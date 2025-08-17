import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface InvoiceItem {
  id?: string;
  tireId?: string;
  tire?: any;
  itemType: 'TIRE' | 'SERVICE' | 'PART' | 'OTHER';
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: any;
  vehicleId?: string;
  vehicle?: any;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHECK' | 'E_TRANSFER' | 'FINANCING';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface CreateInvoiceDto {
  customerId: string;
  vehicleId?: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  taxRate?: number;
  paymentMethod?: Invoice['paymentMethod'];
  notes?: string;
}

export interface UpdateInvoiceDto {
  status?: Invoice['status'];
  paymentMethod?: Invoice['paymentMethod'];
  notes?: string;
  paidAt?: string;
}

class InvoiceService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await axios.post(`${API_URL}/api/invoices`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getInvoices(): Promise<Invoice[]> {
    const response = await axios.get(`${API_URL}/api/invoices`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await axios.get(`${API_URL}/api/invoices/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const response = await axios.patch(`${API_URL}/api/invoices/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async markInvoiceAsPaid(id: string, paymentMethod: Invoice['paymentMethod']): Promise<Invoice> {
    const response = await axios.post(
      `${API_URL}/api/invoices/${id}/pay`,
      { paymentMethod },
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async cancelInvoice(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/invoices/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async searchInvoices(params: {
    customerName?: string;
    invoiceNumber?: string;
    startDate?: string;
    endDate?: string;
    status?: Invoice['status'];
  }): Promise<Invoice[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await axios.get(`${API_URL}/api/invoices/search?${queryParams}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getCustomerInvoices(customerId: string): Promise<Invoice[]> {
    const response = await axios.get(`${API_URL}/api/invoices/customer/${customerId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getDailyCashReport(date?: string): Promise<any> {
    const queryParam = date ? `?date=${date}` : '';
    const response = await axios.get(`${API_URL}/api/invoices/cash-report${queryParam}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Helper method to generate print-friendly HTML
  generatePrintHTML(invoice: Invoice): string {
    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
          }
          .company-info h1 {
            color: #1976d2;
            margin: 0;
          }
          .invoice-details {
            text-align: right;
          }
          .invoice-details h2 {
            margin: 0;
            color: #333;
          }
          .customer-info {
            margin: 20px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th, .items-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .items-table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .totals {
            text-align: right;
            margin-top: 20px;
          }
          .totals table {
            margin-left: auto;
            width: 300px;
          }
          .totals td {
            padding: 5px;
          }
          .total-row {
            font-weight: bold;
            font-size: 1.2em;
            border-top: 2px solid #333;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <h1>GT Automotive</h1>
            <p>123 Main Street<br>
            Houston, TX 77001<br>
            Phone: (555) 123-4567<br>
            Email: info@gtautomotive.com</p>
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
          <p>${invoice.customer?.user?.firstName} ${invoice.customer?.user?.lastName}<br>
          ${invoice.customer?.phone}<br>
          ${invoice.customer?.address || ''}</p>
          ${invoice.vehicle ? `
            <p><strong>Vehicle:</strong> ${invoice.vehicle.year} ${invoice.vehicle.make} ${invoice.vehicle.model}<br>
            <strong>VIN:</strong> ${invoice.vehicle.vin || 'N/A'}<br>
            <strong>License Plate:</strong> ${invoice.vehicle.licensePlate || 'N/A'}</p>
          ` : ''}
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
            <tr>
              <td>Tax (${(invoice.taxRate * 100).toFixed(2)}%):</td>
              <td>${formatCurrency(invoice.taxAmount)}</td>
            </tr>
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
          <p>Thank you for your business!</p>
          <p>GT Automotive - Your trusted automotive partner</p>
        </div>
      </body>
      </html>
    `;
  }

  // Print invoice
  printInvoice(invoice: Invoice): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(this.generatePrintHTML(invoice));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }
}

export const invoiceService = new InvoiceService();