# Deep Research

A Hugo-based site for deep dives on various topics, deployed to GitHub Pages.

## Repository Structure

```
<year>/
  <yymmdd>-<topic>/
    README.md              # Overview and key findings (required)
    *.md                   # Sub-topic pages
hugo.toml                  # Hugo config (Paper theme)
layouts/                   # Template overrides for Hugo 0.157+ compat
  _default/single.html
  partials/head.html
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
`scripts/build-content.sh` generates `content/post/` with proper TOML front matter:
- Each topic's `README.md` becomes the overview post
- Each sub-topic `.md` becomes a separate post in the same series
- The `content/` directory is gitignored — always generated at build time

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

Uses Paper theme (git submodule at `themes/paper`). Two layout overrides exist in
`layouts/` to fix Hugo 0.157 compatibility (the theme uses deprecated `site.Author`).

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`:
1. Checkout with submodules
2. Install Hugo extended
3. Run `scripts/build-content.sh`
4. Run `hugo --minify`
5. Deploy `public/` to GitHub Pages
