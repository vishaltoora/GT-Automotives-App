import axios from 'axios';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor for authentication
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (window.Clerk && window.Clerk.session) {
        const token = await window.Clerk.session.getToken({});
        if (token) {
          localStorage.setItem('authToken', token);
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }

      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface PeriodAnalytics {
  count: number;
  total: number;
}

export interface AnalyticsData {
  mtd: {
    purchases: PeriodAnalytics;
    expenses: PeriodAnalytics;
    salesInvoices: PeriodAnalytics;
    combined: PeriodAnalytics;
  };
  ytd: {
    purchases: PeriodAnalytics;
    expenses: PeriodAnalytics;
    salesInvoices: PeriodAnalytics;
    combined: PeriodAnalytics;
  };
}

class AnalyticsService {
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>('/reports/analytics');
    return response.data;
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
