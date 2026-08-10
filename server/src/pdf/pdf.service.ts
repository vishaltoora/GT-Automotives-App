import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import {
  hasPrintableDeclinedItems,
  renderPaymentSummaryRowsHtml,
  renderDeclinedItemsHtml,
  renderSignatureHtml,
  renderTermsAndConditionsHtml,
  PayStubDto,
} from '@gt-automotive/data';

/**
 * The fields the pay stub template renders. A structural type rather than the
 * full DTO so the template documents exactly what it depends on.
 */
type PayStubDocument = PayStubDto;

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  /**
   * Render several documents in one Chromium.
   *
   * `generatePdfFromHtml` launches and tears down a browser per call, which is
   * fine for one document and ruinous for a batch: a statement covering five
   * invoices paid five Chromium cold starts, and on a 1.75GB app service that
   * ran past the reverse proxy's 30s ceiling and came back to the browser as a
   * 502. One launch, one page reused across the documents, one teardown.
   *
   * Sequential on purpose. Rendering concurrently would mean several pages
   * fetching remote images at once on a container sized for one, trading a
   * timeout for an out-of-memory kill.
   */
  async generatePdfsFromHtml(
    htmls: string[],
    options?: {
      format?: 'A4' | 'Letter';
      printBackground?: boolean;
    }
  ): Promise<Buffer[]> {
    if (htmls.length === 0) return [];

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

    this.logger.log(
      `[PDF] Rendering ${htmls.length} document(s) in a single browser`
    );

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    try {
      const page = await browser.newPage();
      const buffers: Buffer[] = [];

      for (const [index, html] of htmls.entries()) {
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
          format: options?.format || 'Letter',
          printBackground: options?.printBackground !== false,
          margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm',
          },
        });
        buffers.push(Buffer.from(pdfBuffer));
        this.logger.log(`[PDF] Rendered ${index + 1}/${htmls.length}`);
      }

      return buffers;
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePdfFromHtml(
    html: string,
    options?: {
      format?: 'A4' | 'Letter';
      printBackground?: boolean;
    }
  ): Promise<Buffer> {
    // Use system Chromium in production (Alpine container)
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

    this.logger.log(
      `[PDF] Launching Puppeteer with executable: ${
        executablePath || 'bundled'
      }`
    );

    const browser = await puppeteer.launch({
      headless: true,
      executablePath, // Use system Chromium if available
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Overcome limited resource problems
        '--disable-gpu',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: options?.format || 'Letter',
        printBackground: options?.printBackground !== false,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate invoice HTML from invoice data
   */
  generateInvoiceHtml(invoice: any): string {
    // The signature prints inside the declined-services box when work was
    // declined (so it acknowledges that list), and on its own at the foot of the
    // invoice otherwise. Either way there is exactly one signature line.
    const signature = {
      url: invoice.signatureUrl,
      signedByName: invoice.signatureSignedByName,
      signedAt: invoice.signatureSignedAt,
    };
    const signatureCustomerName =
      [invoice.customer?.firstName, invoice.customer?.lastName]
        .filter(Boolean)
        .join(' ') ||
      invoice.customer?.name ||
      invoice.customer?.businessName ||
      '';
    const signatureInDeclinedBox = hasPrintableDeclinedItems(
      invoice.declinedItems
    );

    const formatCurrency = (amount: number | string) => {
      const numAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${(numAmount || 0).toFixed(2)}`;
    };

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString();

    const formatPhoneForDisplay = (phone: string) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
          6
        )}`;
      }
      return phone;
    };

    // Load GT Logo as base64
    let gtLogoBase64 = '';
    try {
      // Try multiple paths for logo (dev vs production Docker)
      const possiblePaths = [
        path.join(process.cwd(), 'server/assets/logo.png'), // Local dev
        path.join(process.cwd(), 'assets/logo.png'), // Production Docker
        path.join(__dirname, '../assets/logo.png'), // Relative to dist
        path.join(__dirname, '../../assets/logo.png'), // Alternative relative
      ];

      let logoPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }

      if (logoPath) {
        const logoBuffer = fs.readFileSync(logoPath);
        gtLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        this.logger.log(`[PDF] GT logo loaded successfully from: ${logoPath}`);
      } else {
        this.logger.warn(
          `[PDF] Logo file not found in any of the expected paths`
        );
      }
    } catch (error) {
      this.logger.warn(
        '[PDF] Could not load GT logo for PDF generation:',
        error
      );
    }

    const gtLogo = gtLogoBase64
      ? `<img src="${gtLogoBase64}" alt="GT Automotives Logo" style="width: 80px; height: 80px; object-fit: contain;" />`
      : `<div style="width: 80px; height: 80px; background: #243c55; border-radius: 8px;"></div>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; padding: 10px; max-width: 800px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #243c55;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                ${gtLogo}
                <div>
                  <h1 style="margin: 0; color: #243c55; font-size: 26px;">${
                    invoice.company?.name || 'GT Automotives'
                  }</h1>
                  <p style="margin: 0; font-size: 14px; color: #666;">${
                    invoice.company?.businessType ||
                    'Professional Tire & Auto Services'
                  }</p>
                  <p style="margin: 0; font-size: 12px; color: #888; font-style: italic;">${
                    invoice.company?.registrationNumber || '16472991'
                  } Canada INC.</p>
                </div>
              </div>
              <p style="margin-top: 8px; font-size: 13px;">${
                invoice.company?.address ||
                '473 3rd Ave, Prince George, BC V2L 3C1'
              }<br>
              ${
                invoice.company?.phone
                  ? `Phone: ${formatPhoneForDisplay(invoice.company.phone)}<br>`
                  : 'Phone: 250-570-2333<br>'
              }
              ${
                invoice.company?.email
                  ? `Email: ${invoice.company.email}`
                  : 'Email: gt-automotives@outlook.com'
              }</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #333;">INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${formatDate(
                invoice.invoiceDate || invoice.createdAt
              )}<br>
              <strong>Status:</strong> ${invoice.status}</p>
            </div>
          </div>

          <div style="margin: 10px 0;">
            <h3>Bill To:</h3>
            <p>${(() => {
              const customer = invoice.customer;
              let customerName = '';

              if (customer?.firstName || customer?.lastName) {
                const firstName = customer.firstName || '';
                const lastName = customer.lastName || '';
                customerName = `${firstName} ${lastName}`.trim();
              } else if (customer?.name) {
                customerName = customer.name;
              } else {
                customerName = 'Customer';
              }

              return customerName;
            })()}<br>
            ${
              invoice.customer?.businessName
                ? `<strong>${invoice.customer.businessName}</strong><br>`
                : ''
            }
            ${invoice.customer?.address || ''}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Description</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Type</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Quantity</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Unit Price</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(invoice.items || [])
                .map((item: any) => {
                  // Handle DISCOUNT_PERCENTAGE display
                  let displayTotal =
                    item.total || item.quantity * item.unitPrice;
                  let displayUnitPrice = item.unitPrice;

                  if (item.itemType === 'DISCOUNT_PERCENTAGE') {
                    const otherItemsSubtotal = (invoice.items || [])
                      .filter(
                        (i: any) =>
                          i.itemType !== 'DISCOUNT' &&
                          i.itemType !== 'DISCOUNT_PERCENTAGE'
                      )
                      .reduce(
                        (sum: any, i: any) =>
                          sum + (i.total || i.quantity * i.unitPrice),
                        0
                      );
                    displayTotal = -(otherItemsSubtotal * item.unitPrice) / 100;
                    displayUnitPrice = `${item.unitPrice}%`;
                  } else if (item.itemType === 'DISCOUNT') {
                    displayTotal = -Math.abs(displayTotal);
                  }

                  return `
                  <tr>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
                      ${
                        item.tireName
                          ? `<div style="font-weight: 600; margin-bottom: 2px;">${item.tireName}</div>`
                          : ''
                      }
                      <div style="${
                        item.tireName ? 'color: #666; font-size: 0.95em;' : ''
                      }">${item.description}</div>
                    </td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      item.itemType
                    }</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      item.quantity
                    }</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      typeof displayUnitPrice === 'string'
                        ? displayUnitPrice
                        : formatCurrency(displayUnitPrice)
                    }</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formatCurrency(
                      displayTotal
                    )}</td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <table style="margin-left: auto; width: 300px;">
              <tr>
                <td style="padding: 3px 5px;">Subtotal:</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  invoice.subtotal
                )}</td>
              </tr>
${
  invoice.gstRate != null && invoice.gstRate > 0
    ? `
              <tr>
                <td style="padding: 3px 5px;">GST (${(
                  invoice.gstRate * 100
                ).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  invoice.gstAmount || 0
                )}</td>
              </tr>`
    : ''
}
${
  invoice.pstRate != null && invoice.pstRate > 0
    ? `
              <tr>
                <td style="padding: 3px 5px;">PST (${(
                  invoice.pstRate * 100
                ).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  invoice.pstAmount || 0
                )}</td>
              </tr>`
    : ''
}
${
  (invoice.gstRate == null || invoice.gstRate === 0) &&
  (invoice.pstRate == null || invoice.pstRate === 0)
    ? `
              <tr>
                <td style="padding: 3px 5px;">Tax (${(
                  invoice.taxRate * 100
                ).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  invoice.taxAmount
                )}</td>
              </tr>`
    : ''
}
              <tr style="font-weight: bold; font-size: 1.1em; border-top: 2px solid #333;">
                <td style="padding: 3px 5px;">Total:</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  invoice.total
                )}</td>
              </tr>
              ${renderPaymentSummaryRowsHtml(invoice)}
            </table>
          </div>

          ${
            invoice.notes
              ? `
            <div style="margin-top: 12px;">
              <h3 style="margin-bottom: 8px;">Notes:</h3>
              <p style="margin: 0; white-space: pre-wrap;">${invoice.notes}</p>
            </div>
          `
              : ''
          }

          ${renderDeclinedItemsHtml(
            invoice.declinedItems,
            signature,
            signatureCustomerName
          )}

          ${
            invoice.customer?.pstExempt
              ? `
            <div style="margin-top: 12px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; background: #fafafa;">
              <p style="margin: 0; font-size: 13px;"><strong>This business is PST exempt.</strong>${
                invoice.customer?.pstNumber
                  ? ` PST Number: ${invoice.customer.pstNumber}`
                  : ''
              }</p>
            </div>
          `
              : ''
          }

          ${
            invoice.paymentMethod
              ? `
            <div style="margin-top: 12px;">
              <p style="margin: 0; font-size: 13px;"><strong>Payment Method:</strong> ${invoice.paymentMethod.replace(
                /_/g,
                ' '
              )}</p>
              ${
                invoice.paidAt
                  ? `<p style="margin: 0; font-size: 13px;"><strong>Paid On:</strong> ${formatDate(
                      invoice.paidAt
                    )}</p>`
                  : ''
              }
            </div>
          `
              : ''
          }

          ${renderTermsAndConditionsHtml(invoice.company?.termsAndConditions)}

          ${
            signatureInDeclinedBox
              ? ''
              : renderSignatureHtml(signature, signatureCustomerName)
          }

          <div style="margin-top: 25px; text-align: center; color: #666; font-size: 0.85em;">
            <div style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 20px;">
              <p style="font-weight: bold; color: #1976d2; margin: 0 0 3px 0;">Thank you for your business!</p>
              <p style="margin: 0; font-size: 12px;">GT Automotives - Your trusted automotive partner</p>
              <p style="margin: 2px 0; font-size: 10px; color: #666;">
                Mobile Service Available | Licensed & Insured | Satisfaction Guaranteed
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate invoice PDF and return as base64
   */
  async generateInvoicePdf(invoice: any): Promise<string> {
    const html = this.generateInvoiceHtml(invoice);
    const pdfBuffer = await this.generatePdfFromHtml(html);
    return pdfBuffer.toString('base64');
  }

  /**
   * Render several invoices as PDFs, sharing one browser. Same output as
   * calling generateInvoicePdf per invoice, without paying a Chromium launch
   * for each one.
   */
  async generateInvoicePdfs(invoices: any[]): Promise<string[]> {
    const htmls = invoices.map((invoice) => this.generateInvoiceHtml(invoice));
    const buffers = await this.generatePdfsFromHtml(htmls);
    return buffers.map((buffer) => buffer.toString('base64'));
  }

  /**
   * Generate quotation HTML from quotation data
   */
  generateQuotationHtml(quotation: any): string {
    const formatCurrency = (amount: number | string) => {
      const numAmount =
        typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${(numAmount || 0).toFixed(2)}`;
    };

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString();

    const formatPhoneForDisplay = (phone: string) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
          6
        )}`;
      }
      return phone;
    };

    // Load GT Logo as base64
    let gtLogoBase64 = '';
    try {
      // Try multiple paths for logo (dev vs production Docker)
      const possiblePaths = [
        path.join(process.cwd(), 'server/assets/logo.png'), // Local dev
        path.join(process.cwd(), 'assets/logo.png'), // Production Docker
        path.join(__dirname, '../assets/logo.png'), // Relative to dist
        path.join(__dirname, '../../assets/logo.png'), // Alternative relative
      ];

      let logoPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }

      if (logoPath) {
        const logoBuffer = fs.readFileSync(logoPath);
        gtLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        this.logger.log(
          `[PDF] GT logo loaded successfully for quotation from: ${logoPath}`
        );
      } else {
        this.logger.warn(
          `[PDF] Logo file not found in any of the expected paths`
        );
      }
    } catch (error) {
      this.logger.warn(
        '[PDF] Could not load GT logo for quotation PDF generation:',
        error
      );
    }

    const gtLogo = gtLogoBase64
      ? `<img src="${gtLogoBase64}" alt="GT Automotives Logo" style="width: 80px; height: 80px; object-fit: contain;" />`
      : `<div style="width: 80px; height: 80px; background: #243c55; border-radius: 8px;"></div>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; padding: 10px; max-width: 800px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #243c55;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                ${gtLogo}
                <div>
                  <h1 style="margin: 0; color: #243c55; font-size: 26px;">GT Automotives</h1>
                  <p style="margin: 0; font-size: 14px; color: #666;">Professional Tire & Auto Services</p>
                  <p style="margin: 0; font-size: 12px; color: #888; font-style: italic;">16472991 Canada INC.</p>
                </div>
              </div>
              <p style="margin-top: 8px; font-size: 13px;">473 3rd Ave<br>
              Prince George, BC V2L 3C1<br>
              Phone: 250-570-2333 / 250-986-9191<br>
              Email: gt-automotives@outlook.com</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #333;">QUOTATION</h2>
              <p><strong>Quote #:</strong> ${quotation.quotationNumber}<br>
              <strong>Date:</strong> ${formatDate(quotation.createdAt)}<br>
              ${
                quotation.validUntil
                  ? `<strong>Valid Until:</strong> ${formatDate(
                      quotation.validUntil
                    )}<br>`
                  : ''
              }
              <strong>Status:</strong> ${quotation.status}</p>
            </div>
          </div>

          <div style="margin: 10px 0;">
            <h3>Quote For:</h3>
            <p>${quotation.customerName}<br>
            ${
              quotation.businessName
                ? `<strong>${quotation.businessName}</strong><br>`
                : ''
            }
            ${
              quotation.phone
                ? `Phone: ${formatPhoneForDisplay(quotation.phone)}<br>`
                : ''
            }
            ${quotation.email ? `Email: ${quotation.email}<br>` : ''}
            ${quotation.address || ''}</p>
            ${
              quotation.vehicleMake ||
              quotation.vehicleModel ||
              quotation.vehicleYear
                ? `
              <p style="margin-top: 10px;"><strong>Vehicle:</strong> ${
                quotation.vehicleYear || ''
              } ${quotation.vehicleMake || ''} ${
                    quotation.vehicleModel || ''
                  }</p>
            `
                : ''
            }
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Description</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Type</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Quantity</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Unit Price</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f4f4f4; font-weight: bold;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(quotation.items || [])
                .map((item: any) => {
                  let displayTotal =
                    item.total || item.quantity * item.unitPrice;
                  let displayUnitPrice = item.unitPrice;

                  if (item.itemType === 'DISCOUNT_PERCENTAGE') {
                    const otherItemsSubtotal = (quotation.items || [])
                      .filter(
                        (i: any) =>
                          i.itemType !== 'DISCOUNT' &&
                          i.itemType !== 'DISCOUNT_PERCENTAGE'
                      )
                      .reduce(
                        (sum: any, i: any) =>
                          sum + (i.total || i.quantity * i.unitPrice),
                        0
                      );
                    displayTotal = -(otherItemsSubtotal * item.unitPrice) / 100;
                    displayUnitPrice = `${item.unitPrice}%`;
                  } else if (item.itemType === 'DISCOUNT') {
                    displayTotal = -Math.abs(displayTotal);
                  }

                  return `
                  <tr>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
                      ${
                        item.tireName
                          ? `<div style="font-weight: 600; margin-bottom: 2px;">${item.tireName}</div>`
                          : ''
                      }
                      <div style="${
                        item.tireName ? 'color: #666; font-size: 0.95em;' : ''
                      }">${item.description}</div>
                    </td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      item.itemType
                    }</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      item.quantity
                    }</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${
                      typeof displayUnitPrice === 'string'
                        ? displayUnitPrice
                        : formatCurrency(displayUnitPrice)
                    }</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formatCurrency(
                      displayTotal
                    )}</td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <table style="margin-left: auto; width: 300px;">
              <tr>
                <td style="padding: 3px 5px;">Subtotal:</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  quotation.subtotal
                )}</td>
              </tr>
${
  quotation.gstRate != null && quotation.gstRate > 0
    ? `
              <tr>
                <td style="padding: 3px 5px;">GST (${(
                  quotation.gstRate * 100
                ).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  quotation.gstAmount || 0
                )}</td>
              </tr>`
    : ''
}
${
  quotation.pstRate != null && quotation.pstRate > 0
    ? `
              <tr>
                <td style="padding: 3px 5px;">PST (${(
                  quotation.pstRate * 100
                ).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  quotation.pstAmount || 0
                )}</td>
              </tr>`
    : ''
}
${
  (quotation.gstRate == null || quotation.gstRate === 0) &&
  (quotation.pstRate == null || quotation.pstRate === 0)
    ? `
              <tr>
                <td style="padding: 3px 5px;">Tax (${(
                  quotation.taxRate * 100
                ).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  quotation.taxAmount
                )}</td>
              </tr>`
    : ''
}
              <tr style="font-weight: bold; font-size: 1.1em; border-top: 2px solid #333;">
                <td style="padding: 3px 5px;">Total:</td>
                <td style="padding: 3px 5px;">${formatCurrency(
                  quotation.total
                )}</td>
              </tr>
            </table>
          </div>

          ${
            quotation.notes
              ? `
            <div style="margin-top: 12px;">
              <h3 style="margin-bottom: 8px;">Notes:</h3>
              <p style="margin: 0;">${quotation.notes}</p>
            </div>
          `
              : ''
          }

          <div style="margin-top: 25px; text-align: center; color: #666; font-size: 0.85em;">
            <div style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 20px;">
              <p style="font-weight: bold; color: #1976d2; margin: 0 0 3px 0;">Thank you for considering our services!</p>
              <p style="margin: 0; font-size: 12px;">GT Automotives - Your trusted automotive partner</p>
              <p style="margin: 2px 0; font-size: 10px; color: #666;">
                Mobile Service Available | Licensed & Insured | Satisfaction Guaranteed
              </p>
              <p style="margin: 10px 0 0 0; font-size: 11px; font-style: italic; color: #888;">
                This quotation is valid for ${
                  quotation.validUntil
                    ? `until ${formatDate(quotation.validUntil)}`
                    : '30 days from the date above'
                }
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate quotation PDF and return as base64
   */
  async generateQuotationPdf(quotation: any): Promise<string> {
    const html = this.generateQuotationHtml(quotation);
    const pdfBuffer = await this.generatePdfFromHtml(html);
    return pdfBuffer.toString('base64');
  }

  /**
   * Load the GT logo from disk and return it as a base64 data URI (or '' if
   * unavailable). Shared by the invoice/quotation/inspection templates.
   */
  private loadGtLogoBase64(context: string): string {
    try {
      // Try multiple paths for logo (dev vs production Docker)
      const possiblePaths = [
        path.join(process.cwd(), 'server/assets/logo.png'), // Local dev
        path.join(process.cwd(), 'assets/logo.png'), // Production Docker
        path.join(__dirname, '../assets/logo.png'), // Relative to dist
        path.join(__dirname, '../../assets/logo.png'), // Alternative relative
      ];

      let logoPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }

      if (logoPath) {
        const logoBuffer = fs.readFileSync(logoPath);
        this.logger.log(
          `[PDF] GT logo loaded successfully for ${context} from: ${logoPath}`
        );
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }

      this.logger.warn(
        `[PDF] Logo file not found in any of the expected paths`
      );
    } catch (error) {
      this.logger.warn(
        `[PDF] Could not load GT logo for ${context} PDF generation:`,
        error
      );
    }
    return '';
  }

  /**
   * Generate inspection report HTML from inspection data.
   *
   * Mirrors the invoice/quotation PDFs: branded header with the disk-loaded
   * base64 logo, company block, a summary band of Good/Fair/Poor counts, an
   * overall-status banner, per-section item cards with status chips, vehicle +
   * customer metadata and a footer. Letter size, print-friendly (cards avoid
   * page breaks).
   */
  generateInspectionHtml(inspection: any): string {
    const escapeHtml = (value: unknown): string =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const formatDate = (dateStr: string | Date) =>
      dateStr ? new Date(dateStr).toLocaleDateString() : '';

    const formatPhoneForDisplay = (phone?: string | null) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
          6
        )}`;
      }
      return phone;
    };

    const formatStatus = (status?: string | null): string => {
      if (!status) return 'Not checked';
      return status.replace(/_/g, ' ');
    };

    const customer = inspection.customer || {};
    const vehicle = inspection.vehicle || null;

    const customerName =
      [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
      customer.businessName ||
      'Customer';
    const vehicleName = vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
      : 'Vehicle not selected';

    const results: any[] = inspection.results || [];

    const resultByItemId = new Map<string, any[]>();
    for (const result of results) {
      resultByItemId.set(result.itemId, [
        ...(resultByItemId.get(result.itemId) || []),
        result,
      ]);
    }

    const statusCounts = results.reduce(
      (counts, result) => {
        if (result.status === 'GOOD') counts.good += 1;
        if (result.status === 'FAIR') counts.fair += 1;
        if (result.status === 'POOR') counts.poor += 1;
        return counts;
      },
      { good: 0, fair: 0, poor: 0 }
    );

    // Overall status banner styling
    const overallStatusMap: Record<
      string,
      { label: string; bg: string; border: string; color: string }
    > = {
      GOOD: {
        label: 'Good — No issues found',
        bg: '#e8f5e9',
        border: '#81c784',
        color: '#1b5e20',
      },
      ATTENTION_SOON: {
        label: 'Attention Soon — Monitor recommended',
        bg: '#fff3e0',
        border: '#ffb74d',
        color: '#8a5200',
      },
      NEEDS_REPAIR: {
        label: 'Needs Repair — Service recommended',
        bg: '#ffebee',
        border: '#ef9a9a',
        color: '#b71c1c',
      },
      UNSAFE: {
        label: 'Unsafe — Immediate attention required',
        bg: '#ffebee',
        border: '#e57373',
        color: '#b71c1c',
      },
    };
    const overall = inspection.overallStatus
      ? overallStatusMap[inspection.overallStatus]
      : null;

    const metaRow = (label: string, value: unknown) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        return '';
      }
      return `<div style="display:flex; gap:6px; margin-bottom:4px;">
        <span style="font-weight:700; color:#243c55; min-width:70px;">${escapeHtml(
          label
        )}:</span>
        <span style="color:#333;">${escapeHtml(value)}</span>
      </div>`;
    };

    const statusChipStyles: Record<string, string> = {
      good: 'color:#1b5e20; border-color:#81c784; background:#e8f5e9;',
      fair: 'color:#8a5200; border-color:#ffcc80; background:#fff3e0;',
      poor: 'color:#b71c1c; border-color:#ef9a9a; background:#ffebee;',
      empty: 'color:#5b6472; border-color:#cfd6e0; background:#f2f5f9;',
    };

    const sections: any[] = inspection.template?.sections || [];
    const sectionsHtml = sections
      .map((section) => {
        const itemsHtml = (section.items || [])
          .map((item: any) => {
            const itemResults = resultByItemId.get(item.id) || [];
            if (itemResults.length === 0) return '';
            const resultsHtml = itemResults
              .map((result: any) => {
                const statusKey = String(
                  result.status || 'empty'
                ).toLowerCase();
                const chipStyle =
                  statusChipStyles[statusKey] || statusChipStyles.empty;
                const pos =
                  result.position && result.position !== 'GENERAL'
                    ? `<span class="ins-pos">${escapeHtml(
                        result.position
                      )}</span>`
                    : '';
                const val = result.value
                  ? `<span class="ins-val">${escapeHtml(result.value)}${
                      item.unit ? ` ${escapeHtml(item.unit)}` : ''
                    }</span>`
                  : '';
                const options = result.selectedOptions?.length
                  ? `<span class="ins-extra"><strong>Affected:</strong> ${escapeHtml(
                      result.selectedOptions.join(', ')
                    )}</span>`
                  : '';
                const notes = result.notes
                  ? `<span class="ins-extra"><strong>Notes:</strong> ${escapeHtml(
                      result.notes
                    )}</span>`
                  : '';
                return `<div class="ins-result">${pos}<span class="ins-chip" style="${chipStyle}">${escapeHtml(
                  formatStatus(result.status)
                )}</span>${val}${options}${notes}</div>`;
              })
              .join('');

            return `<div class="ins-item">
                <div class="ins-item-label">${escapeHtml(item.label)}</div>
                <div class="ins-item-results">${resultsHtml}</div>
              </div>`;
          })
          .join('');

        if (!itemsHtml.trim()) return '';

        return `<div class="ins-section">
            <h2 class="ins-section-title">${escapeHtml(section.title)}</h2>
            <div class="ins-items">${itemsHtml}</div>
          </div>`;
      })
      .join('');

    const gtLogoBase64 = this.loadGtLogoBase64('inspection');
    const gtLogo = gtLogoBase64
      ? `<img src="${gtLogoBase64}" alt="GT Automotives Logo" style="width: 80px; height: 80px; object-fit: contain;" />`
      : `<div style="width: 80px; height: 80px; background: #243c55; border-radius: 8px;"></div>`;

    const summaryCard = (label: string, count: number, style: string) => `
      <div style="border:1px solid #d8dee9; border-radius:6px; padding:12px; text-align:center; ${style}">
        <div style="font-size:24px; font-weight:800; line-height:1;">${count}</div>
        <div style="font-size:12px; font-weight:700; margin-top:4px; text-transform:uppercase; letter-spacing:0.5px;">${label}</div>
      </div>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; }
          * { box-sizing: border-box; }
          @page { size: Letter; margin: 16mm 12mm; }
          .ins-section { margin-top: 14px; }
          .ins-section-title {
            margin: 0 0 8px; font-size: 14px; color: #10264a;
            border-bottom: 1px solid #d8dee9; padding-bottom: 5px;
            break-after: avoid; page-break-after: avoid;
          }
          .ins-items {
            display: grid; grid-template-columns: repeat(2, 1fr);
            gap: 6px 12px; align-items: start;
          }
          .ins-item {
            border: 1px solid #e1e6ef; border-radius: 5px; padding: 6px 10px;
            page-break-inside: avoid; break-inside: avoid;
          }
          .ins-item-label {
            font-weight: 600; font-size: 11.5px; color: #10264a; margin-bottom: 3px;
          }
          .ins-result {
            display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
            font-size: 11px; padding: 1px 0;
          }
          .ins-pos { font-weight: 700; color: #243c55; min-width: 30px; }
          .ins-chip {
            border-radius: 4px; padding: 2px 8px; font-size: 10px;
            font-weight: 700; border: 1px solid; white-space: nowrap;
          }
          .ins-val { font-weight: 700; color: #10264a; }
          .ins-extra { width: 100%; margin-top: 2px; font-size: 10.5px; color: #555; }
        </style>
      </head>
      <body>
        <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; padding: 0; max-width: 800px; margin: 0 auto;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #243c55;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                ${gtLogo}
                <div>
                  <h1 style="margin: 0; color: #243c55; font-size: 26px;">GT Automotives</h1>
                  <p style="margin: 0; font-size: 14px; color: #666;">Professional Tire & Auto Services</p>
                  <p style="margin: 0; font-size: 12px; color: #888; font-style: italic;">16472991 Canada INC.</p>
                </div>
              </div>
              <p style="margin-top: 8px; font-size: 13px;">473 3rd Ave<br>
              Prince George, BC V2L 3C1<br>
              Phone: 250-570-2333<br>
              Email: gt-automotives@outlook.com</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #333;">INSPECTION REPORT</h2>
              <p style="margin-top: 6px;"><strong>Type:</strong> ${escapeHtml(
                inspection.template?.name || 'Inspection'
              )}<br>
              <strong>RO #:</strong> ${escapeHtml(
                inspection.roNumber || '-'
              )}<br>
              <strong>Status:</strong> ${escapeHtml(
                formatStatus(inspection.status)
              )}<br>
              <strong>Date:</strong> ${escapeHtml(
                formatDate(inspection.completedAt || inspection.createdAt)
              )}</p>
            </div>
          </div>

          <!-- Vehicle + customer metadata -->
          <div style="display:flex; justify-content:space-between; gap:24px; margin: 12px 0; font-size:13px;">
            <div style="flex:1;">
              ${metaRow('Customer', customerName)}
              ${
                customer.businessName
                  ? metaRow('Business', customer.businessName)
                  : ''
              }
              ${metaRow('Phone', formatPhoneForDisplay(customer.phone))}
            </div>
            <div style="flex:1;">
              ${vehicle ? metaRow('Vehicle', vehicleName) : ''}
              ${metaRow('VIN', vehicle?.vin)}
              ${metaRow('Plate', vehicle?.licensePlate)}
              ${metaRow('Mileage', inspection.mileage || vehicle?.mileage)}
            </div>
          </div>

          ${
            overall
              ? `<div style="margin: 14px 0; padding: 12px 16px; border-radius:6px; border:1px solid ${
                  overall.border
                }; background:${overall.bg}; color:${
                  overall.color
                }; font-weight:700; font-size:15px; text-align:center;">
                  Overall Status: ${escapeHtml(overall.label)}
                </div>`
              : ''
          }

          <!-- Summary band -->
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin: 14px 0;">
            ${summaryCard(
              'Good',
              statusCounts.good,
              'color:#1b5e20; border-color:#81c784; background:#e8f5e9;'
            )}
            ${summaryCard(
              'Fair',
              statusCounts.fair,
              'color:#8a5200; border-color:#ffcc80; background:#fff3e0;'
            )}
            ${summaryCard(
              'Poor',
              statusCounts.poor,
              'color:#b71c1c; border-color:#ef9a9a; background:#ffebee;'
            )}
          </div>

          ${sectionsHtml}

          ${
            inspection.technicianNotes
              ? `<div style="margin-top:16px; page-break-inside:avoid;">
                  <h2 style="margin:0 0 8px; font-size:15px; color:#10264a; border-bottom:1px solid #d8dee9; padding-bottom:6px;">Technician Notes</h2>
                  <p style="margin:0; font-size:13px; color:#444;">${escapeHtml(
                    inspection.technicianNotes
                  )}</p>
                </div>`
              : ''
          }
          ${
            inspection.customerNotes
              ? `<div style="margin-top:16px; page-break-inside:avoid;">
                  <h2 style="margin:0 0 8px; font-size:15px; color:#10264a; border-bottom:1px solid #d8dee9; padding-bottom:6px;">Notes for Customer</h2>
                  <p style="margin:0; font-size:13px; color:#444;">${escapeHtml(
                    inspection.customerNotes
                  )}</p>
                </div>`
              : ''
          }

          <!-- Footer -->
          <div style="margin-top: 25px; text-align: center; color: #666; font-size: 0.85em;">
            <div style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 20px;">
              <p style="font-weight: bold; color: #1976d2; margin: 0 0 3px 0;">Thank you for trusting GT Automotives with your vehicle!</p>
              <p style="margin: 0; font-size: 12px;">GT Automotives - Your trusted automotive partner</p>
              <p style="margin: 2px 0; font-size: 10px; color: #666;">
                Mobile Service Available | Licensed & Insured | Satisfaction Guaranteed
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate inspection report PDF and return as base64
   */
  async generateInspectionPdf(inspection: any): Promise<string> {
    const html = this.generateInspectionHtml(inspection);
    const pdfBuffer = await this.generatePdfFromHtml(html);
    return pdfBuffer.toString('base64');
  }

  /**
   * Pre-inspection report: photos of defective parts, each with the
   * technician's note. Image `url`s should be directly loadable (SAS URLs or
   * data URIs) — Puppeteer fetches them during generation (waitUntil idle).
   */
  generatePreInspectionHtml(data: {
    roNumber?: string;
    customerName?: string;
    vehicleName?: string;
    date?: string | Date;
    photos: { url: string; note?: string | null }[];
  }): string {
    const escapeHtml = (value: unknown): string =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const gtLogoBase64 = this.loadGtLogoBase64('pre-inspection');
    const gtLogo = gtLogoBase64
      ? `<img src="${gtLogoBase64}" alt="GT Automotives Logo" style="width: 72px; height: 72px; object-fit: contain;" />`
      : `<div style="width: 72px; height: 72px; background: #243c55; border-radius: 8px;"></div>`;

    const dateStr = data.date
      ? new Date(data.date).toLocaleDateString()
      : new Date().toLocaleDateString();

    const cards = (data.photos || [])
      .map(
        (p, i) => `
        <div class="pi-card">
          <div class="pi-img-wrap">
            <img class="pi-img" src="${p.url}" alt="Defect photo ${i + 1}" />
          </div>
          <div class="pi-note">${
            p.note && String(p.note).trim()
              ? escapeHtml(p.note)
              : '<span class="pi-note-empty">No note provided</span>'
          }</div>
        </div>`
      )
      .join('');

    const emptyState = `<p style="text-align:center; color:#777; font-style:italic; margin-top:24px;">
      No defective-part photos were documented for this pre-inspection.
    </p>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { margin: 0; padding: 0; }
          * { box-sizing: border-box; }
          @page { size: Letter; margin: 16mm 12mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; }
          .header {
            display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 2px solid #243c55; padding-bottom: 10px; margin-bottom: 15px;
          }
          .brand { display: flex; align-items: center; gap: 12px; }
          .brand h1 { margin: 0; color: #243c55; font-size: 24px; }
          .brand p { margin: 0; font-size: 13px; color: #666; }
          .doc { text-align: right; }
          .doc h2 { margin: 0; color: #333; font-size: 20px; }
          .doc p { margin: 6px 0 0; font-size: 13px; }
          .meta { display: flex; gap: 24px; font-size: 13px; margin: 12px 0 4px; }
          .meta .lbl { font-weight: 700; color: #243c55; }
          .pi-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px;
          }
          .pi-card {
            border: 1px solid #e1e6ef; border-radius: 6px; overflow: hidden;
            page-break-inside: avoid; break-inside: avoid;
          }
          .pi-img-wrap {
            width: 100%; height: 240px; background: #f2f5f9;
            display: flex; align-items: center; justify-content: center;
          }
          .pi-img { max-width: 100%; max-height: 240px; object-fit: contain; }
          .pi-note {
            padding: 8px 10px; font-size: 12px; color: #333;
            border-top: 1px solid #eef2f7; white-space: pre-wrap;
          }
          .pi-note-empty { color: #999; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            ${gtLogo}
            <div>
              <h1>GT Automotives</h1>
              <p>Professional Tire &amp; Auto Services</p>
              <p style="font-style:italic; color:#888; font-size:12px;">16472991 Canada INC.</p>
            </div>
          </div>
          <div class="doc">
            <h2>PRE-INSPECTION</h2>
            <p><strong>RO #:</strong> ${escapeHtml(data.roNumber || '-')}<br>
            <strong>Date:</strong> ${escapeHtml(dateStr)}</p>
          </div>
        </div>
        <div class="meta">
          ${
            data.customerName
              ? `<div><span class="lbl">Customer:</span> ${escapeHtml(
                  data.customerName
                )}</div>`
              : ''
          }
          ${
            data.vehicleName
              ? `<div><span class="lbl">Vehicle:</span> ${escapeHtml(
                  data.vehicleName
                )}</div>`
              : ''
          }
        </div>
        ${
          (data.photos || []).length
            ? `<div class="pi-grid">${cards}</div>`
            : emptyState
        }
      </body>
      </html>
    `;
  }

  async generatePreInspectionPdf(data: {
    roNumber?: string;
    customerName?: string;
    vehicleName?: string;
    date?: string | Date;
    photos: { url: string; note?: string | null }[];
  }): Promise<string> {
    const html = this.generatePreInspectionHtml(data);
    const pdfBuffer = await this.generatePdfFromHtml(html);
    return pdfBuffer.toString('base64');
  }

  /**
   * Pay stub HTML.
   *
   * This is the *only* pay stub template. The on-screen view, the print action
   * and any future emailed copy all render this same document, so unlike the
   * invoice — which grew three templates that had to be reconciled by
   * `invoice-print-sections.ts` — there is nothing here that can drift.
   *
   * Every value comes from the stored PayStub row, never from a live join, so
   * reprinting an old stub reproduces exactly the figures it was issued with.
   *
   * The layout leads with what the employee came for — net pay, gross and
   * total deductions as summary figures, then a proportional bar showing how
   * the gross was split — before the earnings and deductions detail, each
   * carrying current-period and year-to-date columns. It is also a legal wage
   * statement: BC's Employment Standards Act s.27 fixes what it must contain,
   * and `pay-stub-template.spec.ts` guards those items.
   */
  generatePayStubHtml(stub: PayStubDocument): string {
    const escapeHtml = (value: unknown): string =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const money = (amount: number) =>
      new Intl.NumberFormat('en-CA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));

    const hours = (value: number) => Number(value || 0).toFixed(2);

    // Dates arrive as YYYY-MM-DD calendar dates. Format them in UTC so the
    // printed day matches the business day they were stored as, on any server.
    // One format throughout: a numeric date is ambiguous between day/month and
    // month/day orders, which is not a thing to leave open on a pay record.
    const longDate = (value: string) => {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
        'en-CA',
        { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
      );
    };

    const logoBase64 = this.loadGtLogoBase64('pay stub');

    /**
     * Deductions, each with the purpose named — BC's Employment Standards Act
     * s.27(g) requires the amount *and* purpose of every deduction, so these
     * labels are not decorative.
     *
     * EI and CPP always print, matching the business's existing stub. Income
     * tax and any other deduction only appear when they carry a value, so a
     * stub that withholds neither is not padded with empty $0.00 lines.
     */
    const deductions = [
      {
        label: 'Employment Insurance (EI)',
        current: stub.eiAmount,
        ytd: stub.ytdEiAmount,
        colour: '#7d93ad',
        always: true,
      },
      {
        label: 'Canada Pension Plan (CPP)',
        current: stub.cppAmount,
        ytd: stub.ytdCppAmount,
        colour: '#3a5270',
        always: true,
      },
      {
        label: 'Income Tax',
        current: stub.incomeTaxAmount,
        ytd: stub.ytdIncomeTaxAmount,
        colour: '#ff6b35',
        always: false,
      },
      {
        // Not a deduction the employee loses — it is their vacation pay, held
        // back until they take it. Named so the stub does not read as money
        // gone.
        label: 'Vacation Pay Held',
        current: stub.vacationPayHeld,
        ytd: stub.ytdVacationPayHeld,
        colour: '#4a7c59',
        always: false,
      },
      {
        label: stub.otherDeductionsLabel || 'Other Deductions',
        current: stub.otherDeductions,
        ytd: stub.ytdOtherDeductions,
        colour: '#b9c4d0',
        always: false,
      },
    ].filter((row) => row.always || row.current > 0 || row.ytd > 0);

    /**
     * Vacation earned this period, shown with the rate that produced it so the
     * employee can check the percentage as well as the amount.
     *
     * Omitted entirely when there is nothing to show, so stubs raised before
     * vacation was tracked print exactly as they always did.
     */
    const vacationEarningRow =
      stub.vacationPayAmount > 0 || stub.ytdVacationPayAmount > 0
        ? `
          <tr>
            <td>Vacation Pay${
              stub.vacationPayRate > 0
                ? // Number() rather than toFixed(), so 4 prints as "4%" and 4.5
                  // as "4.5%" instead of a padded "4.00%".
                  ` (${escapeHtml(String(Number(stub.vacationPayRate)))}%)`
                : ''
            }</td>
            <td class="num"></td>
            <td class="num">${money(stub.vacationPayAmount)}</td>
            <td class="num muted">${money(stub.ytdVacationPayAmount)}</td>
          </tr>`
        : '';

    const deductionRows = deductions
      .map(
        (row) => `
      <tr>
        <td><span class="swatch" style="background:${
          row.colour
        }"></span>${escapeHtml(row.label)}</td>
        <td class="num">${money(row.current)}</td>
        <td class="num muted">${money(row.ytd)}</td>
      </tr>`
      )
      .join('');

    /**
     * Where the gross went, as one bar.
     *
     * This is the part of a pay stub people actually want answered — how much
     * of what I earned reached me — and a proportional bar answers it at a
     * glance in a way a column of figures never does. Widths are percentages of
     * gross computed here; the document carries no scripts, so nothing is
     * measured or drawn at render time.
     */
    const gross = Number(stub.grossPay || 0);
    const share = (amount: number) => (gross > 0 ? (amount / gross) * 100 : 0);
    const barSegments = [
      {
        label: 'Take-home',
        amount: Number(stub.netPay || 0),
        colour: '#243c55',
      },
      ...deductions
        .filter((row) => row.current > 0)
        .map((row) => ({
          label: row.label,
          amount: row.current,
          colour: row.colour,
        })),
    ].filter((segment) => segment.amount > 0);

    const distribution =
      gross > 0 && barSegments.length > 0
        ? `
      <div class="distribution">
        <div class="bar">
          ${barSegments
            .map(
              (segment) =>
                `<div class="bar-part" style="width:${share(
                  segment.amount
                ).toFixed(4)}%;background:${segment.colour}"></div>`
            )
            .join('')}
        </div>
        <div class="legend">
          ${barSegments
            .map(
              (segment) => `
            <span class="legend-item">
              <span class="swatch" style="background:${segment.colour}"></span>
              ${escapeHtml(segment.label)}
              <strong>${share(segment.amount).toFixed(1)}%</strong>
            </span>`
            )
            .join('')}
        </div>
      </div>`
        : '';

    const payRateValue =
      stub.payRate != null && stub.payRate > 0
        ? `$${money(stub.payRate)}${
            stub.payType === 'SALARIED' ? ' / year' : ' / hour'
          }`
        : '&mdash;';

    const detail = (label: string, value: string, sub?: string) => `
      <div class="detail">
        <div class="detail-label">${escapeHtml(label)}</div>
        <div class="detail-value">${value}</div>
        ${sub ? `<div class="detail-sub">${sub}</div>` : ''}
      </div>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pay Stub — ${escapeHtml(stub.employeeName)}</title>
  <style>
    * { box-sizing: border-box; }

    /* Backgrounds carry meaning here — the net-pay card and the distribution
       bar are not decoration — so they must survive the print pipeline. The
       colour scheme is pinned too: a wage statement must look the same
       everywhere, and a renderer in dark mode would otherwise invert it. */
    html {
      color-scheme: only light;
    }
    html, body {
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      color: #1f2933;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.45;
    }

    /* Figures line up column-wise only with tabular figures; proportional
       digits make a column of money look ragged. */
    .num, .amount, .stat-value, .summary-value {
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum' 1;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 12px;
      border-bottom: 3px solid #243c55;
    }
    .company { display: flex; gap: 12px; align-items: flex-start; }
    .company img { height: 52px; width: auto; }
    .company-name {
      font-size: 17px;
      font-weight: 700;
      color: #243c55;
      letter-spacing: -0.2px;
    }
    /* The incorporated name is what legally identifies the employer on a wage
       statement, so it reads at nearly the weight of the trading name rather
       than as fine print. */
    .company-registration {
      color: #243c55;
      font-size: 13px;
      font-weight: 600;
    }
    .company-address { color: #66727f; line-height: 1.45; margin-top: 4px; }
    .doc-meta { text-align: right; }
    .doc-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 3px;
      color: #243c55;
      text-transform: uppercase;
    }
    /* Label and value are set apart rather than run together, so the dates read
       as values instead of as the tail of a sentence. */
    .doc-sub {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 3px;
    }
    .doc-sub-label { color: #7b8794; }
    .doc-sub strong { color: #1f2933; font-weight: 600; }

    /* Summary cards — the three figures an employee looks for first. */
    .summary {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      page-break-inside: avoid;
    }
    .stat {
      flex: 1;
      border: 1px solid #dfe4ea;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .stat-label {
      font-size: 9px;
      letter-spacing: 1.1px;
      text-transform: uppercase;
      color: #7b8794;
      font-weight: 700;
    }
    .stat-value {
      font-size: 19px;
      font-weight: 700;
      color: #1f2933;
      margin-top: 2px;
      letter-spacing: -0.4px;
    }
    .stat-ytd { color: #7b8794; font-size: 10px; }
    /* Net pay is the headline figure, but it earns that with weight and a
       heavier rule rather than a block of ink — a filled panel dominates the
       page and costs toner on every stub printed. */
    .stat.net {
      border: 2px solid #243c55;
      flex: 1.35;
    }
    .stat.net .stat-label { color: #243c55; }
    .stat.net .stat-value { color: #243c55; font-size: 25px; }
    .stat.deductions .stat-value { color: #c2410c; }

    /* Where the gross went. */
    .distribution { margin-top: 12px; page-break-inside: avoid; }
    .bar {
      display: flex;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      background: #eef1f5;
    }
    .bar-part { height: 100%; }
    .legend {
      margin-top: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      color: #66727f;
      font-size: 10px;
    }
    .legend-item { display: inline-flex; align-items: center; gap: 5px; }
    .legend-item strong { color: #1f2933; }
    .swatch {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      margin-right: 6px;
      vertical-align: baseline;
    }
    .legend-item .swatch { margin-right: 0; }

    .details {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px 16px;
      margin-top: 16px;
      padding: 12px 14px;
      background: #f7f9fb;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    .detail-label {
      font-size: 9px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #7b8794;
      font-weight: 700;
    }
    .detail-value { color: #1f2933; font-weight: 600; }
    .detail-sub { color: #7b8794; font-size: 10px; }

    .columns {
      display: flex;
      gap: 16px;
      margin-top: 16px;
      page-break-inside: avoid;
    }
    .column { flex: 1; }
    .column-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #243c55;
      padding-bottom: 6px;
      border-bottom: 2px solid #243c55;
    }

    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 6px 2px; border-bottom: 1px solid #eceff3; }
    th {
      text-align: left;
      font-size: 9px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      color: #7b8794;
      font-weight: 700;
    }
    th.num, td.num { text-align: right; }
    td.muted { color: #7b8794; }
    .total-row td {
      font-weight: 700;
      border-top: 1px solid #cbd2d9;
      border-bottom: none;
      padding-top: 7px;
    }

    /* The arithmetic of the stub, spelled out: gross − deductions = net. */
    .summary-strip {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 18px;
      padding: 12px 14px;
      border: 1px solid #dfe4ea;
      border-left: 4px solid #243c55;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    .summary-cell { flex: 1; }
    .summary-label {
      font-size: 9px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #7b8794;
      font-weight: 700;
    }
    .summary-value { font-size: 14px; font-weight: 700; }
    .summary-op { font-size: 16px; color: #9aa5b1; font-weight: 700; }
    .summary-cell.net .summary-value { color: #243c55; font-size: 17px; }
    .summary-ytd { color: #7b8794; font-size: 10px; }

    .notes {
      margin-top: 14px;
      padding: 10px 12px;
      background: #f7f9fb;
      border-radius: 6px;
      color: #52606d;
    }
    .notes strong { color: #1f2933; }

    .footer {
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px solid #eceff3;
      color: #9aa5b1;
      font-size: 9px;
      text-align: center;
    }

    @page { size: letter; margin: 12mm; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">
      ${logoBase64 ? `<img src="${logoBase64}" alt="" />` : ''}
      <div>
        <div class="company-name">${escapeHtml(stub.companyName)}</div>
        ${
          stub.companyRegistrationNumber
            ? `<div class="company-registration">${escapeHtml(
                stub.companyRegistrationNumber
              )} Canada INC.</div>`
            : ''
        }
        ${
          stub.companyAddress
            ? `<div class="company-address">${escapeHtml(
                stub.companyAddress
              )}</div>`
            : ''
        }
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-title">Pay Statement</div>
      <div class="doc-sub">
        <span class="doc-sub-label">Pay date</span>
        <strong>${longDate(stub.payDate)}</strong>
      </div>
      <div class="doc-sub">
        <span class="doc-sub-label">Pay period</span>
        <strong>${longDate(stub.periodStart)} &ndash; ${longDate(
      stub.periodEnd
    )}</strong>
      </div>
    </div>
  </div>

  <div class="summary">
    <div class="stat net">
      <div class="stat-label">Net Pay &middot; This Period</div>
      <div class="stat-value">$${money(stub.netPay)}</div>
      <div class="stat-ytd">$${money(stub.ytdNetPay)} year to date</div>
    </div>
    <div class="stat">
      <div class="stat-label">Gross Pay</div>
      <div class="stat-value">$${money(stub.grossPay)}</div>
      <div class="stat-ytd">$${money(stub.ytdGrossPay)} YTD</div>
    </div>
    <div class="stat deductions">
      <div class="stat-label">Deductions</div>
      <div class="stat-value">$${money(stub.totalWithholding)}</div>
      <div class="stat-ytd">$${money(stub.ytdWithholding)} YTD</div>
    </div>
  </div>

  ${distribution}

  <div class="details">
    ${detail('Employee', escapeHtml(stub.employeeName))}
    ${detail('Position', escapeHtml(stub.position || '—'))}
    ${detail('Pay Rate', payRateValue)}
    ${detail(
      'Hours',
      hours(stub.regularHours),
      `${hours(stub.ytdHours)} year to date`
    )}
  </div>

  <div class="columns">
    <div class="column">
      <div class="column-title">Earnings</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="num">Hours</th>
            <th class="num">Current</th>
            <th class="num">Year to Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Regular Pay</td>
            <td class="num">${hours(stub.regularHours)}</td>
            <td class="num">${money(stub.regularAmount)}</td>
            <td class="num muted">${money(stub.ytdRegularAmount)}</td>
          </tr>
          ${vacationEarningRow}
          <tr class="total-row">
            <td>Gross Pay</td>
            <td class="num">${hours(stub.regularHours)}</td>
            <td class="num">${money(stub.grossPay)}</td>
            <td class="num">${money(stub.ytdGrossPay)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="column">
      <div class="column-title">Deductions</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="num">Current</th>
            <th class="num">Year to Date</th>
          </tr>
        </thead>
        <tbody>
          ${deductionRows}
          <tr class="total-row">
            <td>Total Deductions</td>
            <td class="num">${money(stub.totalWithholding)}</td>
            <td class="num">${money(stub.ytdWithholding)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="summary-strip">
    <div class="summary-cell">
      <div class="summary-label">Gross Pay</div>
      <div class="summary-value">$${money(stub.grossPay)}</div>
      <div class="summary-ytd">$${money(stub.ytdGrossPay)} YTD</div>
    </div>
    <div class="summary-op">&minus;</div>
    <div class="summary-cell">
      <div class="summary-label">Deductions</div>
      <div class="summary-value">$${money(stub.totalWithholding)}</div>
      <div class="summary-ytd">$${money(stub.ytdWithholding)} YTD</div>
    </div>
    <div class="summary-op">=</div>
    <div class="summary-cell net">
      <div class="summary-label">Net Pay</div>
      <div class="summary-value">$${money(stub.netPay)}</div>
      <div class="summary-ytd">$${money(stub.ytdNetPay)} YTD</div>
    </div>
  </div>

  ${
    stub.notes
      ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(
          stub.notes
        )}</div>`
      : ''
  }

  <div class="footer">
    ${escapeHtml(stub.companyName)} &middot; Pay statement for ${longDate(
      stub.periodStart
    )} &ndash; ${longDate(
      stub.periodEnd
    )} &middot; Retain this statement for your records
  </div>
</body>
</html>`;
  }

  async generatePayStubPdf(stub: PayStubDocument): Promise<Buffer> {
    return this.generatePdfFromHtml(this.generatePayStubHtml(stub));
  }
}
