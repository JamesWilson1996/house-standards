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

// Fields where Enter can mean "next": single-line text the phone keyboard types into. Pickers (date, time, select) and choices
// (checkbox, radio) have their own Enter, and a textarea needs Enter for new lines.
const TEXT_TYPES = new Set(["text", "search", "email", "tel", "url", "number", "password"]);
const NEXT = "next";
const ENTER = "Enter";

const typedFields = (form) =>
  [...form.elements].filter((el) => el.tagName === "INPUT" && TEXT_TYPES.has(el.type) && !el.disabled && !el.readOnly && !el.hidden);

/**
 * Makes a phone keyboard's Enter move through a form's text fields (components.md, Form, #116): every field but the last shows Next and
 * moves focus on; the last shows `last` ("done", "go" or "send") and submits as usual. Enter that another handler took (a combobox
 * picking an option) or that finishes an IME composition is left alone. Returns a function that removes the listener.
 */
export function enterMovesOn(form, { last = "done" } = {}) {
  const fields = typedFields(form);
  fields.forEach((field, i) => field.setAttribute("enterkeyhint", i === fields.length - 1 ? last : NEXT));
  const onKey = (event) => {
    if (event.key !== ENTER || event.defaultPrevented || event.isComposing || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
    // Read again, since fields can appear and go (More options in a form).
    const current = typedFields(form);
    const at = current.indexOf(event.target);
    if (at < 0 || at === current.length - 1) return;
    event.preventDefault();
    current[at + 1].focus();
  };
  form.addEventListener("keydown", onKey);
  return () => form.removeEventListener("keydown", onKey);
}
