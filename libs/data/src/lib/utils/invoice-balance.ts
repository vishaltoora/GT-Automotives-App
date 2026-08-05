/**
 * How much is still owing on an invoice.
 *
 * Shared by the server (outstanding-balance queries, printed invoice) and the
 * browser (invoice list, invoice detail) so a balance shown on screen can never
 * disagree with the one the backend reports or prints.
 */

/**
 * Round to whole cents.
 *
 * `total` and `amountPaid` are Decimal(10,2) in the database but cross the wire
 * as JS numbers, so 105.10 - 80.00 lands on 25.099999999999994 and would print
 * a cent light without this.
 */
export function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Amount still owing, exact to the cent. Never negative: an overpaid invoice
 * reads as $0.00 owing rather than a credit, so it cannot subsidise another
 * invoice's balance when these are summed.
 */
export function getInvoiceBalanceDue(
  invoice?: {
    total?: unknown;
    amountPaid?: unknown;
  } | null
): number {
  const total = Number(invoice?.total) || 0;
  const paid = Number(invoice?.amountPaid ?? 0) || 0;
  return Math.max(0, roundToCents(total - paid));
}

/** Amount recorded against the invoice so far, exact to the cent. */
export function getInvoiceAmountPaid(
  invoice?: {
    amountPaid?: unknown;
  } | null
): number {
  return roundToCents(Number(invoice?.amountPaid ?? 0) || 0);
}

/**
 * True when money has been taken but the invoice is not settled.
 *
 * Deliberately derived from the amounts rather than `status`, so the displays
 * stay correct even if a status has not caught up with the ledger.
 */
export function isInvoicePartiallyPaid(
  invoice?: {
    total?: unknown;
    amountPaid?: unknown;
  } | null
): boolean {
  return (
    getInvoiceAmountPaid(invoice) > 0.005 &&
    getInvoiceBalanceDue(invoice) > 0.005
  );
}
