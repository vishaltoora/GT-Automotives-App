import {
  CreateJobDto,
  UpdateJobDto,
  JobResponseDto,
  JobSummaryDto,
  JobStatus,
  JobType
} from '@gt-automotive/data';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  clerkTokenGetter = getter;
}

class JobService {
  private baseUrl = `${API_BASE_URL}/api/jobs`;

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    let token = '';

    if (clerkTokenGetter) {
      try {
        const clerkToken = await clerkTokenGetter();

        if (!clerkToken) {
          console.error('[JobService] Clerk token is null or empty');
          throw new Error('No authentication token available');
        }

        token = clerkToken;
      } catch (error) {
        console.error('[JobService] Failed to get Clerk token:', error);
        throw new Error('Authentication failed. Please try logging out and back in.');
      }
    } else {
      console.warn('[JobService] No clerkTokenGetter available');
    }

    try {
      // Add timeout for mobile networks (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('[JobService] Error response:', errorData);
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

      const data = JSON.parse(text);
      return data;
    } catch (error: any) {
      console.error('[JobService] Request failed:', error);
      // Provide better error messages for common mobile/network issues
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      // Re-throw the original error if it's already formatted
      throw error;
    }
  }

  async createJob(jobData: CreateJobDto): Promise<JobResponseDto> {
    return this.makeRequest<JobResponseDto>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getJobs(filters?: {
    employeeId?: string;
    status?: JobStatus;
    jobType?: JobType;
    startDate?: string;
    endDate?: string;
  }): Promise<JobResponseDto[]> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams}` : this.baseUrl;
    return this.makeRequest<JobResponseDto[]>(url);
  }

  async getJob(id: string): Promise<JobResponseDto> {
    return this.makeRequest<JobResponseDto>(`${this.baseUrl}/${id}`);
  }

  async updateJob(id: string, updates: UpdateJobDto): Promise<JobResponseDto> {
    return this.makeRequest<JobResponseDto>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id: string): Promise<void> {
    await this.makeRequest<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  async markJobComplete(id: string): Promise<JobResponseDto> {
    return this.makeRequest<JobResponseDto>(`${this.baseUrl}/${id}/complete`, {
      method: 'PATCH',
    });
  }

  async getJobsByEmployee(employeeId: string): Promise<JobResponseDto[]> {
    return this.makeRequest<JobResponseDto[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  // Secure endpoint for staff to get their own jobs (uses token)
  async getMyJobs(): Promise<JobResponseDto[]> {
    return this.makeRequest<JobResponseDto[]>(`${this.baseUrl}/my-jobs`);
  }

  // Secure endpoint for staff to get their own job summary (uses token)
  async getMyJobSummary(): Promise<JobSummaryDto> {
    return this.makeRequest<JobSummaryDto>(`${this.baseUrl}/my-summary`);
  }

  async getPendingJobs(): Promise<JobResponseDto[]> {
    return this.makeRequest<JobResponseDto[]>(`${this.baseUrl}/pending`);
  }

  async getJobsReadyForPayment(): Promise<JobResponseDto[]> {
    return this.makeRequest<JobResponseDto[]>(`${this.baseUrl}/ready-for-payment`);
  }

  async getJobSummary(employeeId?: string): Promise<JobSummaryDto> {
    const url = employeeId
      ? `${this.baseUrl}/summary?employeeId=${employeeId}`
      : `${this.baseUrl}/summary`;
    return this.makeRequest<JobSummaryDto>(url);
  }
}

export const jobService = new JobService();
export default jobService;