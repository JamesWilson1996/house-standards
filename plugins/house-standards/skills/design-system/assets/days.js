// Lilac & Sage day helpers: the Date picker's maths, parsing, labels and keys (components.md, Dates and times and Date picker).
// Plain dates are "YYYY-MM-DD" throughout, as the API sends them. The maths runs on UTC midnights so no time zone can shift a day,
// and "today" is always passed in: the app reads the household's day from its own API, so nothing here reads the browser clock.

const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;
const MS_PER_DAY = 86_400_000;
const LOCALE = "en-GB";
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTH_ABBREVIATION_LENGTH = 3;
const TWO_DIGIT_YEAR_BASE = 2000;
// 29 February can be up to 8 years away (2096 to 2104 skips 2100).
const LEAP_YEAR_SEARCH = 8;
/** Which way parseDay resolves a day typed without a year: a due date looks ahead, the date of something done looks back. */
export const TOWARDS_FUTURE = "future";
export const TOWARDS_PAST = "past";
// The weekday formatDay puts in front ("Tue 1 Dec", "Fri, 1 Jan 2027"), read back so a filled field still parses.
// Commas are gone by the time it runs. The weekday itself is ignored: the date wins, and the field then shows the right one.
const LEADING_WEEKDAY = /^(?:mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:r(?:s(?:day)?)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\.?\s+/;

const toDate = (day) => new Date(`${day}T00:00:00Z`);
const toDay = (date) => date.toISOString().slice(0, 10);
const pad = (n) => String(n).padStart(2, "0");
// month is 1-12.
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
// Monday is 0, as weeks start on Monday in en-GB.
const weekdayIndex = (day) => (toDate(day).getUTCDay() + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
const isRealDay = (y, m, d) => m >= 1 && m <= MONTHS_PER_YEAR && d >= 1 && d <= daysInMonth(y, m);
const fullYear = (y) => (y.length === 2 ? TWO_DIGIT_YEAR_BASE + Number(y) : Number(y));
const daysBetween = (from, to) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / MS_PER_DAY);
const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/** The day n days on (or back, when n is negative). */
export const addDays = (day, n) => toDay(new Date(toDate(day).getTime() + n * MS_PER_DAY));

/** The same day n months on, kept inside the month: 31 Jan plus one month is 28 Feb (29 in a leap year). */
export function addMonths(day, n) {
  const [y, m, d] = day.split("-").map(Number);
  const index = y * MONTHS_PER_YEAR + (m - 1) + n;
  const year = Math.floor(index / MONTHS_PER_YEAR);
  const month = (index % MONTHS_PER_YEAR) + 1;
  return `${year}-${pad(month)}-${pad(Math.min(d, daysInMonth(year, month)))}`;
}

/** "8 Nov", "8 Nov 2025" outside today's year, or "Mon 9 Nov" with the weekday. */
export function formatDay(day, today, { weekday = false } = {}) {
  const sameYear = day.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    ...(weekday ? { weekday: "short" } : {}),
  }).format(toDate(day));
}

/** "today", "tomorrow", "in 3 days", "yesterday", "4 days ago". */
export const formatDaysAway = (day, today) => relative.format(daysBetween(today, day), "day");

/** "Tuesday, 1 December 2026", what a screen reader reads for a day. */
export const dayLabel = (day) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(toDate(day));

/** "December 2026", the calendar's heading. month is "YYYY-MM". */
export const monthLabel = (month) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", month: "long", year: "numeric" }).format(toDate(`${month}-01`));

/** A month's weeks, Monday first; null pads the first and last week. month is "YYYY-MM". */
export function monthGrid(month) {
  const [y, m] = month.split("-").map(Number);
  const cells = Array(weekdayIndex(`${month}-01`)).fill(null);
  for (let d = 1; d <= daysInMonth(y, m); d++) cells.push(`${month}-${pad(d)}`);
  while (cells.length % DAYS_PER_WEEK) cells.push(null);
  return Array.from({ length: cells.length / DAYS_PER_WEEK }, (_, w) => cells.slice(w * DAYS_PER_WEEK, (w + 1) * DAYS_PER_WEEK));
}

/** Where a key moves the focused day, or null for keys that don't move it. */
export function moveFocus(day, key, shiftKey = false) {
  switch (key) {
    case "ArrowLeft": return addDays(day, -1);
    case "ArrowRight": return addDays(day, 1);
    case "ArrowUp": return addDays(day, -DAYS_PER_WEEK);
    case "ArrowDown": return addDays(day, DAYS_PER_WEEK);
    case "Home": return addDays(day, -weekdayIndex(day));
    case "End": return addDays(day, DAYS_PER_WEEK - 1 - weekdayIndex(day));
    case "PageUp": return addMonths(day, shiftKey ? -MONTHS_PER_YEAR : -1);
    case "PageDown": return addMonths(day, shiftKey ? MONTHS_PER_YEAR : 1);
    default: return null;
  }
}

/** Whether a day is outside the min or max (either may be left out), so it can't be picked. */
export const isOutside = (day, { min, max } = {}) => (min !== undefined && day < min) || (max !== undefined && day > max);

/**
 * What a key on the calendar's focused day does (the WAI-ARIA date picker dialog pattern), or null for keys the calendar leaves alone.
 * - { type: "move", day }: move tabindex="0" and focus to that day, showing its month if it's another one.
 * - { type: "pick", day }: Enter or Space; fill the field, close the calendar and return focus to the calendar button.
 * - { type: "close" }: Escape; close the calendar only (stop the event, so a dialog round the field stays open) and return focus.
 * Enter and Space on a day outside the min or max return null. Call preventDefault() whenever the result isn't null.
 */
export function calendarKey(event, day, range = {}) {
  const { key, shiftKey = false } = event;
  if (key === "Escape") return { type: "close" };
  if (key === "Enter" || key === " ") return isOutside(day, range) ? null : { type: "pick", day };
  const next = moveFocus(day, key, shiftKey);
  return next ? { type: "move", day: next } : null;
}

/**
 * A typed date as "YYYY-MM-DD", or null when it isn't one. Day first, as in the UK:
 * "today", "tomorrow", "2026-12-01", "1/12/2026", "1/12/26", "1/12", "1 Dec", "1 December 2026",
 * and the field's own "Tue 1 Dec" and "Fri, 1 Jan 2027", whose weekday is ignored.
 * Without a year it is the next such day on or after today, so "1 Jan" typed in November is next January. With
 * { towards: "past" }, for the date of something already done, it is the latest such day on or before today instead.
 */
export function parseDay(text, today, { towards = TOWARDS_FUTURE } = {}) {
  const t = text.trim().toLowerCase().replace(/,/g, "").replace(LEADING_WEEKDAY, "");
  if (t === "today") return today;
  if (t === "tomorrow") return addDays(today, 1);
  if (t === "yesterday") return addDays(today, -1);
  let y, m, d;
  let match = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  else if ((match = t.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/))) [d, m, y] = [Number(match[1]), Number(match[2]), match[3] ? fullYear(match[3]) : undefined];
  else if ((match = t.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)(?:\s+(\d{4}))?$/))) {
    // "Dec", "Decem" and "December" all count; "Decx" doesn't.
    const word = match[2];
    const month = word.length < MONTH_ABBREVIATION_LENGTH ? 0 : MONTHS.findIndex((name) => name.startsWith(word)) + 1;
    if (!month) return null;
    [d, m, y] = [Number(match[1]), month, match[3] ? Number(match[3]) : undefined];
  } else return null;
  if (y === undefined) {
    // The nearest year, from this one onwards (or backwards towards the past), in which that day exists on the right side of today.
    const thisYear = Number(today.slice(0, 4));
    const past = towards === TOWARDS_PAST;
    for (let step = 0; step <= LEAP_YEAR_SEARCH; step++) {
      const year = past ? thisYear - step : thisYear + step;
      const day = `${year}-${pad(m)}-${pad(d)}`;
      if (isRealDay(year, m, d) && (past ? day <= today : day >= today)) return day;
    }
    return null;
  }
  return isRealDay(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : null;
}
