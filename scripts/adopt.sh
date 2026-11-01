#!/usr/bin/env bash
# Wire a local repo checkout to house-standards. Safe to re-run: it merges, never overwrites.
set -euo pipefail

TARGET="${1:?usage: adopt.sh /path/to/repo}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$HERE/templates/consumer"
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

mkdir -p "$TARGET/.claude" "$TARGET/.github/workflows"

settings="$TARGET/.claude/settings.json"
if [ -f "$settings" ]; then
  # Deep-merge so the repo's own permissions, hooks and env survive.
  jq -s '.[0] * .[1]' "$settings" "$TEMPLATE/.claude/settings.json" > "$settings.tmp" && mv "$settings.tmp" "$settings"
  echo "merged  .claude/settings.json"
else
  cp "$TEMPLATE/.claude/settings.json" "$settings"
  echo "created .claude/settings.json"
fi

workflow="$TARGET/.github/workflows/house-standards.yml"
cp "$TEMPLATE/.github/workflows/house-standards.yml" "$workflow"
echo "wrote   .github/workflows/house-standards.yml"

if [ ! -f "$TARGET/CLAUDE.md" ]; then
  sed "s/REPO_NAME/$(basename "$(cd "$TARGET" && pwd)")/" "$TEMPLATE/CLAUDE.md" > "$TARGET/CLAUDE.md"
  echo "created CLAUDE.md (fill in the repo-specific sections)"
else
  echo "kept    CLAUDE.md (remove any pasted house standards text; the plugin provides it)"
fi
