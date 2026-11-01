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
└── @jameswilson1996/ui-tokens npm package  ──►  apps import tokens.css + bundle.css
```

- **Always-on rules** (`plugins/house-standards/core-rules.md`, under 50 lines) are printed into context at session start, resume, clear and compact.
- **Detail** lives in skills, which Claude loads when the task matches, so sessions stay lean.
- **No pinned version.** `plugin.json` deliberately has no `version`, so each merge to `main` is the new version. Add one only if you want releases gated on a manual bump.
- **Updates** flow automatically: merge to `main`, and every repo's Claude Code picks up the new plugin version in the background (`autoUpdate: true`). No PRs to consuming repos.
- **Runtime styles** ship as `@jameswilson1996/ui-tokens`, generated from the same `tokens.json` the skill reads.

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

Already done for this repo: it's pushed and the owner is set. On each machine you code on:

```bash
# Linux / macOS (needs jq)
git clone https://github.com/jameswilson1996/house-standards.git
./house-standards/scripts/install-user.sh
```

```powershell
# Windows (PowerShell 5.1 or 7, nothing else to install)
git clone https://github.com/jameswilson1996/house-standards.git
powershell -ExecutionPolicy Bypass -File .\house-standards\scripts\install-user.ps1
```

This adds the plugin to your personal Claude Code settings (`~/.claude/settings.json`, or `%USERPROFILE%\.claude\settings.json` on Windows), so **every repo you open on that machine gets the standards automatically**. It merges with what's there and keeps a `.before-house` backup. `-ExecutionPolicy Bypass` applies to that one command only; it doesn't change your system's policy.

To publish the tokens package, tag `ui-tokens-v1.0.0` and push the tag.

Adopting each repo (below) is still worth doing: the standards then follow the repo into Claude Code cloud sessions, and it gets the CI check.

## Adding a repo

New or existing repo:

```bash
./scripts/adopt.sh /path/to/repo
```

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\adopt.ps1 C:\path\to\repo
```

This merges the plugin into `.claude/settings.json`, adds a `house-standards` CI check, and creates a repo-specific `CLAUDE.md` stub. Or ask Claude Code in that repo to "adopt house standards"; the skill does the same.

For new repos, make this the default by creating them from a GitHub template repository that already contains `templates/consumer/`'s files.

## What the consumer CI check enforces

`verify-consumer.yml` fails a PR when the repo:
- doesn't register the `house` marketplace or enable `house-standards@house`
- contains a pasted copy of the standards text
- uses raw hex or `rgb()` colours in `src/` instead of tokens

## Public or private?

Nothing in here is secret, so a **public** repo is the least friction: the plugin clones anywhere, cloud sessions can read it, and other repos can call the reusable CI workflow with no extra setup.

If you keep it **private**:
- Locally, Claude Code clones the plugin with your existing Git credentials, so nothing changes.
- In the house-standards repo, set **Settings → Actions → General → Access** to allow repositories owned by you, or consuming repos can't call `verify-consumer.yml`.
- Claude Code cloud sessions need GitHub access to this repo to install the plugin.

Either way, installing from GitHub Packages needs a token: add `@jameswilson1996:registry=https://npm.pkg.github.com` and `//npm.pkg.github.com/:_authToken=<token with read:packages>` to `~/.npmrc` (and as a CI secret in app repos).
