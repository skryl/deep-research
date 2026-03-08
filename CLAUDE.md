# Deep Research

A Quartz v4 site for deep dives on various topics, deployed to GitHub Pages.
Styled after [patternlanguage.cc](https://patternlanguage.cc/) with explorer
sidebar, graph view, backlinks, table of contents, search, and dark mode.

## Repository Structure

```
content/
  index.md                 # Homepage
  research/
    <topic>/
      index.md             # Topic overview (from README.md)
      *.md                 # Sub-topic pages
2026/
  <yymmdd>-<topic>/
    README.md              # Source research files (kept as archive)
    *.md
quartz/                    # Quartz framework (do not modify)
quartz.config.ts           # Site config (title, theme, plugins)
quartz.layout.ts           # Page layout (sidebar, graph, TOC, etc.)
.github/workflows/deploy.yml
```

## Adding a New Research Topic

1. Create content files directly in `content/research/<topic>/`:
   - `index.md` — topic overview with frontmatter:
     ```markdown
     ---
     title: "Topic Title"
     date: YYYY-MM-DD
     ---
     ## Overview
     ...
     ```
   - Sub-topic pages with frontmatter:
     ```markdown
     ---
     title: "Page Title"
     weight: 1
     ---
     Content here...
     ```
2. Update `content/index.md` to include the new topic in the index table.
3. Test the build locally before pushing.

## Building Locally

### Quartz build (required before pushing)

```bash
npx quartz build
```

This must pass cleanly (exit 0, no errors) before pushing.

### Local dev server

```bash
npx quartz build --serve
```

Serves at `http://localhost:8080` with hot reload.

## Quartz Theme

Uses Quartz v4 with layout matching [patternlanguage.cc](https://patternlanguage.cc/):

- Left sidebar: explorer, search, dark mode toggle, reader mode
- Right sidebar: graph view, table of contents, backlinks
- Fonts: Questrial (headers), Mate (body), IBM Plex Mono (code)
- SPA mode with hover popovers enabled

Configuration lives in `quartz.config.ts` (theme/plugins) and
`quartz.layout.ts` (component placement).

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`:
1. Checkout with full history
2. Install Node.js 22
3. Run `npm ci`
4. Run `npx quartz build`
5. Deploy `public/` to GitHub Pages
