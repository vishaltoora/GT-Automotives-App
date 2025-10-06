import axios from 'axios';
import {
  PurchaseInvoiceDto,
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  PurchaseInvoiceListResponse,
  PurchaseCategory,
  PurchaseInvoiceStatus,
  PaymentMethod,
} from '@gt-automotive/data';

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

// Re-export types for convenience
export type PurchaseInvoice = PurchaseInvoiceDto;
export type {
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  PurchaseInvoiceListResponse,
  PurchaseCategory,
  PurchaseInvoiceStatus,
  PaymentMethod,
};

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
