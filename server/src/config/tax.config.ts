/**
 * Tax Configuration for GT Automotives
 * BC Province Tax Rates: GST 5% + PST 7% = 12% Total
 */

export const TAX_CONFIG = {
  /**
   * Federal Goods and Services Tax (GST)
   * Applied across all of Canada
   */
  GST_RATE: 0.05, // 5%

  /**
   * Provincial Sales Tax (PST) for British Columbia
   * BC-specific provincial tax
   */
  PST_RATE: 0.07, // 7%

  /**
   * Combined total tax rate
   * GST + PST = 5% + 7% = 12%
   */
  TOTAL_RATE: 0.12, // 12%
} as const;

/**
 * Calculate tax amounts from a base amount
 * @param baseAmount - Amount before taxes
 * @returns Object containing GST, PST, and total amounts
 */
export function calculateTaxes(baseAmount: number): {
  subtotal: number;
  gstAmount: number;
  pstAmount: number;
  totalAmount: number;
  gstRate: number;
  pstRate: number;
} {
  const gstAmount = baseAmount * TAX_CONFIG.GST_RATE;
  const pstAmount = baseAmount * TAX_CONFIG.PST_RATE;
  const totalAmount = baseAmount + gstAmount + pstAmount;

  return {
    subtotal: baseAmount,
    gstAmount: Number(gstAmount.toFixed(2)),
    pstAmount: Number(pstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    gstRate: TAX_CONFIG.GST_RATE,
    pstRate: TAX_CONFIG.PST_RATE,
  };
}

/**
 * Calculate base amount from total (reverse calculation)
 * @param totalAmount - Total amount including taxes
 * @returns Base amount before taxes
 */
export function calculateBaseFromTotal(totalAmount: number): number {
  const baseAmount = totalAmount / (1 + TAX_CONFIG.TOTAL_RATE);
  return Number(baseAmount.toFixed(2));
}

/**
 * Format tax breakdown for display
 * @param baseAmount - Amount before taxes
 * @returns Formatted string showing tax breakdown
 */
export function formatTaxBreakdown(baseAmount: number): string {
  const taxes = calculateTaxes(baseAmount);
  return `
Subtotal: $${taxes.subtotal.toFixed(2)}
GST (5%): $${taxes.gstAmount.toFixed(2)}
PST (7%): $${taxes.pstAmount.toFixed(2)}
Total: $${taxes.totalAmount.toFixed(2)}
  `.trim();
}
