# Deep Research

A Hugo-based site for deep dives on various topics, deployed to GitHub Pages.

## Repository Structure

```
<year>/
  <yymmdd>-<topic>/
    README.md              # Overview and key findings (required)
    *.md                   # Sub-topic pages
hugo.toml                  # Hugo config (Paper theme)
layouts/
  _default/single.html     # Hugo 0.157+ compat fix (site.Author → site.Params.author)
  partials/head.html        # Same compat fix for head partial
  research/baseof.html      # Docs layout with sidebar (wider than default)
  research/list.html        # Section/topic overview template
  research/single.html      # Individual doc page template
  partials/docs-sidebar.html # Sidebar navigation partial
themes/paper/              # Git submodule (nanxiaobei/hugo-paper)
scripts/build-content.sh   # Generates Hugo content/ from research files
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
`scripts/build-content.sh` generates Hugo `content/` with proper TOML front matter:

- `content/_index.md` — homepage
- `content/research/_index.md` — research section index
- `content/research/<topic>/_index.md` — topic overview (from README.md)
- `content/research/<topic>/<page>.md` — sub-topic pages

All research content uses `type = "research"` which activates the docs layout
with a sticky sidebar showing the document index. Pages are nested under their
topic directory in the sidebar and highlighted when active.

The `content/` directory is gitignored — always generated at build time.

## Testing Locally

```bash
bash scripts/build-content.sh && hugo --minify
```

This must pass cleanly (exit 0, no errors) before pushing. It mirrors exactly
what the GitHub Actions workflow runs. Hugo extended v0.157+ is required.

Install Hugo if needed:
```bash
curl -sL https://github.com/gohugoio/hugo/releases/download/v0.157.0/hugo_extended_0.157.0_linux-amd64.tar.gz | tar xz -C /usr/local/bin hugo
```

## Hugo Theme

Uses Paper theme (git submodule at `themes/paper`). Layout overrides in `layouts/`:
- `_default/single.html` and `partials/head.html` — fix Hugo 0.157 deprecation of `site.Author`
- `research/` — docs-style layout with sidebar navigation (wider max-width, sticky sidebar, active page highlighting, responsive collapse on mobile)

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`:
1. Checkout with submodules
2. Install Hugo extended
3. Run `scripts/build-content.sh`
4. Run `hugo --minify`
5. Deploy `public/` to GitHub Pages
