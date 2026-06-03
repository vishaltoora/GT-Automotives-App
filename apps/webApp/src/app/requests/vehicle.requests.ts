import axios from 'axios';
import type {
  CreateVehicleDto,
  DecodeVinResponseDto,
  UpdateVehicleDto,
  VehicleResponseDto,
} from '@gt-automotive/data';

export type Vehicle = VehicleResponseDto;
export type DecodeVinResponse = DecodeVinResponseDto;
export type { CreateVehicleDto, UpdateVehicleDto };

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class VehicleService {
  private async getAuthHeader() {
    let token: string | null = null;

    if (window.Clerk?.session) {
      token = await window.Clerk.session.getToken({});
      if (token) {
        localStorage.setItem('authToken', token);
      }
    }

    token = token || localStorage.getItem('authToken');

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    const response = await axios.get(`${API_URL}/api/vehicles`, {
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await axios.get(`${API_URL}/api/vehicles/${id}`, {
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    const response = await axios.get(`${API_URL}/api/vehicles/customer/${customerId}`, {
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const response = await axios.post(`${API_URL}/api/vehicles`, data, {
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async updateVehicle(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    const response = await axios.patch(`${API_URL}/api/vehicles/${id}`, data, {
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async updateMileage(id: string, mileage: number): Promise<Vehicle> {
    const response = await axios.patch(`${API_URL}/api/vehicles/${id}/mileage`, 
      { mileage },
      { headers: await this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/vehicles/${id}`, {
      headers: await this.getAuthHeader(),
    });
  }

  async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    const response = await axios.get(`${API_URL}/api/vehicles/search`, {
      params: { q: searchTerm },
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async decodeVin(vin: string, modelYear?: number): Promise<DecodeVinResponse> {
    const response = await axios.get(`${API_URL}/api/vehicles/decode-vin/${encodeURIComponent(vin)}`, {
      params: modelYear ? { modelYear } : undefined,
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }

  async getModelsForMake(make: string): Promise<string[]> {
    const response = await axios.get(`${API_URL}/api/vehicles/models`, {
      params: { make },
      headers: await this.getAuthHeader(),
    });
    return response.data;
  }
}

export const vehicleService = new VehicleService();
