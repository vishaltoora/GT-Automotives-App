import axios from 'axios';
import gtLogoImage from '../images-and-logos/logo.png';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get fresh token from Clerk
let getClerkToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

export interface QuoteItem {
  id?: string;
  tireId?: string;
  tire?: any;
  itemType: 'TIRE' | 'SERVICE' | 'PART' | 'OTHER';
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface Quote {
  id: string;
  quotationNumber: string; // Keep the DB field name but rename interface
  customerName: string;
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  gstRate?: number;
  gstAmount?: number;
  pstRate?: number;
  pstAmount?: number;
  total: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  validUntil?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  convertedToInvoiceId?: string;
}

export interface CreateQuoteDto {
  customerName: string;
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  items: Omit<QuoteItem, 'id' | 'total'>[];
  gstRate?: number;
  pstRate?: number;
  notes?: string;
  status?: Quote['status'];
  validUntil?: string;
}

export interface UpdateQuoteDto {
  customerName?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  items?: Omit<QuoteItem, 'id' | 'total'>[];
  gstRate?: number;
  pstRate?: number;
  notes?: string;
  status?: Quote['status'];
  validUntil?: string;
}

class QuoteService {
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
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to get fresh Clerk token:', error);
        }
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

  async createQuote(data: CreateQuoteDto): Promise<Quote> {
    const response = await axios.post(`${API_URL}/api/quotations`, data, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getQuotes(): Promise<Quote[]> {
    const response = await axios.get(`${API_URL}/api/quotations`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getQuote(id: string): Promise<Quote> {
    const response = await axios.get(`${API_URL}/api/quotations/${id}`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async updateQuote(id: string, data: UpdateQuoteDto): Promise<Quote> {
    const response = await axios.patch(`${API_URL}/api/quotations/${id}`, data, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async deleteQuote(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/quotations/${id}`, {
      headers: await this.getHeaders(),
    });
  }

  async searchQuotes(params: {
    customerName?: string;
    quotationNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: Quote['status'];
  }): Promise<Quote[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(`${API_URL}/api/quotations/search?${queryParams}`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async convertToInvoice(quoteId: string, customerId: string, vehicleId?: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/quotations/${quoteId}/convert`,
      { customerId, vehicleId },
      {
        headers: await this.getHeaders(),
      }
    );
    return response.data;
  }

  // Helper method to generate print-friendly HTML
  generatePrintHTML(quote: Quote): string {
    const formatCurrency = (amount: number | string) => {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      return `$${(numAmount || 0).toFixed(2)}`;
    };
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    // GT Logo - using actual logo.png
    const gtLogo = `<img src="${gtLogoImage}" alt="GT Automotives Logo" style="width: 80px; height: 80px; object-fit: contain;" />`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quote ${quote.quotationNumber}</title>
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
          .quote-header {
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
          .quote-details {
            text-align: right;
          }
          .quote-details h2 {
            margin: 0;
            color: #333;
            font-size: 24px;
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
          .validity-notice {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="quote-header">
          <div class="company-info">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              ${gtLogo}
              <div>
                <h1 style="margin: 0; color: #243c55;">GT Automotives</h1>
                <p style="margin: 0; font-size: 14px; color: #666;">Professional Tire & Auto Services</p>
                <p style="margin: 0; font-size: 12px; color: #888; font-style: italic;">16472991 Canada INC.</p>
              </div>
            </div>
            <p style="margin-top: 8px; font-size: 13px;">Prince George, BC<br>
            Phone: 250-570-2333<br>
            Email: gt-automotives@outlook.com</p>
          </div>
          <div class="quote-details">
            <h2>QUOTE</h2>
            <p><strong>Quote #:</strong> ${quote.quotationNumber}<br>
            <strong>Date:</strong> ${formatDate(quote.createdAt)}<br>
            <strong>Valid Until:</strong> ${quote.validUntil ? formatDate(quote.validUntil) : 'N/A'}<br>
            <strong>Status:</strong> ${quote.status}</p>
          </div>
        </div>

        <div class="customer-info">
          <h3>Quoted To:</h3>
          <p>${quote.businessName ? `<strong>${quote.businessName}</strong><br>` : ''}
          ${quote.customerName}<br>
          ${quote.phone ? `Phone: ${quote.phone}<br>` : ''}
          ${quote.email ? `Email: ${quote.email}<br>` : ''}
          ${quote.address || ''}</p>
        </div>

        ${quote.vehicleMake ? `
        <div class="customer-info">
          <h3>Vehicle Information:</h3>
          <p>${quote.vehicleYear || ''} ${quote.vehicleMake} ${quote.vehicleModel || ''}</p>
        </div>
        ` : ''}

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
            ${quote.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.itemType.replace('_', ' ')}</td>
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
              <td>${formatCurrency(quote.subtotal)}</td>
            </tr>
            ${quote.gstAmount ? `
            <tr>
              <td>GST (${((quote.gstRate || 0) * 100).toFixed(0)}%):</td>
              <td>${formatCurrency(quote.gstAmount)}</td>
            </tr>
            ` : ''}
            ${quote.pstAmount ? `
            <tr>
              <td>PST (${((quote.pstRate || 0) * 100).toFixed(0)}%):</td>
              <td>${formatCurrency(quote.pstAmount)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>Total:</td>
              <td>${formatCurrency(quote.total)}</td>
            </tr>
          </table>
        </div>

        ${quote.notes ? `
        <div style="margin-top: 15px;">
          <h4>Notes:</h4>
          <p>${quote.notes}</p>
        </div>
        ` : ''}

        <div class="validity-notice">
          <strong>Terms & Conditions:</strong><br>
          • This quote is valid until ${quote.validUntil ? formatDate(quote.validUntil) : '30 days from date of issue'}.<br>
          • Prices are subject to change without notice after expiry date.<br>
          • This is a quote only and does not constitute a commitment to provide services or products.<br>
          • All work is subject to parts availability.
        </div>

        <div class="footer">
          <p>Thank you for considering GT Automotives for your automotive needs!</p>
          <p style="font-size: 0.8em;">This quote was generated on ${formatDate(quote.createdAt)}</p>
        </div>
      </body>
      </html>
    `;
  }

  // Print quote
  printQuote(quote: Quote): void {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // Popup was blocked - try alternative method
        this.printUsingBlob(quote);
        return;
      }
      
      const htmlContent = this.generatePrintHTML(quote);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait a bit for content to load, then print
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Print dialog failed:', error);
          }
          // Close the window if print failed
          printWindow.close();
          // Try alternative method
          this.printUsingBlob(quote);
        }
      }, 500);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to open print window:', error);
      }
      // Fallback to blob method
      this.printUsingBlob(quote);
    }
  }

  // Alternative print method using blob URL
  private printUsingBlob(quote: Quote): void {
    try {
      const htmlContent = this.generatePrintHTML(quote);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      if (!printWindow) {
        // Still blocked - show error
        throw new Error('Popup blocked by browser. Please allow popups for printing.');
      }
      
      // Clean up URL after window loads
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.print();
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Print dialog failed:', error);
            }
          }
        }, 500);
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Alternative print method failed:', error);
      }
      throw error;
    }
  }
}

export const quoteService = new QuoteService();

// Legacy export for backward compatibility
export const quotationService = quoteService;