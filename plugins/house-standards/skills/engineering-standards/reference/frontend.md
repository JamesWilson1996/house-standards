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

- **Mutations send commands and then invalidate.** Each mutation lists the query keys it affects in `meta.invalidates`, and the shared query client's `MutationCache` invalidates them once the command succeeds. Components don't call `invalidateQueries` themselves.
- **A command's response goes into the cache only when it is the same representation as the read.** Generated schemas often alias each other while the endpoints fill different fields, so TypeScript accepts a `setQueryData` that blanks fields on screen. When the representations differ, invalidate, or merge only the fields the command owns.
- **Optimistic updates** only for low-risk, easily reversed actions: cancel the query, snapshot, set the new value, roll back on error. Invalidation still comes from `meta.invalidates`.
- **Query keys follow one factory per resource**: `orderKeys.all`, `orderKeys.list(filters)`, `orderKeys.detail(id)`.
- **Buttons follow `allowedActions`** from the API. If the backend did not offer an action, the UI does not show it.
- **Long-running work** (a `202` response) is followed by polling the status URL with `refetchInterval`, or server-sent events where live updates are needed.
- Route loaders prefetch with `queryClient.ensureQueryData` so pages render without waterfalls.

```ts
// shared/lib/query-client.ts
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { invalidates?: readonly QueryKey[] }
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) =>
      Promise.all(
        (mutation.meta?.invalidates ?? []).map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  }),
})

// features/orders/components/cancel-order-button.tsx
const cancelOrder = useMutation({
  ...cancelOrderMutation(), // generated from the OpenAPI document
  meta: { invalidates: [orderKeys.all] },
})
```

## URL state

- Every search param is optional and falls back to `undefined` on bad input: `z.string().optional().catch(undefined)`. A missing param and a malformed one read the same, and the URL never carries a default.
- Defaults are applied where the value is read: `const { page = 1 } = Route.useSearch()`. A default in the schema writes itself into the URL, so the param can't be cleared and a first visit looks like an explicit choice.
- An empty value is written as `undefined`, which removes the key.
- Typing and filtering navigate with `replace: true`, so each keystroke doesn't add a history entry. Selecting a record pushes a new entry, so Back returns to the list.
- `loaderDeps` returns only the params the loader reads. Returning the whole search object reruns the loader on every unrelated change.
- Standard keys: `q` for free text, `sort`, `page` or `cursor`, `tab`, and the record's id name (`orderId`) for selection.
- Components read search state from the route and receive it as props. It is never copied into `useState`.

```ts
const ordersSearch = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  cursor: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/orders/')({
  validateSearch: ordersSearch,
  loaderDeps: ({ search: { q, status, cursor } }) => ({ q, status, cursor }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(listOrdersOptions(deps)),
})

function OrdersPage() {
  const { q = '' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const onSearchChange = (value: string) =>
    navigate({ search: (prev) => ({ ...prev, q: value || undefined, cursor: undefined }), replace: true })
}
```

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

## Layout check for dialogs and popovers

Every page that opens an `ls-dialog` or `ls-popover` gets the same check, in both themes. Run it in two Playwright projects, 1280px and 375px wide:

- Open the dialog by its URL (`/bills?bill=<id>`). Assert it is modal, its box sits inside the viewport, and its header and foot stay visible after the body scrolls to the end. At 375px it fills the viewport.
- Press Escape, then reopen and press Back: each time the dialog closes, the search param is gone, and focus is back on the trigger.
- Open each popover and assert its box sits inside the viewport and the element at its centre is inside it, so nothing draws over it.
- Screenshot the open dialog and popover, and run axe with them open.

```ts
const inViewport = async (page: Page, box: { x: number; y: number; width: number; height: number }) => {
  const { width, height } = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width);
  expect(box.y + box.height).toBeLessThanOrEqual(height);
};

for (const theme of ["light", "dark"] as const) {
  test(`bill dialog and popover (${theme})`, async ({ page }) => {
    await page.goto("/bills");
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const trigger = page.getByRole("link", { name: "Council tax" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Council tax" });
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((d) => d.matches(":modal"))).toBe(true);
    await inViewport(page, (await dialog.boundingBox())!);
    await dialog.locator(".ls-dialog__body").evaluate((b) => b.scrollTo(0, b.scrollHeight));
    await inViewport(page, (await dialog.locator(".ls-dialog__foot").boundingBox())!);
    await expect(page).toHaveScreenshot(`bill-dialog-${theme}.png`);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/bill=/);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.goBack();
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/bill=/);

    const card = page.locator(".ls-popover:popover-open");
    await page.getByRole("button", { name: "Due this week" }).click();
    const box = (await card.boundingBox())!;
    await inViewport(page, box);
    const onTop = await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest(".ls-popover"),
      { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    expect(onTop).toBe(true);
    await page.keyboard.press("Escape");
    await expect(card).toHaveCount(0);
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
    test/
      msw/<resource>/  # default handlers.ts and fixtures.ts per API resource
      render-route.tsx # real router and a fresh query client per test
```

Tests are covered in `frontend-testing.md`.
