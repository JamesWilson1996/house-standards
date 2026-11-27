// Types for motion.js, the Lilac & Sage motion helpers (brand book Motion patterns 1 to 4).

export interface Point {
  x: number;
  y: number;
}

/** Where each element was when capture() ran, in viewport pixels. */
export type Captured = Map<HTMLElement, Point>;

export declare const LIFT_DELAY_MS: 350;
export declare const LIFT_VIBRATION_MS: 15;
export declare const MOVE_TOLERANCE_PX: 8;
export declare const EDGE_ZONE_PX: 48;
export declare const MAX_SCROLL_STEP_PX: 16;
/** The motion-wait token in ms, for the router's defaultPendingMs: how long a navigation waits for the next page's data. */
export declare const MOTION_WAIT_MS: 400;

/** Measures a list's children (minus `exclude`), or the given elements, before the DOM changes. */
export declare function capture(elements: HTMLElement | Iterable<HTMLElement>, exclude?: HTMLElement): Captured;

/** Slides captured elements from where they were to where they are now, over motion-base. Empty when it is 0ms. */
export declare function slideFrom(captured: Captured): Animation[];

/** Moves the drop slot with `place()` and slides the list's other items to their new positions. */
export declare function moveSlot(list: HTMLElement, held: HTMLElement, place: () => void): Animation[];

/** Settles the held item into the slot on release; `drop()` ends the lifted state and puts it in the slot's place. */
export declare function settle(held: HTMLElement, drop: () => void): Animation | null;

/** Mouse lifts at once; touch lifts after LIFT_DELAY_MS unless the finger moves first. Returns a cleanup function. */
export declare function pressToLift(card: HTMLElement, lift: (down: PointerEvent) => void): () => void;

/** Space a bar of the app's own covers at the top or bottom of the viewport, in px. */
export interface EdgeInsets {
  top?: number;
  bottom?: number;
}

/**
 * Scrolls `scroller` (document.scrollingElement for the page) while `pointer` is near its edge. The zones start above a fixed
 * ls-tabbar, below a stuck page header tab row, and inside `insets`. Returns whether it scrolled.
 */
export declare function scrollNearEdge(scroller: Element, pointer: Point, insets?: EdgeInsets): boolean;

/** Runs scrollNearEdge on every animation frame with the pointer's last position; `onScroll` places the slot again. Returns a stop function. */
export declare function scrollWhileHeld(scrollers: Element[], pointer: () => Point, onScroll: (pointer: Point) => void, insets?: EdgeInsets): () => void;

/** Resolves once `el`'s exit animations (its ::backdrop included) have finished; call after close(), hidePopover() or adding ls-leave, then remove it. */
export declare function afterLeaving(el: Element): Promise<void>;

/** Where a page sits: its top-level place ("budget") and its depth (0 for the place's own pages and tabs, 1 one level down). */
export interface PagePlace {
  place: string;
  depth: number;
}

/** The view transition types the bundle animates between pages. */
export type NavigationMotion = "ls-switch" | "ls-tab" | "ls-drill" | "ls-back";

/** The view transition type for a navigation, chosen by where it lands: another place fades through, deeper drills, shallower goes back, a sibling tab fades the panel. */
export declare function navigationMotion(from: PagePlace, to: PagePlace): NavigationMotion;
/** How long a toast stays, in ms: the motion-toast token. */
export declare const TOAST_MS: number;

/** Places a control's span.ls-marker on its current option (ls-segmented, ls-tabs). Slides over motion-base; jumps the first time and when `animate` is false. */
export declare function placeMarker(marker: HTMLElement, current: Element | null, options?: { animate?: boolean }): void;

/** Calls `onTimeout` after TOAST_MS, holding the timer and the countdown line (ls-toast--held) while a mouse is over the toast or focus is inside. Returns a stop function. */
export declare function toastTimer(toast: HTMLElement, onTimeout: () => void): () => void;

/** Fades a list's first six rows in motion-stagger apart (ls-stagger) on its first render with data, and takes the class off once they land. */
export declare function staggerIn(list: Element): Promise<void>;

/** Opens a dialog by growing it from the tapped row over motion-travel. Falls back to `open` alone without view transition types or when the row is off screen. */
export declare function openFrom(origin: HTMLElement, open: () => void | Promise<void>, dialog: () => HTMLElement | null): Promise<void>;

/** Closes a dialog by shrinking it back into its row over motion-base. Falls back to `close` alone when the row has gone or is off screen. */
export declare function closeTo(origin: HTMLElement, close: () => void | Promise<void>, dialog: () => HTMLElement | null): Promise<void>;

/** The motion-flash token in ms: how long ls-flash marks a row, and how long a button shows ls-btn__done. */
export declare const MOTION_FLASH_MS: number;

/** The buzz, in ms, when an item is ticked or a list is finished. */
export declare const TICK_VIBRATION_MS: number;

/** Buzzes for TICK_VIBRATION_MS where supported, never under reduced motion. Returns whether it buzzed. */
export declare function vibrateTick(): boolean;

/** Applies a theme change as a crossfade over motion-base (view transition type ls-theme), or at once without view transition types. */
export declare function switchTheme(apply: () => void): Promise<void>;

/**
 * Hands the installed app's launch (ls-launch) over to the first page once it has rendered, after the mark's entrance: a fade through
 * (view transition type ls-launch), or a fade out without view transition types. Removes a launch that never showed at once.
 * Resolves once the layer has gone: true when it was on screen, so focus the page's h1; false when there was nothing to hand over.
 */
export declare function endLaunch(launch?: Element | null): Promise<boolean>;

/** When tooltips show:the first after motion-wait, the next at once while one is showing or just closed, and at once for focus. */
export interface TooltipTiming {
  enter(show: () => void): void;
  focus(show: () => void): void;
  leave(hide: () => void): void;
}

/** One shared timing for every tooltip in the app. */
export declare function tooltipTiming(): TooltipTiming;

/** What tapping the current place does: scroll to the top, go to its root, or nothing. */
export type Reselect = "top" | "root" | "none";

/** Where each top-level place was left, for the tab bar and sidebar. */
export interface PlaceMemory {
  leave(place: string, href: string, scrollY: number): void;
  target(place: string, root: string): { href: string; scrollY: number };
  reselect(href: string, root: string, scrollY: number): Reselect;
  forget(): void;
}

/** Remembers each place's last page and scroll for the session. */
export declare function placeMemory(): PlaceMemory;
