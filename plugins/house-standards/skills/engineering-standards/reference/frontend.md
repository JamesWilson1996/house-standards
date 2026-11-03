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
| Styling | `@jameswilson1996/ui-tokens` (`tokens.css` + `bundle.css`), optionally Tailwind mapped to the tokens | No raw hex values, no other component kits |
| Icons | Lucide | As set out in the design system |

## Rules for state

- **Mutations send commands and then invalidate.** After a command succeeds, invalidate the affected query keys (or set the returned resource into the cache). Optimistic updates only for low-risk, easily reversed actions, always rolled back on error.
- **Query keys follow one factory per resource**: `orderKeys.all`, `orderKeys.list(filters)`, `orderKeys.detail(id)`.
- **Buttons follow `allowedActions`** from the API. If the backend did not offer an action, the UI does not show it.
- **Long-running work** (a `202` response) is followed by polling the status URL with `refetchInterval`, or server-sent events where live updates are needed.
- Route loaders prefetch with `queryClient.ensureQueryData` so pages render without waterfalls.

## Layout check for forms

The raw-colour lint catches colours but not layout, so every page with a form gets a Playwright test that runs in both themes:

- Load the page with `data-theme="light"`, then `"dark"`, and take a full-page screenshot with `expect(page).toHaveScreenshot()`. Commit the baselines, and regenerate them with `--update-snapshots` only when the design changes.
- Assert alignment from bounding boxes: in each `.ls-field__row` the button's top and height match the input's; in each `.ls-row--top` every field's top matches; each `.ls-help` starts below its row.
- Assert no element under the form has a `style` attribute, and no file input lacks the `ls-file` class.
- Run axe on the same page in both themes.

```ts
for (const theme of ["light", "dark"] as const) {
  test(`settings form layout (${theme})`, async ({ page }) => {
    await page.goto("/settings");
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    for (const row of await page.locator(".ls-field__row").all()) {
      const input = await row.locator(".ls-input, .ls-select, .ls-file").first().boundingBox();
      const button = await row.locator(".ls-btn").first().boundingBox();
      expect(button!.y).toBeCloseTo(input!.y, 0);
      expect(button!.height).toBeCloseTo(input!.height, 0);
    }
    await expect(page.locator("form [style]")).toHaveCount(0);
    await expect(page.locator('input[type="file"]:not(.ls-file)')).toHaveCount(0);
    await expect(page).toHaveScreenshot(`settings-${theme}.png`, { fullPage: true });
  });
}
```

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
    styles/            # imports @jameswilson1996/ui-tokens
```
