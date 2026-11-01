# House standards (always on)

These rules apply to every repo we build. Full detail lives in the `house-standards:engineering-standards` and `house-standards:design-system` skills; load the relevant one before designing a service, writing a migration, adding an endpoint or building UI.

## Architecture
- Backend services use ports and adapters: `domain/` imports nothing external; `application/` holds one use case per file plus port interfaces; `adapters/` implement ports; wiring only in `main.ts`.
- The backend owns state and actions. The frontend renders server state and sends commands; it never decides a business outcome or derives allowed actions itself (use the API's `allowedActions`).
- Commands are intent endpoints (`POST /orders/{id}/cancel`), never field patches. Every command takes an `Idempotency-Key`; updates send `If-Match` with the aggregate version.
- State change and its event commit together via an `outbox` table. Consumers are idempotent via an `inbox` table. Errors are RFC 9457 problem+json with field-level `errors[]`.
- One service, one database. Never read or write another service's tables.

## PostgreSQL
- `snake_case`, plural tables, UUIDv7 `id`, `created_at`/`updated_at timestamptz`, `version integer`. Money as `bigint` minor units + `currency`. Text + `CHECK` instead of native enums. `tenant_id` + row-level security on tenant data.
- Forward-only SQL migrations, expand then contract, indexes `CONCURRENTLY`.

## Frontend
- TanStack Router (URL state, Zod-validated search params), Query (all server data), Form, Table (server-side sort/filter/page). API hooks are generated from OpenAPI; no hand-written fetch.
- UI uses only Lilac & Sage tokens and `ls-` classes. No raw hex colours, no other component kits. Both light and dark themes must work.

## Practice
- DDD: services follow bounded contexts; use the business's words; small aggregates guard invariants; value objects over primitives.
- TDD for domain and use cases: failing test first, test behaviour not implementation, in-memory fakes over mocks. Every bug fix starts with a failing test.
- Pragmatic: no speculative abstractions, boring technology, small reviewable changes.
- Reuse first: search for an existing helper, component or shared package before writing one. Extract duplicated logic on its second use. Improve efficiency while extracting, with behaviour pinned by tests, in its own commit.
- No magic strings or numbers: statuses, event types, error codes, routes, query keys and limits are named constants or generated enums.
- Comments explain why, never how, in one or two lines. No commented-out code; no TODO without a ticket.
- Deviations from these rules need a short ADR in `docs/adr/`.
