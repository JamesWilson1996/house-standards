---
name: engineering-standards
description: House engineering standards for backend services, PostgreSQL, APIs, events, TanStack frontends, DDD, TDD, reuse and code style. Use when designing or changing a service, aggregate, use case, endpoint, event, migration, query, frontend route/form/table, test, or when scaffolding or reviewing code in any house repo.
---

# House engineering standards

The always-on core rules are already in context. This skill holds the detail. Read only the reference file(s) for the task in hand:

| Task | Read |
| --- | --- |
| New service, new module, layer or dependency question | `reference/architecture.md` |
| Endpoint, command, query, event, saga, error response, BFF | `reference/state-and-actions.md` |
| Table, migration, index, repository, tenancy | `reference/postgres.md` |
| Route, query/mutation hook, form, table, styling | `reference/frontend.md` (and the `design-system` skill for UI) |
| DDD modelling, tests, refactoring, reuse, naming, comments | `reference/practice.md` |
| Auth, logging/tracing, health, config, CI, delivery | `reference/cross-cutting.md` |
| Comments, README, ADR, commit message, PR description, docs, error text | `reference/writing.md` |
| Before opening a PR or reviewing one | `reference/checklist.md` |

How to apply:

1. Before writing code, search the repo and shared packages for something reusable; prefer extending it.
2. For domain and application code, write the failing test first.
3. When a rule conflicts with the task, say so and propose an ADR rather than silently breaking the rule.
4. When finishing, walk `reference/checklist.md` and report anything not met.
