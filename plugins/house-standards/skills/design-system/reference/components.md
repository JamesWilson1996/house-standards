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
- Use for persistent conditions ("This workspace is read-only"). Transient confirmations go in an `ls-toast`.

Example markup:

```html
<div class="ls-stack">
<div class="ls-alert ls-alert--info" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><div><strong>Heads up.</strong> Imports run overnight; results appear by 7am.</div></div>
<div class="ls-alert ls-alert--success" role="status"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg><div><strong>Saved.</strong> Your changes are live for everyone.</div></div>
<div class="ls-alert ls-alert--warning" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg><div><strong>Plan limit close.</strong> 92 of 100 seats used.</div></div>
<div class="ls-alert ls-alert--danger" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg><div><strong>Sync failed.</strong> The billing service didn't respond. Try again in a minute.</div></div>
</div>
```

## Toast

Confirms that a command worked, with at most one action, usually Undo: "Netflix marked paid · Undo". It sits at the bottom centre of the window and leaves after 6 seconds. Every module uses this one pattern; don't build inline notices for confirmations.

`div.ls-toasts` is the live region, `role="status"`, rendered once at the app root and empty until a toast arrives. Each toast is `div.ls-toast` holding `p.ls-toast__text` and an optional `button.ls-toast__action`.

- One toast at a time. A new toast replaces the current one at once, without the leaving animation.
- Text: what changed, past tense, naming the item ("Council tax marked paid", "3 items moved to Bought"). One line where it fits; it wraps on a phone.
- Action: one verb ("Undo", "View"). Undo sends the inverse command to the backend; the UI never restores state by itself. Never put a destructive action in a toast.
- Timing: 6 seconds, paused while the pointer is over the toast or focus is inside it, so it can be read and reached. Escape dismisses it when focus is inside. Errors that need action are an `ls-alert` or a field error, not a toast.
- Position: `space-5` above the bottom edge plus the safe area. At 640px and below, when the page has an `ls-tabbar`, it sits above the bar. It is `toast-width` (440px) at most and the viewport width less `overlay-margin` on each side.
- Colours: `toast` with `on-toast` text and `toast-action` for the button. The fill is darker than the page in light and lighter in dark, so it stands out over any surface.
- A dialog is in the top layer and covers the toast. If a command in a dialog closes it, show the toast after the dialog closes.
- Motion is built in: the toast rises 8px and fades in over `motion-base`. To dismiss, add `ls-toast--leaving`: it fades and drops 8px over `motion-quick` with `ease-exit`; remove the element on `animationend`. Under reduced motion both run in 0ms and `animationend` still fires.

```ts
const TOAST_MS = 6000;

// Shows one toast, replacing any current one. Returns a function that dismisses it.
export function showToast(region: HTMLElement, text: string, action?: { label: string; run: () => void }) {
  region.replaceChildren();
  const toast = document.createElement("div");
  toast.className = "ls-toast";
  const p = document.createElement("p");
  p.className = "ls-toast__text";
  p.textContent = text;
  toast.append(p);
  const dismiss = () => {
    clearTimeout(timer);
    toast.classList.add("ls-toast--leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };
  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ls-toast__action";
    button.textContent = action.label;
    button.addEventListener("click", () => { action.run(); dismiss(); });
    toast.append(button);
  }
  let timer = setTimeout(dismiss, TOAST_MS);
  const pause = () => clearTimeout(timer);
  const resume = () => { if (!toast.matches(":hover, :focus-within")) timer = setTimeout(dismiss, TOAST_MS); };
  toast.addEventListener("pointerenter", pause);
  toast.addEventListener("focusin", pause);
  toast.addEventListener("pointerleave", resume);
  toast.addEventListener("focusout", resume);
  toast.addEventListener("keydown", (e) => e.key === "Escape" && dismiss());
  region.append(toast);
  return dismiss;
}
```

In React, keep the current toast in one context at the app root and render the region there; modules call `useToast()` after a mutation succeeds.

Example markup:

```html
<div class="ls-stack">
<div class="ls-toast"><p class="ls-toast__text">Netflix marked paid</p><button class="ls-toast__action" type="button">Undo</button></div>
<div class="ls-toast"><p class="ls-toast__text">3 items moved to Bought</p><button class="ls-toast__action" type="button">Undo</button></div>
<div class="ls-toast"><p class="ls-toast__text">Settings saved</p></div>
</div>
```

At the app root (empty until a toast arrives):

```html
<div class="ls-toasts" role="status"></div>
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

## List

Rows of things you act on in place: bills due, shopping items, household members, today's meals. Use a list when each row has its own action; use an `ls-table` when people compare values across columns.

`ul.ls-list > li.ls-list__row`, each with up to three parts:

- `div.ls-list__lead` (optional): one of a checkbox (`label.ls-check` holding the input and `ls-sr-only` text such as "Bought Milk"), an `span.ls-date` chip ("4 Nov"), or an `ls-drag-handle` button.
- `div.ls-list__main`: the title, then `p.ls-list__meta` with one line of detail (badges, who, when). The title is `button.ls-list__title` or `a.ls-list__title` when it opens the row's dialog, and `span.ls-list__title` when nothing opens.
- `div.ls-list__end` (optional): `span.ls-list__value` (an amount or count, tabular numerals), then the row's actions.

Actions (decided 8 November, #23): every row shows its one main action as a visible control, on touch and desktop alike. The main action is the lead checkbox or one `ls-btn ls-btn--sm` in the end ("Mark paid"). Everything else is in the row's dialog, or under an `ls-btn--ghost` More button with `aria-label="More for Council tax"` opening an `ls-popover--menu`. No swipe actions.

- Rows are 56px tall at least. On a phone the end stacks the value over the action, and end buttons are 36px with a 44px hit area; lead checkboxes and handles are 44px.
- Date chip tones match the status: `ls-date--danger` overdue, `--warning` due soon, `--success` paid, neutral otherwise. The tone never stands alone: the row's meta or a badge says "4 days overdue".
- Details open in an `ls-dialog` with the open state in the URL. The whole row is not a link; only the title opens it, so the row's buttons stay separate targets.
- Motion (brand book pattern 2): a ticked row gets `ls-list__row--done` at once (title struck through in `ink-muted`), then after 400ms folds away with `ls-list__row--leaving` over `motion-base`. A new row gets `ls-enter`. Reordering uses the drag classes in Motion utilities. A toast with Undo confirms the change.
- Consumer provides: the rows from the API, each row's `allowedActions` deciding which main action shows.

```ts
const FOLD_DELAY_MS = 400;

// Marks a ticked row at once, then folds it away; removeRow drops it from the list's state.
export function foldRow(row: HTMLElement, removeRow: () => void) {
  row.classList.add("ls-list__row--done");
  setTimeout(() => {
    row.style.height = `${row.offsetHeight}px`; // a px start height, so the fold animates in every browser
    row.classList.add("ls-list__row--leaving");
    row.addEventListener("animationend", removeRow, { once: true });
  }, FOLD_DELAY_MS);
}
```

Example markup:

```html
<div class="ls-stack">
<ul class="ls-list">
<li class="ls-list__row"><div class="ls-list__lead"><span class="ls-date ls-date--danger">4 Nov</span></div><div class="ls-list__main"><button class="ls-list__title" type="button">Window cleaner</button><p class="ls-list__meta"><span class="ls-badge ls-badge--danger">4 days overdue</span>Card</p></div><div class="ls-list__end"><span class="ls-list__value">£15.00</span><button class="ls-btn ls-btn--sm" type="button">Mark paid</button></div></li>
<li class="ls-list__row"><div class="ls-list__lead"><span class="ls-date ls-date--warning">10 Nov</span></div><div class="ls-list__main"><button class="ls-list__title" type="button">Council tax</button><p class="ls-list__meta"><span class="ls-badge ls-badge--warning">Due in 2 days</span>Direct debit</p></div><div class="ls-list__end"><span class="ls-list__value">£189.00</span></div></li>
<li class="ls-list__row"><div class="ls-list__lead"><span class="ls-date ls-date--success">6 Nov</span></div><div class="ls-list__main"><button class="ls-list__title" type="button">Mortgage</button><p class="ls-list__meta"><span class="ls-badge ls-badge--success">Paid</span>Direct debit</p></div><div class="ls-list__end"><span class="ls-list__value">£1,085.00</span></div></li>
</ul>
<ul class="ls-list">
<li class="ls-list__row"><div class="ls-list__lead"><label class="ls-check"><input type="checkbox"><span class="ls-sr-only">Bought Milk</span></label></div><div class="ls-list__main"><span class="ls-list__title">Milk</span><p class="ls-list__meta">2 pints · added by Alex</p></div><div class="ls-list__end"><button class="ls-btn ls-btn--ghost ls-btn--sm" type="button" aria-label="More for Milk"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button></div></li>
<li class="ls-list__row ls-list__row--done"><div class="ls-list__lead"><label class="ls-check"><input type="checkbox" checked><span class="ls-sr-only">Bought Eggs</span></label></div><div class="ls-list__main"><span class="ls-list__title">Eggs</span></div></li>
</ul>
</div>
```

## Table

Tabular records. `div.ls-table-wrap > table.ls-table`. Right-align numbers with `td.num`; mark a selected row with `aria-selected="true"`.

- Consumer provides: column headers and rows. Sorting, filtering and pagination are server-side (cursor-based) — the table renders what the query returns; TanStack Table is used in headless/manual mode.
- Body text is `body-sm`; headers `ink-muted` on `surface-sunken`.

Example markup:

```html
<div class="ls-table-wrap"><table class="ls-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th class="num">Total</th><th><span class="ls-sr-only">Actions</span></th></tr></thead><tbody>
<tr><td><code>ORD-1042</code></td><td>Harlow &amp; Co</td><td><span class="ls-badge ls-badge--success">Paid</span></td><td class="num">£1,240.00</td><td><button class="ls-btn ls-btn--ghost ls-btn--sm">Refund</button></td></tr>
<tr aria-selected="true"><td><code>ORD-1041</code></td><td>Pennine Bakery</td><td><span class="ls-badge ls-badge--warning">Pending</span></td><td class="num">£86.50</td><td><button class="ls-btn ls-btn--ghost ls-btn--sm">Refund</button></td></tr>
<tr><td><code>ORD-1040</code></td><td>Mossgate Ltd</td><td><span class="ls-badge ls-badge--danger">Refunded</span></td><td class="num">£312.00</td><td></td></tr>
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
- At 640px and below, when the page also has an `ls-tabbar`, the sidebar is hidden and the tab bar takes over.

Example markup:

```html
<nav class="ls-nav"><a class="ls-nav__item" href="#" aria-current="page"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/></svg>Dashboard</a><a class="ls-nav__item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>Orders</a><a class="ls-nav__item" href="#"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>Settings</a></nav>
```

## Tab bar

The app's top-level navigation on a phone: a bar fixed along the bottom edge with up to 5 destinations, each an icon over a short label. The bundle shows it at 640px and below and hides it above, where `ls-nav` is the sidebar. Render both from the same list of routes.

`nav.ls-tabbar[aria-label="Main"] > a.ls-tabbar__item`, each holding a 20px Lucide icon (`aria-hidden="true"`), `span.ls-tabbar__label` and an optional `span.ls-tabbar__badge` count. The current place has `aria-current="page"`.

- 5 items at most, in the same order as the sidebar. The member's name, Settings and Sign out are not tabs: they go in the account menu opened from the page header's account button (see Page header).
- Labels: one word where possible ("Today", "Budget", "Shopping"). A label that doesn't fit is cut with an ellipsis, so keep them short rather than relying on it.
- Badge: a count that needs attention (7 items on the list), as a number with the unit in `ls-sr-only` text ("7<span class="ls-sr-only"> items</span>"). Hide it at 0. Above 99, show "99+".
- Each item is at least 44px wide and 56px tall (`tabbar-height` 64px less `space-1` padding), plus `env(safe-area-inset-bottom)` below the bar for the home indicator. The page needs `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` for the safe area to apply.
- While the tab bar shows, the bundle pads `body` by the bar's height so the last line scrolls clear of it, and hides `ls-nav`. `ls-toasts` and a floating primary action sit above the bar.
- Switching tabs is instant (brand book Motion pattern 4): no slide or fade between top-level places. Each tab keeps its own scroll position and state where the router allows.
- Consumer provides: the links (TanStack Router `<Link>` with `activeProps={{ "aria-current": "page" }}`) and the counts from the API.

Example markup:

```html
<nav class="ls-tabbar" aria-label="Main">
<a class="ls-tabbar__item" href="#"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg><span class="ls-tabbar__label">Today</span></a>
<a class="ls-tabbar__item" href="#" aria-current="page"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg><span class="ls-tabbar__label">Budget</span></a>
<a class="ls-tabbar__item" href="#"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg><span class="ls-tabbar__label">Meals</span></a>
<a class="ls-tabbar__item" href="#"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 2h3l2.7 12.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg><span class="ls-tabbar__label">Shopping</span><span class="ls-tabbar__badge">7<span class="ls-sr-only"> items</span></span></a>
<a class="ls-tabbar__item" href="#"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg><span class="ls-tabbar__label">Projects</span></a>
</nav>
```

## Quick add

Adds items one after another without leaving the keyboard: the shopping list, a board column's new card. An input and an Add button in one row, and optional suggestion chips under it.

`form.ls-quickadd` holds `div.ls-quickadd__row` (an `input.ls-input` with an `aria-label` and `enterkeyhint="done"`, then a `button.ls-btn.ls-btn--primary[type=submit]` "Add") and, optionally, `div.ls-quickadd__suggestions` with `span.ls-quickadd__label` ("Bought before") and `button.ls-chip` per suggestion.

- Enter or Add submits. The field clears at once and keeps focus, before the server answers, so the next item can be typed straight away. If the command fails, the text comes back into the field with the error in a help line. Never disable the field while a command is in flight: text typed during the wait belongs to the next item.
- Each submit is its own command with its own client-made id and `Idempotency-Key`, so items typed quickly arrive as separate items and a retry is safe.
- The new item appears in the list in place with `ls-enter`. No toast when the new row is on screen; a toast with Undo when it lands somewhere out of view.
- Suggestions: at most 8 chips with a 16px Lucide `plus`, from the API (items bought before, most frequent first). Tapping one adds it at once and the chip goes. They wrap onto as many lines as they need; this is not a filter bar.
- Empty input: Add does nothing and the field keeps focus. Don't disable the button, so it stays findable.
- 36px controls on desktop, 44px on a phone.

```ts
// Clears at once so typing can continue; puts the text back only if the command fails.
export async function submitQuickAdd(input: HTMLInputElement, add: (name: string) => Promise<void>) {
  const name = input.value.trim();
  if (!name) return;
  input.value = "";
  input.focus();
  try {
    await add(name);
  } catch (error) {
    if (!input.value) input.value = name;
    throw error;
  }
}
```

Example markup:

```html
<form class="ls-quickadd">
<div class="ls-quickadd__row"><input class="ls-input" aria-label="Add an item" placeholder="Add an item" enterkeyhint="done" autocomplete="off"><button class="ls-btn ls-btn--primary" type="submit">Add</button></div>
<div class="ls-quickadd__suggestions"><span class="ls-quickadd__label">Bought before</span><button class="ls-chip" type="button"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Milk</button><button class="ls-chip" type="button"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Bread</button><button class="ls-chip" type="button"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Bananas</button><button class="ls-chip" type="button"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Washing-up liquid</button></div>
</form>
```

## Filter bar and chips

The one row of controls above a list, on every screen size: the scope (which month, which week), search, the filters in use as removable chips, a Filter chip that holds every other filter, and the result count. It replaces rows of selects and checkboxes, which push the first result below the first screen on a phone.

`div.ls-filterbar` holds `div.ls-filterbar__row`, the Filter chip and `p.ls-filterbar__count`. The row holds, in order:

1. Scope, if the list has one: an `ls-stepper` (see Stepper). Its short label on a phone leaves room for search.
2. Search: `input.ls-input.ls-filterbar__search[type=search]` with an `aria-label` ("Search bills") and a placeholder.
3. Active filters: one `button.ls-chip.ls-chip--active` per filter in use, labelled with its value ("Category: Home") and a 16px Lucide `x`. Activating it removes the filter. Its `aria-label` says so: "Remove filter Category: Home".
4. Quick toggles, at most 2, for filters people flip daily ("Mine", "High priority"): `button.ls-chip[aria-pressed]`.
Then, after the row: the Filter chip, `button.ls-chip.ls-filterbar__filter` with a 16px Lucide `sliders-horizontal` icon, the word "Filter" and, when filters are in use, `span.ls-chip__count` with how many.

- One row, always. When the row is wider than the screen it scrolls sideways; it never wraps. The Filter chip stays outside the scrolling part, so it is always in view, and its count shows how many filters are in use when some have scrolled away. A filter that doesn't earn a place in the row lives behind the Filter chip.
- The Filter chip opens the full set of filters as an `ls-form`: in an `ls-popover ls-popover--panel` (320px) below the chip on desktop, and in an `ls-dialog--sheet` on a phone. The same form component goes in either. Each change applies at once and updates the URL, so the list behind updates while the panel is open; the sheet's foot has "Show 3 bills" (closes it) and "Clear all".
- Count: `p.ls-filterbar__count` with `aria-live="polite"`, the result count in words ("3 of 12 bills"). It sits at the right end on desktop and under the row on a phone.
- Filter state lives in the URL search params (Zod-validated), so a filtered list can be linked and survives reload. The sheet's open state follows the dialog rules; the popover's does not go in the URL.
- Chips are 32px tall with a 44px hit area. Pressed and active chips use `accent-soft` with `on-accent-soft`.
- Lists with no filters have no filter bar. A list with only a search has a bar with just the search and the count.

```ts
const phone = matchMedia("(max-width: 640px)");

// The Filter chip opens the sheet (a URL param, so Back closes it) on a phone and the popover elsewhere.
export function openFilters(chip: HTMLElement, popover: HTMLElement, openSheet: () => void) {
  if (phone.matches) openSheet();
  else popover.showPopover({ source: chip });
}
```

Example markup:

```html
<div class="ls-filterbar">
<div class="ls-filterbar__row">
<input class="ls-input ls-filterbar__search" type="search" aria-label="Search bills" placeholder="Search bills">
<button class="ls-chip ls-chip--active" type="button" aria-label="Remove filter Category: Home">Category: Home<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
<button class="ls-chip" type="button" aria-pressed="false">Overdue</button>
</div>
<button class="ls-chip ls-filterbar__filter" type="button" popovertarget="bill-filters"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/></svg>Filter<span class="ls-chip__count">1<span class="ls-sr-only"> in use</span></span></button>
<p class="ls-filterbar__count" aria-live="polite">3 of 12 bills</p>
</div>
<div class="ls-popover ls-popover--panel" id="bill-filters" popover><form class="ls-form">
<div class="ls-field"><label class="ls-label" for="f-cat">Category</label><select class="ls-select" id="f-cat"><option>Home</option><option>Car</option><option>Subscriptions</option></select></div>
<div class="ls-field"><label class="ls-label" for="f-pay">Paid by</label><select class="ls-select" id="f-pay"><option>Anyone</option><option>Direct debit</option><option>Card</option></select></div>
<label class="ls-check"><input type="checkbox"> Include paid bills</label>
</form></div>
```

## Stepper

Moves a list through time one period at a time: Budget's month, Meals' week. Previous, the current period, Next, and a way back to now when you have stepped away.

`div.ls-stepper[role=group]` with an `aria-label` naming the period ("Month"), holding `button.ls-stepper__step` (Previous), `span.ls-stepper__label`, `button.ls-stepper__step` (Next) and, only when away from the current period, `button.ls-stepper__now`.

- Step buttons hold a 16px Lucide `chevron-left` or `chevron-right` and an `aria-label` with the unit: "Previous month", "Next week". Disable one at the end of the data (no months before the household started).
- Label: `span.ls-stepper__long` ("November 2026", "Week of 9 November") and `span.ls-stepper__short` (`aria-hidden="true"`; "Nov 2026", "9 Nov"). On a phone the short one shows and the long one is read by screen readers, so the stepper leaves room in a filter bar. The label has `aria-live="polite"` so a step is announced.
- Back to now: `ls-stepper__now` in `link` colour, "This month" or "This week". Render it only when the stepper is away from now.
- The period lives in the URL search params (`?month=2026-11`, Zod-validated), so Back steps back and a link opens the same period. A month is a plain calendar month with no time zone; "now" comes from the app's `Clock` in the household's zone.
- Changing period swaps the list in place: no slide or fade (brand book Motion pattern 4 treats it like switching tabs).
- In a list's filter bar it is the scope and goes first in `ls-filterbar__row`. On a page without filters it can sit alone above the content.
- 36px tall with 30px buttons on desktop; 44px tall with 40px buttons on a phone.

Example markup:

```html
<div class="ls-row">
<div class="ls-stepper" role="group" aria-label="Month"><button class="ls-stepper__step" type="button" aria-label="Previous month"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><span class="ls-stepper__label" aria-live="polite"><span class="ls-stepper__long">November 2026</span><span class="ls-stepper__short" aria-hidden="true">Nov 2026</span></span><button class="ls-stepper__step" type="button" aria-label="Next month"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button></div>
<div class="ls-stepper" role="group" aria-label="Week"><button class="ls-stepper__step" type="button" aria-label="Previous week"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><span class="ls-stepper__label" aria-live="polite"><span class="ls-stepper__long">Week of 23 November</span><span class="ls-stepper__short" aria-hidden="true">23 Nov</span></span><button class="ls-stepper__step" type="button" aria-label="Next week"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button><button class="ls-stepper__now" type="button">This week</button></div>
</div>
```

## Board

Columns of numbered cards that move between stages: a project's To do, In progress and Done. `div.ls-board` holds one `section.ls-column` per stage.

- Column: `div.ls-column__head` with `h2.ls-column__title` wrapping a `button.ls-column__toggle` (`aria-expanded`, `aria-controls` on the cards, a 16px Lucide `chevron-down` that turns when folded) and `span.ls-column__count`; then `ol.ls-column__cards`. A folded column gets `ls-column--folded` and shows only its head. Fold state is per device (local storage), not on the server.
- Card: `article.ls-board__card` in an `li`, with `div.ls-board__top` (`span.ls-board__number` "#4" and an optional badge), `button.ls-board__title` (or a link) and an optional `p.ls-board__meta`. The title's hit area covers the whole card, and it opens the card in an `ls-dialog` with the open state in the URL. Cards hold no other buttons.
- Desktop: columns sit side by side at `board-column-width` (280px); the board scrolls sideways when they don't fit.
- Phone (decided 8 November, #26): one column at a time. The columns become the page header's tab row (`div.ls-tabs.ls-page-header__tabs.ls-board__tabs`, each tab "To do" with `span.ls-tab__count`), sticky at the top as in Page header. The column on screen has `ls-column--current`; the others and the column heads are hidden. The current column lives in the URL (`?column=todo`). The tab row is hidden above 640px, where every column shows.
- Dragging (brand book Motion pattern 1): cards have no handle. A mouse drag starts at once; on touch the card lifts after a 350ms press, with a 15ms vibration where supported, so a swipe still scrolls. The lifted card takes `ls-lifted ls-lifted--tilt`, an `ls-drop-slot` opens where it will land (`moveSlot` in Motion utilities), and the column under the pointer gets `ls-column--drop`. On a phone, dragging onto a tab gives it `ls-tab--drop`; holding there for 500ms switches to that column so the card can be placed in it, and letting go on the tab puts the card at the top of that column.
- Without dragging: the card's dialog has Move to, which opens an `ls-dialog--sheet` on a phone listing the columns. This is the keyboard and screen reader route.
- After a move, the API's new order is the truth; a toast with Undo confirms it.

```ts
const LIFT_DELAY_MS = 350;
const MOVE_TOLERANCE_PX = 8;

// On touch, lifts a card after a press; moving first means the finger is scrolling, so nothing lifts.
export function pressToLift(card: HTMLElement, lift: (e: PointerEvent) => void) {
  card.addEventListener("pointerdown", (down) => {
    if (down.pointerType === "mouse") return lift(down);
    const timer = setTimeout(() => {
      navigator.vibrate?.(15);
      lift(down);
    }, LIFT_DELAY_MS);
    const cancel = () => clearTimeout(timer);
    const move = (e: PointerEvent) => Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) > MOVE_TOLERANCE_PX && cancel();
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", cancel, { once: true });
    card.addEventListener("pointercancel", cancel, { once: true });
  });
}
```

Example markup (the tab row shows on a phone only):

```html
<div class="ls-tabs ls-board__tabs" role="tablist" aria-label="Columns"><button class="ls-tab" role="tab" aria-selected="true">To do<span class="ls-tab__count">3</span></button><button class="ls-tab ls-tab--drop" role="tab">In progress<span class="ls-tab__count">1</span></button><button class="ls-tab" role="tab">Done<span class="ls-tab__count">0</span></button></div>
<div class="ls-board">
<section class="ls-column ls-column--current" aria-labelledby="todo-title"><div class="ls-column__head"><h2 class="ls-column__title" id="todo-title"><button class="ls-column__toggle" type="button" aria-expanded="true" aria-controls="todo-cards"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>To do</button></h2><span class="ls-column__count">3<span class="ls-sr-only"> cards</span></span></div><ol class="ls-column__cards" id="todo-cards"><li><article class="ls-board__card"><div class="ls-board__top"><span class="ls-board__number">#1</span><span class="ls-badge ls-badge--warning">High priority</span></div><button class="ls-board__title" type="button">Loose socket by the hob</button><p class="ls-board__meta">Electrics · Alex</p></article></li><li><article class="ls-board__card"><div class="ls-board__top"><span class="ls-board__number">#3</span></div><button class="ls-board__title" type="button">Sealant round the sink</button><p class="ls-board__meta">Plumbing</p></article></li><li><article class="ls-board__card"><div class="ls-board__top"><span class="ls-board__number">#4</span></div><button class="ls-board__title" type="button">Extractor fan noisy</button></article></li></ol></section>
<section class="ls-column ls-column--drop" aria-labelledby="doing-title"><div class="ls-column__head"><h2 class="ls-column__title" id="doing-title"><button class="ls-column__toggle" type="button" aria-expanded="true" aria-controls="doing-cards"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>In progress</button></h2><span class="ls-column__count">1<span class="ls-sr-only"> cards</span></span></div><ol class="ls-column__cards" id="doing-cards"><li><article class="ls-board__card"><div class="ls-board__top"><span class="ls-board__number">#2</span></div><button class="ls-board__title" type="button">Cupboard door hinge</button><p class="ls-board__meta">Carpentry · Sam</p></article></li></ol></section>
<section class="ls-column ls-column--folded" aria-labelledby="done-title"><div class="ls-column__head"><h2 class="ls-column__title" id="done-title"><button class="ls-column__toggle" type="button" aria-expanded="false" aria-controls="done-cards"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>Done</button></h2><span class="ls-column__count">0<span class="ls-sr-only"> cards</span></span></div><ol class="ls-column__cards" id="done-cards"></ol></section>
</div>
```

## Dialog

A modal window over the current page. Record details (a bill, a transaction) and filtered lists opened from a summary ("3 bills due this week") open in a dialog, so closing it puts the user back where they were. A multi-step flow or a form longer than one screen gets its own route.

`dialog.ls-dialog` opened with `showModal()`, holding `header.ls-dialog__header` (an `h2.ls-dialog__title` and a close button), `div.ls-dialog__body` and an optional `footer.ls-dialog__foot` for actions.

- Sizes: default `dialog-md` (560px) for details and short forms, `ls-dialog--sm` (400px) for confirmations, `ls-dialog--lg` (800px) for lists and tables. At 640px wide and below every size fills the screen, except a sheet.
- Sheet (`ls-dialog--sheet`): on a phone, a short form or picker rises as a bottom sheet with the page still in view above it. Use it for pickers, filters, Move to, and forms of up to 4 fields (Change income, a meal slot). Anything longer, such as Add bill with More open, stays full screen. Above 640px a sheet is the centred dialog at its size class. See Sheet below.
- The body scrolls and the header and foot stay in view. The page behind does not scroll while the dialog is open.
- Consumer provides: `aria-labelledby` pointing at the title, a close button with `aria-label="Close"` and a 16px Lucide `x` icon, and actions in the foot with the primary first, as in `ls-form__actions`. A form inside the body is an `ls-form`; its submit button sits in the foot with `form="<form id>"`.
- Open state lives in the URL as a search param (`?bill=<id>`, Zod-validated), so a reload or a shared link reopens it. Opening pushes a history entry, and Back closes the dialog.
- Escape, a click on the backdrop, the close button and Back all close it. The first three fire the dialog's `close` event. If the app opened the dialog by pushing a history entry (marked in history state), the `close` handler calls `history.back()` to pop that entry. Only when the dialog opened from a deep link or a reload, with no such state, does the handler replace the URL without the param. Either way history ends as it was before the dialog opened; pushing or replacing a URL after an in-app open leaves a duplicate entry, so Back returns to the same page. Set `closedby="any"` for the backdrop click. Where the browser lacks `closedby`, close the dialog when a click's target is the dialog element itself; the dialog has no padding, so that target is always the backdrop.
- Focus: `showModal()` makes the rest of the page inert, so Tab stays inside the dialog. Focus moves to the first focusable element (the close button) or to the element with `autofocus`; put `autofocus` on the first field of a form. On close the browser returns focus to the element that opened the dialog. When it opened from a link with no trigger on the page, move focus to the page's `h1`.
- One dialog at a time. A popover inside a dialog is fine.
- Motion is built in: the dialog rises 8px and fades in over `motion-base` and the backdrop fades with it; at 640px and below it, and a sheet, rise from the bottom edge over `motion-travel` while the backdrop fades. Closing is instant, as the native `<dialog>` leaves the top layer at once.

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

### Sheet

`ls-dialog--sheet` on the same `dialog.ls-dialog`, with `div.ls-dialog__handle` (`aria-hidden="true"`) as its first child. Everything else is the dialog's: URL param, history, focus, Escape, backdrop click, close button and foot.

- On a phone it is as tall as its content, up to 90% of the screen (`90dvh`), and the body scrolls past that. Its top corners are `radius-lg`; the foot, or the body when there is no foot, clears the home indicator with `env(safe-area-inset-bottom)`.
- The handle is a 24px strip at the top with a 36px bar. Dragging it down moves the sheet with the finger, with no easing; let go past a quarter of the sheet's height and it closes, otherwise it settles back over `motion-base`. A tap on the page above it (the backdrop) also closes it. Keyboard and screen reader users close it with Escape or the close button, so the handle is hidden from them.
- Keep the close button: not everyone knows to swipe.
- Add `interactive-widget=resizes-content` to the page's viewport meta, so on Android the on-screen keyboard pushes the sheet up instead of covering its fields. iOS scrolls the focused field into view itself.

```ts
// Drags a sheet down by its handle; past a quarter of its height it closes, otherwise it settles back.
export function dragToClose(dialog: HTMLDialogElement, handle: HTMLElement) {
  handle.addEventListener("pointerdown", (down) => {
    const startY = down.clientY;
    let dy = 0;
    handle.setPointerCapture(down.pointerId);
    const move = (e: PointerEvent) => {
      dy = Math.max(0, e.clientY - startY);
      dialog.style.translate = `0 ${dy}px`;
    };
    const release = () => {
      handle.removeEventListener("pointermove", move);
      dialog.style.translate = "";
      if (dy > dialog.offsetHeight / 4) return dialog.close();
      const css = getComputedStyle(dialog);
      const duration = parseFloat(css.getPropertyValue("--motion-base"));
      if (duration) dialog.animate([{ translate: `0 ${dy}px` }, { translate: "0 0" }], { duration, easing: css.getPropertyValue("--ease-enter") });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", release, { once: true });
    handle.addEventListener("pointercancel", release, { once: true });
  });
}
```

Example markup (Change income, two fields):

```html
<button class="ls-btn" type="button" onclick="document.getElementById('income').showModal()">Change income</button>
<dialog class="ls-dialog ls-dialog--sm ls-dialog--sheet" id="income" aria-labelledby="income-title" closedby="any">
<div class="ls-dialog__handle" aria-hidden="true"></div>
<header class="ls-dialog__header"><h2 class="ls-dialog__title" id="income-title">Income</h2><form method="dialog"><button class="ls-btn ls-btn--ghost ls-dialog__close" aria-label="Close"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></form></header>
<div class="ls-dialog__body"><form class="ls-form" id="income-form">
<div class="ls-field"><label class="ls-label" for="inc-you">You, paid the last Friday</label><input class="ls-input" id="inc-you" inputmode="decimal" value="2,100.00" autofocus></div>
<div class="ls-field"><label class="ls-label" for="inc-partner">Partner, paid on the 28th</label><input class="ls-input" id="inc-partner" inputmode="decimal" value="1,450.00"></div>
</form></div>
<footer class="ls-dialog__foot"><button class="ls-btn ls-btn--primary" type="submit" form="income-form">Save income</button><form method="dialog"><button class="ls-btn">Cancel</button></form></footer>
</dialog>
```

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

## Page header

The top of every page, laid out the same everywhere: the area name or a back link, the `h1`, one line of current state, the actions on the right, and the page's tabs below. One component, so the main button never moves between pages and no page lacks a heading.

`header.ls-page-header` holds `div.ls-page-header__main` (with `div.ls-page-header__heading` and `div.ls-page-header__actions`) and optional tabs, `div.ls-tabs.ls-page-header__tabs`.

- Area: `span.ls-page-header__area` with the top-level place ("Budget"), or `a.ls-page-header__area` with a 16px Lucide `chevron-left` and the parent's name ("Projects") on a page one level down.
- Title: `h1.ls-page-header__title`, the page's own name ("Bills", "Kitchen snagging"). One per page. On a phone it drops to 22px.
- State: `p.ls-page-header__state`, one line of what is true now, from the API ("£924.50 still to pay in November · 1 overdue"). Status words follow the badge rules: a word, never colour alone. Leave it out if there is nothing to say.
- Actions: at most one primary (`ls-btn--primary ls-page-header__primary`), and everything else under a More button (`ls-btn` with a Lucide `ellipsis` icon and `aria-label="More actions"`) that opens an `ls-popover--menu`. The primary is the last action, followed only by the account button.
- Account: `button.ls-page-header__account` holding an `ls-avatar` with the member's initial, opening an `ls-popover--menu` with their name, Settings and Sign out. It shows on a phone; where the page has an `ls-nav` sidebar, the sidebar holds the account and the button hides above 640px.
- Tabs: an `ls-tabs` row of the page's views (Overview, Bills, Yearly costs), each a route. The row scrolls sideways if the tabs don't fit.
- Desktop shows everything in this order with nothing sticky.
- Phone (640px and below): only the tab row is sticky, 44px tall, at the top of the screen; the area, title, state and actions scroll away once read. A page without tabs has no sticky row. With an `ls-tabbar`, the primary action floats above the bar at the bottom right as a 48px pill, in thumb reach, and moves up while a toast shows. Header buttons are 44px.
- The sticky row needs the header's parent to be the scrolling page content, with no `overflow` set on the elements between them.

Menus (`ls-popover ls-popover--menu`, `popover="auto"`, opened by a `popovertarget` button) hold `p.ls-menu__label` and `p.ls-menu__meta` for a heading, `a.ls-menu__item` or `button.ls-menu__item` rows (44px on a phone or touch screen), `hr.ls-menu__sep` between groups, and `ls-menu__item--danger` for Sign out or Delete. They are plain links and buttons reached with Tab, so they take no `role="menu"`. The popover rules apply: Escape and a click outside close it and focus returns to the button.

Example markup:

```html
<header class="ls-page-header">
<div class="ls-page-header__main">
<div class="ls-page-header__heading"><span class="ls-page-header__area">Budget</span><h1 class="ls-page-header__title">Bills</h1><p class="ls-page-header__state"><strong>£924.50</strong> still to pay in November · 1 overdue</p></div>
<div class="ls-page-header__actions">
<button class="ls-btn" type="button" aria-label="More actions" popovertarget="bills-more"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button>
<button class="ls-btn ls-btn--primary ls-page-header__primary" type="button">Add bill</button>
<button class="ls-page-header__account" type="button" aria-label="Account: Alex" popovertarget="account"><span class="ls-avatar" aria-hidden="true">A</span></button>
</div>
</div>
<div class="ls-tabs ls-page-header__tabs" role="tablist" aria-label="Budget"><button class="ls-tab" role="tab">Overview</button><button class="ls-tab" role="tab" aria-selected="true">Bills</button><button class="ls-tab" role="tab">Yearly costs</button></div>
</header>
<div class="ls-popover ls-popover--menu" id="bills-more" popover><button class="ls-menu__item" type="button">Import statement</button><button class="ls-menu__item" type="button">Export CSV</button></div>
<div class="ls-popover ls-popover--menu" id="account" popover><p class="ls-menu__label">Alex Morgan</p><p class="ls-menu__meta">Wilson house</p><hr class="ls-menu__sep"><a class="ls-menu__item" href="#">Settings</a><button class="ls-menu__item ls-menu__item--danger" type="button">Sign out</button></div>
```

A page one level down, with no tabs:

```html
<header class="ls-page-header">
<div class="ls-page-header__main">
<div class="ls-page-header__heading"><a class="ls-page-header__area" href="#"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>Projects</a><h1 class="ls-page-header__title">Kitchen snagging</h1><p class="ls-page-header__state">3 to do · 1 in progress</p></div>
<div class="ls-page-header__actions"><button class="ls-btn ls-btn--primary ls-page-header__primary" type="button">Add card</button></div>
</div>
</header>
```

## Avatar

`span.ls-avatar`: a 32px circle in `sage` with the member's initial in `on-sage`. Decorative next to a visible name, so `aria-hidden="true"`; a button that holds only an avatar has its own `aria-label` ("Account: Alex").

## Visually hidden text

`ls-sr-only` hides text on screen and keeps it for screen readers: a table heading for an actions column, "(opens in a dialog)" after a link, a count's unit beside a bare number.

- It clips the element to 1px with `clip-path: inset(50%)` and `white-space: nowrap`, and positions it absolutely, so it takes no space. Put it inside a positioned container (`ls-table-wrap` is one) so it cannot widen the page.
- An icon-only button uses `aria-label` instead.
- Don't hide focusable elements with it; a skip link that appears on focus needs its own style.

Example markup:

```html
<a href="#">Council tax<span class="ls-sr-only"> (opens in a dialog)</span></a>
```

## Motion utilities

Classes for the patterns in the brand book's Motion section. Their durations come from the motion tokens, so they stop under `prefers-reduced-motion` with no extra code.

- `ls-enter`: a new row or item fades in at its place over `motion-base`.
- `ls-flash`: the row a link pointed at, marked in `accent-soft` and faded back over `motion-flash` (1.2s). Scroll it into view first (`scrollIntoView({ block: "center", behavior })`, with `behavior: "auto"` under reduced motion). To flash it again, remove the class, read `offsetWidth`, and add it back.
- `ls-drag-handle`: the grip a row is dragged by. It sets `touch-action: none`, so a finger on it drags instead of scrolling. Give it an `aria-label` ("Move Milk") and handle Arrow Up and Arrow Down on it.
- `ls-lifted`: the item being dragged. Add it on pick-up after setting `left`, `top` and `width` from the item's rect; the item becomes `position: fixed` above the page. Move it by setting `translate`, never `top`, so it follows the pointer without layout work. Add `ls-lifted--tilt` for board cards.
- `ls-drop-slot`: the dashed placeholder where the item will land. Insert it in the item's place on pick-up, with the item's height, and move it as the pointer moves.
- `ls-dragging`: on `body` while a drag is in progress, for the grabbing cursor and to stop text selection.

When the slot moves, slide the items around it from their old position to their new one, and on release settle the item into the slot, both over `motion-base`:

```ts
// Moves the drop slot and slides every other item from where it was to where it is now.
export function moveSlot(list: HTMLElement, held: HTMLElement, place: () => void) {
  const items = [...list.children].filter((el): el is HTMLElement => el !== held);
  const before = new Map(items.map((el) => [el, el.getBoundingClientRect().top]));
  place();
  const duration = parseFloat(getComputedStyle(list).getPropertyValue("--motion-base"));
  if (!duration) return;
  const easing = getComputedStyle(list).getPropertyValue("--ease-enter");
  for (const el of items) {
    const dy = (before.get(el) ?? 0) - el.getBoundingClientRect().top;
    if (dy) el.animate([{ translate: `0 ${dy}px` }, { translate: "0 0" }], { duration, easing });
  }
}
```

Example markup, mid-drag:

```html
<div class="ls-stack">
<div class="ls-drop-slot ls-pad"></div>
<div class="ls-card ls-row"><button class="ls-btn ls-btn--ghost ls-drag-handle" type="button" aria-label="Move Eggs">⋮⋮</button>Eggs</div>
<div class="ls-card ls-row ls-flash">Bananas</div>
</div>
```
