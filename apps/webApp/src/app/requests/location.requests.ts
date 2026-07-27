import { AxiosResponse } from 'axios';
import { catalogApiClient as apiClient } from './catalog-api-client';

export interface Location {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationDto {
  name: string;
}

export interface UpdateLocationDto {
  name?: string;
}

export class LocationService {
  private static readonly BASE_URL = '/tires/locations';

  static async getAll(): Promise<Location[]> {
    const response: AxiosResponse<Location[]> = await apiClient.get(
      `${this.BASE_URL}/all`
    );
    return response.data;
  }

  static async getLocations(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await apiClient.get(
      `${this.BASE_URL}`
    );
    return response.data;
  }

  static async create(data: CreateLocationDto): Promise<Location> {
    const response: AxiosResponse<Location> = await apiClient.post(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  static async update(id: string, data: UpdateLocationDto): Promise<Location> {
    const response: AxiosResponse<Location> = await apiClient.put(
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
