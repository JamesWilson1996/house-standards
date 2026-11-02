# Frontend testing

App code is tested with Vitest, Testing Library and MSW. The main journeys also run in Playwright with an axe check in both themes (see `cross-cutting.md`).

## Shape of the suite

- **Integration tests come first.** Render a route with the real router and query client, drive it as a user would, and assert what the user sees. One test of a critical journey covers more than a dozen tests of internals.
- A refactor that breaks a test without changing behaviour means the test is coupled to the implementation. Rewrite the test against what the user sees.
- **Unit tests are for plain functions** with logic worth pinning: a formatter, a mapper, a search-param helper. They pass data in and check data out. They don't render components, call `renderHook`, import MSW or use API fixtures.
- File names: `*.integration.test.tsx` and `*.unit.test.ts`, next to the code they cover.
- TDD applies here too: new behaviour starts with a failing test, and every UI bug fix starts with a test that reproduces it.

## The API is faked at the network

- MSW is the in-memory fake for every service the app calls. Tests don't mock `fetch`, the generated client or query hooks.
- Default handlers and fixtures are generated from the OpenAPI document (orval's `mock` output or an MSW generator) and live in `src/test/msw/<resource>/handlers.ts` and `fixtures.ts`. Fixtures use the generated types, so a contract change breaks them at compile time.
- The test setup registers every default handler once, and `server.resetHandlers()` after each test keeps them. Tests never re-register defaults in `beforeEach`.
- One `renderRoute(path)` helper in `src/test/` builds the real router and a fresh query client per test, with retries off so failures surface at once.

## Reach state the way a user would

An integration test proves something only when its state is one a user can produce.

- Reach a state by driving the UI (a click, a form submit, a filter) against the default handlers, or by adding a fixture that the default handlers return.
- `server.use(...)` inside a test is reserved for states the defaults can't produce: an error response (4xx, 5xx, network failure) or a delay to show loading. A comment on the line above names the state it forces. An override that several tests share becomes a named helper in the resource's handlers file, such as `givenOrderServiceFails(status)`.
- Test cases don't build entities inline. Hand-written objects drift from what the API returns, and the next test invents them again. Import a fixture, or add one to the resource's `fixtures.ts`.
- The same reasoning rules out other back doors into app state: writing to a store, priming the cache with `setQueryData`, or `vi.mock` on a hook the UI could drive.

## Queries and assertions

- Find elements the way assistive technology does, in this order: `getByRole(role, { name })`, `getByLabelText`, `getByPlaceholderText`, `getByText`, and `getByTestId` last. If a test can't find an element by role and name, a screen reader user can't either. Playwright locators follow the same order.
- Wait with `await screen.findBy…`. Keep `waitFor` for conditions outside the DOM and for absence with `queryBy…`, with one assertion per `waitFor`.
- Drive changes with `@testing-library/user-event`. Tests don't call `rerender`.

## Naming

- `it` names read as specifications of what the user sees: `hides the Cancel button`, `shows the field error from the API`.
- `describe` blocks state a scenario: `describe('when the order has shipped')`. A nested `describe` adds a condition to its parent's.
- Names leave out function, hook, component and endpoint names. A feature flag may be named, since users see its effect.

```tsx
describe('when the order has shipped', () => {
  it('hides the Cancel button', async () => {
    renderRoute(`/orders/${shippedOrder.id}`)

    expect(await screen.findByRole('heading', { name: shippedOrder.reference })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Cancel order' })).not.toBeInTheDocument()
  })
})

describe('when the order service is down', () => {
  it('shows the problem detail and a retry button', async () => {
    // Forces a 503; the default handlers always succeed.
    givenOrderServiceFails(503)
    renderRoute(`/orders/${openOrder.id}`)

    expect(await screen.findByRole('alert')).toHaveTextContent('Orders are unavailable')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled()
  })
})
```

`shippedOrder` comes from the fixtures with no `cancel` in its `allowedActions`, so the test checks that the UI follows the API.
