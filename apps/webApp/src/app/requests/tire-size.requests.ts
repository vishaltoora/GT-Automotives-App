import { AxiosResponse } from 'axios';
import { catalogApiClient as apiClient } from './catalog-api-client';

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
    const response: AxiosResponse<TireSize[]> = await apiClient.get(
      `${this.BASE_URL}/all`
    );
    return response.data;
  }

  static async getSizes(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get(
      `${this.BASE_URL}`
    );
    return response.data;
  }

  static async create(data: CreateTireSizeDto): Promise<TireSize> {
    const response: AxiosResponse<TireSize> = await apiClient.post(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  static async update(id: string, data: UpdateTireSizeDto): Promise<TireSize> {
    const response: AxiosResponse<TireSize> = await apiClient.put(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  static async delete(id: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<{ success: boolean }> =
      await apiClient.delete(`${this.BASE_URL}/${id}`);
    return response.data;
  }
}
