import { AxiosResponse } from 'axios';
import { catalogApiClient as apiClient } from './catalog-api-client';

export interface TireBrand {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTireBrandDto {
  name: string;
  imageUrl?: string;
}

export interface UpdateTireBrandDto {
  name?: string;
  imageUrl?: string;
}

export class TireBrandService {
  private static readonly BASE_URL = '/tires/brands';

  static async getAll(): Promise<TireBrand[]> {
    const response: AxiosResponse<TireBrand[]> = await apiClient.get(
      `${this.BASE_URL}/all`
    );
    return response.data;
  }

  static async getBrands(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get(
      `${this.BASE_URL}`
    );
    return response.data;
  }

  static async create(data: CreateTireBrandDto): Promise<TireBrand> {
    const response: AxiosResponse<TireBrand> = await apiClient.post(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  static async update(
    id: string,
    data: UpdateTireBrandDto
  ): Promise<TireBrand> {
    const response: AxiosResponse<TireBrand> = await apiClient.put(
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
