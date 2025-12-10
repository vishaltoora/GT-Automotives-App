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
  // Cache for companies data - companies rarely change so we cache them
  private companiesCache: Company[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  private fetchPromise: Promise<Company[]> | null = null; // Prevent duplicate requests

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
        // Token refresh failed, will use fallback
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

  async getCompanies(forceRefresh = false): Promise<Company[]> {
    const now = Date.now();

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.companiesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.companiesCache;
    }

    // If a fetch is already in progress, wait for it (prevents duplicate requests)
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Start new fetch
    this.fetchPromise = (async () => {
      try {
        const response = await axios.get(`${API_URL}/api/companies`, {
          headers: await this.getHeaders(),
        });
        this.companiesCache = response.data;
        this.cacheTimestamp = Date.now();
        return response.data;
      } finally {
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
  }

  // Clear cache when needed (e.g., after company update)
  clearCache(): void {
    this.companiesCache = null;
    this.cacheTimestamp = 0;
  }

  // Pre-fetch companies (call this on app init)
  prefetch(): void {
    this.getCompanies().catch(() => {
      // Silently fail prefetch - will retry on actual use
    });
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