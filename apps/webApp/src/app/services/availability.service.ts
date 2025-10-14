import axios from 'axios';

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

export interface SetAvailabilityRequest {
  employeeId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "09:00" format
  endTime: string; // "17:00" format
  isAvailable: boolean;
}

export interface TimeSlotOverrideRequest {
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface EmployeeAvailability {
  id: string;
  employeeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlotOverride {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const availabilityService = {
  /**
   * Set or update recurring availability for an employee
   */
  async setRecurringAvailability(data: SetAvailabilityRequest): Promise<EmployeeAvailability> {
    const response = await apiClient.post(`/api/availability/recurring`, data);
    return response.data;
  },

  /**
   * Get employee's recurring availability
   */
  async getEmployeeAvailability(employeeId: string): Promise<EmployeeAvailability[]> {
    const response = await apiClient.get(`/api/availability/recurring/${employeeId}`);
    return response.data;
  },

  /**
   * Add a time slot override (vacation, sick day, extra shift)
   */
  async addOverride(data: TimeSlotOverrideRequest): Promise<TimeSlotOverride> {
    const response = await apiClient.post(`/api/availability/override`, data);
    return response.data;
  },

  /**
   * Get overrides for an employee within a date range
   */
  async getOverrides(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlotOverride[]> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    const response = await apiClient.get(
      `/api/availability/override/${employeeId}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Delete an override
   */
  async deleteOverride(overrideId: string): Promise<void> {
    await apiClient.delete(`/api/availability/override/${overrideId}`);
  },
};
