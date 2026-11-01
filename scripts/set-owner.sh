#!/usr/bin/env bash
# One-time: replace the YOUR_GITHUB_USER placeholder with your GitHub username.
set -euo pipefail
OWNER_INPUT="${1:?usage: set-owner.sh <github-username>}"
# npm scopes must be lowercase; GitHub treats usernames case-insensitively.
OWNER="$(echo "$OWNER_INPUT" | tr '[:upper:]' '[:lower:]')"
cd "$(dirname "$0")/.."
grep -rlI --exclude-dir=.git --exclude=set-owner.sh YOUR_GITHUB_USER . | xargs sed -i.bak "s/YOUR_GITHUB_USER/$OWNER/g"
find . -name '*.bak' -delete
echo "Replaced YOUR_GITHUB_USER with $OWNER"
