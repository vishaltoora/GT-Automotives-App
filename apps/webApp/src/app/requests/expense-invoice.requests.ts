import axios from 'axios';
import {
  ExpenseInvoiceDto,
  CreateExpenseInvoiceDto,
  UpdateExpenseInvoiceDto,
  ExpenseInvoiceListResponse,
  ExpenseCategory,
  ExpenseInvoiceStatus,
  PaymentMethod,
  RecurringPeriod,
} from '@gt-automotive/data';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
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
  (error) => Promise.reject(error)
);

// Re-export types for convenience
export type ExpenseInvoice = ExpenseInvoiceDto;
export type {
  CreateExpenseInvoiceDto,
  UpdateExpenseInvoiceDto,
  ExpenseInvoiceListResponse,
  ExpenseCategory,
  ExpenseInvoiceStatus,
  PaymentMethod,
  RecurringPeriod,
};

const expenseInvoiceService = {
  async getAll(filters?: {
    vendorId?: string;
    category?: ExpenseCategory;
    status?: ExpenseInvoiceStatus;
    isRecurring?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ExpenseInvoiceListResponse> {
    const response = await apiClient.get('/expense-invoices', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<ExpenseInvoice> {
    const response = await apiClient.get(`/expense-invoices/${id}`);
    return response.data;
  },

  async create(data: CreateExpenseInvoiceDto): Promise<ExpenseInvoice> {
    const response = await apiClient.post('/expense-invoices', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateExpenseInvoiceDto>): Promise<ExpenseInvoice> {
    const response = await apiClient.put(`/expense-invoices/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ExpenseInvoice> {
    const response = await apiClient.delete(`/expense-invoices/${id}`);
    return response.data;
  },

  async uploadImage(id: string, file: File): Promise<ExpenseInvoice> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/expense-invoices/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteImage(id: string): Promise<ExpenseInvoice> {
    const response = await apiClient.delete(`/expense-invoices/${id}/image`);
    return response.data;
  },

  async getImageUrl(id: string): Promise<string> {
    const response = await apiClient.get<{ imageUrl: string }>(`/expense-invoices/${id}/image-url`);
    return response.data.imageUrl;
  },
};

export default expenseInvoiceService;
