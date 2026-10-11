/**
 * Date and time formatting for the whole app.
 *
 * Requirement: every date is displayed as dd/mm/yyyy (Australian format).
 *
 * `toLocaleDateString()` is deliberately avoided. Called without an explicit
 * locale it follows the operating system's region, which is exactly what
 * produced mm/dd/yyyy on a US-configured machine.
 *
 * Stored values have two different meanings, and they need different getters:
 *
 *  - Exhibition start/end are **date-only** values. `backend/seed/data.ts`
 *    anchors them to UTC midnight, so the UTC getters in `formatDate` read back
 *    exactly the intended day in every timezone. Local getters would show the
 *    previous day for any viewer west of UTC.
 *  - Event start/end are **real instants**, where the wall-clock time is the
 *    point, so they are rendered with local getters.
 */

const pad = (value) => String(value).padStart(2, "0");

const toDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** dd/mm/yyyy for a date-only value, e.g. an exhibition period. */
export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`;
}

/** dd/mm/yyyy for a real instant, in the viewer's own timezone. */
export function formatDateLocal(value) {
  const date = toDate(value);
  if (!date) return "";
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** HH:MM in 24-hour time for a real instant, in the viewer's own timezone. */
export function formatTime(value) {
  const date = toDate(value);
  if (!date) return "";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * "dd/mm/yyyy – dd/mm/yyyy", collapsing to a single date when the two ends
 * match, so a one-day exhibition does not read as a range.
 */
export function formatDateRange(start, end) {
  const from = formatDate(start);
  const to = formatDate(end);
  if (!from) return to;
  if (!to || from === to) return from;
  return `${from} – ${to}`;
}

/**
 * Events reach the frontend in two shapes: the TypeScript backend returns
 * `startDate`/`endDate` instants, while `backend-fallback/` returns plain
 * `date` ("YYYY-MM-DD") and `time` ("HH:MM") strings. These two helpers read
 * whichever is present.
 */
export function eventDate(event) {
  if (!event) return "";
  if (event.startDate) return formatDateLocal(event.startDate);
  return formatDate(event.date);
}

export function eventTime(event) {
  if (!event) return "";
  if (event.time) return event.time;
  if (event.startDate) return formatTime(event.startDate);
  return "";
}
