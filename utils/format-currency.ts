/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency symbol to use (default: $)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | undefined | null, currency = "$"): string {
  if (value === undefined || value === null) {
    return "--"
  }

  return `${currency}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
