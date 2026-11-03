---
name: adopt-house-standards
description: Wire a repository up to the house standards (plugin settings, CLAUDE.md, CI verify workflow, @jameswilson1996/ui-tokens). Use when creating a new repo, onboarding an existing repo, or when the house-standards verify check fails.
---

# Adopt house standards in a repo

The house-standards repo is the single source. A consuming repo never copies standards text; it only points at the source. Add these three things, then the hook tasks below:

1. **`.claude/settings.json`** registering the marketplace and enabling the plugin (merge into existing settings, don't overwrite other keys):

```json
{
  "extraKnownMarketplaces": {
    "house": {
      "source": { "source": "github", "repo": "jameswilson1996/house-standards" },
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
    uses: jameswilson1996/house-standards/.github/workflows/verify-consumer.yml@main
```

The plugin's hooks also use two tasks and one file when a repo has them. Add them when adopting; the hooks skip whatever is missing.

| Task | `package.json` script | or `just` recipe | Hook |
| --- | --- | --- | --- |
| Lint and format one file, failing on warnings | `lint:file` | `lint-file` | After every edit, with the file's repo-relative path as its argument |
| Lint, typecheck and boundary-check every file changed since `main`, committed or not | `check:changed` | `check-changed` | When Claude ends a turn with uncommitted changes, up to 3 retries |

- `lint:file` must accept file types it doesn't lint, e.g. `biome check --write --error-on-warnings --no-errors-on-unmatched` or `ruff check --fix "$1" && ruff format "$1"`.
- `check:changed` runs no tests. Running the suite on every turn is too slow; CI runs it.
- **`.gitattributes`** marks every generated file `linguist-generated` (`*.gen.ts linguist-generated`, generated OpenAPI clients and MSW handlers). The hooks refuse edits to those files.
- In an existing repo, `check:changed` lints changed files strictly while older files stay as they are, so every PR leaves the files it touches clean.

For frontends, also add `@jameswilson1996/ui-tokens` as a dependency and import `@jameswilson1996/ui-tokens/tokens.css` and `@jameswilson1996/ui-tokens/bundle.css` once at the app root.

The house-standards repo has scripts that do all of this for a local checkout: `./scripts/adopt.sh /path/to/repo` on Linux/macOS, or `powershell -ExecutionPolicy Bypass -File .\scripts\adopt.ps1 C:\path\to\repo` on Windows. If neither is to hand, make the three changes directly with your file tools.
