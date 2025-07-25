#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

MD_LOC="$HOME/Documents/Obsidian Vault/Blog"
SCRIPT_LOC=$(cd $(dirname "$0") && pwd)
ROOT="$SCRIPT_LOC"/..
OUTPUT_LOC="$ROOT"/pages/posts
CACHE="$OUTPUT_LOC"/.cache

tmp_posts="$ROOT"/tmp.json
tmp_post_items="$ROOT"/tmp_post_items.json
tmp_cache="$OUTPUT_LOC"/.tmp_cache

touch "$CACHE"
touch "$tmp_posts"
touch "$ROOT/posts.json"

echo "Running script..."

>"$tmp_cache"

while IFS="=" read -r filename timestamp; do
	if [ -e "$MD_LOC/$filename" ]; then
		echo "$filename=$timestamp" >>$tmp_cache
	else
		echo "Removing stale cache entry for $filename"
		slug=$(jq -r --arg filename "$filename" '.[] | select(.filename == $filename) | .slug' "$ROOT/posts.json")
		if [[ -n "$slug" ]]; then
			rm -f "$OUTPUT_LOC/$slug.html"
		fi
	fi
done <$CACHE

mv "$tmp_cache" "$CACHE"

>"$tmp_post_items"

for md_filename in "$MD_LOC"/*.md; do
	last_updated=$(stat -f %m "$md_filename")

	filename=$(basename "$md_filename")
	CACHE_ENTRY=$(grep -E "^$filename=" "$CACHE" || true)
	cached_timestamp=""
	if [[ -n "$CACHE_ENTRY" ]]; then
		cached_timestamp=${CACHE_ENTRY#*=}
	fi

	if [[ -n "$cached_timestamp" && "$last_updated" -le "$cached_timestamp" ]]; then
		front_matter_json=$(jq --arg filename "$filename" '.[] | select(.filename == $filename)' "$ROOT/posts.json")
		echo "$front_matter_json" >>"$tmp_post_items"
		continue
	fi

	echo "Cache invalidated for $filename"

	old_slug=$(jq -r --arg filename "$filename" '.[] | select(.filename == $filename) | .slug' "$ROOT/posts.json")
	front_matter_json=$("$SCRIPT_LOC/markdown-parser/build/md_front_matter" "$md_filename" | jq --arg filename "$filename" '. + {filename: $filename}')
	echo "$front_matter_json" >>"$tmp_post_items"
	if [[ -z "$cached_timestamp" ]]; then
		echo "$filename=$last_updated" >>$CACHE
	else
		sed -i '' "s/^$filename=.*/$filename=$last_updated/" "$CACHE"
	fi

	html=$("$SCRIPT_LOC/markdown-parser/build/md_markdown" "$md_filename" --omit-body)
	new_slug=$(echo "$front_matter_json" | jq -r .slug)

	if [[ -n "$old_slug" && "$old_slug" != "$new_slug" ]]; then
		rm -f "$OUTPUT_LOC/$old_slug.html"
	fi

	echo "$html" >"$OUTPUT_LOC/$new_slug.html"
done

jq -s '.' "$tmp_post_items" >"$tmp_posts"
mv "$tmp_posts" "$ROOT/posts.json"
rm -f "$tmp_post_items" "$tmp_posts"

echo "Script completed..."
