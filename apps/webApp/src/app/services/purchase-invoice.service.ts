import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken({});
        if (token) {
          localStorage.setItem('authToken', token);
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }

      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export type PurchaseCategory = 'TIRES' | 'PARTS' | 'TOOLS' | 'SUPPLIES' | 'OTHER';
export type PurchaseInvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'E_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface PurchaseInvoice {
  id: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  category: PurchaseCategory;
  status: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
}

export interface CreatePurchaseInvoiceDto {
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  category: PurchaseCategory;
  status?: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy: string;
}

export interface PurchaseInvoiceListResponse {
  data: PurchaseInvoice[];
  total: number;
  page: number;
  limit: number;
}

const purchaseInvoiceService = {
  async getAll(filters?: {
    vendorId?: string;
    category?: PurchaseCategory;
    status?: PurchaseInvoiceStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PurchaseInvoiceListResponse> {
    const response = await apiClient.get('/purchase-invoices', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<PurchaseInvoice> {
    const response = await apiClient.get(`/purchase-invoices/${id}`);
    return response.data;
  },

  async create(data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    const response = await apiClient.post('/purchase-invoices', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreatePurchaseInvoiceDto>): Promise<PurchaseInvoice> {
    const response = await apiClient.put(`/purchase-invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<PurchaseInvoice> {
    const response = await apiClient.delete(`/purchase-invoices/${id}`);
    return response.data;
  },

  async uploadImage(id: string, file: File): Promise<PurchaseInvoice> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/purchase-invoices/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteImage(id: string): Promise<PurchaseInvoice> {
    const response = await apiClient.delete(`/purchase-invoices/${id}/image`);
    return response.data;
  },
};

export default purchaseInvoiceService;
