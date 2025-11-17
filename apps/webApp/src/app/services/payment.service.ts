import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
  PaymentSummaryDto,
  ProcessPaymentDto,
  PaymentStatus,
  PaymentMethod
} from '@gt-automotive/data';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  clerkTokenGetter = getter;
}

class PaymentService {
  private baseUrl = `${API_BASE_URL}/api/payments`;

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    let token = '';

    if (clerkTokenGetter) {
      try {
        const clerkToken = await clerkTokenGetter();
        token = clerkToken || '';
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (like DELETE operations)
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return null as T;
    }

    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text);
  }

  async createPayment(paymentData: CreatePaymentDto): Promise<PaymentResponseDto> {
    return this.makeRequest<PaymentResponseDto>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async processPayment(paymentData: ProcessPaymentDto): Promise<PaymentResponseDto> {
    return this.makeRequest<PaymentResponseDto>(`${this.baseUrl}/process`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayments(filters?: {
    employeeId?: string;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
  }): Promise<PaymentResponseDto[]> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams}` : this.baseUrl;
    return this.makeRequest<PaymentResponseDto[]>(url);
  }

  async getPayment(id: string): Promise<PaymentResponseDto> {
    return this.makeRequest<PaymentResponseDto>(`${this.baseUrl}/${id}`);
  }

  async updatePayment(id: string, updates: UpdatePaymentDto): Promise<PaymentResponseDto> {
    return this.makeRequest<PaymentResponseDto>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deletePayment(id: string): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  async revertPaymentStatus(id: string): Promise<PaymentResponseDto> {
    return this.makeRequest<PaymentResponseDto>(`${this.baseUrl}/${id}/revert-status`, {
      method: 'PATCH',
    });
  }

  async getPaymentsByEmployee(employeeId: string): Promise<PaymentResponseDto[]> {
    return this.makeRequest<PaymentResponseDto[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  async getPaymentsByJob(jobId: string): Promise<PaymentResponseDto[]> {
    return this.makeRequest<PaymentResponseDto[]>(`${this.baseUrl}/job/${jobId}`);
  }

  async getPendingPayments(): Promise<PaymentResponseDto[]> {
    return this.makeRequest<PaymentResponseDto[]>(`${this.baseUrl}/pending`);
  }

  async getPaymentSummary(employeeId?: string): Promise<PaymentSummaryDto> {
    const url = employeeId
      ? `${this.baseUrl}/summary?employeeId=${employeeId}`
      : `${this.baseUrl}/summary`;
    return this.makeRequest<PaymentSummaryDto>(url);
  }

  // Secure endpoint for staff to get their own summary (uses token)
  async getMyPaymentSummary(): Promise<PaymentSummaryDto> {
    return this.makeRequest<PaymentSummaryDto>(`${this.baseUrl}/my-summary`);
  }

  // Secure endpoint for staff to get their own payments (uses token)
  async getMyPayments(): Promise<PaymentResponseDto[]> {
    return this.makeRequest<PaymentResponseDto[]>(`${this.baseUrl}/my-payments`);
  }

  async getPayrollReport(startDate: string, endDate: string, employeeId?: string): Promise<any> {
    const searchParams = new URLSearchParams({ startDate, endDate });
    if (employeeId) searchParams.append('employeeId', employeeId);

    return this.makeRequest<any>(`${this.baseUrl}/payroll-report?${searchParams}`);
  }

  /**
   * Get payments processed on a specific date (for EOD summary)
   */
  async getByPaymentDate(paymentDate: Date | string): Promise<PaymentResponseDto[]> {
    const dateStr = typeof paymentDate === 'string'
      ? paymentDate
      : paymentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    return this.makeRequest<PaymentResponseDto[]>(`${this.baseUrl}/by-payment-date?paymentDate=${dateStr}`);
  }
}

export const paymentService = new PaymentService();
export default paymentService;