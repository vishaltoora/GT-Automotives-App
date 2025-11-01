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
  async generatePdfFromHtml(html: string, options?: {
    format?: 'A4' | 'Letter';
    printBackground?: boolean;
  }): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${(numAmount || 0).toFixed(2)}`;
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    const formatPhoneForDisplay = (phone: string) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return phone;
    };

    // Load GT Logo as base64
    let gtLogoBase64 = '';
    try {
      // Use process.cwd() to get project root, works in both dev and production
      const logoPath = path.join(process.cwd(), 'server/assets/logo.png');
      this.logger.log(`[PDF] Attempting to load logo from: ${logoPath}`);

      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        gtLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        this.logger.log('[PDF] GT logo loaded successfully for PDF generation');
      } else {
        this.logger.warn(`[PDF] Logo file not found at: ${logoPath}`);
      }
    } catch (error) {
      this.logger.warn('[PDF] Could not load GT logo for PDF generation:', error);
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
                  <h1 style="margin: 0; color: #243c55; font-size: 26px;">${invoice.company?.name || 'GT Automotives'}</h1>
                  <p style="margin: 0; font-size: 14px; color: #666;">${invoice.company?.businessType || 'Professional Tire & Auto Services'}</p>
                  <p style="margin: 0; font-size: 12px; color: #888; font-style: italic;">${invoice.company?.registrationNumber || '16472991'} Canada INC.</p>
                </div>
              </div>
              <p style="margin-top: 8px; font-size: 13px;">${invoice.company?.address || 'Prince George, BC'}<br>
              ${invoice.company?.phone ? `Phone: ${formatPhoneForDisplay(invoice.company.phone)}<br>` : 'Phone: 250-570-2333<br>'}
              ${invoice.company?.email ? `Email: ${invoice.company.email}` : 'Email: gt-automotives@outlook.com'}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #333;">INVOICE</h2>
              <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${formatDate(invoice.invoiceDate || invoice.createdAt)}<br>
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
            ${invoice.customer?.businessName ? `<strong>${invoice.customer.businessName}</strong><br>` : ''}
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
              ${(invoice.items || []).map((item: any) => {
                // Handle DISCOUNT_PERCENTAGE display
                let displayTotal = item.total || item.quantity * item.unitPrice;
                let displayUnitPrice = item.unitPrice;

                if (item.itemType === 'DISCOUNT_PERCENTAGE') {
                  const otherItemsSubtotal = (invoice.items || [])
                    .filter((i: any) => i.itemType !== 'DISCOUNT' && i.itemType !== 'DISCOUNT_PERCENTAGE')
                    .reduce((sum: any, i: any) => sum + (i.total || i.quantity * i.unitPrice), 0);
                  displayTotal = -(otherItemsSubtotal * item.unitPrice) / 100;
                  displayUnitPrice = `${item.unitPrice}%`;
                } else if (item.itemType === 'DISCOUNT') {
                  displayTotal = -Math.abs(displayTotal);
                }

                return `
                  <tr>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
                      ${item.tireName ? `<div style="font-weight: 600; margin-bottom: 2px;">${item.tireName}</div>` : ''}
                      <div style="${item.tireName ? 'color: #666; font-size: 0.95em;' : ''}">${item.description}</div>
                    </td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${item.itemType}</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${typeof displayUnitPrice === 'string' ? displayUnitPrice : formatCurrency(displayUnitPrice)}</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formatCurrency(displayTotal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <table style="margin-left: auto; width: 300px;">
              <tr>
                <td style="padding: 3px 5px;">Subtotal:</td>
                <td style="padding: 3px 5px;">${formatCurrency(invoice.subtotal)}</td>
              </tr>
${invoice.gstRate != null && invoice.gstRate > 0 ? `
              <tr>
                <td style="padding: 3px 5px;">GST (${(invoice.gstRate * 100).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(invoice.gstAmount || 0)}</td>
              </tr>` : ''}
${invoice.pstRate != null && invoice.pstRate > 0 ? `
              <tr>
                <td style="padding: 3px 5px;">PST (${(invoice.pstRate * 100).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(invoice.pstAmount || 0)}</td>
              </tr>` : ''}
${(invoice.gstRate == null || invoice.gstRate === 0) && (invoice.pstRate == null || invoice.pstRate === 0) ? `
              <tr>
                <td style="padding: 3px 5px;">Tax (${(invoice.taxRate * 100).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(invoice.taxAmount)}</td>
              </tr>` : ''}
              <tr style="font-weight: bold; font-size: 1.1em; border-top: 2px solid #333;">
                <td style="padding: 3px 5px;">Total:</td>
                <td style="padding: 3px 5px;">${formatCurrency(invoice.total)}</td>
              </tr>
            </table>
          </div>

          ${invoice.notes ? `
            <div style="margin-top: 12px;">
              <h3 style="margin-bottom: 8px;">Notes:</h3>
              <p style="margin: 0;">${invoice.notes}</p>
            </div>
          ` : ''}

          ${invoice.paymentMethod ? `
            <div style="margin-top: 12px;">
              <p style="margin: 0; font-size: 13px;"><strong>Payment Method:</strong> ${invoice.paymentMethod.replace(/_/g, ' ')}</p>
              ${invoice.paidAt ? `<p style="margin: 0; font-size: 13px;"><strong>Paid On:</strong> ${formatDate(invoice.paidAt)}</p>` : ''}
            </div>
          ` : ''}

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
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${(numAmount || 0).toFixed(2)}`;
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    const formatPhoneForDisplay = (phone: string) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return phone;
    };

    // Load GT Logo as base64
    let gtLogoBase64 = '';
    try {
      const logoPath = path.join(process.cwd(), 'server/assets/logo.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        gtLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        this.logger.log('[PDF] GT logo loaded successfully for quotation PDF generation');
      } else {
        this.logger.warn(`[PDF] Logo file not found at: ${logoPath}`);
      }
    } catch (error) {
      this.logger.warn('[PDF] Could not load GT logo for quotation PDF generation:', error);
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
              <p style="margin-top: 8px; font-size: 13px;">Prince George, BC<br>
              Phone: 250-570-2333 / 250-986-9191<br>
              Email: gt-automotives@outlook.com</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #333;">QUOTATION</h2>
              <p><strong>Quote #:</strong> ${quotation.quotationNumber}<br>
              <strong>Date:</strong> ${formatDate(quotation.createdAt)}<br>
              ${quotation.validUntil ? `<strong>Valid Until:</strong> ${formatDate(quotation.validUntil)}<br>` : ''}
              <strong>Status:</strong> ${quotation.status}</p>
            </div>
          </div>

          <div style="margin: 10px 0;">
            <h3>Quote For:</h3>
            <p>${quotation.customerName}<br>
            ${quotation.businessName ? `<strong>${quotation.businessName}</strong><br>` : ''}
            ${quotation.phone ? `Phone: ${formatPhoneForDisplay(quotation.phone)}<br>` : ''}
            ${quotation.email ? `Email: ${quotation.email}<br>` : ''}
            ${quotation.address || ''}</p>
            ${quotation.vehicleMake || quotation.vehicleModel || quotation.vehicleYear ? `
              <p style="margin-top: 10px;"><strong>Vehicle:</strong> ${quotation.vehicleYear || ''} ${quotation.vehicleMake || ''} ${quotation.vehicleModel || ''}</p>
            ` : ''}
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
              ${(quotation.items || []).map((item: any) => {
                let displayTotal = item.total || item.quantity * item.unitPrice;
                let displayUnitPrice = item.unitPrice;

                if (item.itemType === 'DISCOUNT_PERCENTAGE') {
                  const otherItemsSubtotal = (quotation.items || [])
                    .filter((i: any) => i.itemType !== 'DISCOUNT' && i.itemType !== 'DISCOUNT_PERCENTAGE')
                    .reduce((sum: any, i: any) => sum + (i.total || i.quantity * i.unitPrice), 0);
                  displayTotal = -(otherItemsSubtotal * item.unitPrice) / 100;
                  displayUnitPrice = `${item.unitPrice}%`;
                } else if (item.itemType === 'DISCOUNT') {
                  displayTotal = -Math.abs(displayTotal);
                }

                return `
                  <tr>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
                      ${item.tireName ? `<div style="font-weight: 600; margin-bottom: 2px;">${item.tireName}</div>` : ''}
                      <div style="${item.tireName ? 'color: #666; font-size: 0.95em;' : ''}">${item.description}</div>
                    </td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${item.itemType}</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${typeof displayUnitPrice === 'string' ? displayUnitPrice : formatCurrency(displayUnitPrice)}</td>
                    <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${formatCurrency(displayTotal)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 20px;">
            <table style="margin-left: auto; width: 300px;">
              <tr>
                <td style="padding: 3px 5px;">Subtotal:</td>
                <td style="padding: 3px 5px;">${formatCurrency(quotation.subtotal)}</td>
              </tr>
${quotation.gstRate != null && quotation.gstRate > 0 ? `
              <tr>
                <td style="padding: 3px 5px;">GST (${(quotation.gstRate * 100).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(quotation.gstAmount || 0)}</td>
              </tr>` : ''}
${quotation.pstRate != null && quotation.pstRate > 0 ? `
              <tr>
                <td style="padding: 3px 5px;">PST (${(quotation.pstRate * 100).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(quotation.pstAmount || 0)}</td>
              </tr>` : ''}
${(quotation.gstRate == null || quotation.gstRate === 0) && (quotation.pstRate == null || quotation.pstRate === 0) ? `
              <tr>
                <td style="padding: 3px 5px;">Tax (${(quotation.taxRate * 100).toFixed(2)}%):</td>
                <td style="padding: 3px 5px;">${formatCurrency(quotation.taxAmount)}</td>
              </tr>` : ''}
              <tr style="font-weight: bold; font-size: 1.1em; border-top: 2px solid #333;">
                <td style="padding: 3px 5px;">Total:</td>
                <td style="padding: 3px 5px;">${formatCurrency(quotation.total)}</td>
              </tr>
            </table>
          </div>

          ${quotation.notes ? `
            <div style="margin-top: 12px;">
              <h3 style="margin-bottom: 8px;">Notes:</h3>
              <p style="margin: 0;">${quotation.notes}</p>
            </div>
          ` : ''}

          <div style="margin-top: 25px; text-align: center; color: #666; font-size: 0.85em;">
            <div style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 20px;">
              <p style="font-weight: bold; color: #1976d2; margin: 0 0 3px 0;">Thank you for considering our services!</p>
              <p style="margin: 0; font-size: 12px;">GT Automotives - Your trusted automotive partner</p>
              <p style="margin: 2px 0; font-size: 10px; color: #666;">
                Mobile Service Available | Licensed & Insured | Satisfaction Guaranteed
              </p>
              <p style="margin: 10px 0 0 0; font-size: 11px; font-style: italic; color: #888;">
                This quotation is valid for ${quotation.validUntil ? `until ${formatDate(quotation.validUntil)}` : '30 days from the date above'}
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
}
