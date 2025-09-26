import axios from 'axios';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
  customer?: {
    id: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  };
  _count?: {
    invoices: number;
    appointments: number;
  };
  stats?: {
    serviceCount: number;
    totalSpent: number;
    lastServiceDate: Date | null;
    nextAppointment: any | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
}

export interface UpdateVehicleDto {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  licensePlate?: string;
  mileage?: number;
}

class VehicleService {
  private getAuthHeader() {
    // In production, get the actual token from Clerk
    const token = localStorage.getItem('authToken') || 'mock-jwt-token';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    const response = await axios.get(`${API_URL}/api/vehicles`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async getVehicle(id: string): Promise<Vehicle> {
    const response = await axios.get(`${API_URL}/api/vehicles/${id}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    const response = await axios.get(`${API_URL}/api/vehicles/customer/${customerId}`, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async createVehicle(data: CreateVehicleDto): Promise<Vehicle> {
    const response = await axios.post(`${API_URL}/api/vehicles`, data, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateVehicle(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    const response = await axios.patch(`${API_URL}/api/vehicles/${id}`, data, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateMileage(id: string, mileage: number): Promise<Vehicle> {
    const response = await axios.patch(`${API_URL}/api/vehicles/${id}/mileage`, 
      { mileage },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteVehicle(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/vehicles/${id}`, {
      headers: this.getAuthHeader(),
    });
  }

  async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    const response = await axios.get(`${API_URL}/api/vehicles/search`, {
      params: { q: searchTerm },
      headers: this.getAuthHeader(),
    });
    return response.data;
  }
}

export const vehicleService = new VehicleService();