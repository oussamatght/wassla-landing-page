/**
 * Prices are whole dinars in the backend (rounded with Math.round). Formatting: "12 500 DA" with the French narrow
 * no-break space as thousands separator, tabular numerals applied in CSS.
 */
const priceFormatter = new Intl.NumberFormat("fr-DZ", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const NARROW_NBSP = " ";

export function formatPriceDA(amount: number): string {
  if (!Number.isFinite(amount)) return "—";
  // Normalise every group separator the ICU build may emit (NBSP, NNBSP,
  // regular space, dot) to a narrow no-break space for consistent rendering.
  const digits = priceFormatter.format(Math.round(amount)).replace(/[\s  .]/g, NARROW_NBSP);
  return `${digits}${NARROW_NBSP}DA`;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateFr(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

/** "+213551234567" → "0551 23 45 67" (display only). */
export function formatPhoneDisplay(e164: string): string {
  const local = e164.startsWith("+213") ? "0" + e164.slice(4) : e164;
  return local.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
}
