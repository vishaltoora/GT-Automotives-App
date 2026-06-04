import {
  ClockInDto,
  ClockOutDto,
  CreatePayrollAdjustmentDto,
  EmployeeCompensationDto,
  PayrollAdjustmentDto,
  ProcessPayrollDto,
  PayrollSummaryDto,
  StartBreakDto,
  TimeEntryDto,
  TimeEntryStatus,
  UpdateTimeEntryDto,
  UpsertEmployeeCompensationDto,
} from '@gt-automotive/data';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  clerkTokenGetter = getter;
}

class TimeClockService {
  private baseUrl = `${API_BASE_URL}/api/time-clock`;

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = clerkTokenGetter ? await clerkTokenGetter() : localStorage.getItem('authToken');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null as T;
  }

  clockIn(dto: ClockInDto = {}): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/clock-in`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  adminClockIn(employeeId: string, dto: ClockInDto = {}): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/employees/${employeeId}/clock-in`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  adminClockOut(employeeId: string, dto: ClockOutDto = {}): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/employees/${employeeId}/clock-out`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  startBreak(dto: StartBreakDto = {}): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/start-break`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  endBreak(): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/end-break`, {
      method: 'POST',
    });
  }

  clockOut(dto: ClockOutDto = {}): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/clock-out`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  getMyCurrent(): Promise<TimeEntryDto | null> {
    return this.makeRequest<TimeEntryDto | null>(`${this.baseUrl}/my-current`);
  }

  getMyEntries(filters?: { startDate?: string; endDate?: string; status?: TimeEntryStatus }): Promise<TimeEntryDto[]> {
    return this.makeRequest<TimeEntryDto[]>(`${this.baseUrl}/my-entries${this.toQuery(filters)}`);
  }

  getCurrentEntries(): Promise<TimeEntryDto[]> {
    return this.makeRequest<TimeEntryDto[]>(`${this.baseUrl}/current`);
  }

  getEntries(filters?: { employeeId?: string; startDate?: string; endDate?: string; status?: TimeEntryStatus }): Promise<TimeEntryDto[]> {
    return this.makeRequest<TimeEntryDto[]>(`${this.baseUrl}/entries${this.toQuery(filters)}`);
  }

  updateEntry(id: string, dto: UpdateTimeEntryDto): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  approveEntry(id: string): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/entries/${id}/approve`, {
      method: 'POST',
    });
  }

  voidEntry(id: string, reason: string): Promise<TimeEntryDto> {
    return this.makeRequest<TimeEntryDto>(`${this.baseUrl}/entries/${id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  getCompensation(employeeId: string): Promise<EmployeeCompensationDto | null> {
    return this.makeRequest<EmployeeCompensationDto | null>(`${this.baseUrl}/employees/${employeeId}/compensation`);
  }

  getMyCompensation(): Promise<EmployeeCompensationDto | null> {
    return this.makeRequest<EmployeeCompensationDto | null>(`${this.baseUrl}/my-compensation`);
  }

  updateCompensation(employeeId: string, dto: UpsertEmployeeCompensationDto): Promise<EmployeeCompensationDto> {
    return this.makeRequest<EmployeeCompensationDto>(`${this.baseUrl}/employees/${employeeId}/compensation`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  createAdjustment(dto: CreatePayrollAdjustmentDto): Promise<PayrollAdjustmentDto> {
    return this.makeRequest<PayrollAdjustmentDto>(`${this.baseUrl}/adjustments`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  getPayrollSummary(filters: { startDate: string; endDate: string; employeeId?: string }): Promise<PayrollSummaryDto> {
    return this.makeRequest<PayrollSummaryDto>(`${this.baseUrl}/payroll-summary${this.toQuery(filters)}`);
  }

  processPayroll(dto: ProcessPayrollDto): Promise<{ employeeId: string; processedEntries: number; processedHours: number; grossPay: number; processedAt: string }> {
    return this.makeRequest(`${this.baseUrl}/process-payroll`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  private toQuery(filters?: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString();
    return query ? `?${query}` : '';
  }
}

export const timeClockService = new TimeClockService();
export default timeClockService;
