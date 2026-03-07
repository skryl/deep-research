#!/usr/bin/env bash
# Assemble Hugo content/ from research files.
# Run from the repo root before `hugo build`.
set -euo pipefail

rm -rf content
mkdir -p content/post

# Process each research topic
for dir in 2026/*/; do
  slug=$(basename "$dir")
  date_raw=$(echo "$slug" | grep -oP '^\d{6}')
  # Convert YYMMDD to YYYY-MM-DD
  date="20${date_raw:0:2}-${date_raw:2:2}-${date_raw:4:2}"
  topic=$(echo "$slug" | sed 's/^[0-9]*-//')

  # Read title from README.md first heading
  title=$(head -1 "$dir/README.md" | sed 's/^#\s*//')
  description=$(sed -n '2,10p' "$dir/README.md" | grep -oP '(?<=\*\*Topic:\*\* ).*' || echo '')
  series_name="$title"
  tag=$(echo "$topic" | tr '-' ' ')

  # Create overview post from README
  mkdir -p "content/post/$slug"
  {
    cat <<EOF
+++
title = "$title"
date = "${date}T00:00:00Z"
description = "$description"
series = ["$series_name"]
tags = ["$tag"]
weight = 1
+++

EOF
    sed '1{/^#/d}' "$dir/README.md" | sed '/^\*\*Date:\*\*/d; /^\*\*Topic:\*\*/d'
  } > "content/post/$slug/index.md"

  # Create a post for each sub-page
  weight=2
  for file in "$dir"/*.md; do
    fname=$(basename "$file")
    [ "$fname" = "README.md" ] && continue

    page_title=$(head -1 "$file" | sed 's/^#\s*//')
    page_slug="${fname%.md}"

    mkdir -p "content/post/${slug}-${page_slug}"
    {
      cat <<EOF
+++
title = "$title — $page_title"
date = "${date}T00:0${weight}:00Z"
description = "$page_title section of $title deep research"
series = ["$series_name"]
tags = ["$tag"]
weight = $weight
+++

EOF
      tail -n +2 "$file"
    } > "content/post/${slug}-${page_slug}/index.md"

    weight=$((weight + 1))
  done
done

echo "content/ assembled successfully"
