// Types for motion.js, the Lilac & Sage motion helpers (brand book Motion patterns 1, 3 and 4).

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
