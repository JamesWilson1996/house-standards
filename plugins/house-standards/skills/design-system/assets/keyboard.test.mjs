// Tests for keyboard.js: which shortcut a key press means, and when shortcuts stay quiet.
import { test } from "node:test";
import assert from "node:assert/strict";
import { shortcutFor, SHORTCUT_KEYS, enterMovesOn } from "./keyboard.js";

// A target that answers closest() for the selectors keyboard.js asks about.
const target = (matches = []) => ({ closest: (selector) => (matches.some((m) => selector.includes(m)) ? {} : null) });
const press = (key, extra = {}) => ({ key, target: target(), defaultPrevented: false, repeat: false, ctrlKey: false, metaKey: false, altKey: false, ...extra });

test("shortcutFor names the action for /, n and ?", () => {
  assert.equal(shortcutFor(press("/")), "search");
  assert.equal(shortcutFor(press("n")), "primary");
  assert.equal(shortcutFor(press("?", { shiftKey: true })), "help");
  assert.equal(shortcutFor(press("x")), null);
});

test("shortcutFor stays quiet while typing in a field", () => {
  for (const field of ["input", "textarea", "select", "contenteditable"]) {
    assert.equal(shortcutFor(press("n", { target: target([field]) })), null, field);
  }
});

test("shortcutFor stays quiet inside an open dialog, so n never stacks a second one", () => {
  assert.equal(shortcutFor(press("n", { target: target(["dialog"]) })), null);
});

test("shortcutFor leaves the browser's and the system's shortcuts alone", () => {
  assert.equal(shortcutFor(press("n", { ctrlKey: true })), null);
  assert.equal(shortcutFor(press("n", { metaKey: true })), null);
  assert.equal(shortcutFor(press("n", { altKey: true })), null);
  assert.equal(shortcutFor(press("n", { defaultPrevented: true })), null);
  assert.equal(shortcutFor(press("n", { repeat: true })), null);
});

test("SHORTCUT_KEYS lists every key, for the ? dialog", () => {
  assert.deepEqual(SHORTCUT_KEYS, { search: "/", primary: "n", help: "?" });
});

// ---------- #116: Enter moves to the next field on a phone keyboard ----------

// A field that records focus and its attributes; a form that lists its fields in order and records submits.
const field = (tag = "INPUT", type = "text") => ({
  tagName: tag, type, disabled: false, readOnly: false, hidden: false, attrs: {}, focused: false,
  setAttribute(name, value) { this.attrs[name] = value; }, hasAttribute(name) { return name in this.attrs; }, focus() { this.focused = true; },
});
const formOf = (fields) => {
  const listeners = {};
  return {
    elements: fields,
    addEventListener: (type, fn) => (listeners[type] = fn),
    removeEventListener: (type) => delete listeners[type],
    key: (target, key = "Enter", extra = {}) => {
      const event = { key, target, defaultPrevented: false, isComposing: false, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, preventDefault() { this.defaultPrevented = true; }, ...extra };
      listeners.keydown?.(event);
      return event;
    },
    has: (type) => type in listeners,
  };
};

test("enterMovesOn marks every text field but the last Next, and the last with its own action", () => {
  const [name, amount, notes] = [field(), field("INPUT", "number"), field()];
  enterMovesOn(formOf([name, amount, notes]), { last: "done" });
  assert.equal(name.attrs.enterkeyhint, "next");
  assert.equal(amount.attrs.enterkeyhint, "next");
  assert.equal(notes.attrs.enterkeyhint, "done");
});

test("enterMovesOn moves focus to the next field instead of submitting", () => {
  const [name, amount] = [field(), field()];
  const form = formOf([name, amount]);
  enterMovesOn(form);
  const event = form.key(name);
  assert.equal(event.defaultPrevented, true);
  assert.equal(amount.focused, true);
});

test("enterMovesOn lets Enter submit from the last field", () => {
  const [name, amount] = [field(), field()];
  const form = formOf([name, amount]);
  enterMovesOn(form);
  assert.equal(form.key(amount).defaultPrevented, false);
});

test("enterMovesOn skips buttons, checkboxes, disabled and hidden fields, and leaves textareas their new lines", () => {
  const name = field(), box = field("INPUT", "checkbox"), off = field(), notes = field("TEXTAREA"), amount = field();
  off.disabled = true;
  const form = formOf([name, box, field("BUTTON", "submit"), off, notes, amount]);
  enterMovesOn(form);
  assert.equal(box.attrs.enterkeyhint, undefined);
  assert.equal(notes.attrs.enterkeyhint, undefined);
  form.key(name);
  assert.equal(amount.focused, true);
  assert.equal(form.key(notes).defaultPrevented, false);
});

test("enterMovesOn leaves Enter alone when something else handled it (a combobox picking an option) or while composing", () => {
  const [name, amount] = [field(), field()];
  const form = formOf([name, amount]);
  enterMovesOn(form);
  form.key(name, "Enter", { defaultPrevented: true });
  form.key(name, "Enter", { isComposing: true });
  assert.equal(amount.focused, false);
});

test("enterMovesOn's cleanup removes the listener", () => {
  const form = formOf([field(), field()]);
  const stop = enterMovesOn(form);
  stop();
  assert.equal(form.has("keydown"), false);
});
