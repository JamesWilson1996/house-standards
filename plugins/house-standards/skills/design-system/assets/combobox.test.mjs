// Tests for combobox.js. Pure functions on the entries and the typed text, so no DOM.
import { test } from "node:test";
import assert from "node:assert/strict";
import { NONE_LABEL, OPTION_NONE, OPTION_ENTRY, OPTION_ADD, addLabel, matchEntries, findEntry, comboboxOptions, comboboxKey, settle } from "./combobox.js";

const CATEGORIES = [
  { value: "c1", label: "Groceries" },
  { value: "c2", label: "Energy" },
  { value: "c3", label: "Gym" },
  { value: "c4", label: "Café" },
  { value: "c5", label: "Mortgage" },
];
const labels = (options) => options.map((o) => o.label);

test("matchEntries keeps every entry, in order, for empty text", () => {
  assert.deepEqual(labels(matchEntries(CATEGORIES, "")), ["Groceries", "Energy", "Gym", "Café", "Mortgage"]);
  assert.deepEqual(labels(matchEntries(CATEGORIES, "   ")), ["Groceries", "Energy", "Gym", "Café", "Mortgage"]);
});

test("matchEntries puts entries that start with the text before those that contain it", () => {
  assert.deepEqual(labels(matchEntries(CATEGORIES, "g")), ["Groceries", "Gym", "Energy", "Mortgage"]);
  assert.deepEqual(labels(matchEntries(CATEGORIES, "GY")), ["Gym", "Energy"]);
});

test("matchEntries ignores case and accents", () => {
  assert.deepEqual(labels(matchEntries(CATEGORIES, "cafe")), ["Café"]);
  assert.deepEqual(labels(matchEntries(CATEGORIES, "CAFÉ")), ["Café"]);
});

test("findEntry finds only a whole label, ignoring case, accents and outer spaces", () => {
  assert.equal(findEntry(CATEGORIES, " gym ")?.value, "c3");
  assert.equal(findEntry(CATEGORIES, "cafe")?.value, "c4");
  assert.equal(findEntry(CATEGORIES, "gy"), undefined);
  assert.equal(findEntry(CATEGORIES, ""), undefined);
});

test("comboboxOptions starts an optional field's list with None while nothing is typed", () => {
  const options = comboboxOptions(CATEGORIES, "", { optional: true });
  assert.deepEqual(options[0], { type: OPTION_NONE, value: "", label: NONE_LABEL });
  assert.equal(options.length, 6);
  assert.equal(comboboxOptions(CATEGORIES, "")[0].type, OPTION_ENTRY);
  assert.equal(comboboxOptions(CATEGORIES, "gym", { optional: true })[0].type, OPTION_ENTRY);
});

test("comboboxOptions offers Add for typed text that isn't an entry, last", () => {
  assert.deepEqual(labels(comboboxOptions(CATEGORIES, "Gymnastics", { canAdd: true })), ['Add "Gymnastics"']);
  assert.deepEqual(comboboxOptions(CATEGORIES, " Gy ", { canAdd: true }).at(-1), { type: OPTION_ADD, value: "Gy", label: 'Add "Gy"' });
  assert.deepEqual(labels(comboboxOptions(CATEGORIES, "g", { canAdd: true })), ["Groceries", "Gym", "Energy", "Mortgage", 'Add "g"']);
});

test("comboboxOptions offers no Add for an existing entry, for blank text, or when the field can't add", () => {
  assert.equal(comboboxOptions(CATEGORIES, "gym", { canAdd: true }).some((o) => o.type === OPTION_ADD), false);
  assert.equal(comboboxOptions(CATEGORIES, "  ", { canAdd: true }).some((o) => o.type === OPTION_ADD), false);
  assert.deepEqual(comboboxOptions(CATEGORIES, "Gymnastics"), []);
});

test("addLabel quotes the typed text", () => {
  assert.equal(addLabel("Pets"), 'Add "Pets"');
});

const closed = { open: false, active: -1, count: 5 };
const open = (active) => ({ open: true, active, count: 5 });

test("comboboxKey opens on Down at the first option and on Up at the last", () => {
  assert.deepEqual(comboboxKey({ key: "ArrowDown" }, closed), { type: "open", active: 0 });
  assert.deepEqual(comboboxKey({ key: "ArrowUp" }, closed), { type: "open", active: 4 });
  assert.deepEqual(comboboxKey({ key: "ArrowDown", altKey: true }, closed), { type: "open", active: -1 });
});

test("comboboxKey moves through the open list and wraps", () => {
  assert.deepEqual(comboboxKey({ key: "ArrowDown" }, open(-1)), { type: "move", active: 0 });
  assert.deepEqual(comboboxKey({ key: "ArrowDown" }, open(2)), { type: "move", active: 3 });
  assert.deepEqual(comboboxKey({ key: "ArrowDown" }, open(4)), { type: "move", active: 0 });
  assert.deepEqual(comboboxKey({ key: "ArrowUp" }, open(0)), { type: "move", active: 4 });
  assert.deepEqual(comboboxKey({ key: "ArrowUp" }, open(-1)), { type: "move", active: 4 });
});

test("comboboxKey picks the active option with Enter and closes with Escape, Alt+Up and Tab", () => {
  assert.deepEqual(comboboxKey({ key: "Enter" }, open(2)), { type: "pick", active: 2 });
  assert.equal(comboboxKey({ key: "Enter" }, open(-1)), null);
  assert.deepEqual(comboboxKey({ key: "Escape" }, open(2)), { type: "close" });
  assert.deepEqual(comboboxKey({ key: "ArrowUp", altKey: true }, open(2)), { type: "close" });
  assert.deepEqual(comboboxKey({ key: "Tab" }, open(2)), { type: "settle" });
});

test("comboboxKey leaves keys alone that the input or the page should handle", () => {
  assert.equal(comboboxKey({ key: "Enter" }, closed), null);
  assert.equal(comboboxKey({ key: "Escape" }, closed), null);
  assert.equal(comboboxKey({ key: "Tab" }, closed), null);
  assert.equal(comboboxKey({ key: "Home" }, open(2)), null);
  assert.equal(comboboxKey({ key: "a" }, open(2)), null);
  assert.equal(comboboxKey({ key: "ArrowDown" }, { open: true, active: -1, count: 0 }), null);
});

test("settle keeps an exact entry, clears an optional field, and otherwise returns to the current value", () => {
  const current = CATEGORIES[0];
  assert.deepEqual(settle(CATEGORIES, "gym", current), { type: OPTION_ENTRY, value: "c3", label: "Gym" });
  assert.deepEqual(settle(CATEGORIES, "", current, { optional: true }), { type: OPTION_NONE, value: "", label: NONE_LABEL });
  assert.deepEqual(settle(CATEGORIES, "", current), { type: OPTION_ENTRY, value: "c1", label: "Groceries" });
  assert.deepEqual(settle(CATEGORIES, "Gymnastics", current, { canAdd: true }), { type: OPTION_ENTRY, value: "c1", label: "Groceries" });
  assert.deepEqual(settle(CATEGORIES, "Gymnastics", null, { optional: true }), { type: OPTION_NONE, value: "", label: NONE_LABEL });
  assert.equal(settle(CATEGORIES, "Gymnastics", null), null);
});
