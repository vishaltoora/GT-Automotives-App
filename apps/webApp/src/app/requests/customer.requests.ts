import axios from 'axios';
import type {
  CustomerAppointmentDto,
  CustomerAppointmentEmployeeDto,
  CustomerInvoiceDto,
  CustomerInvoiceItemDto,
  CreateCustomerDto,
  CustomerResponseDto,
  CustomerVehicleDto,
  SmsPreferenceDto,
  UpdateCustomerDto,
} from '@gt-automotive/data';

export type Customer = CustomerResponseDto;
export type SmsPreference = SmsPreferenceDto;
export type Vehicle = CustomerVehicleDto;
export type Invoice = CustomerInvoiceDto;
export type InvoiceItem = CustomerInvoiceItemDto;
export type AppointmentEmployee = CustomerAppointmentEmployeeDto;
export type Appointment = CustomerAppointmentDto;
export type { CreateCustomerDto, UpdateCustomerDto };

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

class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    const response = await apiClient.get('/customers');
    return response.data;
  }

  async getCustomers(): Promise<Customer[]> {
    return this.getAllCustomers();
  }

  // Lightweight endpoint for dropdowns/autocomplete - no stats, much faster
  async getCustomersSimple(): Promise<Customer[]> {
    const response = await apiClient.get('/customers/simple');
    return response.data;
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
