# Cross-cutting standards

| Area | Standard |
| --- | --- |
| Authentication | OIDC through one identity provider. The BFF holds the session in an http-only cookie; services receive a short-lived JWT and verify it themselves |
| Authorization | Checked in the application layer of the owning service, never only in the UI. Tenant id comes from the token, never from the request body |
| Observability | OpenTelemetry traces, metrics and logs from every service and the BFF. Structured JSON logs carrying `traceId` and the operation context (`correlationId`, `causationId`, `tenantId`, `actorId`); no personal data in logs (see below) |
| Health | `/health/live` and `/health/ready` on every service; ready checks the database and broker |
| Config | Environment variables validated at startup; the service refuses to start on bad config. Secrets from a secret manager, never in the repo |
| Time | Three kinds, never mixed. **Instants** (something happened) are UTC end to end: `timestamptz`, an instant type in the domain (NodaTime `Instant`, `Temporal.Instant`), ISO 8601 with `Z` in the API (`format: date-time`). The frontend converts them to the viewer's or tenant's time zone only when displaying them. **Calendar days** are plain dates (`date`, `LocalDate`, `YYYY-MM-DD`, `format: date`), because midnight UTC turns the 15th into the 14th during summer time. **Repeating times of day** (a 9am reminder) are local time plus an IANA zone, with each occurrence computed in UTC, so they don't drift an hour when the clocks change. The tenant's time zone is a setting and decides "today" and "overdue" on the server. Code reads the current time only through an injected `Clock` port, servers and containers run with `TZ=UTC`, and tests pin the clock and cover both clock-change days |
| API versioning | URL major version (`/v1`); additive changes only within a version; deprecations announced with a `Sunset` header |
| Testing | Domain and use cases: unit tests with in-memory fakes. Adapters: integration tests with Testcontainers Postgres. Contracts: consumer-driven tests (e.g. Pact) between BFF and services. UI: integration tests with Vitest, Testing Library and MSW (`frontend-testing.md`), plus Playwright for the main journeys with an axe accessibility check in light and dark themes |
| CI gates | Typecheck, lint, dependency-boundary check, tests, OpenAPI and event-schema breaking-change check, migration dry run, container image scan, house-standards verify |
| Delivery | One container image per service, built once and promoted through environments; trunk-based development with short-lived branches and feature flags |

## Operation context

- Each request or message runs inside one operation context holding `correlationId`, `causationId`, `tenantId`, `actorId` and the actor's roles. Inbound adapters set it once at the boundary: HTTP middleware from the verified token and headers, consumers from the event envelope.
- Application code reads it through a `RequestContext` port backed by ambient storage (`AsyncLocalStorage` in Node, a `contextvar` in Python). It is never passed as a parameter through use cases or into aggregate methods.
- A consumer keeps the incoming event's `correlationId` and takes the event's `id` as its `causationId`. Events it publishes carry both, so a chain can be followed back to the first request.
- Scheduled jobs have no caller. Each run starts a new `correlationId` with the job's system identity as `actorId`. When the data names a real actor (the user who uploaded a file), the job opens a narrower context for that write.
- The logger, tracer and outbox writer read the same context, so every log line, span and event of one operation shares its ids.

## Personal data in logs and telemetry

Logs, traces, metrics and error reports hold opaque ids and fields chosen one at a time.

- Ids are safe to log: internal UUIDs, the identity provider's subject, external system ids. So are counts, types, outcomes and durations.
- Personal data is never logged. It covers any value that identifies a person on its own (name, email address, phone number, postal address, message or document content), any field that can hold one, and any container whose contents aren't fixed: whole requests or responses, event payloads, queue messages, serialized objects and raw third-party responses.
- Logging at `debug` level, or only outside production, doesn't make it safe.
- An operational need to log personal data is a deviation and needs an ADR. The log statement then carries `// PII logging: docs/adr/<n>-<slug>.md` on the line above, and logs the narrowest value that meets the need. Credentials, tokens and secrets are never logged under any ADR.
- Error reports are scrubbed once, before any exporter or sink: tag keys come from an allowlist, extra fields drop denylisted keys (`email`, `name`, `token`, `password`), and messages pass through email and phone patterns.
- Metric names, label keys and span attribute names are constants. Dashboards and alerts depend on them, so renaming one updates those in the same change.
