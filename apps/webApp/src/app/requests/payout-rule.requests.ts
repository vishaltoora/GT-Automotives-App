import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    if ((window as any).Clerk?.session) {
      const token = await (window as any).Clerk.session.getToken({});
      if (token) {
        localStorage.setItem('authToken', token);
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    }
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    console.error('Failed to get auth token:', e);
  }
  return config;
});

export interface PayoutRule {
  id: string;
  triggerAmount: number;
  payoutAmount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePayoutRuleDto {
  triggerAmount: number;
  payoutAmount: number;
  description?: string;
  isActive?: boolean;
}

export type UpdatePayoutRuleDto = Partial<CreatePayoutRuleDto>;

export const DEFAULT_PAYOUT_PERCENTAGE = 0.3;

export const calculatePayoutPreview = (
  amount: number,
  rules: PayoutRule[],
): number => {
  if (!amount || amount <= 0) return 0;
  const match = rules.find(
    (r) => r.isActive && Number(r.triggerAmount) === Number(amount),
  );
  if (match) return Number(match.payoutAmount);
  return Math.round(amount * DEFAULT_PAYOUT_PERCENTAGE * 100) / 100;
};

export const payoutRuleService = {
  async list(): Promise<PayoutRule[]> {
    const res = await apiClient.get('/api/payout-rules');
    return res.data;
  },
  async create(dto: CreatePayoutRuleDto): Promise<PayoutRule> {
    const res = await apiClient.post('/api/payout-rules', dto);
    return res.data;
  },
  async update(id: string, dto: UpdatePayoutRuleDto): Promise<PayoutRule> {
    const res = await apiClient.patch(`/api/payout-rules/${id}`, dto);
    return res.data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/payout-rules/${id}`);
  },
};
