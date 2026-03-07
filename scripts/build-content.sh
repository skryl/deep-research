#!/usr/bin/env bash
# Assemble Hugo content/ from research files.
# Run from the repo root before `hugo build`.
set -euo pipefail

rm -rf content
mkdir -p content

# Create homepage
cat > content/_index.md <<'HOMEPAGE'
+++
title = "Deep Research"
+++
HOMEPAGE

# Create research section
mkdir -p content/research
cat > content/research/_index.md <<'SECTION'
+++
title = "Research"
+++
SECTION

# Process each research topic
for dir in 20[0-9][0-9]/*/; do
  slug=$(basename "$dir")
  date_raw=$(echo "$slug" | grep -oP '^\d{6}')
  # Convert YYMMDD to YYYY-MM-DD
  date="20${date_raw:0:2}-${date_raw:2:2}-${date_raw:4:2}"
  topic=$(echo "$slug" | sed 's/^[0-9]*-//')

  # Read title from README.md first heading
  title=$(head -1 "$dir/README.md" | sed 's/^#\s*//')
  description=$(sed -n '2,10p' "$dir/README.md" | grep -oP '(?<=\*\*Topic:\*\* ).*' || echo '')
  tag=$(echo "$topic" | tr '-' ' ')

  # Create topic section with _index.md from README
  mkdir -p "content/research/$topic"
  {
    cat <<EOF
+++
title = "$title"
date = "${date}T00:00:00Z"
description = "$description"
tags = ["$tag"]
weight = 1
type = "research"
+++

EOF
    sed '1{/^#/d}' "$dir/README.md" | sed '/^\*\*Date:\*\*/d; /^\*\*Topic:\*\*/d'
  } > "content/research/$topic/_index.md"

  # Create a page for each sub-topic
  weight=2
  for file in "$dir"/*.md; do
    fname=$(basename "$file")
    [ "$fname" = "README.md" ] && continue

    page_title=$(head -1 "$file" | sed 's/^#\s*//')
    page_slug="${fname%.md}"

    {
      cat <<EOF
+++
title = "$page_title"
date = "${date}T00:0${weight}:00Z"
description = "$page_title — $title"
tags = ["$tag"]
weight = $weight
type = "research"
+++

EOF
      tail -n +2 "$file"
    } > "content/research/$topic/$page_slug.md"

    weight=$((weight + 1))
  done
done

echo "content/ assembled successfully"
