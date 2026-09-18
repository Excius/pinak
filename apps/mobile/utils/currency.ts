const inrFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatRupeesFromPaise(amountInPaise: number): string {
  return `₹${inrFormatter.format(amountInPaise / 100)}`;
}