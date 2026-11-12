// Tests for motion.js against a small DOM shim: Node has no layout, so each fake element reports the rect it is given.
import { test, beforeEach } from "node:test";
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
