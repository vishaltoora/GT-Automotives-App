import axios from 'axios';
import { ROServiceType } from './repair-order.requests';

// @ts-ignore - Vite injects import.meta.env at build time
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  if (window.Clerk?.session) {
    const token = await window.Clerk.session.getToken({});
    if (token) {
      localStorage.setItem('authToken', token);
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  }
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ServiceCatalogItem {
  id: string;
  name: string;
  category?: string | null;
  type: ROServiceType;
  /** Default labour time in hours. Pre-fills the add-service form; adjustable. */
  labourHours: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceCatalogItemInput {
  name: string;
  category?: string;
  type?: ROServiceType;
  labourHours?: number;
  unitPrice?: number;
}

export type UpdateServiceCatalogItemInput = Partial<CreateServiceCatalogItemInput>;

export const serviceCatalogRequests = {
  async getAll(): Promise<ServiceCatalogItem[]> {
    const { data } = await apiClient.get('/repair-orders/catalog');
    return data;
  },

  async create(input: CreateServiceCatalogItemInput): Promise<ServiceCatalogItem> {
    const { data } = await apiClient.post('/repair-orders/catalog', input);
    return data;
  },

  async update(
    id: string,
    input: UpdateServiceCatalogItemInput,
  ): Promise<ServiceCatalogItem> {
    const { data } = await apiClient.patch(`/repair-orders/catalog/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/repair-orders/catalog/${id}`);
  },
};
