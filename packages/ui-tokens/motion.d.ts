// Types for motion.js, the Lilac & Sage drag helpers (brand book Motion pattern 1).

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

/** Scrolls `scroller` (document.scrollingElement for the page) while `pointer` is near its edge. Returns whether it scrolled. */
export declare function scrollNearEdge(scroller: Element, pointer: Point): boolean;

/** Runs scrollNearEdge on every animation frame with the pointer's last position; `onScroll` places the slot again. Returns a stop function. */
export declare function scrollWhileHeld(scrollers: Element[], pointer: () => Point, onScroll: (pointer: Point) => void): () => void;
