# Frontend: TanStack

TanStack fits the backend-owned model: Query treats the server as the source of truth, and Router puts URL state under type-checked control.

| Concern | Tool | Rule |
| --- | --- | --- |
| App framework | TanStack Start (SSR) or TanStack Router as an SPA behind the BFF | Pick per app in its ADR; the folder layout is the same either way |
| Language | TypeScript, `strict` on | No `any` without a comment explaining why |
| Server state | TanStack Query | All data from the backend goes through Query. No copying server data into local stores |
| URL state | TanStack Router search params, validated with Zod | Filters, sort, tabs and pagination cursors live in the URL |
| Forms | TanStack Form with Zod | Client validation for shape only; business rules come back from the API as problem+json and map onto fields |
| Tables | TanStack Table, headless, `manualPagination` and `manualSorting` | The server sorts, filters and pages |
| API client | Generated from each service's OpenAPI (e.g. orval or openapi-ts) into query and mutation hooks | No hand-written fetch calls |
| Local UI state | React state, or a tiny store (e.g. TanStack Store) | Only for things the server never needs: open panels, draft text, theme choice |
| Styling | `@house/ui-tokens` (`tokens.css` + `bundle.css`), optionally Tailwind mapped to the tokens | No raw hex values, no other component kits |
| Icons | Lucide | As set out in the design system |

## Rules for state

- **Mutations send commands and then invalidate.** After a command succeeds, invalidate the affected query keys (or set the returned resource into the cache). Optimistic updates only for low-risk, easily reversed actions, always rolled back on error.
- **Query keys follow one factory per resource**: `orderKeys.all`, `orderKeys.list(filters)`, `orderKeys.detail(id)`.
- **Buttons follow `allowedActions`** from the API. If the backend did not offer an action, the UI does not show it.
- **Long-running work** (a `202` response) is followed by polling the status URL with `refetchInterval`, or server-sent events where live updates are needed.
- Route loaders prefetch with `queryClient.ensureQueryData` so pages render without waterfalls.

## Standard app layout

```
app-web/
  src/
    routes/            # file-based routes; each owns its loader and search schema
    features/
      orders/
        api/           # generated hooks re-exported + query key factory
        components/    # feature UI built from ls- components
    shared/
      ui/              # thin React wrappers around ls- classes (Button, Field, Badge)
      lib/             # query client, auth, problem+json mapper
    styles/            # imports @house/ui-tokens
```
