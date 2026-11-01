# Lilac & Sage components

All components are plain CSS classes from `assets/bundle.css` (prefix `ls-`). Wrap them in thin React components in `src/shared/ui/`; never restyle them per app.

## Button

Triggers an action. **Primary** (`ls-btn--primary`, accent fill) at most once per view, for the thing the screen is for; **Secondary** (`--secondary`, sage) for the supporting action; default (outlined) for everything else; **Ghost** for toolbars and table rows; **Danger** only for irreversible destructive actions, and always behind a confirm.

- Consumer provides: a `<button>` (or `<a>` for navigation) with class `ls-btn` plus one variant, and a verb-first label in sentence case ("Save changes", not "SAVE" or "Submit").
- Sizes: default 36px, `ls-btn--sm` 28px for dense tables.
- Disabled: native `disabled`; for pending server actions keep the button enabled-looking and show a spinner — the action is owned by the backend and may still succeed.
- Don't put two primary buttons side by side; don't use sage for destructive actions.

Example markup:

```html
<div class="ls-stack">
<div class="ls-row"><button class="ls-btn ls-btn--primary">Save changes</button><button class="ls-btn ls-btn--secondary">Duplicate</button><button class="ls-btn">Cancel</button><button class="ls-btn ls-btn--soft">Preview</button><button class="ls-btn ls-btn--ghost">More</button><button class="ls-btn ls-btn--danger">Delete project</button></div>
<div class="ls-row"><button class="ls-btn ls-btn--primary ls-btn--sm">Small primary</button><button class="ls-btn ls-btn--sm">Small</button><button class="ls-btn ls-btn--primary" disabled>Disabled</button></div>
</div>
```

## Field

A labelled text input with optional help or error text. Wrap in `div.ls-field`; children are `label.ls-label`, an `input.ls-input` / `select.ls-select` / `textarea.ls-textarea`, and an optional `p.ls-help`.

- Consumer provides: the label (always visible, including when the field has a placeholder), `id`/`for` wiring, and `aria-describedby` pointing at the help text.
- Errors: set `data-invalid` on the field and `aria-invalid="true"` on the input; the help line turns `danger-ink`. Error text comes from the backend's validation response (problem+json `errors[]`), mapped by field name — don't duplicate business rules in the client.
- Inputs are 36px tall to align with buttons.

Example markup:

```html
<div class="ls-row" style="align-items:flex-start;gap:24px">
<div class="ls-field"><label class="ls-label" for="n">Project name</label><input class="ls-input" id="n" placeholder="e.g. Field notes" aria-describedby="nh"><p class="ls-help" id="nh">Shown to everyone in the workspace.</p></div>
<div class="ls-field" data-invalid><label class="ls-label" for="e">Email</label><input class="ls-input" id="e" value="sam@" aria-invalid="true" aria-describedby="eh"><p class="ls-help" id="eh">Enter a complete email address.</p></div>
<div class="ls-field"><label class="ls-label" for="r">Region</label><select class="ls-select" id="r"><option>Europe (London)</option><option>US East</option></select><p class="ls-help">Disabled example below.</p><input class="ls-input" disabled value="Read-only"></div>
</div>
```

## Checkbox and Switch

`label.ls-check > input[type=checkbox] + text` for choices that are submitted with a form; `label.ls-switch > input[type=checkbox][role=switch] + text` for settings that apply immediately (the toggle dispatches a backend command at once).

- Consumer provides: the native input and its visible label text.
- Don't use a switch inside a form that has a Save button — use a checkbox.

Example markup:

```html
<div class="ls-row" style="gap:24px"><label class="ls-check"><input type="checkbox" checked> Email me a weekly summary</label><label class="ls-check"><input type="checkbox"> Include archived</label><label class="ls-switch"><input type="checkbox" role="switch" checked> Notifications</label><label class="ls-switch"><input type="checkbox" role="switch"> Beta features</label></div>
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

Example markup:

```html
<div class="ls-row" style="align-items:stretch;gap:16px">
<div class="ls-card" style="width:280px"><h3 class="ls-card__title">Quarterly review</h3><p class="ls-card__meta">Updated 2 hours ago · 4 contributors</p><div class="ls-card__foot"><button class="ls-btn ls-btn--sm ls-btn--primary">Open</button><button class="ls-btn ls-btn--sm ls-btn--ghost">Share</button></div></div>
<div class="ls-card ls-card--raised" style="width:280px"><h3 class="ls-card__title">Raised card</h3><p class="ls-card__meta">Use sparingly, e.g. a draggable item or a featured panel.</p><div style="margin-top:12px"><span class="ls-badge ls-badge--success">Active</span></div></div>
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
