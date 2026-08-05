/**
 * Shared HTML fragments for the invoice document.
 *
 * The invoice exists as three separate templates — the emailed/downloaded PDF
 * (server/src/pdf/pdf.service.ts) and two browser print/preview templates
 * (apps/webApp/src/app/requests/invoice.requests.ts). Historically any change
 * had to be hand-applied to each, and the emailed PDF and the printed copy drift
 * apart the moment one is missed.
 *
 * These builders are the single source of truth for the declined-items,
 * signature and terms sections so all three templates cannot disagree. They are
 * deliberately dependency-free, inline-styled strings: the PDF is rendered by
 * Puppeteer from a standalone HTML document with no stylesheet, and the print
 * templates are written into a fresh window.
 */

export interface PrintableDeclinedItem {
  description: string;
}

export interface PrintablePayment {
  paidAt?: string | Date | null;
  paymentMethod?: string | null;
  amount?: unknown;
}

export interface PrintableSignature {
  url?: string | null;
  signedByName?: string | null;
  signedAt?: string | Date | null;
}

/** Escape text interpolated into the templates. */
export function escapeInvoiceHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSignatureDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  // The shop is in one timezone; show the signing date as that calendar day
  // rather than the viewer's, so a phone in another province cannot disagree
  // with the printed copy.
  return date.toLocaleDateString('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * True when there is at least one declined item worth printing.
 *
 * Templates use this to decide where the signature goes: inside the declined
 * box when work was declined, otherwise in its own block at the foot of the
 * invoice.
 */
export function hasPrintableDeclinedItems(
  items?: PrintableDeclinedItem[] | null
): boolean {
  return (items ?? []).some((item) => item?.description?.trim());
}

/**
 * Services and parts the customer declined, printed directly below the
 * technician notes.
 *
 * Description only, and visually distinct from the billed line items — a
 * declined item must never be mistaken for a charge. Returns '' when there is
 * nothing declined, so an invoice without declined work is byte-identical to
 * how it printed before this section existed.
 *
 * When a signature is passed it is rendered INSIDE this box, so the customer
 * signs against the declined list itself rather than somewhere further down the
 * page — the signature is the acknowledgement that this work was offered and
 * refused, which is the whole reason for printing it.
 */
export function renderDeclinedItemsHtml(
  items?: PrintableDeclinedItem[] | null,
  signature?: PrintableSignature | null,
  customerName?: string | null
): string {
  const declined = (items ?? []).filter((item) => item?.description?.trim());
  if (declined.length === 0) return '';

  const rows = declined
    .map(
      (item) =>
        `<li style="margin: 0 0 3px 0;">${escapeInvoiceHtml(
          item.description.trim()
        )}</li>`
    )
    .join('');

  return `
    <div style="margin-top: 12px; padding: 8px 12px; border: 1px solid #e0a800; border-left: 4px solid #e0a800; border-radius: 4px; background: #fffaf0; page-break-inside: avoid;">
      <h3 style="margin: 0 0 6px 0; font-size: 13px; color: #8a6100; text-transform: uppercase; letter-spacing: 0.03em;">Declined Services &amp; Parts</h3>
      <p style="margin: 0 0 6px 0; font-size: 11px; color: #666;">
        The following were recommended and declined by the customer. They were not performed and are not included in the total.
      </p>
      <ul style="margin: 0; padding-left: 18px; font-size: 12px;">${rows}</ul>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">
        By signing below, the customer confirms the above services and parts were recommended and declined.
      </p>
      ${renderSignatureHtml(signature, customerName)}
    </div>
  `;
}

/**
 * Terms &amp; conditions block. The wording is business-authored and stored on the
 * Company record, so this only lays it out. Sits directly above the signature so
 * the signature reads as acceptance of the terms.
 */
export function renderTermsAndConditionsHtml(terms?: string | null): string {
  if (!terms?.trim()) return '';

  // The heading row is a table so the initials line stays pinned to the right
  // edge in both Puppeteer and the browser print dialog — flexbox is less
  // predictable across the two print paths.
  return `
    <div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #ddd; page-break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 4px 0;">
        <tr>
          <td style="padding: 0; vertical-align: bottom;">
            <h3 style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: #555;">Terms &amp; Conditions</h3>
          </td>
          <td style="padding: 0; vertical-align: bottom; text-align: right; white-space: nowrap;">
            <span style="font-size: 10px; color: #555;">Initials:</span>
            <span style="display: inline-block; width: 70px; border-bottom: 1px solid #333; margin-left: 4px;">&nbsp;</span>
          </td>
        </tr>
      </table>
      <p style="margin: 0; font-size: 10px; line-height: 1.45; color: #555; white-space: pre-wrap;">${escapeInvoiceHtml(
        terms.trim()
      )}</p>
    </div>
  `;
}

/**
 * Customer signature block, with a printed-name and date line beneath it.
 *
 * Always renders: an unsigned invoice prints an empty ruled line so it can be
 * signed by hand, which is the whole point of printing it in the shop.
 */
/** Height of the blank signing area above the rule, in px. */
const SIGNATURE_LINE_HEIGHT_PX = 34;

export function renderSignatureHtml(
  signature?: PrintableSignature | null,
  customerName?: string | null
): string {
  const hasImage = !!signature?.url;
  const signedDate = formatSignatureDate(signature?.signedAt);
  const printedName =
    signature?.signedByName?.trim() || customerName?.trim() || '';

  // Just enough room to sign by hand without leaving a dead band of white space
  // above the rule — the block is often reprinted on a single-page invoice.
  const signatureArea = hasImage
    ? `<img src="${escapeInvoiceHtml(
        signature?.url
      )}" alt="Customer signature" style="max-height: ${SIGNATURE_LINE_HEIGHT_PX}px; max-width: 100%; display: block;" />`
    : `<div style="height: ${SIGNATURE_LINE_HEIGHT_PX}px;"></div>`;

  return `
    <div style="margin-top: 8px; page-break-inside: avoid;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 60%; vertical-align: bottom; padding: 0 16px 0 0;">
            ${signatureArea}
            <div style="border-top: 1px solid #333; padding-top: 3px; font-size: 10px; color: #555;">
              Customer Signature${
                printedName ? ` &mdash; ${escapeInvoiceHtml(printedName)}` : ''
              }
            </div>
          </td>
          <td style="width: 40%; vertical-align: bottom;">
            <div style="height: ${SIGNATURE_LINE_HEIGHT_PX}px; display: flex; align-items: flex-end;">
              <span style="font-size: 12px;">${escapeInvoiceHtml(
                signedDate
              )}</span>
            </div>
            <div style="border-top: 1px solid #333; padding-top: 3px; font-size: 10px; color: #555;">Date</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Rounded to whole cents. `total` and `amountPaid` are Decimal(10,2) in the
 * database but arrive as JS numbers, so 105.10 - 80.00 would otherwise print as
 * 25.099999999999994.
 */
function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatMoney(value: unknown): string {
  return `$${roundToCents(Number(value) || 0).toFixed(2)}`;
}

function formatPaymentDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Amount-paid / balance-due rows appended to the invoice totals table, plus the
 * individual payments that make up the amount paid.
 *
 * Only rendered when the invoice is genuinely part-paid. A wholly-unpaid or
 * fully-paid invoice returns '' and prints exactly as it did before — no empty
 * "Balance Due: $0.00" row.
 *
 * Returns `<tr>` rows, so it must be interpolated INSIDE the existing totals
 * table, directly after the Total row. Cell padding is inlined because the three
 * templates style that table differently.
 */
export function renderPaymentSummaryRowsHtml(
  invoice?: {
    total?: unknown;
    amountPaid?: unknown;
    payments?: PrintablePayment[] | null;
  } | null
): string {
  const total = Number(invoice?.total) || 0;
  const paid = Number(invoice?.amountPaid ?? 0) || 0;
  const balance = roundToCents(total - paid);

  // Nothing paid, or settled in full — leave the invoice as it was.
  if (paid <= 0.005 || balance <= 0.005) return '';

  const payments = (invoice?.payments ?? []).filter(
    (payment) => Number(payment?.amount) > 0
  );

  const paymentRows = payments
    .map((payment) => {
      const when = formatPaymentDate(payment.paidAt);
      const method = (payment.paymentMethod ?? '').replace(/_/g, ' ');
      const label = [when, method].filter(Boolean).join(' — ');
      return `
              <tr>
                <td style="padding: 1px 5px; font-size: 11px; color: #666;">${escapeInvoiceHtml(
                  label
                )}</td>
                <td style="padding: 1px 5px; font-size: 11px; color: #666;">${formatMoney(
                  payment.amount
                )}</td>
              </tr>`;
    })
    .join('');

  const paymentsHeading = paymentRows
    ? `
              <tr>
                <td colspan="2" style="padding: 6px 5px 1px 5px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; color: #666;">Payments Received</td>
              </tr>${paymentRows}`
    : '';

  return `${paymentsHeading}
              <tr>
                <td style="padding: 3px 5px; border-top: 1px solid #ddd;">Amount Paid:</td>
                <td style="padding: 3px 5px; border-top: 1px solid #ddd;">${formatMoney(
                  paid
                )}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 1.1em;">
                <td style="padding: 3px 5px; color: #b00020;">Balance Due:</td>
                <td style="padding: 3px 5px; color: #b00020;">${formatMoney(
                  balance
                )}</td>
              </tr>`;
}
