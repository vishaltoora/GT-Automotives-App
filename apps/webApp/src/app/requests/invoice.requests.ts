import axios from 'axios';
import { PaymentMethod } from '../../enums';
import { CreateInvoiceDto, InvoiceItemType } from '@gt-automotive/data';
import gtLogoImage from '../images-and-logos/logo.png';
import { formatPhoneForDisplay } from '../utils/phone';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get fresh token from Clerk
let getClerkToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

export interface InvoiceItem {
  id?: string;
  tireId?: string;
  tireName?: string;
  tire?: any;
  serviceId?: string;
  itemType: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountType?: 'amount' | 'percentage';
  discountValue?: number;
  discountAmount?: number;
  total?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: any;
  vehicleId?: string;
  vehicle?: any;
  companyId: string;
  company?: {
    id: string;
    name: string;
    registrationNumber: string;
    businessType?: string;
    address?: string;
    phone?: string;
    email?: string;
    isDefault: boolean;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  gstRate?: number;
  gstAmount?: number;
  pstRate?: number;
  pstAmount?: number;
  total: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

// Using shared DTO from the library
// export type CreateInvoiceDto = CreateInvoiceEnhancedDto;

export interface UpdateInvoiceDto {
  vehicleId?: string;
  items?: InvoiceItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  pstRate?: number;
  pstAmount?: number;
  total?: number;
  status?: Invoice['status'];
  paymentMethod?: PaymentMethod;
  notes?: string;
  paidAt?: string;
  invoiceDate?: string;
  companyId?: string;
}

class InvoiceService {
  private async getAuthToken(): Promise<string | null> {
    // Try to get fresh token from Clerk first
    if (getClerkToken) {
      try {
        const freshToken = await getClerkToken();
        if (freshToken) {
          localStorage.setItem('authToken', freshToken);
          return freshToken;
        }
      } catch (error) {
        // Token refresh failed, will use fallback
      }
    }
    // Fallback to localStorage
    return localStorage.getItem('authToken');
  }

  private async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await axios.post(`${API_URL}/api/invoices`, data, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getInvoices(): Promise<Invoice[]> {
    const response = await axios.get(`${API_URL}/api/invoices`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await axios.get(`${API_URL}/api/invoices/${id}`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const response = await axios.patch(`${API_URL}/api/invoices/${id}`, data, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async markInvoiceAsPaid(id: string, paymentMethod: Invoice['paymentMethod']): Promise<Invoice> {
    const response = await axios.post(
      `${API_URL}/api/invoices/${id}/pay`,
      { paymentMethod },
      {
        headers: await this.getHeaders(),
      }
    );
    return response.data;
  }

  async sendInvoiceEmail(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(
      `${API_URL}/api/invoices/${id}/send-email`,
      {},
      {
        headers: await this.getHeaders(),
      }
    );
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/invoices/${id}`, {
      headers: await this.getHeaders(),
    });
  }

  async searchInvoices(params: {
    customerName?: string;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: Invoice['status'];
    companyId?: string;
  }): Promise<Invoice[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(`${API_URL}/api/invoices/search?${queryParams}`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getCustomerInvoices(customerId: string): Promise<Invoice[]> {
    const response = await axios.get(`${API_URL}/api/invoices/customer/${customerId}`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getDailyCashReport(date?: string): Promise<any> {
    const queryParam = date ? `?date=${date}` : '';
    const response = await axios.get(`${API_URL}/api/invoices/cash-report${queryParam}`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  // Helper method to generate print-friendly HTML
  generatePrintHTML(invoice: Invoice): string {
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    // GT Logo - using actual logo.png
    const gtLogo = `<img src="${gtLogoImage}" alt="GT Automotivess Logo" style="width: 80px; height: 80px; object-fit: contain;" />`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
            @page { 
              margin: 0.3in; 
              size: A4;
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            padding: 10px;
            max-width: 800px;
            margin: 0 auto;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #243c55;
          }
          .company-info {
            flex: 1;
          }
          .company-info h1 {
            color: #243c55;
            margin: 0;
            font-size: 28px;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-details h2 {
            margin: 0;
            color: #333;
          }
          .customer-info {
            margin: 10px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
          }
          .items-table th, .items-table td {
            padding: 6px 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .items-table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .totals {
            text-align: right;
            margin-top: 12px;
          }
          .totals table {
            margin-left: auto;
            width: 280px;
          }
          .totals td {
            padding: 3px 5px;
          }
          .total-row {
            font-weight: bold;
            font-size: 1.1em;
            border-top: 2px solid #333;
          }
          .footer {
            margin-top: 25px;
            text-align: center;
            color: #666;
            font-size: 0.85em;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              ${gtLogo}
              <div>
                <h1 style="margin: 0; color: #243c55;">${invoice.company?.name || 'GT Automotivess'}</h1>
                <p style="margin: 0; font-size: 14px; color: #666;">${invoice.company?.businessType || 'Professional Tire & Auto Services'}</p>
                <p style="margin: 0; font-size: 12px; color: #888; font-style: italic;">${invoice.company?.registrationNumber || '16472991'} Canada INC.</p>
              </div>
            </div>
            <p style="margin-top: 8px; font-size: 13px;">${invoice.company?.address || 'Prince George, BC'}<br>
            ${invoice.company?.phone ? `Phone: ${formatPhoneForDisplay(invoice.company.phone)}<br>` : 'Phone: 250-570-2333<br>'}
            ${invoice.company?.email ? `Email: ${invoice.company.email}` : 'Email: gt-automotives@outlook.com'}</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
            <strong>Date:</strong> ${formatDate(invoice.createdAt)}<br>
            <strong>Status:</strong> ${invoice.status}</p>
          </div>
        </div>

        <div class="customer-info">
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

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.itemType}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${formatCurrency(item.total || item.quantity * item.unitPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>${formatCurrency(invoice.subtotal)}</td>
            </tr>
${invoice.gstRate != null && invoice.gstRate > 0 ? `
            <tr>
              <td>GST (${(invoice.gstRate * 100).toFixed(2)}%):</td>
              <td>${formatCurrency(invoice.gstAmount || 0)}</td>
            </tr>` : ''}
${invoice.pstRate != null && invoice.pstRate > 0 ? `
            <tr>
              <td>PST (${(invoice.pstRate * 100).toFixed(2)}%):</td>
              <td>${formatCurrency(invoice.pstAmount || 0)}</td>
            </tr>` : ''}
${(invoice.gstRate == null || invoice.gstRate === 0) && (invoice.pstRate == null || invoice.pstRate === 0) ? `
            <tr>
              <td>Tax (${(invoice.taxRate * 100).toFixed(2)}%):</td>
              <td>${formatCurrency(invoice.taxAmount)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td>Total:</td>
              <td>${formatCurrency(invoice.total)}</td>
            </tr>
          </table>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <h3>Notes:</h3>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        ${invoice.paymentMethod ? `
          <div class="payment-info">
            <p><strong>Payment Method:</strong> ${invoice.paymentMethod.replace(/_/g, ' ')}</p>
            ${invoice.paidAt ? `<p><strong>Paid On:</strong> ${formatDate(invoice.paidAt)}</p>` : ''}
          </div>
        ` : ''}

        <div class="footer">
          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px;">
            <p style="font-weight: bold; color: #1976d2; margin-bottom: 5px;">Thank you for your business!</p>
            <p style="margin: 0;">GT Automotives - Your trusted automotive partner</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">
              Mobile Service Available | Licensed & Insured | Satisfaction Guaranteed
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get print HTML content for dialog preview
  getPrintContent(invoice: Invoice): string {
    const formatCurrency = (amount: number | string) => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${(numAmount || 0).toFixed(2)}`;
    };
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    // GT Logo - using actual logo.png
    const gtLogo = `<img src="${gtLogoImage}" alt="GT Automotivess Logo" style="width: 80px; height: 80px; object-fit: contain;" />`;

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.4; color: #333; padding: 10px; max-width: 800px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #243c55;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              ${gtLogo}
              <div>
                <h1 style="margin: 0; color: #243c55; font-size: 26px;">${invoice.company?.name || 'GT Automotivess'}</h1>
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
            <strong>Date:</strong> ${formatDate(invoice.createdAt)}<br>
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
            ${invoice.items.map(item => {
              // Calculate display total - handle DISCOUNT_PERCENTAGE items
              let displayTotal = item.total || item.quantity * Number(item.unitPrice);
              if (String(item.itemType).toUpperCase() === 'DISCOUNT_PERCENTAGE') {
                // Recalculate percentage discount based on other items
                const otherItemsSubtotal = invoice.items
                  .filter((i: any) => String(i.itemType).toUpperCase() !== 'DISCOUNT' && String(i.itemType).toUpperCase() !== 'DISCOUNT_PERCENTAGE')
                  .reduce((sum: number, i: any) => sum + (Number(i.total) || Number(i.quantity) * Number(i.unitPrice)), 0);
                displayTotal = -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
              } else if (String(item.itemType).toUpperCase() === 'DISCOUNT') {
                // Ensure discount is negative
                displayTotal = -Math.abs(displayTotal);
              }

              return `
              <tr>
                <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">
                  ${(item as any).tireName ? `<div style="font-weight: 600; margin-bottom: 2px;">${(item as any).tireName}</div>` : ''}
                  <div style="${(item as any).tireName ? 'color: #666; font-size: 0.95em;' : ''}">${item.description}</div>
                </td>
                <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${item.itemType}</td>
                <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">${String(item.itemType).toUpperCase() === 'DISCOUNT_PERCENTAGE' ? `${Number(item.unitPrice)}%` : formatCurrency(item.unitPrice)}</td>
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
    `;
  }

  // Print invoice in new window
  printInvoice(invoice: Invoice): void {
    const htmlContent = this.getPrintContent(invoice);
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
                @page {
                  margin-top: 0.5in;
                  margin-right: 0.25in;
                  margin-bottom: 0.25in;
                  margin-left: 0.25in;
                  size: A4;
                  @top-left { content: ""; }
                  @top-center { content: ""; }
                  @top-right { content: ""; }
                  @bottom-left { content: ""; }
                  @bottom-center { content: ""; }
                  @bottom-right { content: ""; }
                }
              }
              body {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        // Show tip about removing headers/footers
        const showTip = !localStorage.getItem('invoice-print-tip-shown');
        if (showTip) {
          alert('Tip: For cleaner printing without headers/footers, go to Print Settings and uncheck "Headers and footers" option.');
          localStorage.setItem('invoice-print-tip-shown', 'true');
        }
        printWindow.print();
      }, 250);
    }
  }
}

export const invoiceService = new InvoiceService();