import axios from 'axios';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get fresh token from Clerk
let getClerkToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  businessType?: string;
  address?: string;
  phone?: string;
  email?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class CompanyService {
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

  async getCompanies(): Promise<Company[]> {
    const response = await axios.get(`${API_URL}/api/companies`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getDefaultCompany(): Promise<Company> {
    const response = await axios.get(`${API_URL}/api/companies/default`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }
}

export const companyService = new CompanyService();
export default companyService;