# Engineering practice

We build with domain-driven design and test-driven development, applied pragmatically so that code stays easy to change.

## Domain-driven design

- **Service boundaries follow bounded contexts.** One microservice owns one context (Orders, Billing, Identity). Draw a context map before splitting; if two "services" always change together, they are one.
- **Ubiquitous language.** Classes, methods, endpoints, events and tables use the business's words. A glossary lives in each service's `docs/`. If the code says `Item` and the business says `Line`, rename the code.
- **Aggregates are small and are the consistency boundary.** One transaction changes one aggregate. Other aggregates are referenced by id and updated through events.
- **Value objects over primitives.** `Money`, `EmailAddress`, `OrderId` validate themselves on creation, so invalid values cannot exist inside the domain.
- **Rich domain, thin application.** Rules live on aggregates and domain services; use cases orchestrate and never contain `if` statements about business policy.
- **Anti-corruption layers** translate another context's model at the adapter edge; its types never enter our domain.
- **Event storming** is the default way to discover a new context's commands, events and aggregates before code is written.

## Test-driven development

- **Red, green, refactor** for domain and application code: write a failing test that names a behaviour, make it pass with the simplest code, then clean up.
- **Tests assert behaviour.** They call use cases and domain methods and check the outcomes and events that result. The domain itself is never mocked.
- **Fakes over mocks.** Ports get in-memory fakes shared across tests; mocking libraries are reserved for adapters at the edge.
- **Names read as specifications:** `cancelling a shipped order is rejected`, not `testCancel2`. Arrange, act, assert, one behaviour per test.
- **Shape of the suite:** many fast domain/use-case tests, fewer adapter integration tests, a handful of end-to-end journeys. The unit suite runs in under 30 seconds.
- **Every bug fix starts with a failing test** that reproduces it.
- **Coverage:** the domain and application layers are fully covered. Adapters and generated code have no coverage target.

## Pragmatism

- **Simplest thing that works (YAGNI).** Build frameworks and extension points only for needs that exist today. Duplicated logic is still extracted on its second use.
- **Not every context needs full DDD.** A CRUD-style supporting context (settings, reference data) can use a thin service with a simple repository; record the choice in an ADR. Reserve aggregates and events for the core domain.
- **Prefer boring technology.** Well-known libraries and the house stack over new tools; a new dependency needs a reason in the PR.
- **Small, reviewable changes.** PRs under about 400 changed lines, merged within a day or two, behind a feature flag if incomplete.
- **Refactor as you go** under test, leaving code clearer than you found it; large rewrites need an ADR.

## Reuse and shared modules

- **Look before you write.** Before adding a helper, component, query or client, search the service, the shared packages and the design system for one that already exists, and use it.
- **Extract on the second use.** When the same logic appears twice, move it into a shared function or module rather than copying it. Within a service it goes to the lowest layer that owns it (a domain value object, an application service, an adapter utility).
- **Shared packages for cross-cutting code.** Code used by more than one service or app lives in a versioned internal package: `@jameswilson1996/ui-tokens` and `@jameswilson1996/ui`, generated API clients, and platform libraries for logging, tracing, config, problem+json, outbox/inbox and idempotency. Each package has an owner, a changelog and semantic versions.
- **Never share domain models across services.** Bounded contexts keep their own entities even when names match; services share only contracts (OpenAPI, event schemas) and technical plumbing.
- **Improve while you extract.** When pulling code into a shared module, make it better if you can: remove redundant work, cut allocations or round trips, replace N+1 queries with a batched query, simplify the API, add missing tests. Behaviour stays the same, covered by tests written or confirmed before the change.
- **Keep refactors reviewable.** Put the extraction or efficiency refactor in its own commit (or PR if large), separate from feature changes, with before/after numbers when the point was performance.
- **Good abstractions are narrow.** A shared module does one job with a small, clear interface. If callers start passing flags to change its behaviour, split it.

## Code standards

- **No magic strings or numbers.** Statuses, event types, error codes, route paths, query keys, config keys and limits are named constants or enums defined once and imported, ideally generated from the OpenAPI and event schemas. `if (status === OrderStatus.Shipped)`, never `if (status === "shipped")`; `MAX_LINE_ITEMS`, never `50`.
- **Comments record the reason code is this way:** a business rule, a trade-off, a workaround and its ticket. One or two lines, next to the code, deleted when the reason goes away.
- **No commented-out code** and no `TODO` without a ticket reference.
- **Names over comments.** If a block needs a comment to say what it does, extract it into a well-named function.
- **Small functions, early returns,** no boolean flag parameters, no nesting deeper than 3 levels.
- **Explicit errors.** Domain failures are typed results or domain errors with codes, never thrown strings; adapters map them to problem+json.
- **Formatting and linting are automatic** (Prettier/ESLint or the language equivalent) and enforced in CI.
- **Immutability by default:** `const`, readonly types and value objects; mutation stays inside aggregate methods.
