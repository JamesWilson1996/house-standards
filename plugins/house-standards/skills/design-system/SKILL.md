---
name: design-system
description: Lilac & Sage, the house design system (pastel lilac and sage, light and dark themes, ls- CSS components). Use whenever building or changing UI, styling, colours, themes, components, icons or copy in any house frontend.
---

# Lilac & Sage design system

Apps consume this system through the `@jameswilson1996/ui-tokens` package (`tokens.css` + `bundle.css`, `motion.js` for the drag and navigation helpers and `days.js` for the day helpers). The files in `assets/` here are the same source the package is built from; read them to see exact token names and classes.

Before building UI:

1. Read `reference/brand-book.md` for colour, type, spacing, dark-mode, voice and iconography rules.
2. Read `reference/components.md` for each `ls-` component's markup and usage rules. Reuse an existing component (or its React wrapper in `src/shared/ui/`) before creating anything new.
3. Look up exact token names in `assets/tokens.json` (semantic tokens such as `bg`, `surface`, `ink`, `accent`, `on-accent`, `sage`, `success-ink`). Never use the `lilac-*`, `sage-*` or `mist-*` primitives in app code.

Hard rules:

- No raw hex, rgb or named colours in app code; only `var(--token)` or Tailwind classes mapped to tokens.
- Every screen must work in both `data-theme="light"` and `data-theme="dark"`; text on a fill always uses its `on-*` token.
- Status is never colour alone: pair it with a word or a Lucide icon.
- Keep the 2px `focus-ring` outline on every interactive element.
- Every state must survive forced colours (Windows High Contrast): a fill or shadow alone is lost, so chosen, current and progress states get a system-colour rule in the bundle's forced-colours block.
- The frame is the App shell in `reference/components.md`: `ls-app` with the sidebar and a left-aligned `ls-main` capped at `content-width`, a skip link, the head (viewport, `theme-color`, icons, manifest), and after each navigation a "Page · App" title and focus on the `h1`.
- Every page starts with an `ls-page-header`: area or back link, one `h1`, one state line, at most one primary action with the rest under More, and the page's tabs.
- Build every form from `ls-form`, `ls-field`, `ls-field__row` (a button beside an input) and `ls-file` (file inputs), as `reference/components.md` shows. No inline `style=` and no custom gaps or margins between fields. One of 2 to 4 short options is an `ls-segmented`, 5 or more an `ls-select`, a long or searched list a picker dialog. Mark optional fields with "(optional)"; required ones carry no mark.
- Stages of work are an `ls-board` of `ls-column`s side by side on desktop; on a phone one column shows at a time, picked from the page header's tab row.
- Adding items in a burst uses `ls-quickadd`: the field clears on submit, before the server answers, and gets the text back only if the command fails.
- Rows you act on are an `ls-list`: each row shows its one main action as a visible control, and the rest go in the row's dialog or a More menu. No swipe actions.
- Filters above a list are one `ls-filterbar` row on every screen size: scope, search, active filters as `ls-chip`s, a Filter chip that opens the rest (popover on desktop, sheet on a phone), and the result count. Never a second row of filters.
- Top-level navigation is `ls-nav` (sidebar, 5 to 7 items) on wider screens and `ls-tabbar` (bottom bar, 5 items at most) at 640px and below. Account, Settings and Sign out live in the page header's account menu on a phone.
- A command's result is confirmed in an `ls-toast` (one at a time, at most one action such as Undo, 6 seconds); persistent conditions use `ls-alert`.
- Loading, busy buttons, failed loads, failed commands and edit conflicts follow Loading and errors in `reference/components.md`: `ls-loading` placeholders, `aria-busy` on the button, `ls-empty` for a page that couldn't load, an alert in forms and a Try again toast for one-tap actions.
- Details and filtered lists open in an `ls-dialog` over the current page rather than navigating away. On a phone, confirms, pickers, filters and forms of up to 4 fields use `ls-dialog--sheet`, and longer forms stay full screen; tooltips and small detail cards use `ls-popover`.
- A long list or table shows its first page and an `ls-more` ("Showing 20 of 48", Show 20 more) under it; sortable columns use `ls-table__sort` with `aria-sort`. Dates and times use the helpers in Dates and times ("8 Nov", "in 3 days", "2 minutes ago").
- A calendar day is picked with the Date picker: a typed `ls-input` read by `parseDay` from `@jameswilson1996/ui-tokens/days.js` and a calendar button opening an `ls-calendar` (a popover on desktop, a sheet on a phone). Never `type="date"`.
- Charts are inline SVG with `ls-chart` and the `chart-*` tokens in order: a legend or direct labels, a tooltip in `ls-popover`, and a table view. One figure is an `ls-stat`, not a chart.
- Motion uses only the `--motion-*` and `--ease-*` tokens and the patterns in the brand book's Motion section, so reduced motion works everywhere. Drags use `ls-lifted`, `ls-drop-slot` and `ls-drag-handle`, with the helpers from `@jameswilson1996/ui-tokens/motion.js`. Page changes take their view transition type from `navigationMotion` in the router, by where they land, so a link from one module to another fades through like the tab bar.
- A genuinely new component is added to this system first (PR to house-standards), then used from apps.
