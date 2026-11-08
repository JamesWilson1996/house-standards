// Lilac & Sage drag helpers for brand book Motion pattern 1 (Holding).
// Durations come from the motion tokens, so reduced motion stops the slides with no extra code.

/** How long a touch press must last before a card with no handle lifts. */
export const LIFT_DELAY_MS = 350;
/** The buzz on lift, where the device supports vibration. */
export const LIFT_VIBRATION_MS = 15;
/** A finger that moves further than this before the lift delay is scrolling, so nothing lifts. */
export const MOVE_TOLERANCE_PX = 8;
/** Holding an item this close to a scroll container's edge scrolls it. */
export const EDGE_ZONE_PX = 48;
/** The most a container scrolls in one animation frame, reached at the very edge. */
export const MAX_SCROLL_STEP_PX = 16;

const SLIDE_DURATION_TOKEN = "--motion-base";
const SLIDE_EASING_TOKEN = "--ease-enter";
const MS_PER_SECOND = 1000;
const PRIMARY_BUTTON = 0;

// Token values are written in ms, but an app may override one in seconds.
const toMs = (value) => {
  const text = value.trim();
  const amount = parseFloat(text);
  if (!Number.isFinite(amount)) return 0;
  return text.endsWith("ms") ? amount : text.endsWith("s") ? amount * MS_PER_SECOND : amount;
};

const slideTiming = (el) => {
  const style = getComputedStyle(el);
  return {
    duration: toMs(style.getPropertyValue(SLIDE_DURATION_TOKEN)),
    easing: style.getPropertyValue(SLIDE_EASING_TOKEN).trim() || "ease",
  };
};

/**
 * Measures where elements are now, before the DOM changes.
 * Pass a list to measure its children, or any elements (such as the held item before it settles).
 */
export function capture(elements, exclude) {
  // An element isn't iterable; an array or a NodeList is.
  const all = Symbol.iterator in elements ? [...elements] : [...elements.children];
  const captured = new Map();
  for (const el of all) {
    if (el === exclude) continue;
    const { left, top } = el.getBoundingClientRect();
    captured.set(el, { x: left, y: top });
  }
  return captured;
}

/**
 * Slides each captured element from where it was to where it is now, over motion-base.
 * Call it after the DOM changed: straight after the change, or in a React layout effect.
 * Elements that left the page are skipped. Does nothing when motion-base is 0ms.
 */
export function slideFrom(captured) {
  const animations = [];
  let timing;
  for (const [el, before] of captured) {
    if (!el.isConnected) continue;
    timing ??= slideTiming(el);
    if (!timing.duration) return animations;
    const { left, top } = el.getBoundingClientRect();
    const dx = before.x - left;
    const dy = before.y - top;
    if (!dx && !dy) continue;
    animations.push(el.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], timing));
  }
  return animations;
}

/** Moves the drop slot with place() and slides every other item of the list to its new position. */
export function moveSlot(list, held, place) {
  const captured = capture(list, held);
  place();
  return slideFrom(captured);
}

/**
 * On release, settles the held item into the slot over motion-base.
 * drop() takes the item out of its lifted state and puts it where the slot was.
 */
export function settle(held, drop) {
  const captured = capture([held]);
  drop();
  return slideFrom(captured)[0] ?? null;
}

/**
 * Lifts a card with no handle: a mouse lifts it at once; on touch it lifts after LIFT_DELAY_MS with a short
 * vibration, and moving first means the finger is scrolling, so nothing lifts. Returns a function that removes it.
 */
export function pressToLift(card, lift) {
  let stopPress = () => {};
  const onDown = (down) => {
    if (down.pointerType === "mouse") {
      if (down.button === PRIMARY_BUTTON) lift(down);
      return;
    }
    stopPress();
    const stop = () => {
      clearTimeout(timer);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", stop);
      card.removeEventListener("pointercancel", stop);
      stopPress = () => {};
    };
    const onMove = (e) => {
      if (Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) > MOVE_TOLERANCE_PX) stop();
    };
    const timer = setTimeout(() => {
      stop();
      globalThis.navigator?.vibrate?.(LIFT_VIBRATION_MS);
      lift(down);
    }, LIFT_DELAY_MS);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", stop);
    card.addEventListener("pointercancel", stop);
    stopPress = stop;
  };
  card.addEventListener("pointerdown", onDown);
  return () => {
    stopPress();
    card.removeEventListener("pointerdown", onDown);
  };
}

const isPage = (scroller) => scroller === document.scrollingElement || scroller === document.documentElement;

// The part of the scroller on screen: the page's own rect is the whole document, and a tall
// column's bottom edge may be below the viewport where the pointer can't reach it.
const visibleEdges = (scroller) => {
  const view = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
  if (isPage(scroller)) return view;
  const rect = scroller.getBoundingClientRect();
  return {
    left: Math.max(rect.left, view.left),
    top: Math.max(rect.top, view.top),
    right: Math.min(rect.right, view.right),
    bottom: Math.min(rect.bottom, view.bottom),
  };
};

// Negative inside the start zone, positive inside the end zone, 0 elsewhere; deeper means faster.
const scrollStep = (position, start, end) => {
  const depth =
    position < start + EDGE_ZONE_PX ? position - (start + EDGE_ZONE_PX) : position > end - EDGE_ZONE_PX ? position - (end - EDGE_ZONE_PX) : 0;
  if (!depth) return 0;
  const speed = Math.min(1, Math.abs(depth) / EDGE_ZONE_PX);
  // At least 1px, since browsers round a fractional scroll step down to nothing.
  return Math.sign(depth) * Math.max(1, Math.round(speed * MAX_SCROLL_STEP_PX));
};

/**
 * Scrolls a container while a held item is within EDGE_ZONE_PX of its edge, on either axis, faster the nearer
 * the edge. For the page, pass document.scrollingElement. Returns whether it scrolled.
 */
export function scrollNearEdge(scroller, pointer) {
  const edges = visibleEdges(scroller);
  const dx = scrollStep(pointer.x, edges.left, edges.right);
  const dy = scrollStep(pointer.y, edges.top, edges.bottom);
  if (!dx && !dy) return false;
  const before = { left: scroller.scrollLeft, top: scroller.scrollTop };
  scroller.scrollLeft += dx;
  scroller.scrollTop += dy;
  return scroller.scrollLeft !== before.left || scroller.scrollTop !== before.top;
}

/**
 * While an item is lifted, runs scrollNearEdge on every animation frame with the pointer's last position, so the
 * containers keep scrolling while the pointer rests; onScroll places the slot again. Returns a function that stops it.
 */
export function scrollWhileHeld(scrollers, pointer, onScroll) {
  let frame = requestAnimationFrame(function tick() {
    const position = pointer();
    let scrolled = false;
    for (const scroller of scrollers) scrolled = scrollNearEdge(scroller, position) || scrolled;
    if (scrolled) onScroll(position);
    frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
}
