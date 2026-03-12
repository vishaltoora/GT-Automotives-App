import axios from 'axios';
import { PaymentMethod, TireType, TireCondition, CommissionStatus } from '../../enums';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper to get fresh token from Clerk
let getClerkToken: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  getClerkToken = getter;
}

// ============================================
// Types
// ============================================

export interface TireSaleItemRequest {
  tireId: string;
  quantity: number;
  unitPrice: number;
}

export interface CustomerDataRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  businessName?: string;
  address?: string;
}

export interface CreateTireSaleRequest {
  items: TireSaleItemRequest[];
  paymentMethod: PaymentMethod;
  customerId?: string;
  customerData?: CustomerDataRequest;
  soldById?: string;
  notes?: string;
}

export interface UpdateTireSaleRequest {
  soldById?: string;
  notes?: string;
}

export interface TireSaleItem {
  id: string;
  tireId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tireBrand: string;
  tireSize: string;
  tireType: TireType;
  tireCondition: TireCondition;
}

export interface TireSaleSeller {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface TireSaleCustomer {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  phone?: string | null;
}

export interface TireSaleInvoice {
  id: string;
  invoiceNumber: string;
}

export interface TireSale {
  id: string;
  saleNumber: string;
  soldBy: TireSaleSeller;
  customer?: TireSaleCustomer | null;
  invoice?: TireSaleInvoice | null;
  paymentMethod: PaymentMethod;
  items: TireSaleItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  commissionStatus: CommissionStatus;
  commissionPaidAt?: string | null;
  notes?: string | null;
  saleDate: string;
  createdAt: string;
}

export interface TireSaleFilters {
  soldById?: string;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  commissionStatus?: CommissionStatus;
  page?: number;
  limit?: number;
}

export interface TireSaleListResponse {
  items: TireSale[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeCommissionSummary {
  employeeId: string;
  employeeName: string;
  totalTiresSold: number;
  totalSalesAmount: number;
  commissionRate: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface CommissionReport {
  startDate: string;
  endDate: string;
  employees: EmployeeCommissionSummary[];
  totals: {
    totalTiresSold: number;
    totalSalesAmount: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
  };
}

export interface MonthlyStats {
  totalTiresSold: number;
  currentRate: number;
  nextThreshold: number | null;
  tiresToNextThreshold: number | null;
}

// ============================================
// API Service
// ============================================

export const TireSaleService = {
  /**
   * Create a new tire sale
   */
  async create(data: CreateTireSaleRequest): Promise<TireSale> {
    // Get fresh token
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const response = await axios.post(`${API_URL}/api/tire-sales`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Update a tire sale (change salesperson)
   */
  async update(id: string, data: UpdateTireSaleRequest): Promise<TireSale> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const response = await axios.patch(`${API_URL}/api/tire-sales/${id}`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  /**
   * Get all tire sales with filters
   */
  async getAll(filters?: TireSaleFilters): Promise<TireSaleListResponse> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const params = new URLSearchParams();
    if (filters?.soldById) params.append('soldById', filters.soldById);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.commissionStatus) params.append('commissionStatus', filters.commissionStatus);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await axios.get(`${API_URL}/api/tire-sales?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  /**
   * Get my tire sales (for staff)
   */
  async getMySales(filters?: TireSaleFilters): Promise<TireSaleListResponse> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const params = new URLSearchParams();
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.commissionStatus) params.append('commissionStatus', filters.commissionStatus);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await axios.get(`${API_URL}/api/tire-sales/my-sales?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  /**
   * Get my monthly stats
   */
  async getMyStats(year?: number, month?: number): Promise<MonthlyStats> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));

    const response = await axios.get(`${API_URL}/api/tire-sales/my-stats?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  /**
   * Get employee stats (admin only - for viewing other employee's stats)
   */
  async getEmployeeStats(employeeId: string, year?: number, month?: number): Promise<MonthlyStats> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));

    const response = await axios.get(`${API_URL}/api/tire-sales/employee-stats/${employeeId}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  /**
   * Get single tire sale by ID
   */
  async getById(id: string): Promise<TireSale> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const response = await axios.get(`${API_URL}/api/tire-sales/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  },

  /**
   * Get commission report
   */
  async getCommissionReport(filters?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }): Promise<CommissionReport> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);

    const response = await axios.get(
      `${API_URL}/api/tire-sales/reports/commissions?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Approve commission for payment
   */
  async approveCommission(id: string): Promise<TireSale> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const response = await axios.post(
      `${API_URL}/api/tire-sales/${id}/approve-commission`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Process all pending commissions for an employee (creates ONE job for total)
   */
  async processEmployeeCommissions(
    employeeId: string,
    year?: number,
    month?: number
  ): Promise<{ jobId: string; totalAmount: number; salesCount: number }> {
    const token = localStorage.getItem('authToken');
    let authToken = token;

    if (getClerkToken) {
      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          authToken = clerkToken;
        }
      } catch {
        // Fall back to localStorage token
      }
    }

    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));

    const response = await axios.post(
      `${API_URL}/api/tire-sales/process-commissions/${employeeId}?${params.toString()}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  },
};
