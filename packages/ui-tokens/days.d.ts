// Types for days.js, the Lilac & Sage day helpers (components.md, Dates and times and Date picker).

/** A plain calendar day, "YYYY-MM-DD". */
export type Day = string;
/** A month, "YYYY-MM". */
export type Month = string;

/** The earliest and latest day that can be picked; either may be left out. */
export interface DayRange {
  min?: Day;
  max?: Day;
}

/** What a key on the calendar's focused day does. */
export type CalendarAction = { type: "move"; day: Day } | { type: "pick"; day: Day } | { type: "close" };

/** The day n days on (or back, when n is negative). */
export declare function addDays(day: Day, n: number): Day;

/** The same day n months on, kept inside the month: 31 Jan plus one month is 28 Feb. */
export declare function addMonths(day: Day, n: number): Day;

/** "8 Nov", "8 Nov 2025" outside today's year, or "Mon 9 Nov" with the weekday. */
export declare function formatDay(day: Day, today: Day, options?: { weekday?: boolean }): string;

/** "today", "tomorrow", "in 3 days", "yesterday", "4 days ago". */
export declare function formatDaysAway(day: Day, today: Day): string;

/** "Tuesday, 1 December 2026", what a screen reader reads for a day. */
export declare function dayLabel(day: Day): string;

/** "December 2026", the calendar's heading. */
export declare function monthLabel(month: Month): string;

/** A month's weeks, Monday first; null pads the first and last week. */
export declare function monthGrid(month: Month): (Day | null)[][];

/** Where a key moves the focused day, or null for keys that don't move it. */
export declare function moveFocus(day: Day, key: string, shiftKey?: boolean): Day | null;

/** Whether a day is outside the min or max, so it can't be picked. */
export declare function isOutside(day: Day, range?: DayRange): boolean;

/** What a key on the calendar's focused day does, or null for keys the calendar leaves alone. Call preventDefault() when it isn't null. */
export declare function calendarKey(event: { key: string; shiftKey?: boolean }, day: Day, range?: DayRange): CalendarAction | null;

/** A typed date (day first, as in the UK, with or without the field's weekday) as "YYYY-MM-DD", or null when it isn't one. */
export declare function parseDay(text: string, today: Day): Day | null;
