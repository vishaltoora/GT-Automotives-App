import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

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
}
