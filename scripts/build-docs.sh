#!/usr/bin/env bash
# Assemble the docs/ directory from repo content for MkDocs.
# Run from the repo root before `mkdocs build`.
set -euo pipefail

rm -rf docs
mkdir -p docs

# Copy year directories
cp -r 2026 docs/

# Create index pages
cp README.md docs/index.md

# Create year index if not present
if [ ! -f docs/2026/index.md ]; then
  cat > docs/2026/index.md <<'EOF'
# 2026

Research topics from 2026.
EOF
fi

# For each topic, copy README.md as index.md and remove README.md
for dir in docs/2026/*/; do
  if [ -f "$dir/README.md" ]; then
    cp "$dir/README.md" "$dir/index.md"
    rm "$dir/README.md"
  fi
done

# Fix relative links ending in / to point to index.md (MkDocs strict mode)
find docs -name '*.md' -exec sed -i 's|\](/\?\([^)]*\)/)|](\1/index.md)|g' {} +

echo "docs/ assembled successfully"
