# Adoption and review checklist

A new service or app, or a PR to one, is ready when every applicable item holds. Report any that don't.

- [ ] Folder layout matches the house service or app layout
- [ ] Dependency-boundary check passing (domain imports nothing external)
- [ ] OpenAPI and event schemas committed; client hooks generated, not hand-written
- [ ] Own database and role; tables follow naming and column conventions; `outbox`, `inbox`, `idempotency_keys` present where needed
- [ ] Commands are intent endpoints with idempotency keys and version checks; responses include `allowedActions`
- [ ] Errors are problem+json with field-level `errors[]`
- [ ] Bounded context, glossary and aggregates documented; tests written first for domain and use cases
- [ ] No magic strings or numbers; comments give the reason in one or two lines
- [ ] Comments, docs, commit messages and UI copy follow `writing.md` (plain facts, no "X, not Y" framing or filler)
- [ ] Existing shared modules reused; duplicated logic extracted, with any efficiency refactor in its own commit
- [ ] Frontend uses Query for all server data, URL search params for view state, and Lilac & Sage tokens only
- [ ] OpenTelemetry, health endpoints and structured logs wired
- [ ] Playwright journeys and axe check passing in both light and dark themes

## Open decisions (record outcomes here when made)

- Backend language: TypeScript on Node (shared types with the frontend) or another runtime per team
- Message broker: RabbitMQ, NATS JetStream, or Postgres-only queues (e.g. pgmq) for smaller apps
- Database topology: database per service on separate clusters, or schemas on a shared cluster for small apps
- TanStack Start (SSR) versus Router SPA as the default for internal tools
- Identity provider
- Package registry for `@jameswilson1996/ui-tokens` and generated API clients
