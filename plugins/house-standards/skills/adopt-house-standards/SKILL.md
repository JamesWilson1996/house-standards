---
name: adopt-house-standards
description: Wire a repository up to the house standards (plugin settings, CLAUDE.md, CI verify workflow, @YOUR_GITHUB_USER/ui-tokens). Use when creating a new repo, onboarding an existing repo, or when the house-standards verify check fails.
---

# Adopt house standards in a repo

The house-standards repo is the single source. A consuming repo never copies standards text; it only points at the source. Add exactly these three things, then stop:

1. **`.claude/settings.json`** registering the marketplace and enabling the plugin (merge into existing settings, don't overwrite other keys):

```json
{
  "extraKnownMarketplaces": {
    "house": {
      "source": { "source": "github", "repo": "YOUR_GITHUB_USER/house-standards" },
      "autoUpdate": true
    }
  },
  "enabledPlugins": {
    "house-standards@house": true
  }
}
```

2. **`CLAUDE.md`** containing only repo-specific facts (what the service does, its bounded context, how to run it locally, anything that deviates via ADR). Start it with a single line noting that house standards load automatically from the house-standards plugin. Never paste standards text into it.

3. **`.github/workflows/house-standards.yml`** calling the reusable verify workflow:

```yaml
name: house-standards
on: [pull_request]
jobs:
  verify:
    uses: YOUR_GITHUB_USER/house-standards/.github/workflows/verify-consumer.yml@main
```

For frontends, also add `@YOUR_GITHUB_USER/ui-tokens` as a dependency and import `@YOUR_GITHUB_USER/ui-tokens/tokens.css` and `@YOUR_GITHUB_USER/ui-tokens/bundle.css` once at the app root.

The `scripts/adopt.sh` script in the house-standards repo does all of this for a local checkout: `./scripts/adopt.sh /path/to/repo`.
