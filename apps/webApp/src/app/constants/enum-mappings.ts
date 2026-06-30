import {
  ExpenseCategory,
  JobStatus,
  JobType,
  PaymentMethod,
  PaymentStatus,
  PurchaseCategory,
  PurchaseInvoiceStatus,
  TireCondition,
  TireType,
} from '@gt-automotive/data';

export type EnumDisplayMeta = {
  label: string;
  description?: string;
  chipColor?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';
  icon?: string;
};

export const enumOptions = <T extends string>(
  values: Record<string, T>,
  display: Record<T, EnumDisplayMeta>
) =>
  Object.values(values).map((value) => ({
    value,
    label: display[value].label,
    description: display[value].description,
  }));

export const getEnumLabel = <T extends string>(
  display: Record<T, EnumDisplayMeta>,
  value: T
) => display[value]?.label ?? value;

// Job Status mappings
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'Pending',
  READY: 'Ready for Payment',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  PARTIALLY_PAID: 'Partially Paid',
};

export const JOB_STATUS_OPTIONS = Object.entries(JOB_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as JobStatus,
    label,
  })
);

// Job Type mappings
export const JOB_TYPE_LABELS: Record<JobType, string> = {
  REGULAR: 'Regular Work',
  OVERTIME: 'Overtime',
  BONUS: 'Bonus',
  COMMISSION: 'Commission',
  FLAT_RATE: 'Flat Rate',
  EXPENSE: 'Expense Reimbursement',
  OTHER: 'Other',
};

export const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(
  ([value, label]) => ({
    value: value as JobType,
    label,
  })
);

// Payment Status mappings
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as PaymentStatus,
    label,
  })
);

// Payment Method mappings
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash (with GST/PST)',
  CASH_NO_TAX: 'Cash (no GST/PST)',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  CHECK: 'Check',
  E_TRANSFER: 'E-Transfer',
  FINANCING: 'Financing',
  BANK_DEPOSIT: 'Bank Deposit',
};

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({
    value: value as PaymentMethod,
    label,
  })
);

export const TIRE_TYPE_DISPLAY: Record<TireType, EnumDisplayMeta> = {
  ALL_SEASON: {
    label: 'All Season',
    description: 'Balanced tire for year-round everyday driving.',
    chipColor: 'primary',
    icon: 'AS',
  },
  SUMMER: {
    label: 'Summer',
    description: 'Warm-weather tire with dry and wet road grip.',
    chipColor: 'warning',
    icon: 'SU',
  },
  WINTER: {
    label: 'Winter',
    description: 'Cold-weather tire for snow, slush, and ice.',
    chipColor: 'info',
    icon: 'WI',
  },
  WINTER_STUDDED: {
    label: 'Winter Studded',
    description: 'Winter tire with studs for severe ice traction.',
    chipColor: 'info',
    icon: 'ST',
  },
  PERFORMANCE: {
    label: 'Performance',
    description: 'Sport tire focused on handling and response.',
    chipColor: 'secondary',
    icon: 'PF',
  },
  OFF_ROAD: {
    label: 'Off Road',
    description: 'Rugged tire for dirt, gravel, and uneven terrain.',
    chipColor: 'success',
    icon: 'OR',
  },
  RUN_FLAT: {
    label: 'Run Flat',
    description: 'Reinforced tire built to keep moving after pressure loss.',
    chipColor: 'error',
    icon: 'RF',
  },
};

export const TIRE_TYPE_OPTIONS = enumOptions(TireType, TIRE_TYPE_DISPLAY);

export const TIRE_CONDITION_DISPLAY: Record<TireCondition, EnumDisplayMeta> = {
  NEW: {
    label: 'New',
    description: 'New tire inventory.',
    chipColor: 'success',
  },
  USED_EXCELLENT: {
    label: 'Used Excellent',
    description: 'Used tire in excellent condition.',
    chipColor: 'success',
  },
  USED_GOOD: {
    label: 'Used Good',
    description: 'Used tire in good condition.',
    chipColor: 'warning',
  },
  USED_FAIR: {
    label: 'Used Fair',
    description: 'Used tire with fair remaining life.',
    chipColor: 'error',
  },
};

export const TIRE_CONDITION_OPTIONS = enumOptions(
  TireCondition,
  TIRE_CONDITION_DISPLAY
);

export const PURCHASE_CATEGORY_DISPLAY: Record<
  PurchaseCategory,
  EnumDisplayMeta
> = {
  TIRES: { label: 'Tires' },
  PARTS: { label: 'Parts' },
  TOOLS: { label: 'Tools' },
  SUPPLIES: { label: 'Supplies' },
  OTHER: { label: 'Other' },
};

export const PURCHASE_CATEGORY_OPTIONS = enumOptions(
  PurchaseCategory,
  PURCHASE_CATEGORY_DISPLAY
);

export const EXPENSE_CATEGORY_DISPLAY: Record<
  ExpenseCategory,
  EnumDisplayMeta
> = {
  RENT: { label: 'Rent' },
  UTILITIES: { label: 'Utilities' },
  INSURANCE: { label: 'Insurance' },
  ADVERTISING: { label: 'Advertising' },
  OFFICE_SUPPLIES: { label: 'Office Supplies' },
  PROFESSIONAL_FEES: { label: 'Professional Fees' },
  MAINTENANCE: { label: 'Maintenance' },
  VEHICLE: { label: 'Vehicle' },
  TRAVEL: { label: 'Travel' },
  TRAINING: { label: 'Training' },
  SOFTWARE: { label: 'Software' },
  OTHER: { label: 'Other' },
};

export const EXPENSE_CATEGORY_OPTIONS = enumOptions(
  ExpenseCategory,
  EXPENSE_CATEGORY_DISPLAY
);

export const PURCHASE_INVOICE_STATUS_DISPLAY: Record<
  PurchaseInvoiceStatus,
  EnumDisplayMeta
> = {
  PENDING: { label: 'Pending', chipColor: 'warning' },
  PAID: { label: 'Paid', chipColor: 'success' },
  OVERDUE: { label: 'Overdue', chipColor: 'error' },
  CANCELLED: { label: 'Cancelled', chipColor: 'default' },
};

export const PURCHASE_INVOICE_STATUS_OPTIONS = enumOptions(
  PurchaseInvoiceStatus,
  PURCHASE_INVOICE_STATUS_DISPLAY
);
