// Lilac & Sage combobox helpers: the list, filter and keys of "choose one, or add a new one" (components.md, Combobox).
// Pure functions on the field's entries and typed text. The app owns the DOM, the open state and the command that adds an entry.

/** What an optional field shows and sends when it has no value. */
export const NONE_LABEL = "None";
/** The kinds of option in the list: the empty value, an existing entry, and the typed text as a new entry. */
export const OPTION_NONE = "none";
export const OPTION_ENTRY = "entry";
export const OPTION_ADD = "add";
const NO_ACTIVE = -1;
const LOCALE = "en-GB";

// "Café" matches "cafe": accents and case never stop a match.
const fold = (text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase(LOCALE).trim();
const none = () => ({ type: OPTION_NONE, value: "", label: NONE_LABEL });
const entry = ({ value, label }) => ({ type: OPTION_ENTRY, value, label });

/** The last option's text: Add "Pets". */
export const addLabel = (text) => `Add "${text}"`;

/** Entries whose label contains the text: those starting with it first, each group in the given order. Every entry for blank text. */
export function matchEntries(entries, text) {
  const t = fold(text);
  if (!t) return entries;
  const starts = [];
  const contains = [];
  for (const e of entries) {
    const label = fold(e.label);
    if (label.startsWith(t)) starts.push(e);
    else if (label.includes(t)) contains.push(e);
  }
  return [...starts, ...contains];
}

/** The entry whose whole label is the text, ignoring case, accents and outer spaces. */
export function findEntry(entries, text) {
  const t = fold(text);
  return t ? entries.find((e) => fold(e.label) === t) : undefined;
}

/**
 * The open list for the typed text: None first for an optional field while nothing is typed, the matching entries,
 * and, where the field can add, Add "<text>" last when the text isn't already an entry.
 */
export function comboboxOptions(entries, text, { optional = false, canAdd = false } = {}) {
  const typed = text.trim();
  const options = matchEntries(entries, typed).map(entry);
  if (optional && !typed) options.unshift(none());
  if (canAdd && typed && !findEntry(entries, typed)) options.push({ type: OPTION_ADD, value: typed, label: addLabel(typed) });
  return options;
}

/**
 * What a key in the input does, from the WAI-ARIA combobox pattern (list autocomplete, manual selection).
 * state is { open, active, count }: whether the list shows, the index of the active option (-1 for none) and how many options it has.
 * Returns { type: "open", active }, { type: "move", active }, { type: "pick", active }, { type: "close" }, { type: "settle" } or null.
 */
export function comboboxKey(event, { open, active, count }) {
  const { key, altKey = false } = event;
  if (!open) {
    if (key === "ArrowDown") return { type: "open", active: altKey || count === 0 ? NO_ACTIVE : 0 };
    if (key === "ArrowUp") return { type: "open", active: count - 1 };
    return null;
  }
  if (key === "Escape" || (key === "ArrowUp" && altKey)) return { type: "close" };
  if (key === "Tab") return { type: "settle" };
  if (key === "Enter") return active === NO_ACTIVE ? null : { type: "pick", active };
  if (count === 0) return null;
  if (key === "ArrowDown") return { type: "move", active: (active + 1) % count };
  if (key === "ArrowUp") return { type: "move", active: active <= 0 ? count - 1 : active - 1 };
  return null;
}

/**
 * The value when focus leaves the field, or the list closes, without a pick: the entry the text names exactly, None for an optional
 * field left blank, and otherwise the value it had. A new entry is only ever added by choosing Add, never by leaving the field.
 */
export function settle(entries, text, current, { optional = false } = {}) {
  const found = findEntry(entries, text);
  if (found) return entry(found);
  if (optional && (!text.trim() || !current)) return none();
  return current ? entry(current) : null;
}
