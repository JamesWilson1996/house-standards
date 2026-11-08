---
name: design-system
description: Lilac & Sage, the house design system (pastel lilac and sage, light and dark themes, ls- CSS components). Use whenever building or changing UI, styling, colours, themes, components, icons or copy in any house frontend.
---

# Lilac & Sage design system

Apps consume this system through the `@jameswilson1996/ui-tokens` package (`tokens.css` + `bundle.css`). The files in `assets/` here are the same source the package is built from; read them to see exact token names and classes.

Before building UI:

1. Read `reference/brand-book.md` for colour, type, spacing, dark-mode, voice and iconography rules.
2. Read `reference/components.md` for each `ls-` component's markup and usage rules. Reuse an existing component (or its React wrapper in `src/shared/ui/`) before creating anything new.
3. Look up exact token names in `assets/tokens.json` (semantic tokens such as `bg`, `surface`, `ink`, `accent`, `on-accent`, `sage`, `success-ink`). Never use the `lilac-*`, `sage-*` or `mist-*` primitives in app code.

Hard rules:

- No raw hex, rgb or named colours in app code; only `var(--token)` or Tailwind classes mapped to tokens.
- Every screen must work in both `data-theme="light"` and `data-theme="dark"`; text on a fill always uses its `on-*` token.
- Status is never colour alone: pair it with a word or a Lucide icon.
- Keep the 2px `focus-ring` outline on every interactive element.
- Every page starts with an `ls-page-header`: area or back link, one `h1`, one state line, at most one primary action with the rest under More, and the page's tabs.
- Build every form from `ls-form`, `ls-field`, `ls-field__row` (a button beside an input) and `ls-file` (file inputs), as `reference/components.md` shows. No inline `style=` and no custom gaps or margins between fields.
- Top-level navigation is `ls-nav` (sidebar, 5 to 7 items) on wider screens and `ls-tabbar` (bottom bar, 5 items at most) at 640px and below. Account, Settings and Sign out live in the page header's account menu on a phone.
- A command's result is confirmed in an `ls-toast` (one at a time, at most one action such as Undo, 6 seconds); persistent conditions use `ls-alert`.
- Details and filtered lists open in an `ls-dialog` over the current page rather than navigating away. On a phone, pickers, filters and forms of up to 4 fields use `ls-dialog--sheet`, and longer forms stay full screen; tooltips and small detail cards use `ls-popover`.
- Motion uses only the `--motion-*` and `--ease-*` tokens and the patterns in the brand book's Motion section, so reduced motion works everywhere. Drags use `ls-lifted`, `ls-drop-slot` and `ls-drag-handle`.
- A genuinely new component is added to this system first (PR to house-standards), then used from apps.
