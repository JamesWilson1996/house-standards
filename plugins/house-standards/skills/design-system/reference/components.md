# Lilac & Sage components

All components are plain CSS classes from `assets/bundle.css` (prefix `ls-`). Wrap them in thin React components in `src/shared/ui/`; never restyle them per app.

## Button

Triggers an action. **Primary** (`ls-btn--primary`, accent fill) at most once per view, for the thing the screen is for; **Secondary** (`--secondary`, sage) for the supporting action; default (outlined) for everything else; **Ghost** for toolbars and table rows; **Danger** only for irreversible destructive actions, and always behind a confirm.

- Consumer provides: a `<button>` (or `<a>` for navigation) with class `ls-btn` plus one variant, and a verb-first label in sentence case ("Save changes", not "SAVE" or "Submit").
- Sizes: default 36px, `ls-btn--sm` 28px for dense tables.
- Disabled: native `disabled`, or `aria-disabled="true"` when the button must stay focusable. Each variant has its own disabled fill and text tokens (`accent-disabled` with `on-accent-disabled`, and so on) that read in both themes. Never fade a button with `opacity`.
- Pending server actions: keep the button enabled-looking and show a spinner — the action is owned by the backend and may still succeed.
- Don't put two primary buttons side by side; don't use sage for destructive actions.

Example markup:

```html
<div class="ls-stack">
<div class="ls-row"><button class="ls-btn ls-btn--primary">Save changes</button><button class="ls-btn ls-btn--secondary">Duplicate</button><button class="ls-btn">Cancel</button><button class="ls-btn ls-btn--soft">Preview</button><button class="ls-btn ls-btn--ghost">More</button><button class="ls-btn ls-btn--danger">Delete project</button></div>
<div class="ls-row"><button class="ls-btn ls-btn--primary ls-btn--sm">Small primary</button><button class="ls-btn ls-btn--sm">Small</button></div>
<div class="ls-row"><button class="ls-btn ls-btn--primary" disabled>Save changes</button><button class="ls-btn ls-btn--secondary" disabled>Duplicate</button><button class="ls-btn" disabled>Cancel</button><button class="ls-btn ls-btn--soft" disabled>Preview</button><button class="ls-btn ls-btn--ghost" disabled>More</button><button class="ls-btn ls-btn--danger" disabled>Delete project</button></div>
</div>
```

## Field

A labelled text input with optional help or error text. Wrap in `div.ls-field`; children are `label.ls-label`, an `input.ls-input` / `select.ls-select` / `textarea.ls-textarea`, and an optional `p.ls-help`.

- Consumer provides: the label (always visible, including when the field has a placeholder), `id`/`for` wiring, and `aria-describedby` pointing at the help text.
- Errors: set `data-invalid` on the field and `aria-invalid="true"` on the input; the help line turns `danger-ink`. Error text comes from the backend's validation response (problem+json `errors[]`), mapped by field name — don't duplicate business rules in the client.
- Inputs are 36px tall to align with buttons.
- Fields side by side go in `div.ls-row.ls-row--top` so every field starts on the same line. A plain `ls-row` centres its items, which moves a field without help text down.
- A button that acts on one field (Test, Copy, Generate) goes inside that field, in `div.ls-field__row` with the input. The button lines up with the input and the help text sits below the row. A button in an `ls-row` beside the field centres on the label, input and help together.
- A button with help text and no input (Export data) goes in an `ls-field` with the help after it. It keeps its own width.

Example markup:

```html
<div class="ls-row ls-row--top ls-row--loose">
<div class="ls-field"><label class="ls-label" for="n">Project name</label><input class="ls-input" id="n" placeholder="e.g. Field notes" aria-describedby="nh"><p class="ls-help" id="nh">Shown to everyone in the workspace.</p></div>
<div class="ls-field" data-invalid><label class="ls-label" for="e">Email</label><input class="ls-input" id="e" value="sam@" aria-invalid="true" aria-describedby="eh"><p class="ls-help" id="eh">Enter a complete email address.</p></div>
<div class="ls-field"><label class="ls-label" for="r">Region</label><select class="ls-select" id="r"><option>Europe (London)</option><option>US East</option></select></div>
<div class="ls-field"><label class="ls-label" for="w">Workspace ID</label><input class="ls-input" id="w" disabled value="ws_0192" aria-describedby="wh"><p class="ls-help" id="wh">Set when the workspace was created.</p></div>
</div>
```

Field with an action:

```html
<form class="ls-form">
<div class="ls-field"><label class="ls-label" for="cal">Calendar feed URL</label><div class="ls-field__row"><input class="ls-input" id="cal" value="https://example.com/feed.ics" aria-describedby="calh"><button class="ls-btn" type="button">Test feed</button></div><p class="ls-help" id="calh">We check the feed every 15 minutes.</p></div>
<div class="ls-field"><span class="ls-label">Export</span><button class="ls-btn" type="button" aria-describedby="exph">Download CSV</button><p class="ls-help" id="exph">Includes every transaction from the last 12 months.</p></div>
</form>
```

## File picker

A native `input[type=file].ls-file`. The browser's picker button takes the default button style from tokens, and the chosen file name shows beside it in `ink-muted`. Wrap it in an `ls-field` like any other input.

- Consumer provides: the label, `accept` for the allowed types, and help text that states the types and size limit ("CSV or OFX, up to 5 MB").
- Upload with a backend command once the user confirms. The API's problem+json error goes in the field's help line with `data-invalid`.
- Keep the native input. Hiding it behind a custom button drops the file name, keyboard access and drag and drop.

Example markup:

```html
<form class="ls-form">
<div class="ls-field"><label class="ls-label" for="stmt">Bank statement</label><input class="ls-file" type="file" id="stmt" accept=".csv,.ofx" aria-describedby="stmth"><p class="ls-help" id="stmth">CSV or OFX, up to 5 MB.</p></div>
<div class="ls-field"><label class="ls-label" for="logo">Logo</label><div class="ls-field__row"><input class="ls-file" type="file" id="logo" accept="image/png,image/svg+xml" aria-describedby="logoh"><button class="ls-btn ls-btn--primary" type="button" disabled>Upload</button></div><p class="ls-help" id="logoh">Choose a PNG or SVG to upload.</p></div>
</form>
```

## Form

`form.ls-form` spaces a form's fields, sub-sections and actions with the form spacing tokens. Use it for every form. App code never sets gaps or margins between fields.

| Gap | Token | Value |
| --- | --- | --- |
| Label to control, control to help | `form-help-gap` | 6px |
| Field to field | `form-field-gap` | 16px |
| Last field to actions | `form-actions-gap` | 24px |
| Sub-section to sub-section | `form-section-gap` | 32px |

- Children: `ls-field`s, or `section.ls-form__section`s that each start with `h3.ls-form__title`, then `div.ls-form__actions` last.
- A card holds one form. Split a long form into sub-sections inside the card; don't nest cards.
- The primary button comes first in `ls-form__actions`. Disable it only while the form can't be submitted, and say why in help text.

Example markup (a settings card with sub-sections, an inline action, a file picker and a disabled primary):

```html
<div class="ls-card">
<form class="ls-form">
<section class="ls-form__section"><h3 class="ls-form__title">Household</h3>
<div class="ls-field"><label class="ls-label" for="hh">Household name</label><input class="ls-input" id="hh" value="Wilson house"></div>
<div class="ls-field"><label class="ls-label" for="inv">Invite link</label><div class="ls-field__row"><input class="ls-input" id="inv" value="https://example.com/join/8f2k" readonly aria-describedby="invh"><button class="ls-btn" type="button">Copy link</button></div><p class="ls-help" id="invh">Anyone with the link can join for 7 days.</p></div>
</section>
<section class="ls-form__section"><h3 class="ls-form__title">Import</h3>
<div class="ls-field"><label class="ls-label" for="imp">Statement file</label><input class="ls-file" type="file" id="imp" accept=".csv" aria-describedby="imph"><p class="ls-help" id="imph">CSV, up to 5 MB.</p></div>
<label class="ls-check"><input type="checkbox"> Skip rows already imported</label>
</section>
<div class="ls-form__actions"><button class="ls-btn ls-btn--primary" type="submit" disabled aria-describedby="saveh">Save changes</button><button class="ls-btn" type="button">Cancel</button></div>
<p class="ls-help" id="saveh">Change a setting to save.</p>
</form>
</div>
```

## Checkbox and Switch

`label.ls-check > input[type=checkbox] + text` for choices that are submitted with a form; `label.ls-switch > input[type=checkbox][role=switch] + text` for settings that apply immediately (the toggle dispatches a backend command at once).

- Consumer provides: the native input and its visible label text.
- Don't use a switch inside a form that has a Save button — use a checkbox.

Example markup:

```html
<div class="ls-row ls-row--loose"><label class="ls-check"><input type="checkbox" checked> Email me a weekly summary</label><label class="ls-check"><input type="checkbox"> Include archived</label><label class="ls-switch"><input type="checkbox" role="switch" checked> Notifications</label><label class="ls-switch"><input type="checkbox" role="switch"> Beta features</label></div>
```

## Badge

A one- or two-word status beside an item. Tones: neutral (default), `--accent`, `--success`, `--warning`, `--danger`, `--info`. Add `span.ls-dot` for live states.

- Consumer provides: the word. Colour never carries meaning alone — the word must say it ("Failed", not just a rose chip).
- Statuses map 1:1 to the backend's state enum; render the label the API sends rather than re-deriving state in the client.

Example markup:

```html
<div class="ls-row"><span class="ls-badge">Draft</span><span class="ls-badge ls-badge--accent">In review</span><span class="ls-badge ls-badge--success"><span class="ls-dot"></span>Active</span><span class="ls-badge ls-badge--warning">Expiring</span><span class="ls-badge ls-badge--danger">Failed</span><span class="ls-badge ls-badge--info">Scheduled</span></div>
```

## Alert

An inline message about the current page. `div.ls-alert.ls-alert--{info|success|warning|danger}` with an icon and text; `role="status"` for info/success, `role="alert"` for warning/danger.

- Consumer provides: the icon (Lucide, 20px, `currentColor`), a bold lead phrase, and one sentence.
- Use for persistent conditions ("This workspace is read-only"). Transient confirmations go in a toast.

Example markup:

```html
<div class="ls-stack">
<div class="ls-alert ls-alert--info" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><div><strong>Heads up.</strong> Imports run overnight; results appear by 7am.</div></div>
<div class="ls-alert ls-alert--success" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><div><strong>Saved.</strong> Your changes are live for everyone.</div></div>
<div class="ls-alert ls-alert--warning" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg><div><strong>Plan limit close.</strong> 92 of 100 seats used.</div></div>
<div class="ls-alert ls-alert--danger" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg><div><strong>Sync failed.</strong> The billing service didn't respond. Try again in a minute.</div></div>
</div>
```

## Card

A bounded group of related content. `div.ls-card` (border only) or add `ls-card--raised` to lift with `shadow-sm`. Optional `h3.ls-card__title`, `p.ls-card__meta`, `div.ls-card__foot`.

- Consumer provides: content and, if actionable, buttons in the foot.
- Prefer the `line` border over shadows; never stack cards inside cards.
- Lay out a set of cards in `div.ls-cards`: a grid with `space-5` gaps and columns at least 260px wide.

Example markup:

```html
<div class="ls-cards">
<div class="ls-card"><h3 class="ls-card__title">Quarterly review</h3><p class="ls-card__meta">Updated 2 hours ago · 4 contributors</p><div class="ls-card__foot"><button class="ls-btn ls-btn--sm ls-btn--primary">Open</button><button class="ls-btn ls-btn--sm ls-btn--ghost">Share</button></div></div>
<div class="ls-card ls-card--raised"><h3 class="ls-card__title">Raised card</h3><p class="ls-card__meta">Use sparingly, e.g. a draggable item or a featured panel.</p><div class="ls-card__foot"><span class="ls-badge ls-badge--success">Active</span></div></div>
</div>
```

## Table

Tabular records. `div.ls-table-wrap > table.ls-table`. Right-align numbers with `td.num`; mark a selected row with `aria-selected="true"`.

- Consumer provides: column headers and rows. Sorting, filtering and pagination are server-side (cursor-based) — the table renders what the query returns; TanStack Table is used in headless/manual mode.
- Body text is `body-sm`; headers `ink-muted` on `surface-sunken`.

Example markup:

```html
<div class="ls-table-wrap"><table class="ls-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th class="num">Total</th></tr></thead><tbody>
<tr><td><code>ORD-1042</code></td><td>Harlow &amp; Co</td><td><span class="ls-badge ls-badge--success">Paid</span></td><td class="num">£1,240.00</td></tr>
<tr aria-selected="true"><td><code>ORD-1041</code></td><td>Pennine Bakery</td><td><span class="ls-badge ls-badge--warning">Pending</span></td><td class="num">£86.50</td></tr>
<tr><td><code>ORD-1040</code></td><td>Mossgate Ltd</td><td><span class="ls-badge ls-badge--danger">Refunded</span></td><td class="num">£312.00</td></tr>
</tbody></table></div>
```

## Tabs

Switch between views of the same object. `div.ls-tabs[role=tablist] > button.ls-tab[role=tab]`; the active tab has `aria-selected="true"`.

- Consumer provides: tab labels and the panels. Each tab is a route segment or search param (TanStack Router) so it survives reload and can be linked.

Example markup:

```html
<div class="ls-tabs" role="tablist"><button class="ls-tab" role="tab" aria-selected="true">Overview</button><button class="ls-tab" role="tab">Activity</button><button class="ls-tab" role="tab">Members</button><button class="ls-tab" role="tab">Settings</button></div>
```

## Nav

The app's primary sidebar. `nav.ls-nav > a.ls-nav__item`, an 18px Lucide icon then the label; the current page has `aria-current="page"`.

- Consumer provides: the links (TanStack Router `<Link>` sets `aria-current` via `activeProps`).
- Five to seven items; group extras under Settings rather than growing the list.

Example markup:

```html
<nav class="ls-nav"><a class="ls-nav__item" href="#" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>Dashboard</a><a class="ls-nav__item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>Orders</a><a class="ls-nav__item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>Settings</a></nav>
```

## Dialog

A modal window over the current page. Record details (a bill, a transaction) and filtered lists opened from a summary ("3 bills due this week") open in a dialog, so closing it puts the user back where they were. A multi-step flow or a form longer than one screen gets its own route.

`dialog.ls-dialog` opened with `showModal()`, holding `header.ls-dialog__header` (an `h2.ls-dialog__title` and a close button), `div.ls-dialog__body` and an optional `footer.ls-dialog__foot` for actions.

- Sizes: default `dialog-md` (560px) for details and short forms, `ls-dialog--sm` (400px) for confirmations, `ls-dialog--lg` (800px) for lists and tables. At 640px wide and below every size fills the screen.
- The body scrolls and the header and foot stay in view. The page behind does not scroll while the dialog is open.
- Consumer provides: `aria-labelledby` pointing at the title, a close button with `aria-label="Close"` and a 16px Lucide `x` icon, and actions in the foot with the primary first, as in `ls-form__actions`. A form inside the body is an `ls-form`; its submit button sits in the foot with `form="<form id>"`.
- Open state lives in the URL as a search param (`?bill=<id>`, Zod-validated), so a reload or a shared link reopens it. Opening pushes a history entry, and Back closes the dialog.
- Escape, a click on the backdrop, the close button and Back all close it. The first three fire the dialog's `close` event, which removes the param from the URL. Set `closedby="any"` for the backdrop click. Where the browser lacks `closedby`, close the dialog when a click's target is the dialog element itself; the dialog has no padding, so that target is always the backdrop.
- Focus: `showModal()` makes the rest of the page inert, so Tab stays inside the dialog. Focus moves to the first focusable element (the close button) or to the element with `autofocus`; put `autofocus` on the first field of a form. On close the browser returns focus to the element that opened the dialog. When it opened from a link with no trigger on the page, move focus to the page's `h1`.
- One dialog at a time. A popover inside a dialog is fine.

Example markup:

```html
<button class="ls-btn" type="button" onclick="document.getElementById('bill').showModal()">View council tax</button>
<dialog class="ls-dialog" id="bill" aria-labelledby="bill-title" closedby="any">
<header class="ls-dialog__header"><h2 class="ls-dialog__title" id="bill-title">Council tax</h2><form method="dialog"><button class="ls-btn ls-btn--ghost ls-dialog__close" aria-label="Close"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></form></header>
<div class="ls-dialog__body"><p class="ls-card__meta">Due 1 December · Direct debit</p><p>£164.00 to Leeds City Council for December.</p></div>
<footer class="ls-dialog__foot"><button class="ls-btn ls-btn--primary" type="button">Mark as paid</button><form method="dialog"><button class="ls-btn">Close</button></form></footer>
</dialog>
```

URL-driven dialog with TanStack Router (the route's `validateSearch` adds `bill: z.string().optional()`):

```tsx
function BillDialog() {
  const { bill } = Route.useSearch();
  const navigate = Route.useNavigate();
  const openedInApp = useRouterState({ select: (s) => s.location.state.openedInApp === true });
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
    if (bill && !dialog.open) dialog.showModal();
    if (!bill && dialog.open) dialog.close(); // Back removed the param
  }, [bill]);

  const onClose = () => {
    if (!bill) return; // the URL already changed
    // Undo the entry the app pushed; a direct link has none, so drop the param in place.
    if (openedInApp) history.back();
    else navigate({ search: (s) => ({ ...s, bill: undefined }), replace: true });
  };

  return (
    <dialog ref={ref} className="ls-dialog" aria-labelledby="bill-title" closedby="any" onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}>
      …
    </dialog>
  );
}
// Open it: <Link search={(s) => ({ ...s, bill: id })} state={{ openedInApp: true }}>View bill</Link>
```

`openedInApp` needs a `HistoryState` entry in the router's module augmentation.

## Popover

A small layer anchored to the element that opened it, built on the Popover API. Popovers render in the top layer, so no z-index or `overflow: hidden` ancestor can draw over or clip them. Two uses:

- **Tooltip** (`ls-popover ls-popover--tip`, `popover="hint"`, `role="tooltip"`): one short phrase that names or explains its trigger. Text only, with no links or buttons. The trigger points at it with `aria-describedby`. Browsers without `hint` treat the value as `manual`, which behaves the same apart from light dismiss.
- **Detail card** (`ls-popover`, `popover="auto"`): a few lines about an item, with an optional `h3.ls-popover__title` and `p.ls-popover__meta`, and at most two buttons. Anything longer, or a form, goes in a dialog.

| Input | Tooltip | Detail card |
| --- | --- | --- |
| Pointer hover | Shows 300ms after the pointer enters the trigger; hides when it leaves | Does nothing |
| Keyboard focus | Shows on focus; hides on blur | Enter or Space on the trigger toggles it |
| Tap | A tap on the trigger shows it; a tap anywhere else hides it | A tap on the trigger toggles it; a tap outside closes it |
| Escape | Hides it | Closes it and returns focus to the trigger |

- The detail card's trigger is a `button` with `popovertarget`, so the browser handles toggling, light dismiss, Escape and focus return. The tooltip needs a small handler: `showPopover({ source: trigger })` on `pointerenter` (after the delay), on `focus` and on a touch `pointerdown`, and `hidePopover()` on `pointerleave` and `blur`.
- A tooltip never holds the only copy of information. An icon-only button keeps its own `aria-label`, and on touch the tooltip appears only when tapped.
- Placement: below the trigger by default, `ls-popover--top` above. Where the browser supports CSS anchor positioning (`position-area`), the popover anchors to its trigger (the `popovertarget` button, or the `source` passed to `showPopover()`), flips above or below, and shifts sideways to stay `popover-offset` (8px) inside the viewport.
- Fallback where `position-area` is missing: compute the position from the trigger and set `--ls-popover-x` and `--ls-popover-y`. Run it on the popover's `toggle` event when `newState` is `"open"`, and on scroll and resize while it is open.

```ts
// Runs only where CSS anchor positioning is missing; the stylesheet reads these two properties.
export function placePopover(popover: HTMLElement, trigger: HTMLElement) {
  if (CSS.supports("position-area: block-end")) return;
  const css = getComputedStyle(popover);
  const offset = parseFloat(css.getPropertyValue("--popover-offset"));
  const t = trigger.getBoundingClientRect();
  const p = popover.getBoundingClientRect();
  const fitsBelow = t.bottom + offset + p.height <= innerHeight - offset;
  const y = fitsBelow ? t.bottom + offset : Math.max(offset, t.top - offset - p.height);
  const x = Math.min(Math.max(offset, t.left + t.width / 2 - p.width / 2), innerWidth - offset - p.width);
  popover.style.setProperty("--ls-popover-x", `${x}px`);
  popover.style.setProperty("--ls-popover-y", `${y}px`);
}
```

Example markup:

```html
<div class="ls-row">
<button class="ls-btn ls-btn--ghost" type="button" aria-label="Paid by direct debit" aria-describedby="dd-tip"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg></button>
<div class="ls-popover ls-popover--tip" id="dd-tip" popover="hint" role="tooltip">Paid by direct debit on the 1st</div>
<button class="ls-btn" type="button" popovertarget="bill-card">Council tax</button>
<div class="ls-popover" id="bill-card" popover><h3 class="ls-popover__title">Council tax</h3><p class="ls-popover__meta">£164.00 · Due 1 December</p></div>
</div>
```
