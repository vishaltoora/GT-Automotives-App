import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Customer {
  id: string;
  userId: string;
  phone: string;
  address?: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: {
      id: string;
      name: string;
    };
  };
  vehicles?: Vehicle[];
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
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  businessName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

class CustomerService {
  private getAuthHeader() {
    // In production, get the actual token from Clerk
    const token = localStorage.getItem('authToken') || 'mock-jwt-token';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getAllCustomers(): Promise<Customer[]> {
    const response = await axios.get(`${API_URL}/api/customers`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async getCustomers(): Promise<Customer[]> {
    return this.getAllCustomers();
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await axios.get(`${API_URL}/api/customers/${id}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async getMyProfile(): Promise<Customer | null> {
    const response = await axios.get(`${API_URL}/api/customers/profile`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await axios.post(`${API_URL}/api/customers`, data, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await axios.patch(`${API_URL}/api/customers/${id}`, data, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/customers/${id}`, {
      headers: this.getAuthHeader(),
    });
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    const response = await axios.get(`${API_URL}/api/customers/search`, {
      params: { q: searchTerm },
      headers: this.getAuthHeader(),
    });
    return response.data;
  }
}

export const customerService = new CustomerService();