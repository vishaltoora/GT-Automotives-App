import {
  CreatePayStubDto,
  PayStubDeductionEstimateDto,
  PayStubDeductionEstimateRequestDto,
  PayStubDto,
  UpdatePayStubDto,
} from '@gt-automotive/data';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: () => Promise<string | null>) {
  clerkTokenGetter = getter;
}

class PayStubService {
  private baseUrl = `${API_BASE_URL}/api/pay-stubs`;

  private async getToken() {
    return clerkTokenGetter
      ? await clerkTokenGetter()
      : localStorage.getItem('authToken');
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    if (response.status === 204) {
      return null as T;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : (null as T);
  }

  /**
   * What the CRA formulas say should be withheld for a given gross. Only ever
   * a suggestion — the accountant confirms or overrides it before saving.
   */
  /** What an employee currently has banked in vacation. */
  getVacationBalance(
    employeeId: string
  ): Promise<{ employeeId: string; balance: number }> {
    return this.makeRequest<{ employeeId: string; balance: number }>(
      `${this.baseUrl}/employees/${employeeId}/vacation-balance`
    );
  }

  estimateDeductions(
    dto: PayStubDeductionEstimateRequestDto
  ): Promise<PayStubDeductionEstimateDto> {
    return this.makeRequest<PayStubDeductionEstimateDto>(
      `${this.baseUrl}/deduction-estimate`,
      { method: 'POST', body: JSON.stringify(dto) }
    );
  }

  /**
   * Correct an issued stub. Send only the fields that are wrong; the server
   * recomputes the totals and rewrites the year-to-date chain.
   */
  update(id: string, dto: UpdatePayStubDto): Promise<PayStubDto> {
    return this.makeRequest<PayStubDto>(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  create(dto: CreatePayStubDto): Promise<PayStubDto> {
    return this.makeRequest<PayStubDto>(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  findAll(employeeId?: string): Promise<PayStubDto[]> {
    const query = employeeId
      ? `?employeeId=${encodeURIComponent(employeeId)}`
      : '';
    return this.makeRequest<PayStubDto[]>(`${this.baseUrl}${query}`);
  }

  /** The signed-in employee's own pay stubs. */
  findMine(): Promise<PayStubDto[]> {
    return this.makeRequest<PayStubDto[]>(`${this.baseUrl}/mine`);
  }

  findOne(id: string): Promise<PayStubDto> {
    return this.makeRequest<PayStubDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Fetch the rendered stub as a PDF blob.
   *
   * Goes through fetch rather than pointing an <iframe> straight at the URL,
   * because the endpoint needs an Authorization header — a bare URL would be
   * unauthenticated, and pay stubs must never be reachable without a token.
   * The caller is responsible for revoking the object URL it creates.
   */
  async fetchPdfBlob(id: string): Promise<Blob> {
    const token = await this.getToken();
    const response = await fetch(`${this.baseUrl}/${id}/pdf`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Unable to generate the pay stub PDF' }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.blob();
  }
}

export const payStubService = new PayStubService();
