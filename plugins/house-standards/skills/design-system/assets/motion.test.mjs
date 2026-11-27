// Tests for motion.js against a small DOM shim: Node has no layout, so each fake element reports the rect it is given.
import { test, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  capture,
  slideFrom,
  moveSlot,
  settle,
  pressToLift,
  scrollNearEdge,
  scrollWhileHeld,
  afterLeaving,
  navigationMotion,
  placeMarker,
  toastTimer,
  staggerIn,
  openFrom,
  closeTo,
  TOAST_MS,
  vibrateTick,
  switchTheme,
  tooltipTiming,
  TICK_VIBRATION_MS,
  MOTION_FLASH_MS,
  placeMemory,
  endLaunch,
  LIFT_DELAY_MS,
  LIFT_VIBRATION_MS,
  MOVE_TOLERANCE_PX,
  EDGE_ZONE_PX,
  MAX_SCROLL_STEP_PX,
  MOTION_WAIT_MS,
} from "./motion.js";

const VIEWPORT = { width: 400, height: 800 };
const BASE_MS = 150;
const EASING = "cubic-bezier(0.2, 0, 0, 1)";
const ROW_HEIGHT = 56;

class FakeElement extends EventTarget {
  constructor({ left = 0, top = 0, width = 100, height = ROW_HEIGHT, scrollWidth = width, scrollHeight = height } = {}) {
    super();
    Object.assign(this, { left, top, width, height, scrollWidth, scrollHeight });
    this.children = [];
    this.isConnected = true;
    this.animations = [];
    this._scrollLeft = 0;
    this._scrollTop = 0;
  }
  getBoundingClientRect() {
    const { left, top, width, height } = this;
    return { left, top, right: left + width, bottom: top + height, width, height };
  }
  animate(keyframes, options) {
    const animation = { keyframes, options };
    this.animations.push(animation);
    return animation;
  }
  // Scroll positions clamp like a browser's, so scrolling past the end changes nothing.
  get scrollLeft() { return this._scrollLeft; }
  set scrollLeft(value) { this._scrollLeft = Math.max(0, Math.min(this.scrollWidth - this.width, value)); }
  get scrollTop() { return this._scrollTop; }
  set scrollTop(value) { this._scrollTop = Math.max(0, Math.min(this.scrollHeight - this.height, value)); }
}

const pointer = (type, props) => Object.assign(new Event(type), props);

let motionBase;
let page;
// The bars on screen, by selector: the tab bar and the page header's tab row.
let bars;
beforeEach(() => {
  motionBase = `${BASE_MS}ms`;
  page = new FakeElement({ width: VIEWPORT.width, height: VIEWPORT.height, scrollHeight: VIEWPORT.height * 3 });
  globalThis.innerWidth = VIEWPORT.width;
  globalThis.innerHeight = VIEWPORT.height;
  bars = {};
  globalThis.document = {
    scrollingElement: page,
    documentElement: page,
    querySelector: (selector) => bars[selector] ?? null,
    querySelectorAll: (selector) => (bars[selector] ? [bars[selector]] : []),
  };
  globalThis.getComputedStyle = (el) => ({
    position: el?.position ?? "static",
    display: el?.display ?? "block",
    getPropertyValue: (name) => ({ "--motion-base": motionBase, "--ease-enter": EASING })[name] ?? "",
  });
});

const listOf = (count) => {
  const list = new FakeElement({ height: ROW_HEIGHT * count });
  list.children = Array.from({ length: count }, (_, i) => new FakeElement({ top: i * ROW_HEIGHT }));
  return list;
};

test("moveSlot slides the other items from their old position to their new one over motion-base", () => {
  const list = listOf(3);
  const [held, second, third] = list.children;
  moveSlot(list, held, () => {
    second.top += ROW_HEIGHT;
    third.top += ROW_HEIGHT;
  });
  assert.deepEqual(second.animations, [
    { keyframes: [{ translate: `0px ${-ROW_HEIGHT}px` }, { translate: "0 0" }], options: { duration: BASE_MS, easing: EASING } },
  ]);
  assert.equal(third.animations.length, 1);
  assert.equal(held.animations.length, 0);
});

test("moveSlot skips items that did not move", () => {
  const list = listOf(3);
  const [held, second, third] = list.children;
  moveSlot(list, held, () => (third.top += ROW_HEIGHT));
  assert.equal(second.animations.length, 0);
  assert.equal(third.animations.length, 1);
});

test("moveSlot places the slot but animates nothing when motion-base is 0ms (reduced motion)", () => {
  motionBase = "0ms";
  const list = listOf(2);
  const [held, other] = list.children;
  let placed = false;
  const animations = moveSlot(list, held, () => {
    placed = true;
    other.top += ROW_HEIGHT;
  });
  assert.equal(placed, true);
  assert.deepEqual(animations, []);
  assert.equal(other.animations.length, 0);
});

test("motion-base given in seconds is read as milliseconds", () => {
  motionBase = "0.15s";
  const item = new FakeElement();
  const captured = capture([item]);
  item.top += ROW_HEIGHT;
  assert.equal(slideFrom(captured)[0].options.duration, BASE_MS);
});

test("capture and slideFrom split the slide, so a framework can change the DOM in between", () => {
  const list = listOf(2);
  const [first, second] = list.children;
  const captured = capture(list);
  // A React render reorders the rows; the layout effect then calls slideFrom.
  [first.top, second.top] = [second.top, first.top];
  const animations = slideFrom(captured);
  assert.equal(animations.length, 2);
  assert.deepEqual(first.animations[0].keyframes[0], { translate: `0px ${-ROW_HEIGHT}px` });
  assert.deepEqual(second.animations[0].keyframes[0], { translate: `0px ${ROW_HEIGHT}px` });
});

test("slideFrom skips elements that left the page", () => {
  const item = new FakeElement();
  const captured = capture([item]);
  item.isConnected = false;
  item.top += ROW_HEIGHT;
  assert.deepEqual(slideFrom(captured), []);
});

test("settle slides the held item from where it was dropped into the slot over motion-base", () => {
  const held = new FakeElement({ left: 30, top: 300 });
  const animation = settle(held, () => {
    held.left = 0;
    held.top = ROW_HEIGHT;
  });
  assert.deepEqual(animation.keyframes, [{ translate: `30px ${300 - ROW_HEIGHT}px` }, { translate: "0 0" }]);
  assert.equal(animation.options.duration, BASE_MS);
});

test("settle returns null under reduced motion", () => {
  motionBase = "0ms";
  const held = new FakeElement({ top: 300 });
  assert.equal(settle(held, () => (held.top = 0)), null);
});

test("pressToLift lifts at once with the main mouse button and ignores the others", () => {
  const card = new FakeElement();
  const lifts = [];
  pressToLift(card, (e) => lifts.push(e.button));
  card.dispatchEvent(pointer("pointerdown", { pointerType: "mouse", button: 2 }));
  card.dispatchEvent(pointer("pointerdown", { pointerType: "mouse", button: 0 }));
  assert.deepEqual(lifts, [0]);
});

test("pressToLift lifts on touch after the delay, with a vibration", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const vibrations = [];
  // Node's navigator is a getter on globalThis; mock.property can't swap it, so redefine and restore it.
  const realNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { vibrate: (ms) => vibrations.push(ms) } });
  t.after(() => Object.defineProperty(globalThis, "navigator", realNavigator));
  const card = new FakeElement();
  let lifted = 0;
  pressToLift(card, () => lifted++);
  card.dispatchEvent(pointer("pointerdown", { pointerType: "touch", clientX: 10, clientY: 10 }));
  t.mock.timers.tick(LIFT_DELAY_MS - 1);
  assert.equal(lifted, 0);
  t.mock.timers.tick(1);
  assert.equal(lifted, 1);
  assert.deepEqual(vibrations, [LIFT_VIBRATION_MS]);
});

test("pressToLift does not lift when the finger moves first, but allows a small wobble", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const card = new FakeElement();
  let lifted = 0;
  pressToLift(card, () => lifted++);

  card.dispatchEvent(pointer("pointerdown", { pointerType: "touch", clientX: 0, clientY: 0 }));
  card.dispatchEvent(pointer("pointermove", { clientX: MOVE_TOLERANCE_PX, clientY: 0 }));
  t.mock.timers.tick(LIFT_DELAY_MS);
  assert.equal(lifted, 1);

  card.dispatchEvent(pointer("pointerdown", { pointerType: "touch", clientX: 0, clientY: 0 }));
  card.dispatchEvent(pointer("pointermove", { clientX: 0, clientY: MOVE_TOLERANCE_PX + 1 }));
  t.mock.timers.tick(LIFT_DELAY_MS);
  assert.equal(lifted, 1);
});

test("pressToLift does not lift when the press ends or is cancelled first", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const card = new FakeElement();
  let lifted = 0;
  pressToLift(card, () => lifted++);
  for (const end of ["pointerup", "pointercancel"]) {
    card.dispatchEvent(pointer("pointerdown", { pointerType: "touch", clientX: 0, clientY: 0 }));
    card.dispatchEvent(pointer(end, {}));
    t.mock.timers.tick(LIFT_DELAY_MS);
  }
  assert.equal(lifted, 0);
});

test("the function pressToLift returns removes it, including a press in progress", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const card = new FakeElement();
  let lifted = 0;
  const remove = pressToLift(card, () => lifted++);
  card.dispatchEvent(pointer("pointerdown", { pointerType: "touch", clientX: 0, clientY: 0 }));
  remove();
  t.mock.timers.tick(LIFT_DELAY_MS);
  card.dispatchEvent(pointer("pointerdown", { pointerType: "mouse", button: 0 }));
  assert.equal(lifted, 0);
});

const board = () => new FakeElement({ left: 0, top: 100, width: 300, height: 400, scrollWidth: 900 });

test("scrollNearEdge scrolls a board sideways near its left or right edge, faster nearer the edge", () => {
  const b = board();
  b.scrollLeft = 300;
  assert.equal(scrollNearEdge(b, { x: 300 - EDGE_ZONE_PX / 2, y: 300 }), true);
  assert.equal(b.scrollLeft, 300 + MAX_SCROLL_STEP_PX / 2);
  assert.equal(scrollNearEdge(b, { x: 300, y: 300 }), true);
  assert.equal(b.scrollLeft, 300 + MAX_SCROLL_STEP_PX * 1.5);
  assert.equal(scrollNearEdge(b, { x: 0, y: 300 }), true);
  assert.equal(b.scrollLeft, 300 + MAX_SCROLL_STEP_PX / 2);
});

test("scrollNearEdge does nothing outside the edge zone or when the container can't scroll further", () => {
  const b = board();
  assert.equal(scrollNearEdge(b, { x: 150, y: 300 }), false);
  assert.equal(scrollNearEdge(b, { x: 0, y: 300 }), false);
  assert.equal(b.scrollLeft, 0);
});

test("scrollNearEdge scrolls a list that is its own scroller up or down near its top or bottom edge", () => {
  const list = new FakeElement({ top: 100, height: 400, scrollHeight: 1200 });
  assert.equal(scrollNearEdge(list, { x: 50, y: 500 }), true);
  assert.equal(list.scrollTop, MAX_SCROLL_STEP_PX);
  assert.equal(scrollNearEdge(list, { x: 50, y: 100 + EDGE_ZONE_PX / 2 }), true);
  assert.equal(list.scrollTop, MAX_SCROLL_STEP_PX / 2);
});

test("scrollNearEdge uses the viewport's edges for the page", () => {
  assert.equal(scrollNearEdge(page, { x: 200, y: VIEWPORT.height - 1 }), true);
  assert.ok(page.scrollTop > 0);
  assert.equal(scrollNearEdge(page, { x: 200, y: VIEWPORT.height / 2 }), false);
});

const TABBAR_HEIGHT = 98; // 64px plus a 34px home indicator
const TAB_ROW_HEIGHT = 44;
const tabBar = () => new FakeElement({ top: VIEWPORT.height - TABBAR_HEIGHT, width: VIEWPORT.width, height: TABBAR_HEIGHT });
const tabRow = (top) => Object.assign(new FakeElement({ top, width: VIEWPORT.width, height: TAB_ROW_HEIGHT }), { position: "sticky" });

test("scrollNearEdge starts the page's bottom zone above the tab bar (#83)", () => {
  bars[".ls-tabbar"] = tabBar();
  const barTop = VIEWPORT.height - TABBAR_HEIGHT;
  // Just above the bar is inside the zone, so the held row scrolls the page before it reaches the bar.
  assert.equal(scrollNearEdge(page, { x: 200, y: barTop - 1 }), true);
  page.scrollTop = 0;
  assert.equal(scrollNearEdge(page, { x: 200, y: barTop - EDGE_ZONE_PX - 1 }), false);
});

test("scrollNearEdge ignores a tab bar that is hidden above 640px", () => {
  bars[".ls-tabbar"] = new FakeElement({ top: 0, width: 0, height: 0 });
  assert.equal(scrollNearEdge(page, { x: 200, y: VIEWPORT.height - EDGE_ZONE_PX - 1 }), false);
  assert.equal(scrollNearEdge(page, { x: 200, y: VIEWPORT.height - 1 }), true);
});

test("scrollNearEdge starts the page's top zone below a stuck tab row, so holding over a tab doesn't scroll", () => {
  bars[".ls-page-header__tabs"] = tabRow(0);
  page.scrollTop = VIEWPORT.height;
  assert.equal(scrollNearEdge(page, { x: 200, y: TAB_ROW_HEIGHT / 2 }), false);
  assert.equal(scrollNearEdge(page, { x: 200, y: TAB_ROW_HEIGHT + 1 }), true);
  assert.ok(page.scrollTop < VIEWPORT.height);
});

test("scrollNearEdge measures from the viewport's top while the tab row is further down the page, or not sticky", () => {
  bars[".ls-page-header__tabs"] = tabRow(200);
  page.scrollTop = VIEWPORT.height;
  assert.equal(scrollNearEdge(page, { x: 200, y: 1 }), true);
  bars[".ls-page-header__tabs"] = Object.assign(tabRow(0), { position: "static" });
  assert.equal(scrollNearEdge(page, { x: 200, y: 1 }), true);
});

test("scrollNearEdge keeps the zones inside insets the app passes", () => {
  const insets = { top: 60, bottom: 80 };
  page.scrollTop = VIEWPORT.height;
  assert.equal(scrollNearEdge(page, { x: 200, y: 30 }, insets), false);
  assert.equal(scrollNearEdge(page, { x: 200, y: 61 }, insets), true);
  assert.equal(scrollNearEdge(page, { x: 200, y: VIEWPORT.height - 81 }, insets), true);
});

test("scrollNearEdge keeps a tall column's bottom zone above the tab bar too", () => {
  bars[".ls-tabbar"] = tabBar();
  const column = new FakeElement({ top: 0, height: VIEWPORT.height * 2, scrollHeight: VIEWPORT.height * 4 });
  assert.equal(scrollNearEdge(column, { x: 50, y: VIEWPORT.height - TABBAR_HEIGHT - 1 }), true);
});

test("scrollNearEdge uses the visible edge of a scroller that runs below the viewport", () => {
  const column = new FakeElement({ top: 0, height: VIEWPORT.height * 2, scrollHeight: VIEWPORT.height * 4 });
  assert.equal(scrollNearEdge(column, { x: 50, y: VIEWPORT.height }), true);
  assert.equal(column.scrollTop, MAX_SCROLL_STEP_PX);
});

test("scrollNearEdge moves at least 1px just inside the zone, since browsers drop fractional steps", () => {
  const list = new FakeElement({ top: 0, height: 400, scrollHeight: 1200 });
  assert.equal(scrollNearEdge(list, { x: 50, y: 400 - EDGE_ZONE_PX + 0.1 }), true);
  assert.equal(list.scrollTop, 1);
});

test("scrollWhileHeld scrolls on every frame with the pointer's last position and re-places the slot", (t) => {
  const frames = [];
  // Node has no animation frames; each frame runs when the test calls runFrame.
  globalThis.requestAnimationFrame = (fn) => frames.push(fn);
  globalThis.cancelAnimationFrame = (id) => (frames[id - 1] = null);
  t.after(() => {
    delete globalThis.requestAnimationFrame;
    delete globalThis.cancelAnimationFrame;
  });
  const runFrame = () => frames.at(-1)?.();
  const b = board();
  let last = { x: 300, y: 300 };
  const placed = [];
  const stop = scrollWhileHeld([b, page], () => last, (p) => placed.push(p));

  runFrame();
  runFrame();
  assert.equal(b.scrollLeft, MAX_SCROLL_STEP_PX * 2);
  assert.deepEqual(placed, [last, last]);

  last = { x: 150, y: 300 };
  runFrame();
  assert.equal(placed.length, 2);

  stop();
  last = { x: 300, y: 300 };
  runFrame();
  assert.equal(b.scrollLeft, MAX_SCROLL_STEP_PX * 2);
});

// A running animation as getAnimations() reports it: `finished` settles when end() or cancel() is called.
const fakeAnimation = (endTime = BASE_MS) => {
  let end;
  let cancel;
  const finished = new Promise((resolve, reject) => { end = resolve; cancel = reject; });
  return { finished, effect: { getComputedTiming: () => ({ endTime }) }, end: () => end(), cancel: () => cancel(new Error("AbortError")) };
};
const leaving = (animations) => {
  const el = new FakeElement();
  el.getAnimations = (options) => { el.asked = options; return animations; };
  return el;
};
const settled = async (promise) => {
  let done = false;
  promise.then(() => (done = true));
  await new Promise((resolve) => setTimeout(resolve, 0));
  return done;
};

test("afterLeaving waits for every exit animation on the element, its ::backdrop included", async () => {
  const fade = fakeAnimation();
  const backdrop = fakeAnimation();
  const el = leaving([fade, backdrop]);
  const left = afterLeaving(el);
  assert.deepEqual(el.asked, { subtree: true });
  fade.end();
  assert.equal(await settled(left), false);
  backdrop.end();
  assert.equal(await settled(left), true);
});

test("afterLeaving resolves at once when nothing runs (reduced motion makes every exit 0ms)", async () => {
  assert.equal(await settled(afterLeaving(leaving([]))), true);
});

test("afterLeaving ignores endless animations inside, such as a busy button's spinner", async () => {
  const spinner = fakeAnimation(Infinity);
  assert.equal(await settled(afterLeaving(leaving([spinner]))), true);
});

test("afterLeaving resolves when an exit is cancelled, so the element is still removed", async () => {
  const fade = fakeAnimation();
  const left = afterLeaving(leaving([fade]));
  fade.cancel();
  assert.equal(await settled(left), true);
});

test("afterLeaving resolves at once where the browser has no getAnimations", async () => {
  assert.equal(await settled(afterLeaving(new FakeElement())), true);
});

test("navigationMotion fades through to another place, whatever the depth either side", () => {
  // The tab bar, and a link from one module to another: Today's "All bills", a shopping item's meal.
  assert.equal(navigationMotion({ place: "today", depth: 0 }, { place: "budget", depth: 0 }), "ls-switch");
  // Today straight into one project's board: still another place, so no drill.
  assert.equal(navigationMotion({ place: "today", depth: 0 }, { place: "projects", depth: 1 }), "ls-switch");
  // Back from that board to Today fades through too, rather than sliding.
  assert.equal(navigationMotion({ place: "projects", depth: 1 }, { place: "today", depth: 0 }), "ls-switch");
});

test("navigationMotion drills in and back within a place", () => {
  assert.equal(navigationMotion({ place: "projects", depth: 0 }, { place: "projects", depth: 1 }), "ls-drill");
  assert.equal(navigationMotion({ place: "projects", depth: 1 }, { place: "projects", depth: 2 }), "ls-drill");
  assert.equal(navigationMotion({ place: "projects", depth: 1 }, { place: "projects", depth: 0 }), "ls-back");
  assert.equal(navigationMotion({ place: "projects", depth: 2 }, { place: "projects", depth: 0 }), "ls-back");
});

test("navigationMotion fades only the panel between a place's own tabs, and the page between siblings below them", () => {
  assert.equal(navigationMotion({ place: "budget", depth: 0 }, { place: "budget", depth: 0 }), "ls-tab");
  assert.equal(navigationMotion({ place: "projects", depth: 1 }, { place: "projects", depth: 1 }), "ls-switch");
});

test("MOTION_WAIT_MS is the motion-wait token, for the router's pending wait (#99)", () => {
  const tokens = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
  const wait = tokens.motion.tokens.find((t) => t.name === "motion-wait").value;
  assert.equal(`${MOTION_WAIT_MS}ms`, wait);
});

// ---------- #107: marker, toast countdown, stagger, opening from the tapped row ----------
// A plain fake for these helpers: a rect, a style that records custom properties, a class list and listeners.
class FakeNode extends EventTarget {
  constructor({ left = 0, top = 0, width = 100, height = 40 } = {}) {
    super();
    Object.assign(this, { left, top, width, height, clientLeft: 0, clientTop: 0, parentElement: null, isConnected: true, inside: [] });
    this.reflows = [];
    const props = {};
    this.style = { transition: "", viewTransitionName: "", props, setProperty: (name, value) => (props[name] = value) };
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle: (name, force) => (force ? classes.add(name) : classes.delete(name), force),
    };
  }
  getBoundingClientRect() {
    const { left, top, width, height } = this;
    return { left, top, right: left + width, bottom: top + height, width, height };
  }
  // Reading offsetWidth forces style, so the test records which transition was in force at that moment.
  get offsetWidth() { this.reflows.push(this.style.transition); return this.width; }
  contains(node) { return node === this || this.inside.includes(node); }
}

const control = () => {
  const box = new FakeNode({ left: 20, top: 100, width: 300, height: 36 });
  box.clientLeft = 1;
  box.clientTop = 1;
  const marker = new FakeNode();
  marker.parentElement = box;
  const options = [0, 1, 2].map((i) => new FakeNode({ left: 23 + i * 98, top: 103, width: 96, height: 30 }));
  return { box, marker, options };
};

test("placeMarker puts the marker on the current option, measured inside the control's border", () => {
  const { marker, options } = control();
  placeMarker(marker, options[1]);
  assert.deepEqual(marker.style.props, {
    "--ls-marker-x": "100px", "--ls-marker-y": "2px", "--ls-marker-w": "96px", "--ls-marker-h": "30px", "--ls-marker-scale": "96",
  });
  assert.equal(marker.classList.contains("ls-marker--placed"), true);
});

test("placeMarker jumps on its first placement, so the marker never slides in from the control's corner", () => {
  const { marker, options } = control();
  placeMarker(marker, options[0]);
  assert.deepEqual(marker.reflows, ["none"]);
  assert.equal(marker.style.transition, "");
});

test("placeMarker slides once placed, and jumps when asked (a resize)", () => {
  const { marker, options } = control();
  placeMarker(marker, options[0]);
  placeMarker(marker, options[2]);
  assert.deepEqual(marker.reflows, ["none"]);
  placeMarker(marker, options[1], { animate: false });
  assert.deepEqual(marker.reflows, ["none", "none"]);
});

test("placeMarker does nothing without a current option", () => {
  const { marker } = control();
  placeMarker(marker, null);
  assert.equal(marker.classList.contains("ls-marker--placed"), false);
});

const toastPointer = (type, pointerType = "mouse") => Object.assign(new Event(type), { pointerType });
const toastFocus = (type, relatedTarget = null) => Object.assign(new Event(type), { relatedTarget });
const withClock = (body) => () => {
  mock.timers.enable({ apis: ["setTimeout", "Date"] });
  try { body(); } finally { mock.timers.reset(); }
};

test("toastTimer ends the toast after TOAST_MS", withClock(() => {
  const toast = new FakeNode();
  let ended = 0;
  toastTimer(toast, () => ended++);
  mock.timers.tick(TOAST_MS - 1);
  assert.equal(ended, 0);
  mock.timers.tick(1);
  assert.equal(ended, 1);
}));

test("toastTimer holds the toast and its line while a mouse is over it, then runs on with the time left", withClock(() => {
  const toast = new FakeNode();
  let ended = 0;
  toastTimer(toast, () => ended++);
  mock.timers.tick(2000);
  toast.dispatchEvent(toastPointer("pointerenter"));
  assert.equal(toast.classList.contains("ls-toast--held"), true);
  mock.timers.tick(10000);
  assert.equal(ended, 0);
  toast.dispatchEvent(toastPointer("pointerleave"));
  assert.equal(toast.classList.contains("ls-toast--held"), false);
  mock.timers.tick(TOAST_MS - 2000 - 1);
  assert.equal(ended, 0);
  mock.timers.tick(1);
  assert.equal(ended, 1);
}));

test("toastTimer ignores a finger, since a touch has no hover to end it", withClock(() => {
  const toast = new FakeNode();
  let ended = 0;
  toastTimer(toast, () => ended++);
  toast.dispatchEvent(toastPointer("pointerenter", "touch"));
  assert.equal(toast.classList.contains("ls-toast--held"), false);
  mock.timers.tick(TOAST_MS);
  assert.equal(ended, 1);
}));

test("toastTimer holds while focus is inside, and only lets go when focus leaves the toast", withClock(() => {
  const toast = new FakeNode();
  const undo = new FakeNode();
  toast.inside.push(undo);
  let ended = 0;
  toastTimer(toast, () => ended++);
  toast.dispatchEvent(toastFocus("focusin"));
  toast.dispatchEvent(toastFocus("focusout", undo));
  mock.timers.tick(TOAST_MS * 2);
  assert.equal(ended, 0);
  toast.dispatchEvent(toastFocus("focusout", null));
  mock.timers.tick(TOAST_MS);
  assert.equal(ended, 1);
}));

test("toastTimer's stop function cancels it, so a replaced toast never ends the new one", withClock(() => {
  const toast = new FakeNode();
  let ended = 0;
  const stop = toastTimer(toast, () => ended++);
  stop();
  toast.dispatchEvent(toastPointer("pointerleave"));
  mock.timers.tick(TOAST_MS * 2);
  assert.equal(ended, 0);
}));

test("TOAST_MS is the motion-toast token", () => {
  const tokens = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
  assert.equal(`${TOAST_MS}ms`, tokens.motion.tokens.find((t) => t.name === "motion-toast").value);
});

test("staggerIn marks the list, then unmarks it once every row has landed, so a re-sort never replays it", async () => {
  const list = new FakeNode();
  const rows = [fakeAnimation(), fakeAnimation()];
  list.getAnimations = () => rows;
  const done = staggerIn(list);
  assert.equal(list.classList.contains("ls-stagger"), true);
  rows[0].end();
  assert.equal(await settled(done), false);
  rows[1].end();
  assert.equal(await settled(done), true);
  assert.equal(list.classList.contains("ls-stagger"), false);
});

// A view transition that runs its update at once and records what was named before and after it.
const fakeTransitions = (origin, dialog) => {
  const runs = [];
  globalThis.ViewTransition = class { get types() { return null; } };
  document.startViewTransition = ({ update, types }) => {
    const run = { types, namedBefore: { origin: origin.style.viewTransitionName, dialog: dialog.style.viewTransitionName }, skipped: false };
    let finish;
    run.finished = new Promise((resolve) => (finish = resolve));
    run.updateCallbackDone = Promise.resolve().then(update).then(() => {
      run.namedAfter = { origin: origin.style.viewTransitionName, dialog: dialog.style.viewTransitionName };
    });
    run.skipTransition = () => { run.skipped = true; finish(); };
    run.end = finish;
    runs.push(run);
    return run;
  };
  return runs;
};
const onScreenRow = () => new FakeNode({ left: 16, top: 200, width: 360, height: 56 });

test("openFrom names the row, then the dialog, so the dialog grows out of the row", async () => {
  const row = onScreenRow();
  const dialog = new FakeNode();
  const runs = fakeTransitions(row, dialog);
  let opened = false;
  await openFrom(row, () => { opened = true; }, () => dialog);
  assert.equal(opened, true);
  assert.deepEqual(runs[0].types, ["ls-origin"]);
  assert.deepEqual(runs[0].namedBefore, { origin: "ls-origin", dialog: "" });
  assert.deepEqual(runs[0].namedAfter, { origin: "", dialog: "ls-origin" });
  runs[0].end();
  await settled(runs[0].finished);
  assert.equal(dialog.style.viewTransitionName, "");
});

test("closeTo names the dialog, then the row it came from, and shrinks back over the ls-origin-back type", async () => {
  const row = onScreenRow();
  const dialog = new FakeNode();
  const runs = fakeTransitions(row, dialog);
  await closeTo(row, () => {}, () => dialog);
  assert.deepEqual(runs[0].types, ["ls-origin-back"]);
  assert.deepEqual(runs[0].namedBefore, { origin: "", dialog: "ls-origin" });
  assert.deepEqual(runs[0].namedAfter, { origin: "ls-origin", dialog: "" });
  runs[0].end();
  await settled(runs[0].finished);
  assert.equal(row.style.viewTransitionName, "");
});

test("openFrom and closeTo just open and close when the row is off screen or gone, or the browser has no transition types", async () => {
  const dialog = new FakeNode();
  const offScreen = new FakeNode({ top: VIEWPORT.height + 10 });
  const gone = onScreenRow();
  gone.isConnected = false;
  const runs = fakeTransitions(offScreen, dialog);
  let changes = 0;
  await openFrom(offScreen, () => changes++, () => dialog);
  await closeTo(gone, () => changes++, () => dialog);
  delete globalThis.ViewTransition;
  await openFrom(onScreenRow(), () => changes++, () => dialog);
  assert.equal(changes, 3);
  assert.equal(runs.length, 0);
});

test("closing while the dialog is still growing skips to the end of the growth, so every transition can be interrupted", async () => {
  const row = onScreenRow();
  const dialog = new FakeNode();
  const runs = fakeTransitions(row, dialog);
  await openFrom(row, () => {}, () => dialog);
  await closeTo(row, () => {}, () => dialog);
  assert.equal(runs[0].skipped, true);
  await settled(runs[0].finished);
  // The skipped growth must not clear the name the shrink is using.
  assert.equal(row.style.viewTransitionName, "ls-origin");
});

// ---------- #109: haptics, theme crossfade, tooltip timing, busy to done ----------

test("vibrateTick buzzes for TICK_VIBRATION_MS", () => {
  const buzzes = [];
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { vibrate: (ms) => (buzzes.push(ms), true) } });
  globalThis.matchMedia = () => ({ matches: false });
  assert.equal(vibrateTick(), true);
  assert.deepEqual(buzzes, [TICK_VIBRATION_MS]);
  assert.equal(TICK_VIBRATION_MS, 10);
});

test("vibrateTick stays still under reduced motion and where the device can't vibrate", () => {
  const buzzes = [];
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { vibrate: (ms) => (buzzes.push(ms), true) } });
  globalThis.matchMedia = (query) => ({ matches: query.includes("reduce") });
  assert.equal(vibrateTick(), false);
  globalThis.matchMedia = () => ({ matches: false });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: {} });
  assert.equal(vibrateTick(), false);
  assert.deepEqual(buzzes, []);
});

test("switchTheme crossfades with the ls-theme type where view transition types exist", async () => {
  const runs = [];
  globalThis.ViewTransition = class { get types() { return null; } };
  document.startViewTransition = ({ update, types }) => {
    runs.push(types);
    const done = Promise.resolve().then(update);
    return { updateCallbackDone: done, ready: Promise.reject(new Error("skipped")), finished: done };
  };
  let applied = 0;
  await switchTheme(() => applied++);
  assert.deepEqual(runs, [["ls-theme"]]);
  assert.equal(applied, 1);
});

test("switchTheme just applies the theme without view transition types", async () => {
  delete globalThis.ViewTransition;
  let applied = 0;
  await switchTheme(() => applied++);
  assert.equal(applied, 1);
});

test("tooltipTiming waits motion-wait before the first tooltip", withClock(() => {
  const timing = tooltipTiming();
  const shown = [];
  timing.enter(() => shown.push("edit"));
  mock.timers.tick(MOTION_WAIT_MS - 1);
  assert.deepEqual(shown, []);
  mock.timers.tick(1);
  assert.deepEqual(shown, ["edit"]);
}));

test("tooltipTiming shows nothing for a pointer sweeping across a toolbar", withClock(() => {
  const timing = tooltipTiming();
  const shown = [];
  for (const name of ["edit", "copy", "share"]) {
    timing.enter(() => shown.push(name));
    mock.timers.tick(100);
    timing.leave(() => {});
  }
  mock.timers.tick(MOTION_WAIT_MS * 2);
  assert.deepEqual(shown, []);
}));

test("tooltipTiming shows the next tooltip at once while one is showing or has just closed", withClock(() => {
  const timing = tooltipTiming();
  const shown = [];
  timing.enter(() => shown.push("share"));
  mock.timers.tick(MOTION_WAIT_MS);
  timing.leave(() => {});
  mock.timers.tick(MOTION_WAIT_MS - 1);
  timing.enter(() => shown.push("archive"));
  assert.deepEqual(shown, ["share", "archive"]);
}));

test("tooltipTiming waits again once a tooltip has been closed for motion-wait", withClock(() => {
  const timing = tooltipTiming();
  const shown = [];
  timing.enter(() => shown.push("share"));
  mock.timers.tick(MOTION_WAIT_MS);
  timing.leave(() => {});
  mock.timers.tick(MOTION_WAIT_MS);
  timing.enter(() => shown.push("archive"));
  assert.deepEqual(shown, ["share"]);
}));

test("tooltipTiming shows at once for keyboard focus", withClock(() => {
  const timing = tooltipTiming();
  const shown = [];
  timing.focus(() => shown.push("edit"));
  assert.deepEqual(shown, ["edit"]);
}));

test("MOTION_FLASH_MS is the motion-flash token, for how long a button says it's done", () => {
  const tokens = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
  assert.equal(`${MOTION_FLASH_MS}ms`, tokens.motion.tokens.find((t) => t.name === "motion-flash").value);
});

// ---------- #115: each place remembers where you were ----------

test("placeMemory sends you back to the page and scroll you left a place at", () => {
  const places = placeMemory();
  places.leave("money", "/money/bills/42", 640);
  assert.deepEqual(places.target("money", "/money"), { href: "/money/bills/42", scrollY: 640 });
});

test("placeMemory opens a place you haven't visited at its root and its top", () => {
  assert.deepEqual(placeMemory().target("shopping", "/shopping"), { href: "/shopping", scrollY: 0 });
});

test("placeMemory keeps each place apart", () => {
  const places = placeMemory();
  places.leave("money", "/money/bills/42", 640);
  places.leave("shopping", "/shopping?list=2", 120);
  assert.equal(places.target("money", "/money").href, "/money/bills/42");
  assert.equal(places.target("shopping", "/shopping").href, "/shopping?list=2");
});

test("placeMemory: tapping the current place scrolls to the top, and a second tap at the top goes to its root", () => {
  const places = placeMemory();
  assert.equal(places.reselect("/money/bills/42", "/money", 300), "top");
  assert.equal(places.reselect("/money/bills/42", "/money", 0), "root");
  assert.equal(places.reselect("/money", "/money", 0), "none");
});

test("placeMemory forgets a place when asked, as after signing out", () => {
  const places = placeMemory();
  places.leave("money", "/money/bills/42", 640);
  places.forget();
  assert.equal(places.target("money", "/money").href, "/money");
});

// ---------- #146: the installed app's launch handing over to the first page ----------

const PAINTED = [{ name: "first-paint" }];
// A launch layer: a class list, an entrance made of the given animations, and remove().
const launchLayer = ({ entrance = [], display = "grid" } = {}) => {
  const launch = new FakeNode();
  launch.display = display;
  launch.getAnimations = () => entrance;
  launch.remove = () => { launch.isConnected = false; };
  return launch;
};
const painted = (t, entries = PAINTED) => t.mock.method(performance, "getEntriesByType", (type) => (type === "paint" ? entries : []));
const launchTransitions = () => {
  const runs = [];
  globalThis.ViewTransition = class { get types() { return null; } };
  document.startViewTransition = ({ update, types }) => {
    const done = Promise.resolve().then(update);
    runs.push({ types });
    return { updateCallbackDone: done, ready: done, finished: done };
  };
  return runs;
};

test("endLaunch waits for the mark's entrance, then fades through to the page with the ls-launch type", async (t) => {
  painted(t);
  const runs = launchTransitions();
  const leaf = fakeAnimation();
  const launch = launchLayer({ entrance: [leaf] });
  const ended = endLaunch(launch);
  assert.equal(await settled(ended), false);
  assert.equal(runs.length, 0);
  leaf.end();
  assert.equal(await ended, true);
  assert.deepEqual(runs, [{ types: ["ls-launch"] }]);
  assert.equal(launch.isConnected, false);
});

test("endLaunch fades the layer out where the browser has no view transition types, and removes it after", async (t) => {
  painted(t);
  delete globalThis.ViewTransition;
  const fade = fakeAnimation();
  const launch = launchLayer();
  // The fade starts once ls-launch--leaving is on.
  launch.getAnimations = () => (launch.classList.contains("ls-launch--leaving") ? [fade] : []);
  const ended = endLaunch(launch);
  assert.equal(await settled(ended), false);
  assert.equal(launch.classList.contains("ls-launch--leaving"), true);
  assert.equal(launch.isConnected, true);
  fade.end();
  assert.equal(await ended, true);
  assert.equal(launch.isConnected, false);
});

test("endLaunch removes a launch that never reached the screen at once, with no fade", async (t) => {
  painted(t, []);
  const runs = launchTransitions();
  const pending = { ...fakeAnimation(), currentTime: 0 };
  const beforePaint = launchLayer({ entrance: [pending] });
  assert.equal(await endLaunch(beforePaint), false);
  const inABrowserTab = launchLayer({ display: "none" });
  assert.equal(await endLaunch(inABrowserTab), false);
  assert.equal(beforePaint.isConnected, false);
  assert.equal(inABrowserTab.isConnected, false);
  assert.equal(runs.length, 0);
});

test("endLaunch counts a running entrance as shown where the browser has no paint timing", async (t) => {
  painted(t, []);
  const runs = launchTransitions();
  const leaf = { ...fakeAnimation(), currentTime: 40 };
  const launch = launchLayer({ entrance: [leaf] });
  const ended = endLaunch(launch);
  leaf.end();
  await ended;
  assert.deepEqual(runs, [{ types: ["ls-launch"] }]);
});

test("endLaunch hands over once when called twice, and does nothing without a launch", async (t) => {
  painted(t);
  const runs = launchTransitions();
  const launch = launchLayer();
  const first = endLaunch(launch);
  assert.equal(endLaunch(launch), first);
  await first;
  await endLaunch(null);
  await endLaunch(launch);
  assert.equal(runs.length, 1);
});

test("motion-launch is 560ms, chosen in review, and stops under reduced motion like every movement (#146)", () => {
  const tokens = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
  const launch = tokens.motion.tokens.find((t) => t.name === "motion-launch");
  assert.equal(launch.value, "560ms");
  assert.equal(launch.reducedMotion, "0ms");
});

test("motion-fade has no reduced-motion value, so the launch fades rather than cuts under reduced motion", () => {
  const tokens = JSON.parse(readFileSync(new URL("./tokens.json", import.meta.url), "utf8"));
  const fade = tokens.motion.tokens.find((t) => t.name === "motion-fade");
  assert.equal(fade.value, "150ms");
  assert.equal(fade.reducedMotion, undefined);
});
