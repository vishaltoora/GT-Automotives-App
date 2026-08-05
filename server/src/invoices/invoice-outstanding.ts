import { InvoiceStatus, Prisma } from '@prisma/client';

/**
 * Single source of truth for "what does a customer still owe on invoices".
 *
 * This used to be computed in three places that disagreed with each other: the
 * customer stats aggregate, the customer stats raw SQL, and the day-summary
 * outstanding report. The first two summed `total` (ignoring anything already
 * paid) and filtered on PENDING/DRAFT (so a part-paid invoice dropped out of the
 * filter entirely and contributed nothing), which meant the same customer could
 * be overstated on one screen and understated on another.
 *
 * The rules, in one place:
 *
 *  - Only PENDING and PARTIALLY_PAID count. A DRAFT invoice has not been issued
 *    to the customer, so it is not money owed; PAID and CANCELLED are settled.
 *  - Owing is `total - amountPaid`, never `total`.
 *  - Consolidated children are excluded — their balance is carried by the
 *    combined parent, so counting both double-counts the debt.
 */
export const OUTSTANDING_INVOICE_STATUSES: InvoiceStatus[] = [
  'PENDING',
  'PARTIALLY_PAID',
];

/** Prisma `where` fragment selecting the invoices that count toward a balance. */
export function outstandingInvoiceWhere(
  customerId?: string
): Prisma.InvoiceWhereInput {
  return {
    ...(customerId ? { customerId } : {}),
    status: { in: OUTSTANDING_INVOICE_STATUSES },
    // Children of a combined invoice are settled through their parent.
    combinedInvoiceId: null,
  };
}

/**
 * The same filter as raw SQL, for the batch customer-stats query.
 *
 * Kept beside the Prisma version deliberately: the two must always say the same
 * thing, and separating them is how they drifted in the first place.
 */
export const OUTSTANDING_INVOICE_SQL_FILTER = `i.status IN ('PENDING', 'PARTIALLY_PAID') AND i."combinedInvoiceId" IS NULL`;

// The per-invoice arithmetic lives in libs/data so the browser shows the same
// figure the server computes and prints.
export {
  getInvoiceBalanceDue as invoiceBalanceDue,
  isInvoicePartiallyPaid as isPartiallyPaid,
  roundToCents,
} from '@gt-automotive/data';
