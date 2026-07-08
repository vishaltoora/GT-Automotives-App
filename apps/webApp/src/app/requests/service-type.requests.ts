import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the Clerk/localStorage auth token to every request.
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

export interface ServiceType {
  id: string;
  code: string;
  name: string;
  duration: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceTypeInput {
  code?: string;
  name: string;
  duration: number;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateServiceTypeInput = Partial<CreateServiceTypeInput>;

export const serviceTypeService = {
  async list(activeOnly = false): Promise<ServiceType[]> {
    const response = await apiClient.get<ServiceType[]>('/service-types', {
      params: activeOnly ? { activeOnly: 'true' } : undefined,
    });
    return response.data;
  },

  // Unauthenticated endpoint for the public booking form (active types only).
  async listPublic(): Promise<ServiceType[]> {
    const response = await apiClient.get<ServiceType[]>(
      '/service-types/public'
    );
    return response.data;
  },

  async create(input: CreateServiceTypeInput): Promise<ServiceType> {
    const response = await apiClient.post<ServiceType>('/service-types', input);
    return response.data;
  },

  async update(
    id: string,
    input: UpdateServiceTypeInput
  ): Promise<ServiceType> {
    const response = await apiClient.put<ServiceType>(
      `/service-types/${id}`,
      input
    );
    return response.data;
  },

  async remove(id: string): Promise<ServiceType> {
    const response = await apiClient.delete<ServiceType>(
      `/service-types/${id}`
    );
    return response.data;
  },
};
