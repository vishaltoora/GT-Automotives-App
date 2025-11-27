import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateTerminalCheckoutDto {
  invoiceId: string;
  amount: number;
  deviceId: string;
  currency?: string;
}

export interface TerminalCheckoutResponse {
  checkoutId: string;
  status: string;
  deviceId: string;
  amount: number;
  invoiceId: string;
  createdAt: string;
}

export interface TerminalDevice {
  id: string;
  name: string;
  code: string;
  status: string;
  deviceType: string;
}

export const squareTerminalService = {
  /**
   * List available Square Terminal devices at the location
   */
  async listDevices(): Promise<TerminalDevice[]> {
    const token = await getAuthToken();
    const response = await axios.get<TerminalDevice[]>(
      `${API_URL}/api/square/payments/terminal/devices`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Create a Terminal checkout (sends payment request to Square device)
   */
  async createCheckout(
    checkoutData: CreateTerminalCheckoutDto
  ): Promise<TerminalCheckoutResponse> {
    const token = await getAuthToken();
    const response = await axios.post<TerminalCheckoutResponse>(
      `${API_URL}/api/square/payments/terminal/checkout`,
      checkoutData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Get Terminal checkout status
   */
  async getCheckoutStatus(checkoutId: string): Promise<any> {
    const token = await getAuthToken();
    const response = await axios.get(
      `${API_URL}/api/square/payments/terminal/checkout/${checkoutId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Cancel a Terminal checkout
   */
  async cancelCheckout(checkoutId: string): Promise<void> {
    const token = await getAuthToken();
    await axios.post(
      `${API_URL}/api/square/payments/terminal/checkout/${checkoutId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
