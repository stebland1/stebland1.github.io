#!/bin/bash
set -euo pipefail
shopt -s nullglob

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

output_file="$SCRIPT_DIR/../posts.json"
posts_src=$HOME/Documents/Obsidian\ Vault/Blog
posts_dst="$SCRIPT_DIR/../posts/"

mkdir -p "$posts_dst"
rm -rf "$posts_dst"*
cp "$posts_src"/*.md "$posts_dst"

echo '[' >"$output_file"
first=true
for file in "$posts_dst"*.md; do
	json=$("$SCRIPT_DIR"/markdown-parser/build/mdparser "$file")

	if [ "$first" = true ]; then
		first=false
	else
		echo "," >>"$output_file"
	fi

	echo "$json" >>"$output_file"
done
echo ']' >>"$output_file"
