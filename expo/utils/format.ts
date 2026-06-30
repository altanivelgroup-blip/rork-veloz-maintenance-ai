/**
 * Centralized formatting utilities for the Veloz Fleet app.
 * All number, date, currency, and unit formatting flows through here
 * so detail screens, cards, and tabs never inline their own formatters.
 */

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/** "12,345"  — integer with groups. */
export function formatInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** "12,345.7" — float with one decimal and groups. */
export function formatDecimal(n: number, digits = 1): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// ---------------------------------------------------------------------------
// Mileage / distance
// ---------------------------------------------------------------------------

/** "12,345 mi" */
export function formatMiles(n: number): string {
  return `${formatInt(n)} mi`;
}

/** "1,500 mi" — compact for sparkline labels. */
export function formatMilesCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M mi`;
  if (n >= 1_000) return `${formatInt(n)} mi`;
  return `${n} mi`;
}

/** "Due in 5,000 mi" / "Overdue 300 mi" — service-interval phrase. */
export function formatServiceDue(remaining: number): string {
  if (remaining < 0) return `Overdue ${formatInt(Math.abs(remaining))} mi`;
  return `Due in ${formatInt(remaining)} mi`;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

/** "$1,234.56" */
export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

/** "$1,235" — whole-dollar compact. */
export function formatCurrencyCompact(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ---------------------------------------------------------------------------
// Weight
// ---------------------------------------------------------------------------

/** "12,000 lb" */
export function formatWeight(n: number): string {
  return `${formatInt(n)} lb`;
}

/** "12.0k lb" — kilos-style compact. */
export function formatWeightCompact(n: number): string {
  return `${(n / 1000).toFixed(1)}k lb`;
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const SHORT_OPTS: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
const SHORT_TIME_OPTS: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };

/** "Jun 30" */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", SHORT_OPTS);
}

/** "Jun 30, 2:45 PM" */
export function formatDateShortTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", SHORT_TIME_OPTS);
}

/** "2026-06-30" — ISO date for keys & comparisons. */
export function formatDateISO(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Volts
// ---------------------------------------------------------------------------

/** "12.6 V" */
export function formatVolts(n: number): string {
  return `${n.toFixed(1)} V`;
}

// ---------------------------------------------------------------------------
// Percent
// ---------------------------------------------------------------------------

/** "72%" */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

// ---------------------------------------------------------------------------
// Time / hours
// ---------------------------------------------------------------------------

/** "3.2 hrs" — fractional hours. */
export function formatHours(n: number): string {
  return `${n.toFixed(1)} hrs`;
}

// ---------------------------------------------------------------------------
// Composite helpers used across the asset detail screens
// ---------------------------------------------------------------------------

/** "12,345 mi · 6.2 MPG" */
export function formatMileageMpg(miles: number, mpg: number): string {
  return `${formatMiles(miles)} · ${formatDecimal(mpg)} MPG`;
}

/** "WO: ABC-123 — Dec 15, 2024 · 45,000 mi · $2,350.00" */
export function formatRepairMeta(completionDate: string, odometerAtService: number | undefined, totalCost: number): string {
  const parts: string[] = [completionDate];
  if (odometerAtService != null) parts.push(`${formatInt(odometerAtService)} mi`);
  parts.push(formatCurrency(totalCost));
  return parts.join(" · ");
}
