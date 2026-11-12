// Tests for days.js. Pure functions on plain dates, so no DOM and no clock: "today" is always passed in.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  addMonths,
  formatDay,
  formatDaysAway,
  dayLabel,
  monthLabel,
  monthGrid,
  moveFocus,
  isOutside,
  calendarKey,
  parseDay,
} from "./days.js";

const TODAY = "2026-11-08";

test("parseDay reads the typed forms, day first", () => {
  assert.equal(parseDay("today", TODAY), TODAY);
  assert.equal(parseDay("Tomorrow", TODAY), "2026-11-09");
  assert.equal(parseDay("2026-12-01", TODAY), "2026-12-01");
  assert.equal(parseDay("1/12/2026", TODAY), "2026-12-01");
  assert.equal(parseDay("1/12/26", TODAY), "2026-12-01");
  assert.equal(parseDay("1/12", TODAY), "2026-12-01");
  assert.equal(parseDay("1 Dec", TODAY), "2026-12-01");
  assert.equal(parseDay("1st December 2026", TODAY), "2026-12-01");
  assert.equal(parseDay("1 Decem", TODAY), "2026-12-01");
});

test("parseDay without a year takes the next such day on or after today", () => {
  assert.equal(parseDay("8 Nov", TODAY), TODAY);
  assert.equal(parseDay("1 Jan", TODAY), "2027-01-01");
  assert.equal(parseDay("29 Feb", TODAY), "2028-02-29");
});

test("parseDay reads yesterday", () => {
  assert.equal(parseDay("yesterday", TODAY), "2026-11-07");
  assert.equal(parseDay("Yesterday", TODAY, { towards: "past" }), "2026-11-07");
});

test("parseDay towards the past takes the latest such day on or before today (#95)", () => {
  const PAST = { towards: "past" };
  assert.equal(parseDay("20 Oct", "2026-10-26", PAST), "2026-10-20");
  assert.equal(parseDay("8 Nov", TODAY, PAST), TODAY);
  assert.equal(parseDay("1 Dec", TODAY, PAST), "2025-12-01");
  assert.equal(parseDay("1/12", TODAY, PAST), "2025-12-01");
  assert.equal(parseDay("Mon 1 Dec", TODAY, PAST), "2025-12-01");
  assert.equal(parseDay("29 Feb", TODAY, PAST), "2024-02-29");
  // A typed year is kept either way, and the default stays the future.
  assert.equal(parseDay("1 Dec 2026", TODAY, PAST), "2026-12-01");
  assert.equal(parseDay("20 Oct", "2026-10-26"), "2027-10-20");
  assert.equal(parseDay("20 Oct", "2026-10-26", { towards: "future" }), "2027-10-20");
});

test("parseDay refuses what isn't a day", () => {
  assert.equal(parseDay("31/4/2026", TODAY), null);
  assert.equal(parseDay("1 Decx", TODAY), null);
  assert.equal(parseDay("1 De", TODAY), null);
  assert.equal(parseDay("29 Feb 2027", TODAY), null);
  assert.equal(parseDay("", TODAY), null);
  assert.equal(parseDay("Tuesday", TODAY), null);
});

test("parseDay reads the field's own weekday form back (#81)", () => {
  assert.equal(parseDay("Tue 1 Dec", TODAY), "2026-12-01");
  assert.equal(parseDay("Fri, 1 Jan 2027", TODAY), "2027-01-01");
  assert.equal(parseDay("Thursday 3 December", TODAY), "2026-12-03");
  assert.equal(parseDay("thurs. 3/12", TODAY), "2026-12-03");
  // Every value formatDay shows parses back to itself.
  for (const day of ["2026-12-01", "2027-01-01", "2026-11-08", "2028-02-29"]) {
    assert.equal(parseDay(formatDay(day, TODAY, { weekday: true }), TODAY), day);
    assert.equal(parseDay(formatDay(day, TODAY), TODAY), day);
  }
});

test("parseDay ignores a weekday that doesn't match the date", () => {
  // Changing only the number of "Tue 1 Dec" to 3 keeps the date; the field then shows "Thu 3 Dec".
  assert.equal(parseDay("Tue 3 Dec", TODAY), "2026-12-03");
  assert.equal(parseDay("Mon 1 Dec", TODAY), "2026-12-01");
});

test("formatDay and formatDaysAway", () => {
  assert.equal(formatDay("2026-12-01", TODAY), "1 Dec");
  assert.equal(formatDay("2025-11-08", TODAY), "8 Nov 2025");
  assert.equal(formatDay("2026-12-01", TODAY, { weekday: true }), "Tue 1 Dec");
  assert.equal(formatDay("2027-01-01", TODAY, { weekday: true }), "Fri, 1 Jan 2027");
  assert.equal(formatDaysAway(TODAY, TODAY), "today");
  assert.equal(formatDaysAway("2026-11-09", TODAY), "tomorrow");
  assert.equal(formatDaysAway("2026-11-11", TODAY), "in 3 days");
  assert.equal(formatDaysAway("2026-11-04", TODAY), "4 days ago");
});

test("addDays and addMonths cross months and years, and keep inside the month", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  // The clocks change on 29 March and 25 October 2026 in the UK; plain dates don't notice.
  assert.equal(addDays("2026-03-28", 2), "2026-03-30");
  assert.equal(addDays("2026-10-24", 2), "2026-10-26");
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2028-01-31", 1), "2028-02-29");
  assert.equal(addMonths("2026-12-15", 1), "2027-01-15");
  assert.equal(addMonths("2026-01-15", -1), "2025-12-15");
  assert.equal(addMonths("2028-02-29", 12), "2029-02-28");
});

test("monthGrid starts weeks on Monday and pads both ends", () => {
  const december = monthGrid("2026-12");
  assert.equal(december.length, 5);
  assert.deepEqual(december[0], [null, "2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06"]);
  assert.deepEqual(december[4], ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", null, null, null]);
  // February 2027 starts on a Monday and fills exactly four weeks.
  assert.equal(monthGrid("2027-02").length, 4);
  assert.equal(monthGrid("2027-02")[0][0], "2027-02-01");
});

test("labels", () => {
  assert.equal(dayLabel("2026-12-01"), "Tuesday, 1 December 2026");
  assert.equal(monthLabel("2026-12"), "December 2026");
});

test("moveFocus follows the WAI-ARIA date picker keys", () => {
  const day = "2026-12-02"; // a Wednesday
  assert.equal(moveFocus(day, "ArrowLeft"), "2026-12-01");
  assert.equal(moveFocus(day, "ArrowRight"), "2026-12-03");
  assert.equal(moveFocus(day, "ArrowUp"), "2026-11-25");
  assert.equal(moveFocus(day, "ArrowDown"), "2026-12-09");
  assert.equal(moveFocus(day, "Home"), "2026-11-30");
  assert.equal(moveFocus(day, "End"), "2026-12-06");
  assert.equal(moveFocus(day, "PageUp"), "2026-11-02");
  assert.equal(moveFocus(day, "PageDown"), "2027-01-02");
  assert.equal(moveFocus(day, "PageUp", true), "2025-12-02");
  assert.equal(moveFocus(day, "PageDown", true), "2027-12-02");
  assert.equal(moveFocus(day, "a"), null);
});

test("calendarKey moves, picks and closes", () => {
  const day = "2026-12-02";
  assert.deepEqual(calendarKey({ key: "ArrowDown" }, day), { type: "move", day: "2026-12-09" });
  assert.deepEqual(calendarKey({ key: "PageDown", shiftKey: true }, day), { type: "move", day: "2027-12-02" });
  assert.deepEqual(calendarKey({ key: "Enter" }, day), { type: "pick", day });
  assert.deepEqual(calendarKey({ key: " " }, day), { type: "pick", day });
  assert.deepEqual(calendarKey({ key: "Escape" }, day), { type: "close" });
  assert.equal(calendarKey({ key: "Tab" }, day), null);
});

test("calendarKey won't pick outside the min or max, but still moves there", () => {
  const range = { min: "2026-11-08", max: "2026-12-31" };
  assert.equal(isOutside("2026-11-07", range), true);
  assert.equal(isOutside("2026-11-08", range), false);
  assert.equal(isOutside("2027-01-01", { max: "2026-12-31" }), true);
  assert.equal(isOutside("1999-01-01"), false);
  assert.equal(calendarKey({ key: "Enter" }, "2026-11-07", range), null);
  assert.deepEqual(calendarKey({ key: "ArrowLeft" }, "2026-11-08", range), { type: "move", day: "2026-11-07" });
});
