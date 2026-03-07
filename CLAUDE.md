# Deep Research

A Hugo-based site for deep dives on various topics, deployed to GitHub Pages.

## Repository Structure

```
<year>/
  <yymmdd>-<topic>/
    README.md              # Overview and key findings (required)
    *.md                   # Sub-topic pages
hugo.toml                  # Hugo config (Book theme)
themes/hugo-book/          # Git submodule (alex-shpak/hugo-book)
scripts/build-content.sh   # Generates Hugo content/ from research files
tests/sidebar.spec.js      # Playwright rendering tests
playwright.config.js       # Playwright config (desktop + mobile viewports)
.github/workflows/deploy.yml
```

## Adding a New Research Topic

1. Create `<year>/<yymmdd>-<topic>/README.md` with this format:
   ```markdown
   # Topic Title - Deep Research

   **Date:** YYYY-MM-DD
   **Topic:** Short description

   ## Overview
   ...

   ## Key Findings
   ...

   ## Contents
   | File | Description |
   |------|-------------|
   | [page.md](page.md) | Description |
   ```
2. Add sub-topic markdown files in the same directory (no front matter needed).
3. Update `README.md` at the repo root to include the new topic in the index table.
4. Test the build locally before pushing.

## Content Build Pipeline

Research files in `<year>/` are plain markdown with no Hugo front matter. The script
`scripts/build-content.sh` generates Hugo `content/` with YAML front matter:

- `content/_index.md` — homepage
- `content/research/_index.md` — research section index (bookFlatSection)
- `content/research/<topic>/_index.md` — topic overview (from README.md)
- `content/research/<topic>/<page>.md` — sub-topic pages

The Book theme renders `content/research/` as a sidebar navigation tree
(`BookSection = "research"`). Topic sections use `bookCollapseSection: false`
to stay expanded. Pages are ordered by `weight` in front matter.

The `content/` directory is gitignored — always generated at build time.

## Testing Locally

### Hugo build (required before pushing)

```bash
bash scripts/build-content.sh && hugo --minify
```

This must pass cleanly (exit 0, no errors) before pushing. It mirrors exactly
what the GitHub Actions workflow runs. Hugo extended v0.146+ is required.

Install Hugo if needed:
```bash
curl -sL https://github.com/gohugoio/hugo/releases/download/v0.157.0/hugo_extended_0.157.0_linux-amd64.tar.gz | tar xz -C /usr/local/bin hugo
```

### Browser rendering tests (Playwright)

```bash
npm test                  # Run all tests (desktop + mobile)
npm run test:desktop      # Desktop viewport only
npm run test:mobile       # Mobile viewport only
```

Tests verify sidebar layout, mobile toggle, table of contents, responsive
behavior, and content rendering. Screenshots are saved to `test-results/`.

Requires Chromium — set `CHROMIUM_PATH` env var if not at the default location.

## Hugo Theme

Uses Hugo Book theme (git submodule at `themes/hugo-book`). No custom layout
overrides — uses the theme's built-in features:

- Left sidebar with collapsible navigation tree
- Right sidebar with table of contents (BookToC)
- Mobile: hamburger toggle for sidebar, separate toggle for TOC
- Search (BookSearch)
- Dark/light/auto theme (BookTheme)

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`:
1. Checkout with submodules
2. Install Hugo extended
3. Run `scripts/build-content.sh`
4. Run `hugo --minify`
5. Deploy `public/` to GitHub Pages
