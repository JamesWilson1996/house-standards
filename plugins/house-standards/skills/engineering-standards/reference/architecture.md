# Service architecture: ports and adapters

Every app we ship follows one shape: TanStack frontend, backend microservices built as ports and adapters, one PostgreSQL database per service, and the Lilac & Sage design system.

Non-negotiables:

1. **The backend owns state and actions.** The frontend renders server state and sends commands. It never decides a business outcome on its own.
2. **The domain depends on nothing.** Business rules live in a core with no framework, ORM, HTTP or SQL imports. Everything else plugs in through ports.
3. **One service, one database, one owner.** No service reads or writes another service's tables. Data crosses boundaries by API or event.
4. **Contracts first.** Every API is described in OpenAPI and every event in a schema before code is written; clients are generated from them.
5. **Same look everywhere.** UI uses Lilac & Sage tokens and `ls-` components only.

Deviations are allowed only through a short ADR in the repo's `docs/adr/` folder, reviewed by one other engineer.

## Layers

Dependencies point inward only: adapters depend on application, application depends on domain, domain depends on nothing.

| Layer | Holds | May import | Must not import |
| --- | --- | --- | --- |
| Domain | Entities, value objects, aggregates, domain events, invariants | Standard library only | Framework, ORM, SQL, HTTP, logger, config |
| Application | Use cases (one per command or query), port interfaces, transaction boundary | Domain | Adapters, framework |
| Inbound adapters | HTTP controllers, event consumers, scheduled jobs | Application | Domain internals, outbound adapters |
| Outbound adapters | Postgres repositories, outbox publisher, HTTP clients for other services | Application ports, domain types | Inbound adapters |

## Rules

- **Ports are interfaces owned by the application layer.** Driven ports (`OrderRepository`, `PaymentGateway`, `EventPublisher`, `Clock`) are implemented by outbound adapters. Driving ports are the use cases themselves.
- **One use case per file**, named as a verb: `PlaceOrder`, `CancelOrder`, `GetOrderSummary`. A use case loads aggregates through a repository port, calls domain methods, saves, and records events, in one transaction.
- **Aggregates guard invariants.** State changes happen through methods (`order.cancel(reason)`), never by setting fields from outside. Methods return or record domain events.
- **Wiring happens once**, in a composition root (`src/main.ts` or equivalent). No service locators, no adapter imports inside the core.
- **The boundary is enforced in CI** with a dependency linter (dependency-cruiser for TypeScript, ArchUnit for JVM); a forbidden import fails the build.
- **Tests follow the layers:** domain and use cases are unit-tested with in-memory fakes of the ports; adapters get integration tests against a real Postgres (Testcontainers).

## Standard service layout

```
service-orders/
  src/
    domain/          # order.ts, order-status.ts, events.ts
    application/
      ports/         # order-repository.ts, event-publisher.ts, clock.ts
      commands/      # place-order.ts, cancel-order.ts
      queries/       # get-order-summary.ts
    adapters/
      http/          # routes, request/response mapping, problem+json
      postgres/      # repositories, read-model queries
      messaging/     # outbox relay, consumers
    main.ts          # composition root
  migrations/
  openapi.yaml
  events/            # event schemas (JSON Schema)
  docs/adr/
```
