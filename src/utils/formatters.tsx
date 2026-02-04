// src/utils/formatters.ts

/**
 * Format a number with currency symbol and locale.
 *
 * @param value - number to format
 * @param locale - language/region code (default: "en-US")
 * @param currency - ISO currency code (e.g., "USD", "BDT")
 * @returns formatted string like "$2,000.00" or "৳2,000.00"
 */
export const formatCurrency = (
  value: number | null | undefined,
  locale: string = "en-US",
  currency: string = "USD"
): string => {
  if (value === null || value === undefined) return "0.00";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
