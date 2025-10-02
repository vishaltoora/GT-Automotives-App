import axios, { AxiosResponse } from 'axios';


// @ts-ignore
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
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export interface TireSize {
  id: string;
  size: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTireSizeDto {
  size: string;
}

export interface UpdateTireSizeDto {
  size?: string;
}

export class TireSizeService {
  private static readonly BASE_URL = '/tires/sizes';

  static async getAll(): Promise<TireSize[]> {
    const response: AxiosResponse<TireSize[]> = await apiClient.get(`${this.BASE_URL}/all`);
    return response.data;
  }

  static async getSizes(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get(`${this.BASE_URL}`);
    return response.data;
  }

  static async create(data: CreateTireSizeDto): Promise<TireSize> {
    const response: AxiosResponse<TireSize> = await apiClient.post(this.BASE_URL, data);
    return response.data;
  }

  static async update(id: string, data: UpdateTireSizeDto): Promise<TireSize> {
    const response: AxiosResponse<TireSize> = await apiClient.put(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> = await apiClient.delete(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}