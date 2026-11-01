# State and actions: owned by the backend

The frontend asks; the service decides. Every state change is a command handled by exactly one service, which validates it, applies it in one transaction and publishes what happened.

Path of a command: Frontend (TanStack mutation) → BFF/gateway (auth, routing) → HTTP adapter (maps to a command) → use case (aggregate decides) → Postgres (state + outbox row, one transaction) → outbox relay → broker → other services (idempotent consumers). The frontend then invalidates its queries.

## Commands

Commands change state. They are explicit intents, not field patches: `POST /orders/{id}/cancel` with `{ reason }`, never `PATCH /orders/{id}` with `{ status: "cancelled" }`.

- Every command accepts an `Idempotency-Key` header; the service stores the key with the result for 24 hours and replays the result on retry.
- Updates to existing aggregates carry the version the client saw (`If-Match: "<version>"`); a mismatch returns `409` and the client refetches. Optimistic locking uses a `version` column.
- A command that finishes immediately returns `200` with the new resource. Long work returns `202` with a status URL; the UI polls or listens rather than guessing.
- Responses include `allowedActions` (e.g. `["cancel", "refund"]`) so the UI shows only buttons the backend will accept. The UI never re-derives these from status.

## Queries

Queries never change state. They read from the service's own tables or a read model shaped for the screen. Lists use cursor pagination (`?cursor=&limit=`), and filtering and sorting happen server-side.

## Events

Events tell other services what happened, in the past tense: `order.placed`, `order.cancelled`.

- Written to an `outbox` table in the same transaction as the state change; a relay publishes them to the broker. No dual writes.
- Envelope: `id`, `type`, `version`, `occurredAt`, `aggregateId`, `tenantId`, `correlationId`, `data`. Schemas live in `events/` and are versioned; breaking changes get a new `type` version.
- Consumers are idempotent: they record processed event ids in an `inbox` table and skip duplicates.
- Cross-service workflows are sagas driven by events, with compensating commands, never a distributed transaction.

## Errors

RFC 9457 problem+json everywhere: `type`, `title`, `status`, `detail`, plus `errors[]` with `field` and `message` for validation, so the UI can place each message on its field.

## Gateway

Each app has one backend-for-frontend (BFF) or API gateway that handles session auth and routes to services. It composes reads where a screen needs several services, but holds no business rules and no state of its own.
