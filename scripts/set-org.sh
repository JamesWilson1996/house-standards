#!/usr/bin/env bash
# One-time: replace the YOUR_ORG placeholder with your GitHub org or user.
set -euo pipefail
ORG="${1:?usage: set-org.sh <github-org-or-user>}"
cd "$(dirname "$0")/.."
grep -rlI --exclude-dir=.git --exclude=set-org.sh YOUR_ORG . | xargs sed -i.bak "s/YOUR_ORG/$ORG/g"
find . -name '*.bak' -delete
echo "Replaced YOUR_ORG with $ORG"
