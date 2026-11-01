#!/usr/bin/env bash
# Enable house-standards for every repo you open on this machine, adopted or not.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
USER_SETTINGS="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json"
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

mkdir -p "$(dirname "$USER_SETTINGS")"
[ -f "$USER_SETTINGS" ] || echo '{}' > "$USER_SETTINGS"
cp "$USER_SETTINGS" "$USER_SETTINGS.before-house"
# Deep-merge so existing permissions, hooks and env survive.
jq -s '.[0] * .[1]' "$USER_SETTINGS" "$HERE/templates/consumer/.claude/settings.json" > "$USER_SETTINGS.tmp"
mv "$USER_SETTINGS.tmp" "$USER_SETTINGS"
echo "Enabled house-standards in $USER_SETTINGS (backup: $USER_SETTINGS.before-house)"
echo "Start a new Claude Code session; /plugin should list house-standards@house."
