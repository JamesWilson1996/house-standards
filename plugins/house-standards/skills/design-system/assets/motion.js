// Lilac & Sage motion helpers: dragging (brand book Motion pattern 1, Holding), a list's first rows in turn (pattern 2), waiting for an
// exit to finish, a toast's timer and a dialog growing from its row (pattern 3), a navigation's motion and the current-place
// marker (pattern 4), and the installed app's launch handing over to the first page.
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
/**
 * The motion-wait token in ms: how long a navigation holds the current page for the next page's data before it moves on to
 * placeholders. For the router's defaultPendingMs, which can't read CSS. A test keeps it equal to tokens.json.
 */
export const MOTION_WAIT_MS = 400;

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

// A bar this close to the top of the screen is stuck there.
const STUCK_TOLERANCE_PX = 1;
// Bars that stay on screen over the page: the fixed tab bar along the bottom, and the page header's tab row
// (a board's column tabs on a phone), which sticks to the top once scrolled to it.
const BOTTOM_BAR = ".ls-tabbar";
const TOP_BAR = ".ls-page-header__tabs";

// The part of the viewport the content shows in: below a stuck tab row and above the tab bar, and inside any insets
// the app passes for bars of its own. Hidden bars measure 0px tall and are skipped.
const contentView = (insets = {}) => {
  let top = insets.top ?? 0;
  let bottom = innerHeight - (insets.bottom ?? 0);
  const bar = document.querySelector?.(BOTTOM_BAR)?.getBoundingClientRect();
  if (bar?.height && bar.top < bottom) bottom = bar.top;
  for (const row of document.querySelectorAll?.(TOP_BAR) ?? []) {
    const rect = row.getBoundingClientRect();
    const stuck = rect.height && Math.abs(rect.top) <= STUCK_TOLERANCE_PX && getComputedStyle(row).position === "sticky";
    if (stuck && rect.bottom > top) top = rect.bottom;
  }
  return { left: 0, top, right: innerWidth, bottom };
};

// The part of the scroller on screen and not under a bar: the page's own rect is the whole document, and a tall
// column's bottom edge may be below the viewport or under the tab bar, where the pointer can't reach it.
const visibleEdges = (scroller, view) => {
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
 * the edge. For the page, pass document.scrollingElement. The edges are those of the part the content shows in:
 * the zones start above a fixed ls-tabbar and below a stuck page header tab row, and inside `insets` (px from the
 * top and bottom of the viewport) for any other bar the app keeps on screen. A pointer over a bar at the top scrolls
 * nothing up or down, since the hold is for the bar (dropping on a tab). Returns whether it scrolled.
 */
export function scrollNearEdge(scroller, pointer, insets) {
  const view = contentView(insets);
  const edges = visibleEdges(scroller, view);
  const dx = scrollStep(pointer.x, edges.left, edges.right);
  // Over a bar at the top (a stuck tab row) the hold belongs to the bar, such as dropping on a tab, so nothing scrolls up or down.
  const dy = pointer.y < view.top ? 0 : scrollStep(pointer.y, edges.top, edges.bottom);
  if (!dx && !dy) return false;
  const before = { left: scroller.scrollLeft, top: scroller.scrollTop };
  scroller.scrollLeft += dx;
  scroller.scrollTop += dy;
  return scroller.scrollLeft !== before.left || scroller.scrollTop !== before.top;
}

/**
 * While an item is lifted, runs scrollNearEdge on every animation frame with the pointer's last position, so the
 * containers keep scrolling while the pointer rests; onScroll places the slot again. `insets` is passed on to
 * scrollNearEdge. Returns a function that stops it.
 */
export function scrollWhileHeld(scrollers, pointer, onScroll, insets) {
  let frame = requestAnimationFrame(function tick() {
    const position = pointer();
    let scrolled = false;
    for (const scroller of scrollers) scrolled = scrollNearEdge(scroller, position, insets) || scrolled;
    if (scrolled) onScroll(position);
    frame = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(frame);
}

/**
 * Resolves once an element's exit motion has finished: the animations and transitions running on it, its
 * descendants and its pseudo-elements (a dialog's ::backdrop). Call it right after the change that starts the exit
 * (close(), hidePopover(), adding ls-leave), then remove the element. Endless animations inside, such as a busy
 * button's spinner, are not waited for. Under reduced motion the exits are 0ms, so it resolves at once.
 */
export function afterLeaving(el) {
  return afterMotion(el);
}

// Resolves when the finite animations and transitions on an element and inside it have finished or been cancelled.
function afterMotion(el) {
  if (typeof el.getAnimations !== "function") return Promise.resolve();
  // Reading a style applies the new state, so its transitions exist before they are listed.
  void getComputedStyle(el).opacity;
  const running = el.getAnimations({ subtree: true }).filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
  return Promise.allSettled(running.map((a) => a.finished)).then(() => undefined);
}

/**
 * The view transition type for a navigation between two pages (brand book Motion pattern 4), chosen by where it lands,
 * never by where the link sits. A page is its top-level place ("budget") and its depth: 0 for the place's own pages and
 * tabs, 1 for a page one level down, and so on.
 * - Another place: "ls-switch" (fade through), whatever page it lands on and however deep, Back included.
 * - Deeper in the same place: "ls-drill". Shallower: "ls-back".
 * - Another of the place's own pages (its tabs): "ls-tab". Another page at the same depth below them: "ls-switch".
 */
export function navigationMotion(from, to) {
  if (from.place !== to.place) return "ls-switch";
  if (to.depth > from.depth) return "ls-drill";
  if (to.depth < from.depth) return "ls-back";
  return to.depth === 0 ? "ls-tab" : "ls-switch";
}
/** How long a toast stays: the motion-toast token in ms, which its countdown line also uses. A test keeps it equal to tokens.json. */
export const TOAST_MS = 6000;

const MARKER_PLACED = "ls-marker--placed";
const TOAST_HELD = "ls-toast--held";
const STAGGER = "ls-stagger";
const ORIGIN_NAME = "ls-origin";
const ORIGIN_OPEN = "ls-origin";
const ORIGIN_CLOSE = "ls-origin-back";
const MOUSE = "mouse";

/**
 * Places a control's span.ls-marker on its current option: the fill in ls-segmented, the underline in ls-tabs. It slides there over
 * motion-base, except the first time and when `animate` is false (on resize, or when fonts load), when it jumps.
 */
export function placeMarker(marker, current, { animate = true } = {}) {
  const box = marker.parentElement;
  if (!box || !current) return;
  const outer = box.getBoundingClientRect();
  const rect = current.getBoundingClientRect();
  const jump = !animate || !marker.classList.contains(MARKER_PLACED);
  if (jump) marker.style.transition = "none";
  // Absolute positions start inside the control's border.
  marker.style.setProperty("--ls-marker-x", `${rect.left - outer.left - box.clientLeft}px`);
  marker.style.setProperty("--ls-marker-y", `${rect.top - outer.top - box.clientTop}px`);
  marker.style.setProperty("--ls-marker-w", `${rect.width}px`);
  marker.style.setProperty("--ls-marker-h", `${rect.height}px`);
  marker.style.setProperty("--ls-marker-scale", String(rect.width));
  marker.classList.add(MARKER_PLACED);
  if (jump) {
    // Applies the jump before the transition comes back.
    void marker.offsetWidth;
    marker.style.transition = "";
  }
}

/**
 * Ends a toast after TOAST_MS by calling `onTimeout`. While a mouse is over it or focus is inside, the timer and the countdown line
 * hold (ls-toast--held), then run on with the time left. A finger doesn't hold it, since a touch has no hover to end.
 * Returns a function that stops the timer, for a toast that is replaced or dismissed.
 */
export function toastTimer(toast, onTimeout) {
  let left = TOAST_MS;
  let started = 0;
  let timer = 0;
  let stopped = false;
  let pointer = false;
  let focus = false;
  const run = () => {
    started = Date.now();
    timer = setTimeout(() => { stop(); onTimeout(); }, left);
  };
  const sync = () => {
    if (stopped) return;
    const held = pointer || focus;
    toast.classList.toggle(TOAST_HELD, held);
    if (held && timer) {
      clearTimeout(timer);
      timer = 0;
      left -= Date.now() - started;
    } else if (!held && !timer) {
      run();
    }
  };
  const listeners = {
    pointerenter: (e) => { if (e.pointerType === MOUSE) { pointer = true; sync(); } },
    pointerleave: (e) => { if (e.pointerType === MOUSE) { pointer = false; sync(); } },
    focusin: () => { focus = true; sync(); },
    focusout: (e) => { focus = toast.contains(e.relatedTarget); sync(); },
  };
  function stop() {
    stopped = true;
    clearTimeout(timer);
    timer = 0;
    for (const [type, listener] of Object.entries(listeners)) toast.removeEventListener(type, listener);
  }
  for (const [type, listener] of Object.entries(listeners)) toast.addEventListener(type, listener);
  run();
  return stop;
}

/**
 * Fades a list's first rows in turn on its first render with data (ls-stagger): six rows, motion-stagger apart. Resolves once they
 * have landed and takes the class off, so a re-sort, a refetch or a new row never replays it.
 */
export function staggerIn(list) {
  list.classList.add(STAGGER);
  return afterMotion(list).then(() => list.classList.remove(STAGGER));
}

let originTransition = null;

// The bundle picks each transition's motion by its type, so a browser without types gets the change with no transition.
const hasTransitionTypes = () =>
  typeof document.startViewTransition === "function" && "types" in (globalThis.ViewTransition?.prototype ?? {});

// Growing needs view transition types (for the bundle's ls-origin rules) and a row the user can see.
const canGrowFrom = (origin) => {
  if (!hasTransitionTypes()) return false;
  if (!origin?.isConnected) return false;
  const { top, right, bottom, left } = origin.getBoundingClientRect();
  return bottom > 0 && right > 0 && top < innerHeight && left < innerWidth;
};

const nameOrigin = (el, named) => {
  if (el) el.style.viewTransitionName = named ? ORIGIN_NAME : "";
};

// Names `from` in the old state and `to()` in the new one, so the browser morphs one into the other.
function growBetween(type, from, to, change) {
  originTransition?.skipTransition();
  nameOrigin(from, true);
  const transition = document.startViewTransition({
    types: [type],
    update: async () => {
      nameOrigin(from, false);
      await change();
      nameOrigin(to(), true);
    },
  });
  originTransition = transition;
  transition.finished.catch(() => {}).finally(() => {
    // A newer transition may already be using the name, so only the latest one clears it.
    if (originTransition !== transition) return;
    nameOrigin(to(), false);
    originTransition = null;
  });
  return transition.updateCallbackDone;
}

/**
 * Opens a dialog by growing it out of the row or card that was tapped, over motion-travel. `open` shows the dialog (showModal, or a
 * state change that has rendered it by the time it returns or resolves) and `dialog` returns its element. Where the browser lacks view
 * transition types or the row is off screen, it only calls `open`, and the dialog rises as usual. Resolves once the dialog is open.
 */
export function openFrom(origin, open, dialog) {
  if (!canGrowFrom(origin)) return Promise.resolve(open()).then(() => undefined);
  return growBetween(ORIGIN_OPEN, origin, dialog, open);
}

/**
 * Closes a dialog by shrinking it back into the row it came from, over motion-base. If the row has gone or is off screen, it only calls
 * `close`, and the dialog leaves its usual way.
 */
export function closeTo(origin, close, dialog) {
  const el = dialog();
  if (!el || !canGrowFrom(origin)) return Promise.resolve(close()).then(() => undefined);
  return growBetween(ORIGIN_CLOSE, el, () => (origin.isConnected ? origin : null), close);
}
/** The motion-flash token in ms: how long ls-flash marks a row, and how long a button says it's done. A test keeps it equal to tokens.json. */
export const MOTION_FLASH_MS = 1200;
/** The buzz when an item is ticked or a list is finished, where the device supports vibration. */
export const TICK_VIBRATION_MS = 10;

const THEME_TYPE = "ls-theme";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Buzzes for TICK_VIBRATION_MS when an item is ticked or the done state appears. Never under reduced motion, and never for a change
 * from the other person. Returns whether it buzzed.
 */
export function vibrateTick() {
  if (globalThis.matchMedia?.(REDUCED_MOTION).matches) return false;
  return globalThis.navigator?.vibrate?.(TICK_VIBRATION_MS) ?? false;
}

/**
 * Applies a theme change as a crossfade over motion-base (view transition type ls-theme). `apply` sets the theme, such as
 * data-theme on the root. Without view transition types it just applies it. Resolves once the new theme is in place.
 */
export function switchTheme(apply) {
  if (!hasTransitionTypes()) {
    apply();
    return Promise.resolve();
  }
  const transition = document.startViewTransition({ update: apply, types: [THEME_TYPE] });
  // A second change straight after skips this one; that is expected, not an error.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
  return transition.updateCallbackDone.catch(() => {});
}

const LAUNCH = ".ls-launch";
const LAUNCH_TYPE = "ls-launch";
const LAUNCH_LEAVING = "ls-launch--leaving";
const HIDDEN = "none";
const ending = new WeakMap();

// The launch reached the screen once the page has painted, or once its entrance has started running.
const launchShown = (launch) =>
  (globalThis.performance?.getEntriesByType?.("paint")?.length ?? 0) > 0 ||
  (launch.getAnimations?.({ subtree: true }) ?? []).some((a) => (a.currentTime ?? 0) > 0);

/**
 * Hands the installed app's launch (ls-launch, #146) over to the first page. Call it once, when the first page has rendered with its data
 * or with its placeholders after motion-wait, and from the app's error boundary. It waits for the mark's entrance to finish, so the mark
 * never cuts off half grown, then fades through to the page (view transition type ls-launch), or fades the layer out where the browser
 * has no view transition types. A launch that never reached the screen (a browser tab, or a page ready before the first paint) goes at
 * once. Resolves once the layer has gone from the page: true when it was on screen and handed over, so move focus to the page's h1;
 * false when there was nothing to hand over, where the browser's own start is right.
 */
export function endLaunch(launch = document.querySelector(LAUNCH)) {
  if (!launch?.isConnected) return Promise.resolve(false);
  if (ending.has(launch)) return ending.get(launch);
  const remove = () => launch.remove();
  let done;
  if (getComputedStyle(launch).display === HIDDEN || !launchShown(launch)) {
    remove();
    done = Promise.resolve(false);
  } else {
    done = afterMotion(launch).then(() => {
      if (hasTransitionTypes()) {
        const transition = document.startViewTransition({ update: remove, types: [LAUNCH_TYPE] });
        // A navigation straight after skips the fade; that is expected, not an error.
        transition.ready.catch(() => {});
        transition.finished.catch(() => {});
        return transition.updateCallbackDone.catch(() => {}).then(() => true);
      }
      launch.classList.add(LAUNCH_LEAVING);
      return afterMotion(launch).then(remove).then(() => true);
    });
  }
  ending.set(launch, done);
  return done;
}

/**
 * When tooltips show (brand book Motion pattern 3): the first after the pointer rests on its control for motion-wait, so sweeping
 * across a toolbar shows none; the next at once while one is showing or within motion-wait of one closing; and at once for keyboard
 * focus. Make one for the app and call enter, focus and leave from every tooltip's control.
 */
export function tooltipTiming() {
  let timer = 0;
  let open = false;
  let closedAt = -Infinity;
  const showNow = (show) => {
    clearTimeout(timer);
    open = true;
    show();
  };
  return {
    enter(show) {
      clearTimeout(timer);
      if (open || Date.now() - closedAt < MOTION_WAIT_MS) showNow(show);
      else timer = setTimeout(() => showNow(show), MOTION_WAIT_MS);
    },
    focus: showNow,
    leave(hide) {
      clearTimeout(timer);
      if (!open) return;
      open = false;
      closedAt = Date.now();
      hide();
    },
  };
}
/**
 * Where each top-level place was left, for the tab bar and sidebar (brand book Motion pattern 4, #115). Call `leave(place, href, scrollY)`
 * as a navigation leaves a place, link each place's item to `target(place, root).href`, and restore `scrollY` once its page has rendered.
 * `reselect(href, root, scrollY)` says what tapping the current place does: scroll to the top, then go to the place's root.
 * It lives for the tab's session, in memory; `forget()` on sign-out.
 */
export function placeMemory() {
  const left = new Map();
  return {
    leave(place, href, scrollY) {
      left.set(place, { href, scrollY });
    },
    target(place, root) {
      return left.get(place) ?? { href: root, scrollY: 0 };
    },
    reselect(href, root, scrollY) {
      if (scrollY > 0) return "top";
      return href === root ? "none" : "root";
    },
    forget() {
      left.clear();
    },
  };
}
