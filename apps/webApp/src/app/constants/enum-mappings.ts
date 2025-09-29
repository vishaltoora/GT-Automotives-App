import { JobStatus, JobType, PaymentStatus, PaymentMethod } from '@prisma/client';

// Job Status mappings
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'Pending',
  READY: 'Ready for Payment',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  PARTIALLY_PAID: 'Partially Paid'
};

export const JOB_STATUS_OPTIONS = Object.entries(JOB_STATUS_LABELS).map(([value, label]) => ({
  value: value as JobStatus,
  label
}));

// Job Type mappings
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  REGULAR: 'Regular Work',
  OVERTIME: 'Overtime',
  BONUS: 'Bonus',
  COMMISSION: 'Commission',
  EXPENSE: 'Expense Reimbursement',
  OTHER: 'Other'
};

export const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
  value: value as JobType,
  label
}));

// Payment Status mappings
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled'
};

export const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
  value: value as PaymentStatus,
  label
}));

// Payment Method mappings
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  CHECK: 'Check',
  E_TRANSFER: 'E-Transfer',
  FINANCING: 'Financing'
};

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
  value: value as PaymentMethod,
  label
}));