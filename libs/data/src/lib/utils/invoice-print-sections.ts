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
