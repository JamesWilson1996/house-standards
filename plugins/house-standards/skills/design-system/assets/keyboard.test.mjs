// Tests for keyboard.js: which shortcut a key press means, and when shortcuts stay quiet.
import { test } from "node:test";
import assert from "node:assert/strict";
import { shortcutFor, SHORTCUT_KEYS } from "./keyboard.js";

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
