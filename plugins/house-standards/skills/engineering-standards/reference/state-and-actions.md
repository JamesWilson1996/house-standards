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
- Envelope: `id`, `type`, `version`, `occurredAt`, `aggregateId`, `tenantId`, `correlationId`, `causationId`, `actorId`, `data`. The last four ids come from the operation context (see `cross-cutting.md`). Schemas live in `events/` and are versioned; breaking changes get a new `type` version.
- Consumers are idempotent: they record processed event ids in an `inbox` table and skip duplicates.
- Cross-service workflows are sagas driven by events, with compensating commands, never a distributed transaction.

## Changing an event schema

Producers and consumers deploy separately, and stored events (outbox history, replays, the warehouse) keep the shape they were written in. An event written by last week's producer must still parse under this week's schema.

- Within one `type` version a schema only gains fields, and every new field is optional with a default.
- These changes are breaking. They need a new `type` version, published alongside the old one until every consumer has moved:
  - removing or renaming a field (a rename also breaks replay, because stored events carry only the old name)
  - narrowing a type: free text to an enum, nullable to required, a tighter constraint
  - adding a required field
  - changing what a field means, or what `null` means, under the same name
- A missing key and a key set to `null` are different wire states, and serializers, stores and brokers often drop nulls in transit. A nullable field therefore always has a default, so a consumer that receives it absent still parses. The event-schema check in CI fails a nullable field without one.
- Consumers include anything that reads the JSON directly: broker filter rules, partition or ordering keys built from the envelope, analytics and warehouse jobs. Search the repo and its infrastructure code for a field's name before removing it.
- A consumer never loosens its own copy of a schema, or catches the parse error, to accept an event the producer shouldn't send. The producer gets fixed.
- Bumping `version` alone doesn't make a change compatible. Readers that aren't ready for the new version still break.

## Failures and retries

- Every outbound call has an explicit timeout.
- Adapters classify failures as transient (timeout, connection reset, `429`, `503`) or permanent (validation, other `4xx`, a domain rejection) and raise a typed error for each. Only transient failures are retried, with capped exponential backoff and jitter, and only when the call is idempotent or carries an idempotency key.
- Every queue and subscription has a dead-letter queue with an alert on its depth. A message that fails permanently or runs out of retries goes there.
- An ordered consumer (one partition or message group per aggregate) holds back every later event for that aggregate while one bad message retries. Keep its retry count low and dead-letter the message, so one bad event can't stall an entity.
- A caught error is either handled, leaving the aggregate in a safe final or retryable state, or rethrown. Code never catches an error, logs it and carries on.
- Each failure is reported once, where it is finally handled. Code that rethrows doesn't also log or record the error.

## Errors

RFC 9457 problem+json everywhere: `type`, `title`, `status`, `detail`, plus `errors[]` with `field` and `message` for validation, so the UI can place each message on its field.

- The HTTP adapter maps typed domain and application errors to problem+json in one place per service. Use cases never build HTTP responses.
- `detail` is written for the caller. It never repeats an upstream service's message, which can carry another user's data.
- `401` and `403` responses use a fixed `detail` that names neither the caller's roles nor the roles required.

## Gateway

Each app has one backend-for-frontend (BFF) or API gateway that handles session auth and routes to services. It composes reads where a screen needs several services, but holds no business rules and no state of its own.
