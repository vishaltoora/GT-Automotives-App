import axios from 'axios';
import {
  VendorDto,
  CreateVendorDto,
  UpdateVendorDto,
  VendorListResponse,
} from '@gt-automotive/data';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with common configuration
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
      // Always try to get a fresh token from Clerk first
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken({});
        if (token) {
          localStorage.setItem('authToken', token);
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }

      // Fallback to localStorage token if Clerk not available
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
export type Vendor = VendorDto;
export type { CreateVendorDto, UpdateVendorDto, VendorListResponse };

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    purchaseInvoices: number;
    expenseInvoices: number;
  };
}

export interface CreateVendorDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateVendorDto {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive?: boolean;
  notes?: string;
}

export interface VendorListResponse {
  data: Vendor[];
  total: number;
  page: number;
  limit: number;
}

const vendorService = {
  async getAll(page = 1, limit = 100): Promise<VendorListResponse> {
    const response = await apiClient.get('/vendors', {
      params: { page, limit },
    });
    return response.data;
  },

  async getById(id: string): Promise<Vendor> {
    const response = await apiClient.get(`/vendors/${id}`);
    return response.data;
  },

  async search(query: string, limit = 10): Promise<Vendor[]> {
    const response = await apiClient.get('/vendors/search', {
      params: { query, limit },
    });
    return response.data;
  },

  async getActive(): Promise<Vendor[]> {
    const response = await apiClient.get('/vendors/active');
    return response.data;
  },

  async create(data: CreateVendorDto): Promise<Vendor> {
    const response = await apiClient.post('/vendors', data);
    return response.data;
  },

  async update(id: string, data: UpdateVendorDto): Promise<Vendor> {
    const response = await apiClient.put(`/vendors/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<Vendor> {
    const response = await apiClient.delete(`/vendors/${id}`);
    return response.data;
  },
};

export default vendorService;
