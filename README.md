# house-standards

The single source for our engineering standards and the Lilac & Sage design system. Every repo points here; nothing is copied, so nothing drifts.

## How it reaches Claude Code

```
house-standards (this repo, the only copy)
├── Claude Code plugin  ──►  every repo's .claude/settings.json enables it (autoUpdate)
│     ├── core rules     →  injected at every session start (SessionStart hook)
│     ├── engineering-standards skill → loaded when designing services, DB, APIs, tests
│     ├── design-system skill         → loaded when building UI
│     └── adopt-house-standards skill → wires up new repos
└── @house/ui-tokens npm package  ──►  apps import tokens.css + bundle.css
```

- **Always-on rules** (`plugins/house-standards/core-rules.md`, under 50 lines) are printed into context at session start, resume, clear and compact.
- **Detail** lives in skills, which Claude loads when the task matches, so sessions stay lean.
- **No pinned version.** `plugin.json` deliberately has no `version`, so each merge to `main` is the new version. Add one only if you want releases gated on a manual bump.
- **Updates** flow automatically: merge to `main`, and every repo's Claude Code picks up the new plugin version in the background (`autoUpdate: true`). No PRs to consuming repos.
- **Runtime styles** ship as `@house/ui-tokens`, generated from the same `tokens.json` the skill reads.

## Where to edit

| To change | Edit | Then |
| --- | --- | --- |
| Always-on rules | `plugins/house-standards/core-rules.md` | merge |
| Engineering detail | `plugins/house-standards/skills/engineering-standards/reference/*.md` | merge |
| Colours, type, spacing | `plugins/house-standards/skills/design-system/assets/tokens.json` | `node scripts/build.mjs`, commit, tag `ui-tokens-vX.Y.Z` |
| Component styles | `plugins/house-standards/skills/design-system/assets/bundle.css` | same as above |
| Brand and component rules | `plugins/house-standards/skills/design-system/reference/*.md` | merge |

Never edit `packages/ui-tokens/*` or any `tokens.css` by hand; `scripts/build.mjs` generates them and CI fails if they're stale.

Changes go through pull requests here. The claude.ai Engineering Standards doc and the Lilac & Sage design-system page are discussion copies; when they change, port the change here (or ask Claude to).

## First-time setup

1. Push this repo to GitHub as `<org>/house-standards`, then run `./scripts/set-org.sh <org>` and commit.
2. Optional but recommended: in claude.ai, **Organization settings → Claude Code → Managed settings**, add the same `extraKnownMarketplaces` and `enabledPlugins` keys from `templates/consumer/.claude/settings.json`. That enables the plugin on every machine and cloud session in the org, including repos that haven't been adopted yet. Requires an owner role on a Team or Enterprise plan.
3. Tag `ui-tokens-v1.0.0` to publish `@house/ui-tokens` to GitHub Packages.

## Installing by hand

Anyone can install it directly, without an adopted repo:

```
/plugin install house-standards --marketplace YOUR_ORG/house-standards
```

## Adding a repo

New or existing repo:

```bash
./scripts/adopt.sh /path/to/repo
```

This merges the plugin into `.claude/settings.json`, adds a `house-standards` CI check, and creates a repo-specific `CLAUDE.md` stub. Or ask Claude Code in that repo to "adopt house standards"; the skill does the same.

For new repos, make this the default by creating them from a GitHub template repository that already contains `templates/consumer/`'s files.

## What the consumer CI check enforces

`verify-consumer.yml` fails a PR when the repo:
- doesn't register the `house` marketplace or enable `house-standards@house`
- contains a pasted copy of the standards text
- uses raw hex or `rgb()` colours in `src/` instead of tokens

## Access

The marketplace is a private Git repo, so each developer needs read access, and Claude Code clones it with their existing Git credentials. In CI or containers without access, use `CLAUDE_CODE_PLUGIN_SEED_DIR` as described in the Claude Code plugin docs.
