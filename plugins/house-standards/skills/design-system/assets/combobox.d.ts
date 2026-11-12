// Types for combobox.js, the Lilac & Sage combobox helpers (components.md, Combobox).

/** One thing the field can hold: its id as the API sends it, and the name people see. */
export interface ComboboxEntry {
  value: string;
  label: string;
}

/** What an optional field shows and sends when it has no value: "None". */
export declare const NONE_LABEL: string;
export declare const OPTION_NONE: "none";
export declare const OPTION_ENTRY: "entry";
export declare const OPTION_ADD: "add";

/** A row in the open list. For an Add option, value is the trimmed typed text; for None, it is "". */
export type ComboboxOption =
  | { type: typeof OPTION_NONE; value: ""; label: string }
  | { type: typeof OPTION_ENTRY; value: string; label: string }
  | { type: typeof OPTION_ADD; value: string; label: string };

export interface ComboboxSettings {
  /** The field may be left empty, so the list starts with None. */
  optional?: boolean;
  /** The list ends with Add "<text>" when the typed text isn't an entry. */
  canAdd?: boolean;
}

/** Whether the list shows, the index of the active option (-1 for none) and how many options it has. */
export interface ComboboxState {
  open: boolean;
  active: number;
  count: number;
}

/** What a key in the input does. "settle" closes the list and applies settle(); "close" also puts the field's text back. */
export type ComboboxAction =
  | { type: "open"; active: number }
  | { type: "move"; active: number }
  | { type: "pick"; active: number }
  | { type: "close" }
  | { type: "settle" };

/** Add "Pets". */
export declare function addLabel(text: string): string;

/** Entries whose label contains the text, those starting with it first; every entry for blank text. */
export declare function matchEntries<T extends ComboboxEntry>(entries: readonly T[], text: string): T[];

/** The entry whose whole label is the text, ignoring case, accents and outer spaces. */
export declare function findEntry<T extends ComboboxEntry>(entries: readonly T[], text: string): T | undefined;

/** The open list: None (optional, nothing typed), the matching entries, then Add "<text>" (canAdd, not an entry). */
export declare function comboboxOptions(entries: readonly ComboboxEntry[], text: string, settings?: ComboboxSettings): ComboboxOption[];

/** What a key in the input does, or null to leave it to the input and the page. */
export declare function comboboxKey(event: { key: string; altKey?: boolean }, state: ComboboxState): ComboboxAction | null;

/** The value when focus leaves without a pick: an exact entry, None for a blank optional field, else the current value. Never adds. */
export declare function settle(
  entries: readonly ComboboxEntry[],
  text: string,
  current: ComboboxEntry | null,
  settings?: Pick<ComboboxSettings, "optional">,
): ComboboxOption | null;
