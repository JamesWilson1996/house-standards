# Lilac & Sage components

All components are plain CSS classes from `assets/bundle.css` (prefix `ls-`). Wrap them in thin React components in `src/shared/ui/`; never restyle them per app.

## Button

Triggers an action. **Primary** (`ls-btn--primary`, accent fill) at most once per view, for the thing the screen is for; **Secondary** (`--secondary`, sage) for the supporting action; default (outlined) for everything else; **Ghost** for toolbars and table rows; **Danger** only for irreversible destructive actions, and always behind a confirm.

- Consumer provides: a `<button>` (or `<a>` for navigation) with class `ls-btn` plus one variant, and a verb-first label in sentence case ("Save changes", not "SAVE" or "Submit").
- Sizes: default 36px, `ls-btn--sm` 28px for dense tables. On a phone or touch screen the default is 44px and a small button keeps its 28px look with a 44px hit area (brand book, Touch).
- Disabled: native `disabled`, or `aria-disabled="true"` when the button must stay focusable. Each variant has its own disabled fill and text tokens (`accent-disabled` with `on-accent-disabled`, and so on) that read in both themes. Never fade a button with `opacity`.
- Busy: while its command is on the way, set `aria-busy="true"` on the button and leave it enabled-looking, since the backend owns the action and it may still succeed. After `motion-wait` (400ms) the bundle shows a spinner before the label, and the button keeps its width. Ignore further clicks while it is busy, and remove the attribute when the command settles. See Loading and errors.
- A link may carry `ls-btn` when it navigates but sits among buttons (an empty state's action, "Add bill" in a page header). It looks the same as a `button.ls-btn`, with no underline at rest, on hover or on focus.
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
- Inputs are 36px tall to align with buttons. On a phone or touch screen inputs and selects are 44px with 16px text, so iOS doesn't zoom the page when one takes focus.
- Required and optional (decided 8 November, #52): most fields are needed, so only the optional ones are marked, with `span.ls-label__optional` inside the label: `<label class="ls-label" for="note">Note <span class="ls-label__optional">(optional)</span></label>`. Required fields carry no mark and no asterisk; set `required` on the input so the browser and screen readers know.
- A select's open list (decided 8 November, #52): in Chrome and Edge 135+, Chrome on Android included, it opens as a card like a menu, with radius, border, shadow, the 8px rise, options highlighted in `accent-soft` and a tick on the current choice. On a phone or touch screen its rows are 44px with 16px text. Firefox and Safari, and so every iPhone browser, keep their own list. Nothing to add in the markup: plain `option`s in an `ls-select`.
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
- Submitting: the primary gets `aria-busy="true"` (see Loading and errors) and further submits are ignored until the command settles. Fields stay editable and nothing is disabled, so a slow answer never locks the form. On success the form's dialog closes or the toast confirms; on failure the alert or field errors appear and focus moves to the first one.

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

## Money

Amounts of money, typed and shown. Money is stored and sent as integer minor units with a currency (`amount_minor: 164000, currency: "GBP"`); these classes only display it.

- Input: `div.ls-money` in place of the `ls-input`, holding `span.ls-money__currency` (`aria-hidden="true"`, the symbol "£") and `input.ls-money__input` with `inputmode="decimal"`, `autocomplete="off"` and the field's `id`. The label says the currency when it matters ("Amount (£)"); the symbol is decoration. Digits are tabular and left-aligned, as typed.
- The wrapper is the visible box: it takes the focus ring, `data-invalid` and disabled styles like an `ls-input`, and fits in an `ls-field__row`. 36px tall; 44px with 16px text on a phone or touch screen.
- Accept what people type: "1,234.5", "£12", " 12.00 ". Parse to minor units on submit and send that; the API's problem+json decides what is valid and its error goes in the help line.
- Text: `span.ls-amount` for any amount outside a table (`td.num` already does this in a table): tabular numerals, never wrapped. Format with `Intl.NumberFormat` and the household's currency, never by hand. A negative amount has `ls-amount--negative` (`danger-ink`), keeps its minus sign, and says what it means in words beside it ("−£695 short"). Colour is never the only sign.
- Amounts change in place: no counting up.

```ts
const MINOR_PER_MAJOR = 100; // GBP, EUR and USD; other currencies read maximumFractionDigits from Intl.NumberFormat

// "£1,234.5" -> 123450. Returns null for text that isn't an amount, so the field can say so before sending.
export function parseMoney(text: string): number | null {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(text.replace(/[^\d.-]/g, ""));
  if (!match) return null;
  const [, sign, whole, fraction = ""] = match;
  const minor = Number(whole) * MINOR_PER_MAJOR + Number(fraction.padEnd(2, "0"));
  return sign ? -minor : minor;
}

export const formatMoney = (minor: number, currency: string, locale = "en-GB") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(minor / MINOR_PER_MAJOR);
```

Example markup:

```html
<div class="ls-stack">
<form class="ls-form">
<div class="ls-field"><label class="ls-label" for="amt">Amount</label><div class="ls-money"><span class="ls-money__currency" aria-hidden="true">£</span><input class="ls-money__input" id="amt" inputmode="decimal" autocomplete="off" value="164.00"></div></div>
<div class="ls-field" data-invalid><label class="ls-label" for="inc">Partner, paid on the 28th</label><div class="ls-money"><span class="ls-money__currency" aria-hidden="true">£</span><input class="ls-money__input" id="inc" inputmode="decimal" autocomplete="off" value="1,450.0.0" aria-invalid="true" aria-describedby="inch"></div><p class="ls-help" id="inch">Enter an amount such as 1,450.00.</p></div>
<div class="ls-field"><label class="ls-label" for="dd">Paid so far</label><div class="ls-money"><span class="ls-money__currency" aria-hidden="true">£</span><input class="ls-money__input" id="dd" inputmode="decimal" value="85.00" disabled></div></div>
</form>
<p>Left this month: <span class="ls-amount ls-amount--negative">−£695.00</span> short. Council tax is <span class="ls-amount">£164.00</span>.</p>
</div>
```

## Dates and times

One way to show a date in every app (#53). The API sends calendar days as plain dates (`YYYY-MM-DD`) and moments as UTC instants (ISO 8601 with `Z`), as the time rules require; these helpers only display them.

| Where | Shown as | Helper |
| --- | --- | --- |
| A day in a list, chip or table | "8 Nov"; "8 Nov 2025" outside the current year | `formatDay` |
| A day where the weekday matters (meals, a week) | "Mon 9 Nov" | `formatDay(day, today, { weekday: true })` |
| How far away a due day is | "today", "tomorrow", "in 3 days", "yesterday", "4 days ago" | `formatDaysAway` |
| When something happened (last synced, changed by) | "just now", "2 minutes ago", "3 hours ago", "yesterday", then "20 Oct" | `formatAgo` |

- "Today" is the household's calendar day, worked out from the `Clock` port's instant in the household's time zone (`dayIn`), never `new Date()` in a component. Whether something is overdue comes from the API.
- Plain dates are formatted in UTC, so the 15th stays the 15th in every zone. Instants are turned into a day in the household's zone first.
- Times of day are 24-hour ("14:02") in `ls-amount`-style tabular figures. Full dates in prose spell the month: "1 December".
- An `<time datetime="2026-11-08">` element wraps any date shown, so it can be read and copied exactly.

`formatDay` and `formatDaysAway` take plain dates and ship in `@jameswilson1996/ui-tokens/days.js`; import them. `dayIn` and `formatAgo` start from an instant and a time zone, so they stay in the app:

```ts
import { formatDay, formatDaysAway } from "@jameswilson1996/ui-tokens/days.js";

const LOCALE = "en-GB";
const JUST_NOW_SECONDS = 45;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_SHOWN_AS_AGO = 6;
const MS_PER_DAY = 86_400_000;

const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY);

/** The calendar day an instant falls on in a time zone, as "YYYY-MM-DD". today = dayIn(clock.now(), household.timeZone). */
export const dayIn = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);

/** "just now", "2 minutes ago", "3 hours ago", then "yesterday" to "6 days ago", then the day. */
export function formatAgo(instant: string, now: Date, timeZone: string) {
  const seconds = Math.round((now.getTime() - new Date(instant).getTime()) / 1000);
  if (seconds < JUST_NOW_SECONDS) return "just now";
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return relative.format(-minutes, "minute");
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return relative.format(-hours, "hour");
  const day = dayIn(new Date(instant), timeZone);
  const today = dayIn(now, timeZone);
  return -daysBetween(today, day) <= DAYS_SHOWN_AS_AGO ? formatDaysAway(day, today) : formatDay(day, today);
}
```

Tests pin the clock and cover both clock-change days, as the time rules say: `dayIn(new Date("2026-06-30T23:30:00Z"), "Europe/London")` is `"2026-07-01"`.

## Date picker

Every app picks a calendar day the same way, with Lilac & Sage's own calendar in place of the browser's, which looks different in each browser and ignores the theme (decided 8 November, #57). Typing stays the fastest route; the calendar is beside it.

- Field: an `ls-input` (not `type="date"`) in an `ls-field__row` with a calendar button: `ls-btn` holding a 16px Lucide `calendar` icon, `aria-label="Choose a date"` and `aria-haspopup="dialog"`. Help text says what to type: "Type a date like 1 Dec, or pick one."
- Typing: `parseDay` reads it on blur and Enter, day first as in the UK ("1 Dec", "1/12", "1/12/2026", "2026-12-01", "today", "tomorrow"). Without a year it is the next such day on or after today. It also reads the field's own form back ("Tue 1 Dec", "Fri, 1 Jan 2027"), so tabbing through a filled field or changing only the number keeps it valid (#81). The weekday is ignored, so "Tue 3 Dec" is the 3rd and the field then shows "Thu 3 Dec": the number is what someone just typed, and refusing it would be an error for a change they meant. The field then shows the day as `formatDay(day, today, { weekday: true })` ("Tue 1 Dec"). When `parseDay` returns null, the field gets `data-invalid` and its help says "Enter a date like 1 Dec 2026."; the value sent to the API stays the last good one.
- Calendar: the button opens it in an `ls-popover ls-popover--calendar` (`popover="auto"`, `role="dialog"`, `aria-label="Choose a date"`) below the field on desktop, and in an `ls-dialog--sheet` on a phone, with no URL param, as it belongs to its field. It opens on the field's month, or today's. Where `position-area` is missing (Safari), place it with `placePopover(popover, button)` from Popover, on `toggle` and on scroll and resize while open, as for any popover; it goes below the button and flips above when there's no room.
- Month: `div.ls-calendar` holds `div.ls-calendar__head` (previous month, `h2.ls-calendar__title` with `aria-live="polite"`, next month; the steps are `ls-btn ls-btn--ghost ls-calendar__step` with Lucide `chevron-left` and `chevron-right` and labels "Previous month" and "Next month") and `table.ls-calendar__grid` with `role="grid"`, `aria-labelledby` on the title, one `th` per weekday from Monday ("M" with `abbr="Monday"`), and a `td.ls-calendar__day` per day from `monthGrid`. Blank cells are empty `td`s.
- Days: each day cell carries `data-day`, `aria-label` from `dayLabel` ("Tuesday, 1 December 2026"), `aria-selected="true"` on the chosen one (filled `accent`), `aria-current="date"` on today (an `accent` ring), and `aria-disabled="true"` outside a min or max (`on-disabled`, not chosen). Only one day has `tabindex="0"`: the chosen day, else today, else the 1st; the rest have `tabindex="-1"`.
- Keyboard, from the WAI-ARIA date picker dialog pattern: arrows move by a day and a week, Home and End to the week's ends, Page Up and Page Down by a month (with Shift, a year); moving past the month shows the next one. Enter or Space picks, which closes the calendar, fills the field and returns focus to the calendar button. Escape closes only the calendar, never a dialog the field sits in, and returns focus to the button. `calendarKey(event, focusedDay, { min, max })` turns a key into what to do (below); a day outside the min or max can be focused but not picked.
- 36px days with a pointer, 44px on a phone or touch screen, where the month fills the sheet's width. Motion is the popover's or sheet's own.
- The value sent is the plain date (`YYYY-MM-DD`), never a time or an instant.

The helpers ship in `@jameswilson1996/ui-tokens/days.js`, with types (#82). Import them; don't copy them into the app. Everything takes and returns plain dates (`YYYY-MM-DD`), and "today" is always passed in from the household's day, so nothing reads the browser clock.

| Export | Does |
| --- | --- |
| `parseDay(text, today)` | A typed date as a plain date, or null |
| `formatDay(day, today, { weekday })` | "1 Dec", "Tue 1 Dec", "Fri, 1 Jan 2027" |
| `monthGrid("2026-12")` | The month's weeks, Monday first, null for blank cells |
| `dayLabel(day)`, `monthLabel(month)` | "Tuesday, 1 December 2026", "December 2026" |
| `addDays(day, n)`, `addMonths(day, n)` | Day maths; `addMonths` keeps inside the month (31 Jan plus one is 28 Feb) |
| `moveFocus(day, key, shiftKey)` | The day an arrow, Home, End or Page key moves to |
| `isOutside(day, { min, max })` | Whether a day can't be picked |
| `calendarKey(event, day, { min, max })` | `{ type: "move", day }`, `{ type: "pick", day }`, `{ type: "close" }` or null |

The calendar's key handler, in React:

```tsx
import { calendarKey } from "@jameswilson1996/ui-tokens/days.js";

const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
  const action = calendarKey(e, focused, { min, max });
  if (!action) return;
  e.preventDefault();
  if (action.type === "move") setFocused(action.day); // a layout effect focuses the cell with that data-day; its month shows when it's another
  if (action.type === "pick") pick(action.day); // fill the field, close, return focus to the calendar button
  if (action.type === "close") {
    e.stopPropagation(); // so a dialog round the field stays open
    close();
  }
};
```

The package's tests cover the forms above, the field's weekday form, "1 Jan" typed on 8 November 2026 as `"2027-01-01"`, "29 Feb" as `"2028-02-29"`, "31/4/2026" and "1 Decx" as null, `addMonths("2026-01-31", 1)` as `"2026-02-28"`, both clock-change days, December 2026's first week starting on Tuesday the 1st, and every key.

Example markup (December 2026, the 1st chosen, today the 8th of November so no ring in this month):

```html
<div class="ls-field"><label class="ls-label" for="due">Next due</label>
<div class="ls-field__row"><input class="ls-input" id="due" value="Tue 1 Dec" autocomplete="off" aria-describedby="due-help"><button class="ls-btn" type="button" aria-label="Choose a date" aria-haspopup="dialog" popovertarget="due-cal"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></button></div>
<p class="ls-help" id="due-help">Type a date like 1 Dec, or pick one.</p></div>
<div class="ls-popover ls-popover--calendar" id="due-cal" popover role="dialog" aria-label="Choose a date">
<div class="ls-calendar">
<div class="ls-calendar__head"><button class="ls-btn ls-btn--ghost ls-calendar__step" type="button" aria-label="Previous month"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><h2 class="ls-calendar__title" id="due-cal-title" aria-live="polite">December 2026</h2><button class="ls-btn ls-btn--ghost ls-calendar__step" type="button" aria-label="Next month"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button></div>
<table class="ls-calendar__grid" role="grid" aria-labelledby="due-cal-title">
<thead><tr><th scope="col" abbr="Monday">M</th><th scope="col" abbr="Tuesday">T</th><th scope="col" abbr="Wednesday">W</th><th scope="col" abbr="Thursday">T</th><th scope="col" abbr="Friday">F</th><th scope="col" abbr="Saturday">S</th><th scope="col" abbr="Sunday">S</th></tr></thead>
<tbody>
<tr><td></td><td class="ls-calendar__day" data-day="2026-12-01" aria-label="Tuesday, 1 December 2026" aria-selected="true" tabindex="0">1</td><td class="ls-calendar__day" data-day="2026-12-02" aria-label="Wednesday, 2 December 2026" tabindex="-1">2</td><td class="ls-calendar__day" data-day="2026-12-03" aria-label="Thursday, 3 December 2026" tabindex="-1">3</td><td class="ls-calendar__day" data-day="2026-12-04" aria-label="Friday, 4 December 2026" tabindex="-1">4</td><td class="ls-calendar__day" data-day="2026-12-05" aria-label="Saturday, 5 December 2026" tabindex="-1">5</td><td class="ls-calendar__day" data-day="2026-12-06" aria-label="Sunday, 6 December 2026" tabindex="-1">6</td></tr>
<tr><td class="ls-calendar__day" data-day="2026-12-07" aria-label="Monday, 7 December 2026" tabindex="-1">7</td><td class="ls-calendar__day" data-day="2026-12-08" aria-label="Tuesday, 8 December 2026" tabindex="-1">8</td><td class="ls-calendar__day" data-day="2026-12-09" aria-label="Wednesday, 9 December 2026" tabindex="-1">9</td><td class="ls-calendar__day" data-day="2026-12-10" aria-label="Thursday, 10 December 2026" tabindex="-1">10</td><td class="ls-calendar__day" data-day="2026-12-11" aria-label="Friday, 11 December 2026" tabindex="-1">11</td><td class="ls-calendar__day" data-day="2026-12-12" aria-label="Saturday, 12 December 2026" tabindex="-1">12</td><td class="ls-calendar__day" data-day="2026-12-13" aria-label="Sunday, 13 December 2026" tabindex="-1">13</td></tr>
<!-- …the weeks of the 14th, 21st and 28th, from monthGrid("2026-12") -->
</tbody></table>
</div></div>
```

## Checkbox and Switch

`label.ls-check > input[type=checkbox] + text` for choices that are submitted with a form; `label.ls-switch > input[type=checkbox][role=switch] + text` for settings that apply immediately (the toggle dispatches a backend command at once).

- Consumer provides: the native input and its visible label text.
- Don't use a switch inside a form that has a Save button — use a checkbox.
- `ls-check` also holds a radio (`input[type=radio]`, drawn round with a dot), for a list of choices that each need a line of help. Group them in a `fieldset` with a `legend.ls-label`. For short choices use `ls-segmented`; see Choosing one option.

Example markup:

```html
<div class="ls-row ls-row--loose"><label class="ls-check"><input type="checkbox" checked> Email me a weekly summary</label><label class="ls-check"><input type="checkbox"> Include archived</label><label class="ls-switch"><input type="checkbox" role="switch" checked> Notifications</label><label class="ls-switch"><input type="checkbox" role="switch"> Beta features</label></div>
```

## Choosing one option

Which control, by the number and length of the options (decided 8 November, #52):

| Options | Control |
| --- | --- |
| 2 to 4, each a word or two ("Alex", "Sam", "Split") | `ls-segmented` |
| 5 or more, a known short list (how often a bill repeats) | `ls-select` |
| Each needs a line of help to choose well | `ls-check` radios in a `fieldset` |
| Long, growing or searched (meals, payees) | A picker: see below |

### Segmented control

`div.ls-segmented` with `role="radiogroup"` and `aria-labelledby` pointing at the field's label, holding one `label.ls-segmented__option` per choice, each wrapping a real `input[type=radio]` (same `name`) and its text. The inputs are invisible and cover their option, so the browser gives the arrow keys, the form value and the group's name.

- The chosen option fills with `accent-soft` and `on-accent-soft`. Focus shows the ring on the option.
- 36px tall with a pointer. On a phone or touch screen it is 44px and fills the field's width.
- It submits with the form like any radio. For a setting that applies at once (Appearance), send the command on `change`.

```html
<div class="ls-field"><span class="ls-label" id="paid-label">Paid by</span>
<div class="ls-segmented" role="radiogroup" aria-labelledby="paid-label"><label class="ls-segmented__option"><input type="radio" name="paidBy" value="alex" checked>Alex</label><label class="ls-segmented__option"><input type="radio" name="paidBy" value="sam">Sam</label><label class="ls-segmented__option"><input type="radio" name="paidBy" value="split">Split</label></div></div>
```

### Picker

For a long or growing list, a button in the field shows the current value ("Chilli" or "Choose a meal") and opens an `ls-dialog` (an `ls-dialog--sheet` on a phone) with the open state in the URL. The dialog holds an `ls-input` search at the top, then an `ls-list` of options, recent ones first. Typing filters the list; picking one closes the dialog, fills the field and returns focus to its button. When nothing matches, the list's place shows "No meals match "chill"" and, where the user may add one, an Add button for what they typed. No new classes: it is built from Field, Dialog, Sheet and List.

## Appearance

Each device can follow the OS theme or keep its own (decided 8 November, #50). The setting is an `ls-segmented` with three options, Match device, Light and Dark, with "Saved on this device only." as its help. It applies at once, with no Save.

- The choice lives in `localStorage` on the device, never on the server. Match device stores nothing.
- The inline script in `<head>` reads it before first paint, so the page never flashes the wrong theme, and sets `theme-color` to match. It goes after the `tokens.css` link. Match device follows the OS live, while the page is open.

```html
<script>
  // Before first paint: this device's choice, else the OS. The key matches APPEARANCE_KEY in appearance.ts.
  (() => {
    let pick = null;
    try { pick = localStorage.getItem("ls-appearance"); } catch { /* storage blocked: follow the OS */ }
    const dark = pick ? pick === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const root = document.documentElement;
    root.dataset.theme = dark ? "dark" : "light";
    // The browser bar matches the page; tokens.css is linked above this script, so --bg is ready.
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
  })();
</script>
```

```ts
export const APPEARANCE_KEY = "ls-appearance";
export const APPEARANCES = ["match", "light", "dark"] as const;
export type Appearance = (typeof APPEARANCES)[number];

const osDark = matchMedia("(prefers-color-scheme: dark)");

export function readAppearance(): Appearance {
  try {
    const stored = localStorage.getItem(APPEARANCE_KEY);
    return stored === "light" || stored === "dark" ? stored : "match";
  } catch {
    return "match";
  }
}

export function applyAppearance(choice: Appearance = readAppearance()) {
  const dark = choice === "match" ? osDark.matches : choice === "dark";
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  // The phone's browser bar and the installed app's title bar follow the page (see App shell).
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
}

export function setAppearance(choice: Appearance) {
  try {
    if (choice === "match") localStorage.removeItem(APPEARANCE_KEY);
    else localStorage.setItem(APPEARANCE_KEY, choice);
  } catch {
    // Storage blocked: the choice lasts until the page closes.
  }
  applyAppearance(choice);
}

// Match device follows the OS while the page is open.
osDark.addEventListener("change", () => applyAppearance());
```

```html
<div class="ls-field"><span class="ls-label" id="appearance-label">Appearance</span>
<div class="ls-segmented" role="radiogroup" aria-labelledby="appearance-label" aria-describedby="appearance-help"><label class="ls-segmented__option"><input type="radio" name="appearance" value="match" checked>Match device</label><label class="ls-segmented__option"><input type="radio" name="appearance" value="light">Light</label><label class="ls-segmented__option"><input type="radio" name="appearance" value="dark">Dark</label></div>
<p class="ls-help" id="appearance-help">Saved on this device only.</p></div>
```

## Badge

A one- or two-word status beside an item. Tones: neutral (default), `--accent`, `--success`, `--warning`, `--danger`, `--info`. Add `span.ls-dot` for live states.

- One line: the badge doesn't wrap, so in a narrow table cell the column widens to fit it. Keep the word short ("Due in 17 days" at most).
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
- Timing: 6 seconds, paused while the pointer is over the toast or focus is inside it, so it can be read and reached. Escape dismisses it when focus is inside. Errors from a form are an `ls-alert` or a field error, not a toast; a one-tap action that failed gets a toast with Try again in place of its success toast (see Loading and errors).
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

## Stat

One figure that answers a question at a glance: "Left this month", "Due this week". `dl.ls-stats` holds one or more `div.ls-stat`, each with `dt.ls-stat__label`, `dd.ls-stat__value` and an optional `dd.ls-stat__sub`.

- Label: what the figure is, in a few words. Value: the figure itself, tabular, formatted with `Intl.NumberFormat` (30px; 24px on a phone). Sub-line: what it is made of ("Income £3,200 · Bills £3,895") or when it was true.
- Status: an `ls-badge` inside the value, after the figure ("Short", "On track"), mapped 1:1 from the API's state. The figure stays `ink`; the badge carries the tone and the word.
- A row of stats wraps: as many 160px columns as fit (140px on a phone). Put stats in an `ls-card` when they sit among other content.
- A stat beats a chart when one number answers the question. Use a chart for a trend over time, and a stat for where things stand now.
- Figures change in place: no counting up.

Example markup:

```html
<dl class="ls-stats">
<div class="ls-stat"><dt class="ls-stat__label">Left this month</dt><dd class="ls-stat__value">−£695<span class="ls-badge ls-badge--danger">Short</span></dd><dd class="ls-stat__sub">Income £3,200 · Bills £3,895</dd></div>
<div class="ls-stat"><dt class="ls-stat__label">Due this week</dt><dd class="ls-stat__value">3 bills</dd><dd class="ls-stat__sub">£218.00 in total</dd></div>
<div class="ls-stat"><dt class="ls-stat__label">Spent so far</dt><dd class="ls-stat__value">£2,140<span class="ls-badge ls-badge--success">On track</span></dd></div>
</dl>
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
- Sorting (#53): a sortable column's `th` holds `button.ls-table__sort` with the header text and a 14px Lucide icon, and carries `aria-sort` (`ascending`, `descending`, or none). The icon is `chevrons-up-down` while the column isn't sorted, `arrow-up` ascending and `arrow-down` descending; the sorted header reads in `ink`. A click sorts by that column, a second click reverses it. The sort lives in the URL (`?sort=due` or `?sort=-due`) and the server sorts. Only the columns the API can sort get the button.
- More rows: an `ls-more` under the wrap, as for lists (see Long lists).

Example markup:

```html
<div class="ls-table-wrap"><table class="ls-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th class="num" aria-sort="descending"><button class="ls-table__sort" type="button">Total<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></button></th><th><span class="ls-sr-only">Actions</span></th></tr></thead><tbody>
<tr><td><code>ORD-1042</code></td><td>Harlow &amp; Co</td><td><span class="ls-badge ls-badge--success">Paid</span></td><td class="num">£1,240.00</td><td><button class="ls-btn ls-btn--ghost ls-btn--sm">Refund</button></td></tr>
<tr aria-selected="true"><td><code>ORD-1041</code></td><td>Pennine Bakery</td><td><span class="ls-badge ls-badge--warning">Pending</span></td><td class="num">£86.50</td><td><button class="ls-btn ls-btn--ghost ls-btn--sm">Refund</button></td></tr>
<tr><td><code>ORD-1040</code></td><td>Mossgate Ltd</td><td><span class="ls-badge ls-badge--danger">Refunded</span></td><td class="num">£312.00</td><td></td></tr>
</tbody></table></div>
```

## Long lists

Lists and tables longer than one page show the first page and a Load more button under them (decided 8 November, #53). It fits the API's cursor paging, keeps the footer reachable, and works the same by touch, keyboard and screen reader. No page numbers and no loading as you scroll.

`div.ls-more` holds `p.ls-more__count` (`aria-live="polite"`) and an `ls-btn`:

- Count: how far through, in words: "Showing 20 of 48" when the API sends a total, "Showing 20" when it doesn't. When everything is shown: "All 48 shown", and the button goes.
- Button: "Show 20 more", or the remainder when it is smaller ("Show 8 more"); "Show more" when the total is unknown. It gets `aria-busy="true"` while the next page loads (see Loading and errors).
- New rows join the end with `ls-enter`. Focus stays on the button; when it goes because the list is complete, focus moves to the first new row.
- With TanStack Query: `useInfiniteQuery` keyed by the list's filters and sort, with `getNextPageParam` from the API's next cursor. The cursor stays in the query cache, not the URL, so a shared link opens at the start; Back returns to the list with the loaded rows and scroll position restored from the cache.
- A failed page shows a Try again toast; the rows already shown stay.

```html
<div class="ls-more"><p class="ls-more__count" aria-live="polite">Showing 20 of 48</p><button class="ls-btn" type="button">Show 20 more</button></div>
```

## Progress

How far through something is: spent of budget, cards done of a project. `div.ls-progress` holds `div.ls-progress__head` (`span.ls-progress__label` and `span.ls-progress__value`) and a native `progress.ls-progress__bar` with `value`, `max` and `aria-labelledby` pointing at the label.

- The value says it in words beside the bar: "£2,140 of £3,200", "5 of 8 done". The bar never carries the number alone.
- Fill: `accent` by default. `ls-progress--done` (`success-ink`) when the work is complete; `ls-progress--over` (`danger`) past a limit, with the value saying so ("£120 over"). The tone follows the API's state, never a threshold the client works out.
- Over the limit, set `value` to `max` so the bar is full; the words carry the overspend.
- The bar is 8px with `radius-pill`, on a `surface-sunken` track. Changes are instant: no animated fill and no counting up.
- An indeterminate wait (no `value`) is not this component; under 400ms show nothing.

Example markup:

```html
<div class="ls-stack">
<div class="ls-progress"><div class="ls-progress__head"><span class="ls-progress__label" id="p1">Spent this month</span><span class="ls-progress__value">£2,140 of £3,200</span></div><progress class="ls-progress__bar" value="2140" max="3200" aria-labelledby="p1">67%</progress></div>
<div class="ls-progress ls-progress--done"><div class="ls-progress__head"><span class="ls-progress__label" id="p2">Kitchen snagging</span><span class="ls-progress__value">8 of 8 done</span></div><progress class="ls-progress__bar" value="8" max="8" aria-labelledby="p2">100%</progress></div>
<div class="ls-progress ls-progress--over"><div class="ls-progress__head"><span class="ls-progress__label" id="p3">Eating out</span><span class="ls-progress__value">£320 of £200 · £120 over</span></div><progress class="ls-progress__bar" value="200" max="200" aria-labelledby="p3">Over</progress></div>
</div>
```

## Tabs

Switch between views of the same object. `div.ls-tabs[role=tablist] > button.ls-tab[role=tab]`; the active tab has `aria-selected="true"`.

- Consumer provides: tab labels and the panels. Each tab is a route segment or search param (TanStack Router) so it survives reload and can be linked.
- Switching tabs fades through (see Tab bar), never slides.

Example markup:

```html
<div class="ls-tabs" role="tablist"><button class="ls-tab" role="tab" aria-selected="true">Overview</button><button class="ls-tab" role="tab">Activity</button><button class="ls-tab" role="tab">Members</button><button class="ls-tab" role="tab">Settings</button></div>
```

## App shell

What every app's frame is, so each app doesn't build its own (decided 8 November, #49). `div.ls-app` holds the skip link's target and the sidebar beside the page; the bottom tab bar, toast region and dialogs sit outside it, at the end of `body`.

- Above 640px: `ls-nav` (`nav-width`, 220px) on the left, sticky so it stays in view, then `main.ls-main`. The page is left-aligned beside the sidebar and capped at `content-width` (1040px), so list rows and lines stay readable. A board or wide table uses `ls-main ls-main--wide` for the full width.
- 640px and below: one column with `page-gutter` (16px) plus the safe area on each side. With an `ls-tabbar`, the sidebar is hidden and the bar takes over.
- `main.ls-main` has `id="main"` and `tabindex="-1"`, as the skip link's target.

```html
<body>
<a class="ls-skip-link" href="#main">Skip to content</a>
<div class="ls-app">
<nav class="ls-nav" aria-label="Main">…</nav>
<main class="ls-main" id="main" tabindex="-1">
<header class="ls-page-header">…<h1 class="ls-page-header__title" tabindex="-1">Bills</h1>…</header>
…
</main>
</div>
<nav class="ls-tabbar" aria-label="Main">…</nav>
<div class="ls-toasts" role="status"></div>
</body>
```

### The head

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<meta name="theme-color" content="">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<title>Hearth</title>
<link rel="stylesheet" href="…/tokens.css"><link rel="stylesheet" href="…/bundle.css">
<script>/* the Appearance script, which also sets theme-color: see Appearance */</script>
```

- `viewport-fit=cover` makes `env(safe-area-inset-*)` real, so the tab bar, toasts and sheets clear the system bars on Android gesture navigation and the iPhone home indicator. `interactive-widget=resizes-content` keeps sheets above the Android keyboard.
- `theme-color` colours the phone's browser bar and the installed app's title bar. Set it from `--bg` after the theme is applied (see Appearance), so it matches in both themes and follows the Appearance choice.
- Icons: an SVG favicon, a 180px `apple-touch-icon`, and a web app manifest. The manifest has `name`, `short_name` (12 characters at most, the home-screen label), `display: "standalone"`, `start_url: "/"`, `background_color` and `theme_color` set to the light `--bg`, and 192px and 512px PNG icons plus a 512px `"purpose": "maskable"` one, which Android crops to its icon shape. Until a logo exists, the app's initial in `on-accent` on an `accent` square.

### After navigation

On every route change, the page says where you are:

- `document.title` is "Page · App" ("Bills · Hearth"); the app's home is just the app's name.
- Focus moves to the page's `h1` (`tabindex="-1"`), so a screen reader reads the new page from its title and Tab continues from there. Not on the first load, where the browser's own start is right, and not when only the search params change (a filter, a dialog's param).
- Back and Forward restore the scroll position; a new page starts at the top. TanStack Router's `scrollRestoration: true` does both.

```ts
export const APP_NAME = "Hearth";
const TITLE_SEPARATOR = " · ";

export const router = createRouter({ routeTree, scrollRestoration: true });

// Each route sets staticData.title ("Bills"); the home route leaves it out.
router.subscribe("onResolved", ({ fromLocation, toLocation }) => {
  const title = router.state.matches.at(-1)?.staticData.title;
  document.title = title ? `${title}${TITLE_SEPARATOR}${APP_NAME}` : APP_NAME;
  if (!fromLocation || fromLocation.pathname === toLocation.pathname) return; // first load, or only the search params changed
  document.querySelector<HTMLElement>(".ls-page-header__title")?.focus({ preventScroll: true });
});
```

### Navigation motion

Every navigation between pages takes its motion from where it lands, never from where the link sits, so a link from one module to another moves the same way as the tab bar (brand book Motion pattern 4). The router chooses it once for every link and for Back and Forward; links don't pass their own types.

Each route says where it sits in `staticData`: its top-level `place` (`"budget"`, matching its tab bar item) and its `depth`, 0 for the place's own pages and tabs and 1 for a page one level down (a bill, a board). `navigationMotion(from, to)` from `@jameswilson1996/ui-tokens/motion.js` turns two of those into the view transition type:

| From → to | Type | Seen as |
| --- | --- | --- |
| Another place, at any depth (the tab bar, Today's "All bills", a shopping item's meal, Back from any of them) | `ls-switch` | Fade through |
| Deeper in the same place | `ls-drill` | Slides in from the right on a phone, nudges in on wider screens |
| Shallower in the same place (the page header's back link, Back) | `ls-back` | The reverse |
| Another of the place's own pages (its tabs) | `ls-tab` | Only the `ls-tab-panel` fades through |
| Another page at the same depth below them (one bill to the next) | `ls-switch` | Fade through |

- A link into another place never drills, even when it lands on a page one level down (Today's "Kitchen snagging" card opening the board): a slide promises that Back returns to the page underneath, and that page belongs to another place. The page header there still shows its own place's back link ("Projects"), which goes back with `ls-back`.
- A link to one record in another place lands on the page that lists it, fades through, then points at its row: scrolled into view and marked with `ls-flash` (pattern 5). It doesn't open that place's dialog over a page the user hasn't seen. Inside a place, record details still open in a dialog (see Dialog).
- Changes to the search params only (a dialog's param, a filter, a stepper's period) take no page motion from the router: dialogs and filters have their own, and the stepper's links pass `viewTransition={{ types: ["ls-tab"] }}` themselves.
- Without a router, call `switchView`, `switchPanel` or `drillView` with the type `navigationMotion` gives.

```ts
import { createRouter, type ParsedLocation } from "@tanstack/react-router";
import { navigationMotion, type PagePlace } from "@jameswilson1996/ui-tokens/motion.js";

// Every page route sets both; layout routes leave them out.
declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    title?: string;
    place?: string; // the tab bar item this page belongs to
    depth?: number; // 0 for the place's own pages and tabs, 1 one level down
  }
}

// The deepest matched route's place and depth: the page's own route.
const pageAt = (location: ParsedLocation): PagePlace => {
  const { place = "", depth = 0 } = router.matchRoutes(location).at(-1)?.staticData ?? {};
  return { place, depth };
};

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  // Runs for every link, navigate() call, and Back and Forward.
  defaultViewTransition: {
    types: ({ fromLocation, toLocation, pathChanged }) =>
      fromLocation && pathChanged ? [navigationMotion(pageAt(fromLocation), pageAt(toLocation))] : false,
  },
});
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
- Switching tabs fades through (brand book Motion pattern 4, decided 9 November): the old view fades out over `motion-quick`, then the new one fades in and grows from 96% over `motion-base`, so two pages never show at once. Nothing slides. The sidebar does the same. Each tab keeps its own scroll position and state where the router allows.
- Within a place (a page's `ls-tabs`, the board's column tabs, a stepper's period) the page holds still and only the content below the tabs fades through, with no scale (decided 9 November, since fading the whole screen to change Overview to Bills was jarring). Wrap that content in `div.ls-tab-panel`, once per page, and mark the navigation `ls-tab`. The bundle names the panel only during an `ls-tab` transition. Without a panel the page swaps at once.
- The router marks these navigations with the `ls-switch` view transition type, and an `ls-tab` within a place, from each route's place and depth (see Navigation motion in App shell); the bundle animates only those. Without a router, use `switchView` and `switchPanel`. Browsers without View Transitions switch at once, and reduced motion makes the fade 0ms. Browsers with View Transitions but without transition types (Safari 18.0 and 18.1) fade through on every navigation, drill-downs included, since the bundle's fade through is the default for any view transition; apps need no check for them. The bundle gives `ls-nav`, `ls-tabbar` and `ls-toasts` their own `view-transition-name`, so they stay still while the page changes; each appears once per page.

```ts
// Fades through to the next tab; update swaps the content. Falls back to an instant swap.
export function switchView(update: () => void) {
  if (!document.startViewTransition) return update();
  document.startViewTransition({ update, types: ["ls-switch"] });
}
```

```ts
// Fades only the ls-tab-panel through, for a page's own tabs and periods.
export function switchPanel(update: () => void) {
  if (!document.startViewTransition) return update();
  document.startViewTransition({ update, types: ["ls-tab"] });
}
```
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
- Changing period fades only the content below through (`ls-tab` with an `ls-tab-panel`, see Tab bar), with no slide. The stepper stays still.
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
- Dragging (brand book Motion pattern 1): cards have no handle. A mouse drag starts at once; on touch the card lifts after a 350ms press, with a 15ms vibration where supported, so a swipe still scrolls (`pressToLift`). The lifted card takes `ls-lifted ls-lifted--tilt`, an `ls-drop-slot` opens where it will land (`moveSlot` in Motion utilities), and the column under the pointer gets `ls-column--drop`. On a phone, dragging onto a tab gives it `ls-tab--drop`; holding there for 500ms switches to that column so the card can be placed in it, and letting go on the tab puts the card at the top of that column.
- When the tab hold switches columns on a phone, the card's own column stops being current. The bundle keeps a non-current column that holds `ls-lifted` as a zero-height box (`:has(.ls-lifted)`), so the fixed card stays drawn under the finger. Drag code that measures drop targets skips columns whose height is 0.
- When the columns don't fit, holding a card within 48px of the board's left or right edge scrolls the board that way, faster the nearer the edge; in a column taller than the screen (on a phone, the whole page), the top and bottom edges scroll it up and down the same way. `scrollWhileHeld` does both, as in Motion utilities: pass the board and the page.
- Without dragging: the card's dialog has Move to, which opens an `ls-dialog--sheet` on a phone listing the columns. This is the keyboard and screen reader route.
- After a move, the API's new order is the truth; a toast with Undo confirms it.

```ts
import { pressToLift } from "@jameswilson1996/ui-tokens/motion.js";

// Returns a cleanup, so a React effect can return it.
const stopLifting = pressToLift(card, (down) => startDrag(card, down));
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

## Week

A week of days with a slot per meal (or per anything that happens once a day): Meals' plan. `ol.ls-week` with an `aria-label` ("Week of 23 November"), holding seven `li.ls-week__day`.

- Day: `h3.ls-week__date` with the short day name and `span.ls-week__dnum`, then `div.ls-week__slots`. Monday first.
- Slot: `button.ls-week__slot` (or a link) with `span.ls-week__kind` ("Dinner") when a day has more than one slot, `span.ls-week__meal` and an optional `span.ls-week__note`. An empty slot is `ls-week__slot--empty`: dashed, with a 16px Lucide `plus` and "Add dinner", and an `aria-label` naming the day ("Add dinner on Wednesday").
- Today: `ls-week__day--today` gives the day an `accent-soft` fill, and the date says so in words with `span.ls-badge.ls-badge--accent` "Today". Past days get `ls-week__day--past`: their dates and meals turn `ink-muted` and regular weight, and stay tappable.
- Layout: day rows (date on the left, slots on the right) below 1100px; seven equal columns at 1100px and wider.
- A slot opens its picker (recent meals, then search) in an `ls-dialog--sheet` on a phone and an `ls-dialog` elsewhere, with the open state in the URL (`?slot=2026-11-25.dinner`). Picking fills the slot in place with no animation; a toast with Undo confirms.
- The week shown comes from an `ls-stepper` above it, and lives in the URL. Days are plain calendar dates with no time zone; "today" comes from the app's `Clock` in the household's zone.
- Slots are 44px tall at least.

Example markup:

```html
<ol class="ls-week" aria-label="Week of 23 November">
<li class="ls-week__day ls-week__day--past"><h3 class="ls-week__date"><span>Mon</span><span class="ls-week__dnum">23</span></h3><div class="ls-week__slots"><button class="ls-week__slot" type="button"><span class="ls-week__kind">Dinner</span><span class="ls-week__meal">Chilli</span><span class="ls-week__note">Leftovers for Tuesday lunch</span></button></div></li>
<li class="ls-week__day ls-week__day--today"><h3 class="ls-week__date"><span>Tue</span><span class="ls-week__dnum">24</span><span class="ls-badge ls-badge--accent">Today</span></h3><div class="ls-week__slots"><button class="ls-week__slot" type="button"><span class="ls-week__kind">Dinner</span><span class="ls-week__meal">Fish pie</span></button></div></li>
<li class="ls-week__day"><h3 class="ls-week__date"><span>Wed</span><span class="ls-week__dnum">25</span></h3><div class="ls-week__slots"><button class="ls-week__slot ls-week__slot--empty" type="button" aria-label="Add dinner on Wednesday"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add dinner</button></div></li>
<li class="ls-week__day"><h3 class="ls-week__date"><span>Thu</span><span class="ls-week__dnum">26</span></h3><div class="ls-week__slots"><button class="ls-week__slot" type="button"><span class="ls-week__kind">Dinner</span><span class="ls-week__meal">Roast chicken</span></button></div></li>
<li class="ls-week__day"><h3 class="ls-week__date"><span>Fri</span><span class="ls-week__dnum">27</span></h3><div class="ls-week__slots"><button class="ls-week__slot ls-week__slot--empty" type="button" aria-label="Add dinner on Friday"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add dinner</button></div></li>
<li class="ls-week__day"><h3 class="ls-week__date"><span>Sat</span><span class="ls-week__dnum">28</span></h3><div class="ls-week__slots"><button class="ls-week__slot" type="button"><span class="ls-week__kind">Dinner</span><span class="ls-week__meal">Pizza night</span><span class="ls-week__note">Alex cooking</span></button></div></li>
<li class="ls-week__day"><h3 class="ls-week__date"><span>Sun</span><span class="ls-week__dnum">29</span></h3><div class="ls-week__slots"><button class="ls-week__slot ls-week__slot--empty" type="button" aria-label="Add dinner on Sunday"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>Add dinner</button></div></li>
</ol>
```

## Dialog

A modal window over the current page. Record details (a bill, a transaction) and filtered lists opened from a summary ("3 bills due this week") open in a dialog, so closing it puts the user back where they were. A multi-step flow or a form longer than one screen gets its own route.

`dialog.ls-dialog` opened with `showModal()`, holding `header.ls-dialog__header` (an `h2.ls-dialog__title` and a close button), `div.ls-dialog__body` and an optional `footer.ls-dialog__foot` for actions.

- Sizes: default `dialog-md` (560px) for details and short forms, `ls-dialog--sm` (400px) for confirmations, `ls-dialog--lg` (800px) for lists and tables. At 640px wide and below every size fills the screen, except a sheet; a confirm is always a sheet.
- Sheet (`ls-dialog--sheet`): on a phone, a short form or picker rises as a bottom sheet with the page still in view above it. Use it for confirms (Confirm and Unsaved changes below), pickers, filters, Move to, and forms of up to 4 fields (Change income, a meal slot). Anything longer, such as Add bill with More open, stays full screen. Above 640px a sheet is the centred dialog at its size class. See Sheet below.
- The body scrolls and the header and foot stay in view. The page behind does not scroll while the dialog is open.
- Consumer provides: `aria-labelledby` pointing at the title, a close button with `aria-label="Close"` and a 16px Lucide `x` icon, and actions in the foot with the primary first, as in `ls-form__actions`. A form inside the body is an `ls-form`; its submit button sits in the foot with `form="<form id>"`.
- Open state lives in the URL as a search param (`?bill=<id>`, Zod-validated), so a reload or a shared link reopens it. Opening pushes a history entry, and Back closes the dialog.
- Escape, a click on the backdrop, the close button and Back all close it. The first three fire the dialog's `close` event. If the app opened the dialog by pushing a history entry (marked in history state), the `close` handler calls `history.back()` to pop that entry. Only when the dialog opened from a deep link or a reload, with no such state, does the handler replace the URL without the param. Either way history ends as it was before the dialog opened; pushing or replacing a URL after an in-app open leaves a duplicate entry, so Back returns to the same page. Set `closedby="any"` for the backdrop click. Where the browser lacks `closedby`, close the dialog when a click's target is the dialog element itself; the dialog has no padding, so that target is always the backdrop.
- Focus: `showModal()` makes the rest of the page inert, so Tab stays inside the dialog. Focus moves to the first focusable element (the close button) or to the element with `autofocus`; put `autofocus` on the first field of a form. On close the browser returns focus to the element that opened the dialog. When it opened from a link with no trigger on the page, move focus to the page's `h1`.
- One dialog at a time. A popover inside a dialog is fine.
- Motion is built in: the dialog rises 8px and fades in over `motion-base` and the backdrop fades with it; at 640px and below it, and a sheet, rise from the bottom edge over `motion-travel` while the backdrop fades. Closing is the reverse and quicker (decided 8 November, #54): the dialog fades and drops 8px over `motion-quick` with `ease-exit`, and at 640px and below it slides off the bottom edge over `motion-base`. The bundle holds the dialog in the top layer until the fade ends (`overlay` with `transition-behavior: allow-discrete`); browsers without `overlay` close at once. The `close` event fires at the start, so URL and focus handling don't wait for the motion.
- Keep the `dialog` element on the page while it closes, or the exit never shows (see Leaving in Motion utilities). The example below renders it all the time and calls `close()`. A component that renders the dialog only while it is open calls `close()` first and unmounts it after `afterLeaving(dialog)`.

### Confirm

Deleting or anything else that can't be put back (decided 8 November, #51):

- When the API can restore the item, don't ask: delete at once and offer Undo in the toast ("Gym deleted · Undo"). Undo sends the restore command.
- When it can't (a whole board, a household, anything permanent), confirm first in an `ls-dialog ls-dialog--sm ls-dialog--sheet` (#84): small and centred on desktop, and on a phone a sheet as tall as its content, so the page or form it asks about stays in view above it. It carries the sheet's `ls-dialog__handle` and `dragToClose`, and a drag down cancels.
  - Title: the action and the item, as a question: "Delete Kitchen snagging?"
  - Body: one sentence on what is lost and what stays: "Its 12 cards go too. This can't be undone."
  - Foot: an `ls-btn--danger` that repeats the verb and names the thing ("Delete board"), then Cancel. Cancel has `autofocus`, so Enter never deletes by accident. Escape and the backdrop cancel.
- Never "Are you sure?", and never OK and Cancel as the buttons.

```html
<dialog class="ls-dialog ls-dialog--sm ls-dialog--sheet" id="delete-board" aria-labelledby="delete-board-title" closedby="any">
<div class="ls-dialog__handle" aria-hidden="true"></div>
<header class="ls-dialog__header"><h2 class="ls-dialog__title" id="delete-board-title">Delete Kitchen snagging?</h2><form method="dialog"><button class="ls-btn ls-btn--ghost ls-dialog__close" aria-label="Close"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></form></header>
<div class="ls-dialog__body"><p>Its 12 cards go too. This can't be undone.</p></div>
<footer class="ls-dialog__foot"><button class="ls-btn ls-btn--danger" type="button">Delete board</button><form method="dialog"><button class="ls-btn" autofocus>Cancel</button></form></footer>
</dialog>
```

### Unsaved changes

Leaving a form with changes that weren't saved asks first (#52), with the same confirm (a sheet on a phone, so the form stays in view): "Leave without saving?", "Your changes to Council tax will be lost.", then `ls-btn--danger` "Discard changes" and "Keep editing" (with `autofocus`).

- Ask only when a field differs from what was loaded. A saved or untouched form leaves without asking.
- In-app navigation, Back and closing the form's dialog go through TanStack Router's `useBlocker` with `shouldBlockFn` reading the form's `isDirty`, so the app's own dialog asks. Closing the tab or reloading uses `beforeunload`, where the browser shows its own wording.
- A dialog that holds a form asks before it closes on Escape or the backdrop: handle `cancel` and call `preventDefault()` while the form is dirty, then show the confirm.

```tsx
const form = useForm({ /* … */ });
const isDirty = form.useStore((s) => s.isDirty && !s.isSubmitted);
const blocker = useBlocker({ shouldBlockFn: () => isDirty, enableBeforeUnload: () => isDirty, withResolver: true });
// blocker.status === "blocked" opens the confirm; Discard changes calls blocker.proceed(), Keep editing blocker.reset().
```

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
- The handle is a 24px strip at the top with a 36px bar. Dragging it down moves the sheet with the finger, with no easing; let go past a quarter of the sheet's height and it slides on off the bottom edge from there, otherwise it settles back over `motion-base`. The drag sets `--ls-drag` rather than `translate`, so the closing slide starts where the finger let go. A tap on the page above it (the backdrop) also closes it. Keyboard and screen reader users close it with Escape or the close button, so the handle is hidden from them.
- Keep the close button: not everyone knows to swipe.
- Add `interactive-widget=resizes-content` to the page's viewport meta, so on Android the on-screen keyboard pushes the sheet up instead of covering its fields. iOS scrolls the focused field into view itself.

```ts
// Drags a sheet down by its handle; past a quarter of its height it closes from there, otherwise it settles back.
// The offset goes in --ls-drag, which the bundle reads only while the sheet is open, so the closing slide starts where the finger let go.
export function dragToClose(dialog: HTMLDialogElement, handle: HTMLElement) {
  dialog.addEventListener("close", () => dialog.style.removeProperty("--ls-drag"));
  handle.addEventListener("pointerdown", (down) => {
    const startY = down.clientY;
    let dy = 0;
    handle.setPointerCapture(down.pointerId);
    const move = (e: PointerEvent) => {
      dy = Math.max(0, e.clientY - startY);
      dialog.style.setProperty("--ls-drag", `${dy}px`);
    };
    const release = () => {
      handle.removeEventListener("pointermove", move);
      if (dy > dialog.offsetHeight / 4) return dialog.close();
      dialog.style.removeProperty("--ls-drag");
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
- Motion is built in: a detail card, menu or filter panel rises 8px and fades in over `motion-base`, as a dialog does. A tooltip and a chart's `ls-popover--at` card only fade in, over `motion-quick`, since they follow the pointer. Closing reverses it over `motion-quick` (#54); browsers without `overlay` close at once. As with a dialog, hide it with `hidePopover()` and unmount it only after `afterLeaving` (see Leaving in Motion utilities).
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
- Going one level down and back (brand book Motion pattern 4): the link into the page moves with the `ls-drill` view transition type and the back link, and the browser's Back to that parent, with `ls-back`. The router picks them from each route's depth (see Navigation motion in App shell), so a link arriving from another place fades through instead. On a phone the new page slides over the old from the right in `motion-travel` and Back slides it off in `motion-base`; on wider screens the new page fades in from 8px right over `motion-base` and Back fades it out 8px to the right in `motion-quick`. The sidebar, tab bar and toasts stay still. Without a router, use `drillView`.

```ts
// Moves to a page one level down ("in") or back to its parent ("back"); update swaps the content. Falls back to an instant swap.
export function drillView(direction: "in" | "back", update: () => void) {
  if (!document.startViewTransition) return update();
  document.startViewTransition({ update, types: [direction === "in" ? "ls-drill" : "ls-back"] });
}
```

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

## Empty state

What a list or page shows when there is nothing in it yet. `div.ls-empty` holds an optional 32px Lucide icon (`aria-hidden="true"`), `p.ls-empty__text` and `div.ls-empty__actions`.

- Text: one or two sentences that say what appears here or why it is empty: "Bills you add appear here." The product may speak as "we" ("We'll list next week's meals here once you plan them."). No exclamation marks, no "Nothing to see here", no illustrations.
- One action, the way to start: an `ls-btn` with the same command as the page header's primary ("Add bill"). It stays a default button because the header already holds the page's one primary. An optional second step is a plain link ("Import a statement").
- Filtered to nothing: say so and offer the way back: "No bills match these filters." with a "Clear filters" button. Don't show the first-use text, because the list isn't empty.
- An empty section inside a card (no meals today) is one line of `ink-muted` text, not an `ls-empty`.
- It sits where the list would be, inside the same width. Actions are 44px on a phone.

Example markup:

```html
<div class="ls-stack">
<div class="ls-empty"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><p class="ls-empty__text">Bills you add appear here, with what is due this month at the top.</p><div class="ls-empty__actions"><button class="ls-btn" type="button">Add bill</button><a href="#">Import a statement</a></div></div>
<div class="ls-empty"><p class="ls-empty__text">No bills match these filters.</p><div class="ls-empty__actions"><button class="ls-btn" type="button">Clear filters</button></div></div>
</div>
```

## Loading and errors

Every app shows waiting and failing the same way (decided 8 November, #48). Nothing appears for the first `motion-wait` (400ms), so a fast answer never flashes a loading state.

### Loading

`div.ls-loading` holds placeholders inside the real component: an `ls-list` of rows, a card, a stat. The bundle keeps it hidden for `motion-wait`, then shows it. Each `span.ls-placeholder` is a bar that pulses between full strength and 45% every `motion-pulse` (1.6s); under reduced motion it stays still.

- Shape: the same component as the content, so the content lands where the placeholders were and nothing jumps. Bars: `ls-placeholder--title`, `--meta` and `--value` in a list row; plain `ls-placeholder` for a line of text. Show as many rows as fill the first screen, up to 5.
- Screen readers: `role="status"` on `ls-loading` with `ls-sr-only` text naming what is loading ("Loading bills"); the placeholders are `aria-hidden="true"`.
- With TanStack Query: render it while the query `isPending`. A refetch keeps the current content on screen; it never shows placeholders again.
- No shimmer and no spinner for a page or section; the brand book's Never list still applies.

```html
<div class="ls-loading" role="status"><span class="ls-sr-only">Loading bills</span>
<ul class="ls-list" aria-hidden="true">
<li class="ls-list__row"><div class="ls-list__main"><span class="ls-placeholder ls-placeholder--title"></span><span class="ls-placeholder ls-placeholder--meta"></span></div><div class="ls-list__end"><span class="ls-placeholder ls-placeholder--value"></span></div></li>
<li class="ls-list__row"><div class="ls-list__main"><span class="ls-placeholder ls-placeholder--title"></span><span class="ls-placeholder ls-placeholder--meta"></span></div><div class="ls-list__end"><span class="ls-placeholder ls-placeholder--value"></span></div></li>
<li class="ls-list__row"><div class="ls-list__main"><span class="ls-placeholder ls-placeholder--title"></span><span class="ls-placeholder ls-placeholder--meta"></span></div><div class="ls-list__end"><span class="ls-placeholder ls-placeholder--value"></span></div></li>
</ul></div>
```

### Busy button

`aria-busy="true"` on an `ls-btn` (see Button). After `motion-wait` a spinner turns before the label once every `motion-spin` (800ms), three times slower under reduced motion. The side padding gives the spinner its room, so the button keeps its width.

```html
<div class="ls-row"><button class="ls-btn ls-btn--primary" type="submit" aria-busy="true">Save changes</button><button class="ls-btn" type="button">Cancel</button></div>
```

### Couldn't load

A page or section whose query failed shows an `ls-empty` in place of the content, with one Try again button that refetches. A section fails on its own; the rest of the page keeps working. The same layout covers the other reasons a page has nothing to show:

| Reason | Icon | Text | Action |
| --- | --- | --- | --- |
| The query failed (`5xx`, timeout) | `circle-alert` | "Bills didn't load. Try again in a minute." | Try again |
| Offline (`navigator.onLine` is false, or the request never left) | `wifi-off` | "You're offline. Bills load when you're back online." | Try again |
| Not found (`404`, or an unknown route) | `search-x` | "We can't find that bill. It may have been deleted." | A link back to Bills |
| No access (`403`) | `lock` | "This board belongs to another household." | A link to Today |

- With TanStack Router, the root route's `notFoundComponent` and each route's `errorComponent` render these, so a bad link never shows the router's default.
- Text says what didn't happen and what to do, in the brand book's voice, and names the thing ("Bills", "that bill"). The problem+json `title` may replace the first sentence when it is written for people.

```html
<div class="ls-empty"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p class="ls-empty__text">Bills didn't load. Try again in a minute.</p><div class="ls-empty__actions"><button class="ls-btn" type="button">Try again</button></div></div>
```

### A command failed

When the API names a field, the error goes on that field (see Field). Otherwise:

- From a form or dialog: an `ls-alert ls-alert--danger` (`role="alert"`) at the top of the form, above the fields, keeping what was typed: "**That didn't save.** The budget service didn't answer. Try again in a minute." Focus moves to the alert, and it clears on the next submit.
- From a one-tap action (Mark paid, a tick, a drag): an `ls-toast` in place of the success toast, with Try again as its action: "Couldn't mark Council tax paid · Try again". The row goes back to how it was before the tap.

```html
<div class="ls-alert ls-alert--danger" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg><div><strong>That didn't save.</strong> The budget service didn't answer. Try again in a minute.</div></div>
<div class="ls-toast"><p class="ls-toast__text">Couldn't mark Council tax paid</p><button class="ls-toast__action" type="button">Try again</button></div>
```

### Someone else changed it

A command sent with `If-Match` comes back `409` when someone saved the same thing first. Refetch it, then:

- Reload the form with the saved values, and keep what the user typed in memory.
- An `ls-alert ls-alert--warning` at the top names who changed it and what the user had: "**Sam changed this bill.** Their amount is shown; yours was £175.00. Save again to use yours."
- Each field that changed gets `data-invalid` and help text saying when: "Changed by Sam at 14:02". One Save then sends the user's values with the new version.

```html
<div class="ls-alert ls-alert--warning" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg><div><strong>Sam changed this bill.</strong> Their amount is shown; yours was £175.00. Save again to use yours.</div></div>
<div class="ls-field" data-invalid><label class="ls-label" for="amt-c">Amount</label><div class="ls-money"><span class="ls-money__currency" aria-hidden="true">£</span><input class="ls-money__input" id="amt-c" value="189.00" inputmode="decimal" aria-invalid="true" aria-describedby="amt-ch"></div><p class="ls-help" id="amt-ch">Changed by Sam at 14:02</p></div>
```

## Visually hidden text

`ls-sr-only` hides text on screen and keeps it for screen readers: a table heading for an actions column, "(opens in a dialog)" after a link, a count's unit beside a bare number.

- It clips the element to 1px with `clip-path: inset(50%)` and `white-space: nowrap`, and positions it absolutely, so it takes no space. Put it inside a positioned container (`ls-table-wrap` is one) so it cannot widen the page.
- An icon-only button uses `aria-label` instead.
- Don't hide focusable elements with it; a skip link that appears on focus needs its own style.

Example markup:

```html
<a href="#">Council tax<span class="ls-sr-only"> (opens in a dialog)</span></a>
```

## Chart

A chart shows a trend or a comparison that one number can't. Apps draw charts as inline SVG from their own scales, styled only with the `ls-chart` classes and the chart tokens. No chart library: libraries bring their own colours, DOM and motion, and Hearth's spend chart already works as inline SVG. Using one needs an ADR.

### Pick the form

- One figure that answers the question ("£695 short"): an `ls-stat`, not a chart.
- Change over time (spending through the month): a line. A running total is a line from zero.
- Amounts compared across categories or periods (spend by category, month by month): bars, from a zero baseline, sorted by value unless the order means something (months).
- Never a pie, a dual-axis chart (two y-scales), 3D, or a gauge. Two measures of different size are two charts.

### Colour

- Series take `chart-1` to `chart-5` in that order (lilac, sage, amber, sky, rose), through `ls-chart__series-1` to `-5`. A series keeps its colour when a filter hides others: colour follows the entity, never its rank. More than 5 series fold into "Other" or become small multiples.
- The order is validated (dataviz palette checks) against `surface` in both themes: worst adjacent colour-blind separation ΔE 8.9 light and 8.2 dark, normal vision 18.4 and 16.4, every series 3:1 or more on `surface`. Scatter-style charts where any two series can touch take the first 3 only.
- A series that means good or bad (overspent, overdue) uses the status tokens with an icon and a word, never a `chart-` colour.
- Text in a chart (labels, values, legend) is `chart-label`, never a series colour. Gridlines are `chart-grid`; the baseline and crosshair `chart-axis`.

### Never colour alone

- Two or more series: `ul.ls-chart__legend` is always there, with `li.ls-chart__key` per series (a 16px line in the series colour, then the name). Up to 4 series are also labelled directly at the end of their line.
- A projected or still-due part of a series is the same colour, dashed (`ls-chart__line--projected`, `ls-chart__key--projected`), and the legend says "still due" or "projected".
- One series needs no legend: the title names it.

### Marks, axes and numbers

- Lines 2px, round joins. Points 8px (`r="4"`) with a 2px `surface` ring. Bars have a 2px `surface` gap between them; their data end has a 4px radius and the baseline end none.
- Horizontal gridlines only, at 4 or 5 round steps; no vertical gridlines, no chart border. The y-axis starts at 0.
- Labels 12px, tabular. Money on an axis in whole units, short ("£3k", `Intl.NumberFormat` with `notation: "compact"`); in tooltips and the table in full ("£2,140.00"). Dates as "8 Nov". Mark today on a time axis with the `ls-chart__crosshair` line and the word "Today".
- No animation: charts draw at once and values change in place. No draw-in, no counting up.

### Tooltip

- Every point or bar has a hit target bigger than the mark: `circle.ls-chart__hit` (`r="12"`, 24px) that is focusable (`tabindex="0"`, `role="button"`, an `aria-label` with the date and values).
- Hover, focus or tap shows an `ls-popover ls-popover--at` (detail card, `popover="manual"`) with the date in `ls-popover__title` and each series' value in `ls-popover__meta`. Pointer leave or blur hides it; a tap elsewhere or Escape hides it on touch.
- `showPopover({ source })` takes only HTML elements, so an SVG point can't anchor it. `ls-popover--at` turns off anchor positioning and reads `--ls-popover-x` and `--ls-popover-y`, which `showChartTip` sets from the hit target: above the point, or below when there is no room, kept `popover-offset` inside the viewport.

```ts
// Shows a chart tooltip next to an SVG hit target.
export function showChartTip(tip: HTMLElement, hit: SVGGraphicsElement) {
  tip.showPopover();
  const offset = parseFloat(getComputedStyle(tip).getPropertyValue("--popover-offset"));
  const h = hit.getBoundingClientRect();
  const p = tip.getBoundingClientRect();
  const fitsAbove = h.top - offset - p.height >= offset;
  const y = fitsAbove ? h.top - offset - p.height : h.bottom + offset;
  const x = Math.min(Math.max(offset, h.left + h.width / 2 - p.width / 2), innerWidth - offset - p.width);
  tip.style.setProperty("--ls-popover-x", `${x}px`);
  tip.style.setProperty("--ls-popover-y", `${y}px`);
}
```
- On a line chart a pointer anywhere over the plot snaps the crosshair and tooltip to the nearest day.

### Text alternative and empty state

- `figure.ls-chart` with `figcaption.ls-chart__title`. The SVG has `role="img"` and `aria-labelledby` pointing at the title and a `desc` that states the finding in a sentence ("£2,140 spent by 8 November..."). The drawing inside is `aria-hidden`; the hit targets stay outside it so they can be reached.
- `details.ls-chart__table` with `summary` "Show as table" holds an `ls-table` of the same values, for screen readers and anyone who wants the numbers.
- No data yet: `p.ls-chart__empty` in place of the plot, saying what will appear ("Spending shows here once the first bill is paid."). Keep the title; drop the legend and table.
- On a phone the chart is full width at the same aspect; the tooltip opens on tap.

Example markup (November's spending, with today on 8 November):

```html
<div class="ls-stack">
<div class="ls-card">
<figure class="ls-chart">
<figcaption class="ls-chart__title" id="spend-title">Spending in November</figcaption>
<ul class="ls-chart__legend"><li class="ls-chart__key ls-chart__series-1">Spent so far</li><li class="ls-chart__key ls-chart__key--projected ls-chart__series-1">Still due</li><li class="ls-chart__key ls-chart__series-2">Income</li></ul>
<svg class="ls-chart__plot" viewBox="0 0 320 172" role="img" aria-labelledby="spend-title spend-desc">
<desc id="spend-desc">£2,140 spent by 8 November. With £1,755 still due, spending reaches £3,895 by 30 November, £695 more than the £3,200 income.</desc>
<g aria-hidden="true">
<line class="ls-chart__grid" x1="40" x2="310" y1="10" y2="10"/><line class="ls-chart__grid" x1="40" x2="310" y1="45" y2="45"/><line class="ls-chart__grid" x1="40" x2="310" y1="80" y2="80"/><line class="ls-chart__grid" x1="40" x2="310" y1="115" y2="115"/>
<line class="ls-chart__axis" x1="40" x2="310" y1="150" y2="150"/>
<text class="ls-chart__label" x="34" y="14" text-anchor="end">£4k</text><text class="ls-chart__label" x="34" y="49" text-anchor="end">£3k</text><text class="ls-chart__label" x="34" y="84" text-anchor="end">£2k</text><text class="ls-chart__label" x="34" y="119" text-anchor="end">£1k</text><text class="ls-chart__label" x="34" y="154" text-anchor="end">£0</text>
<text class="ls-chart__label" x="40" y="166">1 Nov</text><text class="ls-chart__label" x="105" y="166" text-anchor="middle">Today</text><text class="ls-chart__label" x="310" y="166" text-anchor="end">30 Nov</text>
<line class="ls-chart__crosshair" x1="105.2" x2="105.2" y1="10" y2="150"/>
<line class="ls-chart__line ls-chart__series-2" x1="40" x2="310" y1="38" y2="38"/>
<text class="ls-chart__label" x="44" y="32">Income £3,200</text>
<polyline class="ls-chart__line ls-chart__series-1" points="40,150 58.6,127.6 77.2,103.8 105.2,75.1"/>
<polyline class="ls-chart__line ls-chart__line--projected ls-chart__series-1" points="105.2,75.1 170.3,48.5 291,24 310,13.7"/>
<text class="ls-chart__label" x="306" y="8" text-anchor="end">£3,895</text>
<circle class="ls-chart__point ls-chart__series-1" cx="105.2" cy="75.1" r="4"/>
</g>
<circle class="ls-chart__hit" cx="105.2" cy="75.1" r="12" tabindex="0" role="button" aria-label="8 November: £2,140 spent, £1,755 still due"/>
</svg>
<div class="ls-popover ls-popover--at" id="spend-tip" popover="manual"><h3 class="ls-popover__title">8 November</h3><p class="ls-popover__meta">£2,140.00 spent · £1,755.00 still due</p></div>
<details class="ls-chart__table"><summary>Show as table</summary><div class="ls-table-wrap"><table class="ls-table"><thead><tr><th>Date</th><th class="num">Spent so far</th><th class="num">Still due</th></tr></thead><tbody><tr><td>1 Nov</td><td class="num">£0.00</td><td class="num">£3,895.00</td></tr><tr><td>3 Nov</td><td class="num">£640.00</td><td class="num">£3,255.00</td></tr><tr><td>5 Nov</td><td class="num">£1,320.00</td><td class="num">£2,575.00</td></tr><tr><td>8 Nov</td><td class="num">£2,140.00</td><td class="num">£1,755.00</td></tr></tbody></table></div></details>
</figure>
</div>
<div class="ls-card"><figure class="ls-chart"><figcaption class="ls-chart__title">Spending in December</figcaption><p class="ls-chart__empty">Spending shows here once the first bill is paid.</p></figure></div>
</div>
```

## Motion utilities

Classes for the patterns in the brand book's Motion section. Their durations come from the motion tokens, so they stop under `prefers-reduced-motion` with no extra code.

- `ls-enter`: a new row or item fades in at its place over `motion-base`.
- `ls-leave`: the same item leaving. It fades and drops 8px over `motion-quick` with `ease-exit` and stops taking taps at once; remove it after `afterLeaving`. For an inline alert, a removed chip or a section that goes away. A ticked list row folds with `ls-list__row--leaving` instead, and a toast uses `ls-toast--leaving`.
- `ls-flash`: the row a link pointed at, marked in `accent-soft` and faded back over `motion-flash` (1.2s). Scroll it into view first (`scrollIntoView({ block: "center", behavior })`, with `behavior: "auto"` under reduced motion). To flash it again, remove the class, read `offsetWidth`, and add it back.
- `ls-drag-handle`: the grip a row is dragged by. It sets `touch-action: none`, so a finger on it drags instead of scrolling. Give it an `aria-label` ("Move Milk") and handle Arrow Up and Arrow Down on it.
- `ls-lifted`: the item being dragged. Add it on pick-up after setting `left`, `top` and `width` from the item's rect; the item becomes `position: fixed` above the page. Move it by setting `translate`, never `top`, so it follows the pointer without layout work. Add `ls-lifted--tilt` for board cards.
- `ls-drop-slot`: the dashed placeholder where the item will land. Insert it in the item's place on pick-up, with the item's height, and move it as the pointer moves.
- `ls-dragging`: on `body` while a drag is in progress, for the grabbing cursor and to stop text selection.

### Leaving

Everything that arrives with motion leaves with motion (brand book Motion pattern 3): dialogs, sheets, popovers, menus, toasts and items that used `ls-enter`. The exit is in the bundle; the app's part is to keep the element on the page until it has played. Removing an open dialog or popover from the DOM, as a React component does when its URL param goes and it unmounts, cuts the exit off and the element vanishes.

1. Start the exit: `dialog.close()`, `popover.hidePopover()`, or add `ls-leave` (`ls-toast--leaving`, `ls-list__row--leaving`).
2. Wait for `afterLeaving(el)` from `@jameswilson1996/ui-tokens/motion.js`. It resolves when the element's exit animations and transitions end, its `::backdrop` included, and skips endless ones such as a busy spinner inside. Under reduced motion they are 0ms, so it resolves at once.
3. Remove the element (unmount it).

URL, history and focus handling don't wait: do them on `close` as before. In React, keep the last open value in state, so the component renders until the exit ends:

```tsx
import { afterLeaving } from "@jameswilson1996/ui-tokens/motion.js";

// Renders while `open` is true and on until the element's exit motion has played.
export function useLeaving<T extends HTMLElement>(open: boolean, leave: (el: T) => void) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (open) return setShown(true);
    const el = ref.current;
    if (!el) return setShown(false);
    let current = true;
    leave(el);
    afterLeaving(el).then(() => current && setShown(false));
    return () => { current = false; };
  }, [open]);
  return { ref, shown };
}
// const { ref, shown } = useLeaving<HTMLDialogElement>(Boolean(bill), (d) => d.open && d.close());
// return shown ? <dialog ref={ref} className="ls-dialog">…</dialog> : null;
```

### Drag helpers

The drag code ships in `@jameswilson1996/ui-tokens/motion.js`, with types. Import it; don't copy it into the app. Every duration and distance below is a named export (`LIFT_DELAY_MS`, `LIFT_VIBRATION_MS`, `MOVE_TOLERANCE_PX`, `EDGE_ZONE_PX`, `MAX_SCROLL_STEP_PX`).

- `moveSlot(list, held, place)`: calls `place()` to move the slot, then slides the list's other items from their old position to their new one over `motion-base`. Nothing slides when the token is 0ms.
- `capture(listOrElements, exclude?)` and `slideFrom(captured)`: the same slide in two steps, for when the app doesn't move the DOM itself. In React, call `capture` before the state change and `slideFrom` in a layout effect; key the rows by id so React keeps their elements.
- `settle(held, drop)`: on release, `drop()` takes the item out of `ls-lifted` and puts it where the slot was, and the item slides from where it was let go into its place over `motion-base`.
- `pressToLift(card, lift)`: for cards with no handle. A mouse (main button) lifts at once; touch lifts after 350ms with a 15ms vibration, and moving more than 8px first cancels it, since the finger is scrolling. Returns a function that removes it.
- `scrollNearEdge(scroller, { x, y })`: while the pointer is within 48px of an edge of the scroller's visible part, scrolls it that way on either axis, faster the nearer the edge; returns whether it scrolled. Pass `document.scrollingElement` for the page.
- `scrollWhileHeld(scrollers, pointer, onScroll)`: from pick-up to release, runs `scrollNearEdge` on every animation frame for each scroller with the pointer's last position, so it keeps scrolling while the pointer rests, and calls `onScroll` to place the slot again after a scroll. Pass the list or board when it scrolls itself, then `document.scrollingElement`, so a row held near the top or bottom of the screen scrolls a long `ls-list` or a tall column. Returns a function that stops it. Edge scrolling runs under reduced motion, because the user is moving it.

```ts
import { moveSlot, settle, scrollWhileHeld, type Point } from "@jameswilson1996/ui-tokens/motion.js";

// Puts the slot before the first row whose middle is below the pointer.
const placeSlotAt = ({ y }: Point) => {
  const rows = [...list.children].filter((el) => el !== held && el !== slot);
  const next = rows.find((el) => {
    const { top, height } = el.getBoundingClientRect();
    return y < top + height / 2;
  });
  moveSlot(list, held, () => list.insertBefore(slot, next ?? null));
};

let last = { x: down.clientX, y: down.clientY };
const stopScrolling = scrollWhileHeld([list, document.scrollingElement!], () => last, placeSlotAt);
const onMove = (e: PointerEvent) => {
  last = { x: e.clientX, y: e.clientY };
  held.style.translate = `${e.clientX - down.clientX}px ${e.clientY - down.clientY}px`;
  placeSlotAt(last);
};
const onUp = () => {
  stopScrolling();
  settle(held, () => {
    held.classList.remove("ls-lifted");
    held.style.translate = "";
    slot.replaceWith(held);
  });
};
```

Example markup, mid-drag:

```html
<div class="ls-stack">
<div class="ls-drop-slot ls-pad"></div>
<div class="ls-card ls-row"><button class="ls-btn ls-btn--ghost ls-drag-handle" type="button" aria-label="Move Eggs">⋮⋮</button>Eggs</div>
<div class="ls-card ls-row ls-flash">Bananas</div>
</div>
```
