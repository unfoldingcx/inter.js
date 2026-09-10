/**
 * Date formatting for Inter's two wire formats.
 *
 * Inter expects `YYYY-MM-DD` wherever a parameter is documented as `date`, and
 * ISO 8601 with an offset wherever it is documented as `date-time`. Every
 * resource method accepts `string | Date` and normalises through these helpers,
 * so a `Date` never reaches the wire in the wrong shape.
 *
 * Brazilian banking days follow `America/Sao_Paulo`. A `Date` is a UTC instant,
 * so `2026-01-01T02:00:00Z` is still 31 December in São Paulo. Pass a string
 * when the calendar day matters more than the instant.
 */

/** A value accepted anywhere the SDK wants a date. */
export type DateInput = string | Date;

/**
 * Formats a value as `YYYY-MM-DD`.
 *
 * Strings already in that shape pass through untouched; other strings are parsed
 * first. `Date` values are formatted in UTC.
 *
 * @example formatDate(new Date("2026-03-15T12:00:00Z")) // => "2026-03-15"
 */
export function formatDate(value: DateInput): string {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new TypeError(`invalid date: "${value}"`);
    return formatDate(parsed);
  }
  if (Number.isNaN(value.getTime())) throw new TypeError("invalid Date");
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a value as an ISO 8601 timestamp, e.g. `2026-03-15T12:00:00.000Z`.
 *
 * A `YYYY-MM-DD` string becomes midnight UTC on that day. Other strings are
 * parsed and re-emitted so the format is always one Inter accepts.
 */
export function formatDateTime(value: DateInput): string {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00.000Z`;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new TypeError(`invalid date-time: "${value}"`);
    return parsed.toISOString();
  }
  if (Number.isNaN(value.getTime())) throw new TypeError("invalid Date");
  return value.toISOString();
}

/** Formats a value only when it is present. */
export function formatDateOptional(value: DateInput | undefined): string | undefined {
  return value === undefined ? undefined : formatDate(value);
}

/** Formats a value only when it is present. */
export function formatDateTimeOptional(value: DateInput | undefined): string | undefined {
  return value === undefined ? undefined : formatDateTime(value);
}

/** Adds whole days to a date, returning a new `Date`. */
export function addDays(value: DateInput, days: number): Date {
  const base = typeof value === "string" ? new Date(formatDateTime(value)) : new Date(value.getTime());
  base.setUTCDate(base.getUTCDate() + days);
  return base;
}
