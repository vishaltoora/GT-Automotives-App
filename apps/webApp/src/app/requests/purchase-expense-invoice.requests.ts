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

// Types
export type PurchaseExpenseType = 'PURCHASE' | 'EXPENSE';

export type PurchaseExpenseCategory =
  | 'TIRES'
  | 'PARTS'
  | 'TOOLS'
  | 'SUPPLIES'
  | 'RENT'
  | 'UTILITIES'
  | 'INSURANCE'
  | 'ADVERTISING'
  | 'OFFICE_SUPPLIES'
  | 'PROFESSIONAL_FEES'
  | 'MAINTENANCE'
  | 'VEHICLE'
  | 'TRAVEL'
  | 'TRAINING'
  | 'SOFTWARE'
  | 'OTHER';

export interface PurchaseExpenseInvoice {
  id: string;
  type: PurchaseExpenseType;
  vendorId: string | null;
  vendorName: string;
  description: string;
  invoiceDate: string;
  totalAmount: number;
  category: PurchaseExpenseCategory;
  notes: string | null;
  imageUrl: string | null;
  imageName: string | null;
  imageSize: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    name: string;
  } | null;
}

export interface CreatePurchaseExpenseInvoiceDto {
  type: PurchaseExpenseType;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  totalAmount: number;
  category: PurchaseExpenseCategory;
  notes?: string;
}

export interface UpdatePurchaseExpenseInvoiceDto {
  type?: PurchaseExpenseType;
  vendorId?: string;
  vendorName?: string;
  description?: string;
  invoiceDate?: string;
  totalAmount?: number;
  category?: PurchaseExpenseCategory;
  notes?: string;
}

export interface PurchaseExpenseInvoiceListResponse {
  data: PurchaseExpenseInvoice[];
  total: number;
  page: number;
  limit: number;
}

// Purchase category labels
export const PURCHASE_CATEGORIES: PurchaseExpenseCategory[] = [
  'TIRES',
  'PARTS',
  'TOOLS',
  'SUPPLIES',
];

// Expense category labels
export const EXPENSE_CATEGORIES: PurchaseExpenseCategory[] = [
  'RENT',
  'UTILITIES',
  'INSURANCE',
  'ADVERTISING',
  'OFFICE_SUPPLIES',
  'PROFESSIONAL_FEES',
  'MAINTENANCE',
  'VEHICLE',
  'TRAVEL',
  'TRAINING',
  'SOFTWARE',
];

// All categories
export const ALL_CATEGORIES: PurchaseExpenseCategory[] = [
  ...PURCHASE_CATEGORIES,
  ...EXPENSE_CATEGORIES,
  'OTHER',
];

// Category display names
export const CATEGORY_LABELS: Record<PurchaseExpenseCategory, string> = {
  TIRES: 'Tires',
  PARTS: 'Parts',
  TOOLS: 'Tools',
  SUPPLIES: 'Supplies',
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  INSURANCE: 'Insurance',
  ADVERTISING: 'Advertising',
  OFFICE_SUPPLIES: 'Office Supplies',
  PROFESSIONAL_FEES: 'Professional Fees',
  MAINTENANCE: 'Maintenance',
  VEHICLE: 'Vehicle',
  TRAVEL: 'Travel',
  TRAINING: 'Training',
  SOFTWARE: 'Software',
  OTHER: 'Other',
};

const purchaseExpenseInvoiceService = {
  async getAll(filters?: {
    type?: PurchaseExpenseType;
    vendorId?: string;
    category?: PurchaseExpenseCategory;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PurchaseExpenseInvoiceListResponse> {
    const response = await apiClient.get('/purchase-expense-invoices', {
      params: filters,
    });
    return response.data;
  },

  async getById(id: string): Promise<PurchaseExpenseInvoice> {
    const response = await apiClient.get(`/purchase-expense-invoices/${id}`);
    return response.data;
  },

  async create(
    data: CreatePurchaseExpenseInvoiceDto
  ): Promise<PurchaseExpenseInvoice> {
    const response = await apiClient.post('/purchase-expense-invoices', data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdatePurchaseExpenseInvoiceDto
  ): Promise<PurchaseExpenseInvoice> {
    const response = await apiClient.put(
      `/purchase-expense-invoices/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<PurchaseExpenseInvoice> {
    const response = await apiClient.delete(`/purchase-expense-invoices/${id}`);
    return response.data;
  },

  async uploadImage(id: string, file: File): Promise<PurchaseExpenseInvoice> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/purchase-expense-invoices/${id}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async deleteImage(id: string): Promise<PurchaseExpenseInvoice> {
    const response = await apiClient.delete(
      `/purchase-expense-invoices/${id}/image`
    );
    return response.data;
  },

  async getImageUrl(id: string): Promise<string> {
    const response = await apiClient.get<{ imageUrl: string }>(
      `/purchase-expense-invoices/${id}/image-url`
    );
    return response.data.imageUrl;
  },
};

export default purchaseExpenseInvoiceService;
