/**
 * Currency formatting utilities for the Pinak web app.
 *
 * All monetary values returned by the backend API are in **paise** (the
 * smallest Indian currency unit, 1/100 of a Rupee).  These helpers convert
 * paise integers to human-readable ₹ strings.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Format an amount in paise to a display string in Indian Rupees.
 *
 * @example
 * formatPaise(50000)  // "₹500.00"
 * formatPaise(99)     // "₹0.99"
 * formatPaise(0)      // "₹0.00"
 */
export function formatPaise(amountInPaise: number): string {
  const rupees = amountInPaise / 100
  return `₹${inrFormatter.format(rupees)}`
}
