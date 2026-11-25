// Lilac & Sage keyboard shortcuts (components.md, Keyboard): one listener at the app root asks shortcutFor() what a key press means,
// and the page runs its search, primary action or the shortcuts dialog. Every shortcut also has a visible control.

/** Each shortcut's key, by action. The ? dialog lists these. */
export const SHORTCUT_KEYS = Object.freeze({ search: "/", primary: "n", help: "?" });

// Typing in any of these must never trigger a shortcut.
const TYPING = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
// A modal dialog owns the keyboard while it is open.
const DIALOG = "dialog";

/**
 * The action a keydown means ("search", "primary" or "help"), or null. It stays quiet while typing in a field, inside a dialog, with
 * Ctrl, Cmd or Alt held (the browser's and the system's shortcuts), on a key held down, and when something else handled the key.
 */
export function shortcutFor(event) {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return null;
  const target = event.target;
  if (target?.closest?.(TYPING) || target?.closest?.(DIALOG)) return null;
  const match = Object.entries(SHORTCUT_KEYS).find(([, key]) => key === event.key);
  return match ? match[0] : null;
}
