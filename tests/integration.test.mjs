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
    baseUrl = externalBaseUrl.replace(/\/$/, "")
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
 * Returns a Map of normalized URL path -> HTTP status code (or error string).
 */
async function crawlSite() {
  const visited = new Map()
  const queue = [startPath()]

  while (queue.length > 0) {
    const rawPath = queue.shift()
    const normalized = normalizePath(rawPath)

    if (visited.has(normalized)) continue
    visited.set(normalized, null)

    let res
    try {
      res = await fetch(`${baseUrl}${normalized}`, { redirect: "follow" })
    } catch (err) {
      visited.set(normalized, `FETCH_ERROR: ${err.message}`)
      continue
    }

    visited.set(normalized, res.status)

    if (!res.ok) continue

    const contentType = res.headers.get("content-type") || ""
    if (!contentType.includes("text/html")) continue

    const html = await res.text()

    // Use the final URL after redirects for relative link resolution.
    // This matters because directory URLs get a trailing-slash redirect,
    // and relative links resolve against the final (redirected) URL.
    const finalUrl = new URL(res.url)
    const pagePath = finalUrl.pathname

    // Extract href values from anchor tags
    const linkRe = /href="([^"#]*?)"/g
    let match
    while ((match = linkRe.exec(html)) !== null) {
      const href = match[1]
      if (!href) continue

      // Skip external links, mailto, javascript, data URIs
      if (/^(https?:|mailto:|javascript:|data:)/i.test(href)) continue

      // Resolve relative URLs against the final page path.
      let resolved
      if (href.startsWith("/")) {
        resolved = href
      } else {
        // Use the page path including trailing slash (from redirect)
        // so that relative resolution matches browser behavior.
        const dir = pagePath.substring(0, pagePath.lastIndexOf("/") + 1)
        resolved = dir + href
      }

      const resolvedNormalized = normalizePath(resolved)
      if (!visited.has(resolvedNormalized)) {
        queue.push(resolvedNormalized)
      }
    }
  }

  return visited
}

/**
 * Simulate Quartz SPA normalizeRelativeURLs rebase.
 *
 * The SPA router fetches a page and then uses `normalizeRelativeURLs` to
 * resolve relative hrefs (starting with ./ or ../) against the final URL
 * after redirects.  This test verifies that for every page reachable via
 * SPA navigation, every relative link resolves to a valid (200) URL when
 * rebased against the post-redirect URL — exactly as the fixed SPA router
 * does in the browser.
 */
async function checkSpaResolution() {
  const start = startPath()
  const visited = new Set()
  const queue = [start]
  const broken = []

  while (queue.length > 0) {
    const rawPath = queue.shift()
    const normalized = normalizePath(rawPath)
    if (visited.has(normalized)) continue
    visited.add(normalized)

    let res
    try {
      res = await fetch(`${baseUrl}${normalized}`, { redirect: "follow" })
    } catch {
      continue
    }
    if (!res.ok) continue

    const ct = res.headers.get("content-type") || ""
    if (!ct.includes("text/html")) continue

    const html = await res.text()
    const finalUrl = new URL(res.url)

    // Simulate normalizeRelativeURLs: resolve relative hrefs using the
    // browser URL API against the final (post-redirect) URL.
    const linkRe = /href="([^"#]*?)"/g
    let match
    while ((match = linkRe.exec(html)) !== null) {
      const href = match[1]
      if (!href) continue
      if (/^(https?:|mailto:|javascript:|data:)/i.test(href)) continue

      // Resolve using the URL API (same as _rebaseHtmlElement in Quartz)
      const resolved = new URL(href, finalUrl)
      const resolvedPath = normalizePath(resolved.pathname)

      if (!visited.has(resolvedPath)) {
        queue.push(resolvedPath)
      }

      // Only validate HTML-like paths (skip .css, .png, etc.)
      if (/\.\w+$/.test(resolvedPath) && !/\.html?$/.test(resolvedPath)) continue

      // Verify the resolved URL is reachable
      try {
        const check = await fetch(`${baseUrl}${resolvedPath}`, {
          method: "HEAD",
          redirect: "follow",
        })
        if (!check.ok) {
          broken.push(
            `On ${normalized}: href="${href}" -> ${resolvedPath} (${check.status})`,
          )
        }
      } catch (err) {
        broken.push(
          `On ${normalized}: href="${href}" -> ${resolvedPath} (FETCH_ERROR)`,
        )
      }
    }
  }

  return broken
}

describe("site links", () => {
  let crawlResults

  before(async () => {
    crawlResults = await crawlSite()
  })

  it("should find pages on the site", () => {
    assert.ok(crawlResults.size > 0, "Crawl found no pages")
    console.log(`  Crawled ${crawlResults.size} URLs`)
  })

  it("should have no 404 links", () => {
    const broken = []
    for (const [url, status] of crawlResults) {
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
    for (const [url, status] of crawlResults) {
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
    for (const [url, status] of crawlResults) {
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
  it("should resolve relative links correctly without trailing slash", async () => {
    const broken = await checkSpaResolution()
    assert.equal(
      broken.length,
      0,
      `Found ${broken.length} SPA resolution mismatch(es):\n  ${broken.join("\n  ")}`,
    )
  })
})
