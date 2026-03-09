/**
 * Integration tests for the Quartz site.
 *
 * Usage:
 *   # Against local build (run `npx quartz build` first, or use `npm test`):
 *   node --test tests/integration.test.mjs
 *
 *   # Against production or a running server:
 *   BASE_URL=https://skryl.github.io/deep-research node --test tests/integration.test.mjs
 */

import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import http from "node:http"
import fs from "node:fs"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

/**
 * Base path prefix derived from quartz.config.ts baseUrl.
 * The local server mounts public/ under this prefix so that relative link
 * resolution matches the production GitHub Pages deployment exactly.
 */
const BASE_PATH = "/deep-research"

const externalBaseUrl = process.env.BASE_URL
let baseUrl
let server

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".xml": "application/xml",
    ".webmanifest": "application/manifest+json",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
  }
  return types[ext] || "application/octet-stream"
}

/**
 * Fetch a URL, falling back to curl when Node's fetch is blocked (e.g.
 * in sandboxed environments that restrict outbound connections but allow
 * shelling out to curl).
 *
 * Returns a fetch-Response-like object with: status, ok, url,
 * headers.get("content-type"), text().
 */
async function httpGet(url) {
  // For local URLs, use native fetch — it's faster and handles redirects.
  if (url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost")) {
    return fetch(url, { redirect: "follow" })
  }

  // Try native fetch first for external URLs.
  try {
    const res = await fetch(url, { redirect: "follow" })
    return res
  } catch {
    // fetch blocked — fall back to curl
  }

  // curl fallback: -L follows redirects, -s is silent, -w prints metadata.
  const args = [
    "-sL",
    "--connect-timeout",
    "10",
    "-D",
    "-",
    "-o",
    "-",
    "-w",
    "\n%{http_code}\n%{url_effective}",
    url,
  ]

  let stdout
  try {
    const result = await execFileAsync("curl", args, {
      maxBuffer: 10 * 1024 * 1024,
    })
    stdout = result.stdout
  } catch (err) {
    throw new Error(`curl failed for ${url}: ${err.message}`)
  }

  // curl -D - writes headers then body; -w appends status + final url.
  const lines = stdout.split("\n")
  const effectiveUrl = lines.pop() || url
  const statusCode = parseInt(lines.pop() || "0", 10)

  // Find the last blank line separating headers from body (there may be
  // multiple header blocks when following redirects).
  let lastHeaderEnd = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") lastHeaderEnd = i
  }

  const headerLines = lastHeaderEnd >= 0 ? lines.slice(0, lastHeaderEnd) : []
  const body =
    lastHeaderEnd >= 0 ? lines.slice(lastHeaderEnd + 1).join("\n") : lines.join("\n")

  let contentType = ""
  for (const h of headerLines) {
    const m = h.match(/^content-type:\s*(.+)/i)
    if (m) contentType = m[1].trim()
  }

  return {
    status: statusCode,
    ok: statusCode >= 200 && statusCode < 300,
    url: effectiveUrl,
    headers: {
      get: (name) => (name.toLowerCase() === "content-type" ? contentType : null),
    },
    text: async () => body,
  }
}

/**
 * Normalize a URL path by resolving `.` and `..` segments and removing
 * trailing slashes (except for root `/`).
 */
function normalizePath(p) {
  let normalized = path.posix.normalize(p)
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

before(async () => {
  if (externalBaseUrl) {
    // Use just the origin so that absolute paths like /deep-research/...
    // work the same way as with the local server.
    const u = new URL(externalBaseUrl)
    baseUrl = u.origin
    return
  }

  const publicDir = path.join(process.cwd(), "public")
  if (!fs.existsSync(publicDir)) {
    throw new Error(
      "public/ directory not found. Run `npx quartz build` before running tests.",
    )
  }

  server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost")
    const pathname = decodeURIComponent(url.pathname)

    // Strip base path prefix to map to the public directory
    if (!pathname.startsWith(BASE_PATH)) {
      res.writeHead(404)
      res.end("Not Found")
      return
    }

    const relativePath = pathname.slice(BASE_PATH.length) || "/"
    let filePath = path.join(publicDir, relativePath)

    // Directory without trailing slash -> redirect (matches GitHub Pages)
    if (
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isDirectory() &&
      !pathname.endsWith("/")
    ) {
      res.writeHead(301, { Location: pathname + "/" })
      res.end()
      return
    }

    // Directory -> index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html")
    }
    // Try .html extension for clean URLs
    if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html"
    }
    if (!fs.existsSync(filePath)) {
      res.writeHead(404)
      res.end("Not Found")
      return
    }

    const content = fs.readFileSync(filePath)
    res.writeHead(200, { "Content-Type": getMimeType(filePath) })
    res.end(content)
  })

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address()
      baseUrl = `http://127.0.0.1:${addr.port}`
      resolve()
    })
  })
})

after(() => {
  if (server) server.close()
})

/**
 * Determine the starting path for the crawl.  For the local server it is
 * BASE_PATH; for an external BASE_URL we derive it from the URL.
 */
function startPath() {
  if (externalBaseUrl) {
    const u = new URL(externalBaseUrl)
    return normalizePath(u.pathname) || "/"
  }
  return BASE_PATH
}

/**
 * Crawl the site starting from the base path, collecting all internal links.
 * Fetches up to CONCURRENCY pages in parallel per round for speed.
 *
 * Returns an object with:
 *   visited: Map of normalized URL path -> HTTP status code (or error string)
 *   pages:   Map of normalized URL path -> { finalUrl, html, hrefs }
 *            (only for 200 HTML pages)
 */
const CONCURRENCY = 6

async function crawlSite() {
  const visited = new Map()
  const pages = new Map()
  const queue = [startPath()]

  while (queue.length > 0) {
    // Dequeue a batch of unique, unvisited paths
    const batch = []
    while (queue.length > 0 && batch.length < CONCURRENCY) {
      const rawPath = queue.shift()
      const normalized = normalizePath(rawPath)
      if (visited.has(normalized)) continue
      visited.set(normalized, null)
      batch.push(normalized)
    }

    const results = await Promise.all(
      batch.map(async (normalized) => {
        let res
        try {
          res = await httpGet(`${baseUrl}${normalized}`)
        } catch (err) {
          return { normalized, status: `FETCH_ERROR: ${err.message}`, links: [] }
        }

        const status = res.status
        if (!res.ok) return { normalized, status, links: [] }

        const contentType = res.headers.get("content-type") || ""
        if (!contentType.includes("text/html")) return { normalized, status, links: [] }

        const html = await res.text()
        const finalUrl = new URL(res.url)
        const pagePath = finalUrl.pathname

        // Extract all internal hrefs
        const hrefs = []
        const links = []
        const linkRe = /href="([^"#]*?)"/g
        let match
        while ((match = linkRe.exec(html)) !== null) {
          const href = match[1]
          if (!href) continue
          if (/^(https?:|mailto:|javascript:|data:)/i.test(href)) continue

          hrefs.push(href)

          let resolved
          if (href.startsWith("/")) {
            resolved = href
          } else {
            const dir = pagePath.substring(0, pagePath.lastIndexOf("/") + 1)
            resolved = dir + href
          }
          links.push(normalizePath(resolved))
        }

        return { normalized, status, links, pageData: { finalUrl, html, hrefs } }
      }),
    )

    for (const { normalized, status, links, pageData } of results) {
      visited.set(normalized, status)
      if (pageData) pages.set(normalized, pageData)
      for (const link of links) {
        if (!visited.has(link)) queue.push(link)
      }
    }
  }

  return { visited, pages }
}

/**
 * Check SPA link resolution using already-crawled page data.
 *
 * For each page, resolves every relative href using the URL API against
 * the post-redirect finalUrl — exactly as normalizeRelativeURLs does in
 * the browser — and verifies the resolved path exists in the crawl results.
 * No additional network requests needed.
 */
function checkSpaResolution(crawlPages, crawlVisited) {
  const broken = []

  for (const [pagePath, { finalUrl, hrefs }] of crawlPages) {
    for (const href of hrefs) {
      // Resolve using the URL API (same as _rebaseHtmlElement in Quartz)
      const resolved = new URL(href, finalUrl)
      const resolvedPath = normalizePath(resolved.pathname)

      // Only validate HTML-like paths (skip .css, .png, etc.)
      if (/\.\w+$/.test(resolvedPath) && !/\.html?$/.test(resolvedPath)) continue

      const status = crawlVisited.get(resolvedPath)
      if (status !== 200 && status !== undefined) {
        broken.push(
          `On ${pagePath}: href="${href}" -> ${resolvedPath} (${status})`,
        )
      } else if (status === undefined) {
        // Path wasn't visited by the crawl — it may be a valid path that
        // just wasn't discovered, or a broken path.  Flag it.
        broken.push(
          `On ${pagePath}: href="${href}" -> ${resolvedPath} (not in crawl)`,
        )
      }
    }
  }

  return broken
}

let crawlData

describe("site links", () => {
  before(async () => {
    crawlData = await crawlSite()
  })

  it("should find pages on the site", () => {
    assert.ok(crawlData.visited.size > 0, "Crawl found no pages")
    console.log(`  Crawled ${crawlData.visited.size} URLs`)
  })

  it("should have no 404 links", () => {
    const broken = []
    for (const [url, status] of crawlData.visited) {
      if (status === 404) {
        broken.push(url)
      }
    }
    assert.equal(
      broken.length,
      0,
      `Found ${broken.length} broken link(s):\n  ${broken.join("\n  ")}`,
    )
  })

  it("should have no fetch errors", () => {
    const errors = []
    for (const [url, status] of crawlData.visited) {
      if (typeof status === "string" && status.startsWith("FETCH_ERROR")) {
        errors.push(`${url}: ${status}`)
      }
    }
    assert.equal(
      errors.length,
      0,
      `Found ${errors.length} fetch error(s):\n  ${errors.join("\n  ")}`,
    )
  })

  it("should have all pages returning 200", () => {
    const nonOk = []
    for (const [url, status] of crawlData.visited) {
      if (status !== 200) {
        nonOk.push(`${url} -> ${status}`)
      }
    }
    assert.equal(
      nonOk.length,
      0,
      `Found ${nonOk.length} non-200 response(s):\n  ${nonOk.join("\n  ")}`,
    )
  })
})

describe("SPA link resolution", () => {
  it("should resolve relative links correctly via post-redirect URL", () => {
    const broken = checkSpaResolution(crawlData.pages, crawlData.visited)
    assert.equal(
      broken.length,
      0,
      `Found ${broken.length} SPA resolution mismatch(es):\n  ${broken.join("\n  ")}`,
    )
  })
})
