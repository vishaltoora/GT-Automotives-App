import axios from 'axios';
import { format } from 'date-fns';
import { AppointmentStatus } from '@gt-automotive/data';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Always try to get a fresh token from Clerk first
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken({});
        if (token) {
          localStorage.setItem('authToken', token);
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }

      // Fallback to localStorage token if Clerk not available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401 and haven't retried yet, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to get a fresh token from Clerk
        if (window.Clerk && window.Clerk.session) {
          const token = await window.Clerk.session.getToken({ skipCache: true });
          if (token) {
            localStorage.setItem('authToken', token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Clear invalid token
        localStorage.removeItem('authToken');
      }
    }

    return Promise.reject(error);
  }
);

export interface CreateAppointmentRequest {
  customerId: string;
  vehicleId?: string;
  employeeId?: string; // Deprecated: Use employeeIds instead
  employeeIds?: string[]; // Multiple employees
  scheduledDate: Date | string; // Allow string to avoid timezone issues
  scheduledTime: string;
  duration: number;
  serviceType: string;
  appointmentType: string;
  notes?: string;
}

export interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
}

export interface UpdateAppointmentRequest {
  employeeId?: string; // Deprecated: Use employeeIds instead
  employeeIds?: string[]; // Multiple employees
  scheduledDate?: Date | string; // Allow string to avoid timezone issues
  scheduledTime?: string;
  duration?: number;
  status?: AppointmentStatus;
  appointmentType?: string;
  notes?: string;
  paymentAmount?: number;
  paymentBreakdown?: PaymentEntry[]; // Array of payment entries
  paymentNotes?: string;
  expectedAmount?: number; // Expected amount for tracking partial payments
}

export interface AppointmentQueryParams {
  startDate?: Date | string; // Allow string to avoid timezone issues
  endDate?: Date | string; // Allow string to avoid timezone issues
  employeeId?: string;
  customerId?: string;
  status?: AppointmentStatus;
}

export interface CalendarQueryParams {
  startDate: Date;
  endDate: Date;
  employeeId?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  vehicleId?: string;
  employeeId?: string; // Deprecated: Use employees array instead
  scheduledDate: Date;
  scheduledTime: string;
  endTime?: string;
  duration: number;
  serviceType: string;
  appointmentType?: string;
  status: AppointmentStatus;
  notes?: string;
  paymentAmount?: number; // Total amount paid
  paymentBreakdown?: PaymentEntry[]; // Breakdown of payment methods
  paymentNotes?: string;
  expectedAmount?: number; // Expected total amount for the service (for tracking partial payments)
  paymentDate?: Date; // Date when payment was actually processed/collected (for accurate daily cash reporting)
  reminderSent: boolean;
  bookedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    businessName?: string;
    address?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  employees?: Array<{
    id: string;
    employeeId: string;
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export interface AvailableSlot {
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CheckAvailabilityRequest {
  employeeId?: string;
  date: Date | string; // Allow string to avoid timezone issues
  duration: number;
}

export const appointmentService = {
  /**
   * Create a new appointment
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    // Convert Date to YYYY-MM-DD string to avoid timezone issues
    const payload = {
      ...data,
      scheduledDate: data.scheduledDate instanceof Date
        ? data.scheduledDate.toLocaleDateString('en-CA') // en-CA format is YYYY-MM-DD
        : data.scheduledDate,
    };
    const response = await apiClient.post(`/api/appointments`, payload);
    return response.data;
  },

  /**
   * Get all appointments with filters
   */
  async getAppointments(params?: AppointmentQueryParams): Promise<Appointment[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) {
      const startDateStr = typeof params.startDate === 'string'
        ? params.startDate
        : params.startDate.toISOString();
      queryParams.append('startDate', startDateStr);
    }
    if (params?.endDate) {
      const endDateStr = typeof params.endDate === 'string'
        ? params.endDate
        : params.endDate.toISOString();
      queryParams.append('endDate', endDateStr);
    }
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/api/appointments?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get calendar view
   */
  async getCalendar(params: CalendarQueryParams): Promise<Record<string, Appointment[]>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate.toISOString(),
      endDate: params.endDate.toISOString(),
    });
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);

    const response = await apiClient.get(`/api/appointments/calendar?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get today's appointments
   */
  async getTodayAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get(`/api/appointments/today`);
    return response.data;
  },

  /**
   * Get customer's upcoming appointments
   */
  async getCustomerAppointments(customerId: string): Promise<Appointment[]> {
    const response = await apiClient.get(`/api/appointments/customer/${customerId}`);
    return response.data;
  },

  /**
   * Get single appointment by ID
   */
  async getAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.get(`/api/appointments/${id}`);
    return response.data;
  },

  /**
   * Update an appointment
   */
  async updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<Appointment> {
    // Convert Date to YYYY-MM-DD string to avoid timezone issues
    const payload = {
      ...data,
      scheduledDate: data.scheduledDate instanceof Date
        ? data.scheduledDate.toLocaleDateString('en-CA') // en-CA format is YYYY-MM-DD
        : data.scheduledDate,
    };
    const response = await apiClient.patch(`/api/appointments/${id}`, payload);
    return response.data;
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(id: string): Promise<Appointment> {
    const response = await apiClient.patch(`/api/appointments/${id}/cancel`);
    return response.data;
  },

  /**
   * Delete an appointment (admin only)
   */
  async deleteAppointment(id: string): Promise<void> {
    await apiClient.delete(`/api/appointments/${id}`);
  },

  /**
   * Check available time slots
   */
  async checkAvailability(data: CheckAvailabilityRequest): Promise<AvailableSlot[]> {
    // Convert Date to YYYY-MM-DD string to avoid timezone issues
    const payload = {
      ...data,
      date: data.date instanceof Date
        ? data.date.toLocaleDateString('en-CA') // en-CA format is YYYY-MM-DD
        : data.date,
    };
    const response = await apiClient.post(`/api/availability/check`, payload);
    return response.data;
  },

  /**
   * Check if specific employee is available
   */
  async checkEmployeeAvailability(
    employeeId: string,
    date: Date,
    startTime: string,
    duration: number
  ): Promise<{ available: boolean }> {
    const queryParams = new URLSearchParams({
      date: date.toISOString(),
      startTime,
      duration: duration.toString(),
    });
    const response = await apiClient.get(
      `/api/availability/check/${employeeId}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get appointments by payment date (for daily cash reports)
   * Sends date in YYYY-MM-DD format to avoid timezone issues
   */
  async getByPaymentDate(paymentDate: Date): Promise<Appointment[]> {
    const queryParams = new URLSearchParams({
      // Send as YYYY-MM-DD to prevent timezone conversion issues
      // Backend will interpret this as a date in business timezone (PST/PDT)
      paymentDate: format(paymentDate, 'yyyy-MM-dd'),
    });
    const response = await apiClient.get(
      `/api/appointments/by-payment-date?${queryParams.toString()}`
    );
    return response.data;
  },
};
