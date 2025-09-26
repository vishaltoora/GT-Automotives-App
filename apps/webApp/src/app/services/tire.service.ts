import axios, { AxiosResponse } from 'axios';
import {
  ITire,
  ITireCreateInput,
  ITireUpdateInput,
  ITireSearchParams,
  ITireSearchResult,
  ITireImage,
} from '@gt-automotive/data';

// Type declaration for Clerk global
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string>;
      };
    };
  }
}

// @ts-ignore
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

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
    let token = localStorage.getItem('authToken');
    
    // If no token in localStorage, try to get it from Clerk
    if (!token) {
      try {
        // Check if Clerk is available
        if (window.Clerk && window.Clerk.session) {
          token = await window.Clerk.session.getToken();
          if (token) {
            localStorage.setItem('authToken', token);
          }
        }
      } catch (error) {
        // Silently handle token retrieval errors
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token but don't redirect automatically
      // Let the component handle the redirect appropriately
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export interface InventoryReport {
  totalValue: number;
  totalCost: number;
  totalItems: number;
  lowStockItems: ITire[];
  byBrand: Record<string, number>;
  byType: Record<string, number>;
}

export class TireService {
  /**
   * Get paginated list of tires with optional filters
   */
  static async getTires(params: ITireSearchParams = {}): Promise<ITireSearchResult> {
    const queryParams = new URLSearchParams();
    
    // Add search parameter
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    // Add sorting parameters
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      queryParams.append('sortOrder', params.sortOrder);
    }
    
    // Add pagination parameters
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    // Add filters (removed - not supported in DTO)
    
    const response: AxiosResponse<ITireSearchResult> = await apiClient.get(
      `/tires?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get a single tire by ID
   */
  static async getTireById(id: string): Promise<ITire> {
    const response: AxiosResponse<ITire> = await apiClient.get(`/tires/${id}`);
    return response.data;
  }

  /**
   * Create a new tire
   */
  static async createTire(data: ITireCreateInput): Promise<ITire> {
    const response: AxiosResponse<ITire> = await apiClient.post('/tires', data);
    return response.data;
  }

  /**
   * Update an existing tire
   */
  static async updateTire(id: string, data: ITireUpdateInput): Promise<ITire> {
    const response: AxiosResponse<ITire> = await apiClient.put(`/tires/${id}`, data);
    return response.data;
  }

  /**
   * Delete a tire (admin only)
   */
  static async deleteTire(id: string): Promise<void> {
    await apiClient.delete(`/tires/${id}`);
  }

  /**
   * Adjust tire stock quantity
   */
  static async adjustStock(
    id: string, 
    adjustment: { quantity: number; type: 'add' | 'remove' | 'set'; reason: string }
  ): Promise<ITire> {
    const response: AxiosResponse<ITire> = await apiClient.post(
      `/tires/${id}/adjust-stock`, 
      adjustment
    );
    return response.data;
  }

  /**
   * Get tires with low stock (staff/admin only)
   */
  static async getLowStockTires(): Promise<ITire[]> {
    const response: AxiosResponse<ITire[]> = await apiClient.get('/tires/low-stock');
    return response.data;
  }

  /**
   * Get inventory report (admin only)
   */
  static async getInventoryReport(params?: { startDate?: string; endDate?: string }): Promise<InventoryReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params?.endDate) {
      queryParams.append('endDate', params.endDate);
    }
    
    const response: AxiosResponse<InventoryReport> = await apiClient.get(
      `/tires/reports/inventory?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Upload image for a tire
   */
  static async uploadImage(tireId: string, file: File): Promise<ITireImage> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response: AxiosResponse<ITireImage> = await apiClient.post(
      `/tires/${tireId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  /**
   * Delete an image for a tire
   */
  static async deleteImage(tireId: string, imageId: string): Promise<void> {
    await apiClient.delete(`/tires/${tireId}/images/${imageId}`);
  }

  /**
   * Get available tire brands for filtering
   */
  static async getTireBrands(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get('/tires/brands');
    return response.data;
  }

  /**
   * Export tires to CSV (admin only)
   */
  static async exportTires(params: ITireSearchParams = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    // Add filters for export (removed - not supported in DTO)
    
    const response = await apiClient.get(`/tires/export?${queryParams.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Bulk update tire prices (admin only)
   */
  static async bulkUpdatePrices(updates: { id: string; price: number; cost?: number }[]): Promise<ITire[]> {
    const response: AxiosResponse<ITire[]> = await apiClient.put('/tires/bulk-update-prices', {
      updates,
    });
    return response.data;
  }

  /**
   * Get tire size suggestions based on input
   */
  static async getTireSizeSuggestions(query: string): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get(`/tires/sizes/suggest?q=${encodeURIComponent(query)}`);
    return response.data;
  }
}

export const tireService = new TireService();
export default TireService;