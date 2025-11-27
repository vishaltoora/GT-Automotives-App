import axios from 'axios';

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
      console.error('Failed to get auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401 and haven't retried yet, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a fresh token from Clerk
        if (window.Clerk && window.Clerk.session) {
          const token = await window.Clerk.session.getToken({ skipCache: true });
          if (token) {
            localStorage.setItem('authToken', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Clear invalid token
        localStorage.removeItem('authToken');
      }
    }

    return Promise.reject(error);
  }
);

export interface SmsPreference {
  optedIn: boolean;
  appointmentReminders: boolean;
  serviceUpdates: boolean;
  promotional: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  vehicles?: Vehicle[];
  smsPreference?: SmsPreference;
  _count?: {
    invoices: number;
    appointments: number;
    vehicles: number;
  };
  stats?: {
    totalSpent: number;
    vehicleCount: number;
    appointmentCount: number;
    lastVisitDate: Date | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
  _count?: {
    invoices: number;
    appointments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  smsOptedIn?: boolean;
  smsAppointmentReminders?: boolean;
  smsServiceUpdates?: boolean;
  smsPromotional?: boolean;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  smsOptedIn?: boolean;
  smsAppointmentReminders?: boolean;
  smsServiceUpdates?: boolean;
  smsPromotional?: boolean;
}

class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    const response = await apiClient.get('/customers');
    return response.data;
  }

  async getCustomers(): Promise<Customer[]> {
    return this.getAllCustomers();
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  }

  async getMyProfile(): Promise<Customer | null> {
    const response = await apiClient.get('/customers/profile');
    return response.data;
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await apiClient.post('/customers', data);
    return response.data;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await apiClient.patch(`/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const response = await apiClient.get('/customers/search', {
      params: { q: searchTerm },
    });
    return response.data;
  }
}

export const customerService = new CustomerService();