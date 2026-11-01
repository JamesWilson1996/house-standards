# Cross-cutting standards

| Area | Standard |
| --- | --- |
| Authentication | OIDC through one identity provider. The BFF holds the session in an http-only cookie; services receive a short-lived JWT and verify it themselves |
| Authorization | Checked in the application layer of the owning service, never only in the UI. Tenant id comes from the token, never from the request body |
| Observability | OpenTelemetry traces, metrics and logs from every service and the BFF. Structured JSON logs with `traceId`, `correlationId` and `tenantId`; no personal data in logs |
| Health | `/health/live` and `/health/ready` on every service; ready checks the database and broker |
| Config | Environment variables validated at startup; the service refuses to start on bad config. Secrets from a secret manager, never in the repo |
| API versioning | URL major version (`/v1`); additive changes only within a version; deprecations announced with a `Sunset` header |
| Testing | Domain and use cases: unit tests with in-memory fakes. Adapters: integration tests with Testcontainers Postgres. Contracts: consumer-driven tests (e.g. Pact) between BFF and services. UI: Playwright for the main journeys plus an axe accessibility check in light and dark themes |
| CI gates | Typecheck, lint, dependency-boundary check, tests, OpenAPI and event-schema breaking-change check, migration dry run, container image scan, house-standards verify |
| Delivery | One container image per service, built once and promoted through environments; trunk-based development with short-lived branches and feature flags |
