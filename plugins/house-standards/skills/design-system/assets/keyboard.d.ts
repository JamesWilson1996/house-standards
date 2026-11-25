// Types for keyboard.js, the Lilac & Sage keyboard shortcuts (components.md, Keyboard).

/** The actions a shortcut can mean. */
export type ShortcutAction = "search" | "primary" | "help";

/** Each shortcut's key, by action: / for search, n for the page's primary action, ? for the shortcuts dialog. */
export declare const SHORTCUT_KEYS: Readonly<Record<ShortcutAction, string>>;

/** The action a keydown means, or null while typing, inside a dialog, with Ctrl, Cmd or Alt held, on a repeat, or when already handled. */
export declare function shortcutFor(event: KeyboardEvent): ShortcutAction | null;
