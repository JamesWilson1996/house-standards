Lilac & Sage is the shared look for every app we build: calm pastel lilac and sage on a lilac-tinted neutral, one friendly sans, soft radii, borders over shadows. Every app uses these tokens and the `ls-` component classes; no app defines its own colours.

## Using this system in an app

- Load `tokens.css` (generated from `tokens.json`) then `components/bundle.css`, once, at the app root. Set `data-theme="light"` or `data-theme="dark"` on `<html>`; follow the OS with `matchMedia('(prefers-color-scheme: dark)')` unless the user has picked a theme. Set the attribute in an inline script in `<head>` before first paint so dark-mode users never see a light flash.
- Components reference **semantic tokens only** (`bg`, `surface`, `ink`, `accent`, `sage`, `success-ink`…). The `lilac-*`, `sage-*` and `mist-*` scales are primitives: use them only to define new semantic tokens here, never in app code.
- Publish both files as an internal package (e.g. `@jameswilson1996/ui-tokens`) so every app pins a version; changes land here first, then apps bump.
- Tailwind (optional): map semantic tokens in `@theme`, e.g. `--color-accent: var(--accent); --color-ink: var(--ink);`, so `bg-accent text-on-accent` stays theme-aware. Never use Tailwind's default palette.

## Colour

- **Lilac is the primary brand colour.** `accent` fills the one primary action per view, selected tabs and focus; text on it is always `on-accent` (white in light, deep lilac in dark — never hard-code white).
- **Sage is the secondary.** `sage` with `on-sage` for secondary buttons and positive highlights. Do not use sage for destructive or error states.
- **Pastel fills carry most of the colour.** `accent-soft` for selected rows, nav highlight and soft buttons; status uses the four soft/ink pairs: `success-*` (sage), `warning-*` (peach), `danger-*` (rose), `info-*` (sky).
- **Status is never colour alone.** Every badge or alert says its state in words and/or a Lucide icon; success and danger are also separated by icon shape.
- Text: `ink` for primary, `ink-muted` for secondary. Both reach at least 5.5:1 on `bg`, `surface` and `surface-sunken` in both themes; every ink/fill pair in this system is AA (4.5:1) or better.
- **Dark mode keeps the pastel character.** Solid fills (`accent`, `sage`, `danger`) turn into lighter pastels with deep text on them (`on-accent`, `on-sage`, `on-danger`); soft fills and surfaces turn into deep tinted greys. Never invert colours or pick dark-theme values by hand in an app; every semantic token already has both.
- Borders: `line` for decorative hairlines, `line-strong` for anything a user operates (inputs, checkboxes) — 3:1 in both themes.
- Disabled: each button variant has a fill and text pair (`disabled-fill`/`on-disabled`, `accent-disabled`/`on-accent-disabled`, `sage-disabled`/`on-sage-disabled`, `danger-disabled`/`on-danger-disabled`). Disabled text reaches at least 3.6:1 on its fill in both themes, and a disabled primary stays lilac. Never fade a control with `opacity`.

## Type

- One family: **Figtree** (Google Fonts, weights 400–700) for all UI; **JetBrains Mono** for IDs, codes and keys.
- Scale: `display` 40 · `h1` 30 · `h2` 22 · `h3` 17 · `body` 15 · `body-sm` 13 · `label` 13/600 · `caption` 12 · `code` 13.
- Sentence case everywhere, including buttons and headings. Use tabular numerals (`font-variant-numeric: tabular-nums`) for money and counts.

## Space, shape, depth

- 4px base: `space-1` 4 → `space-8` 64. Card padding `space-4`; gap between cards `space-5`; between page sections `space-7`.
- Forms (`ls-form`): `form-help-gap` 6 from label to control and control to help text; `form-field-gap` 16 from field to field; `form-actions-gap` 24 from the last field to the actions; `form-section-gap` 32 between sub-sections in a card.
- Radius: `radius-sm` 6 (badges, checkboxes), `radius-md` 10 (buttons, inputs, tabs), `radius-lg` 16 (cards, alerts, dialogs), `radius-pill` (switches, avatars).
- Depth: borders first. `shadow-sm` only to lift a card; `shadow-md` for menus and popovers; `shadow-lg` for dialogs, over a `backdrop` scrim.
- Overlays: dialogs are `dialog-sm` 400, `dialog-md` 560 or `dialog-lg` 800 wide and fill the screen at 640px and below, except a sheet (`ls-dialog--sheet`): it rises from the bottom as tall as its content, up to 90% of the screen, for pickers, filters and forms of up to 4 fields. Longer forms stay full screen. Popovers grow to `popover-width` 320 (tooltips `tooltip-width` 240), and sit `popover-offset` 8 from their trigger and the viewport edge. Dialogs keep `overlay-margin` 16 from the viewport edge.
- Controls are 36px tall (28px small) so buttons, inputs and selects align on one line.
- Focus: a 2px solid `focus-ring` outline offset 2px on every interactive element (`:focus-visible`). Never remove it.

## Motion

Motion shows what you are holding, what changed, what arrived, where you went, or what a link points at. It never decorates.

- Durations come only from tokens: `motion-quick` 120ms (colour, press states, chevrons, anything leaving), `motion-base` 150ms (dialogs, popovers and toasts arriving, rows sliding aside, a drop settling, a row folding away), `motion-travel` 200ms (movement across most of the screen: a full-screen dialog or sheet on a phone, drilling into a screen and back). `motion-flash` 1200ms is how long `ls-flash` marks a row.
- Easing: `ease-enter` for arriving and moving, `ease-exit` for leaving. Leaving is faster than arriving. No bounce or overshoot.
- Animate only `opacity`, `translate`, `scale`, `rotate` and colour. Never animate layout on large content; a single row may fold.
- Reduced motion: the three durations become 0ms under `prefers-reduced-motion: reduce`, so anything built on the tokens stops moving by itself. A dragged item still follows the pointer, because the user is moving it. `ls-flash` keeps its mark for 1.2s and clears it without fading.
- The five patterns:
  1. Holding (drag): the item lifts in `motion-quick` (`ls-lifted`: shadow, accent border, 2% larger; board cards also tilt 1.5° with `ls-lifted--tilt`) and then follows the pointer exactly, with no easing. A dashed `ls-drop-slot` opens where it will land and the items around it slide aside in `motion-base`. On release it settles into the slot in `motion-base`. Rows drag by a handle at once; cards with no handle lift after a 350ms press, with a 15ms vibration where supported, so a swipe still scrolls. Arrow keys on the handle move it one place with the same slide.
  2. Changing a list: a ticked item is marked at once, then folds away after 400ms. A new item fades in at its place (`ls-enter`). Amounts change in place with no counting up. A toast with Undo confirms what changed.
  3. Arriving and leaving: dialogs and popovers rise 8px and fade in over `motion-base`; on a phone a full-screen dialog or a sheet rises from the bottom in `motion-travel` while the backdrop fades. Toasts rise from the bottom and leave in `motion-quick`.
  4. Navigation: switching between top-level places (sidebar or bottom tab bar) is instant. Opening something one level down on a phone slides it in from the right in `motion-travel` and back slides it out in `motion-base`, using View Transitions where the router offers them.
  5. Pointing: a link to one row scrolls to it smoothly and marks it with `ls-flash`.
- Never: page-load sequences or staggered entrances, sliding between tabs, numbers counting up, parallax, blur or zoom-in screens, skeleton shimmer, a spinner for anything under 400ms, celebrations, or motion that blocks the next tap. Every transition can be interrupted.

## Voice

- Plain, warm, brief. Address the user as "you"; the product speaks as "we" only in empty states and errors.
- Buttons are verbs: "Save changes", "Invite member". Errors say what happened and what to do: "Sync failed. The billing service didn't respond. Try again in a minute."
- No emoji in UI, no exclamation marks, no ALL CAPS.
- State facts. Empty states, tooltips and onboarding say what something is or does: "Projects you create appear here." Skip contrast framing ("Not just a list, a workspace"), marketing adjectives (seamless, powerful, effortless) and rhetorical questions.
- Use real numbers and names: "3 of 10 seats used", "Last synced 2 minutes ago".

## Iconography

- **Lucide** icons (outline, 2px stroke, round caps), drawn with `currentColor` so they take the text colour. 18px in nav, 20px in the tab bar and alerts, 16px inside buttons.
- No logo is defined yet: each app sets its name in `h3` weight in `ink`. Add marks under `assets/Logos/` when they exist.

## Data & state in the UI

- The backend owns state and actions. The UI renders server state (TanStack Query) and sends commands; it never infers a status the API didn't send. Badges map 1:1 to the API's state enum.
- Validation errors come from the API (problem+json) and appear in the matching field's help line with `data-invalid`.
- Details and filtered lists open in an `ls-dialog` over the current page, with the open state in the URL, so Back or Escape returns the user to where they were.
