// This file is generated from libs/database/src/lib/prisma/schema.prisma.

// Run `yarn enums:generate` after changing Prisma enums.



export const PayType = {
  HOURLY: 'HOURLY',
  SALARIED: 'SALARIED',
} as const;
export type PayType = (typeof PayType)[keyof typeof PayType];

export const TimeEntryStatus = {
  OPEN: 'OPEN',
  ON_BREAK: 'ON_BREAK',
  CLOCKED_OUT: 'CLOCKED_OUT',
  APPROVED: 'APPROVED',
  ADJUSTED: 'ADJUSTED',
  VOIDED: 'VOIDED',
} as const;
export type TimeEntryStatus = (typeof TimeEntryStatus)[keyof typeof TimeEntryStatus];

export const TimeEntrySource = {
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
} as const;
export type TimeEntrySource = (typeof TimeEntrySource)[keyof typeof TimeEntrySource];

export const BreakType = {
  MEAL: 'MEAL',
  REST: 'REST',
  PERSONAL: 'PERSONAL',
  OTHER: 'OTHER',
} as const;
export type BreakType = (typeof BreakType)[keyof typeof BreakType];

export const PayrollAdjustmentType = {
  BONUS: 'BONUS',
  REIMBURSEMENT: 'REIMBURSEMENT',
  DEDUCTION: 'DEDUCTION',
  OTHER: 'OTHER',
} as const;
export type PayrollAdjustmentType = (typeof PayrollAdjustmentType)[keyof typeof PayrollAdjustmentType];

export const JobStatus = {
  PENDING: 'PENDING',
  READY: 'READY',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const JobType = {
  REGULAR: 'REGULAR',
  OVERTIME: 'OVERTIME',
  BONUS: 'BONUS',
  COMMISSION: 'COMMISSION',
  FLAT_RATE: 'FLAT_RATE',
  EXPENSE: 'EXPENSE',
  OTHER: 'OTHER',
} as const;
export type JobType = (typeof JobType)[keyof typeof JobType];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const SquarePaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  APPROVED: 'APPROVED',
  CANCELED: 'CANCELED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIAL_REFUND: 'PARTIAL_REFUND',
} as const;
export type SquarePaymentStatus = (typeof SquarePaymentStatus)[keyof typeof SquarePaymentStatus];

export const PeriodType = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const;
export type PeriodType = (typeof PeriodType)[keyof typeof PeriodType];

export const RoleName = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  SUPERVISOR: 'SUPERVISOR',
  ACCOUNTANT: 'ACCOUNTANT',
  ADMIN: 'ADMIN',
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const TireType = {
  ALL_SEASON: 'ALL_SEASON',
  SUMMER: 'SUMMER',
  WINTER: 'WINTER',
  WINTER_STUDDED: 'WINTER_STUDDED',
  PERFORMANCE: 'PERFORMANCE',
  OFF_ROAD: 'OFF_ROAD',
  RUN_FLAT: 'RUN_FLAT',
} as const;
export type TireType = (typeof TireType)[keyof typeof TireType];

export const TireCondition = {
  NEW: 'NEW',
  USED_EXCELLENT: 'USED_EXCELLENT',
  USED_GOOD: 'USED_GOOD',
  USED_FAIR: 'USED_FAIR',
} as const;
export type TireCondition = (typeof TireCondition)[keyof typeof TireCondition];

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  CHECK: 'CHECK',
  E_TRANSFER: 'E_TRANSFER',
  FINANCING: 'FINANCING',
  BANK_DEPOSIT: 'BANK_DEPOSIT',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const InvoiceItemType = {
  TIRE: 'TIRE',
  SERVICE: 'SERVICE',
  PART: 'PART',
  OTHER: 'OTHER',
  LEVY: 'LEVY',
  DISCOUNT: 'DISCOUNT',
  DISCOUNT_PERCENTAGE: 'DISCOUNT_PERCENTAGE',
  TIPS: 'TIPS',
} as const;
export type InvoiceItemType = (typeof InvoiceItemType)[keyof typeof InvoiceItemType];

export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const AppointmentType = {
  AT_GARAGE: 'AT_GARAGE',
  MOBILE_SERVICE: 'MOBILE_SERVICE',
} as const;
export type AppointmentType = (typeof AppointmentType)[keyof typeof AppointmentType];

export const InspectionType = {
  PEACE_OF_MIND: 'PEACE_OF_MIND',
  OUT_OF_PROVINCE: 'OUT_OF_PROVINCE',
  PRE_PURCHASE: 'PRE_PURCHASE',
  SEASONAL: 'SEASONAL',
  CUSTOM: 'CUSTOM',
} as const;
export type InspectionType = (typeof InspectionType)[keyof typeof InspectionType];

export const InspectionStatus = {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FINALIZED: 'FINALIZED',
  CANCELLED: 'CANCELLED',
} as const;
export type InspectionStatus = (typeof InspectionStatus)[keyof typeof InspectionStatus];

export const InspectionOverallStatus = {
  GOOD: 'GOOD',
  ATTENTION_SOON: 'ATTENTION_SOON',
  NEEDS_REPAIR: 'NEEDS_REPAIR',
  UNSAFE: 'UNSAFE',
} as const;
export type InspectionOverallStatus = (typeof InspectionOverallStatus)[keyof typeof InspectionOverallStatus];

export const InspectionItemKind = {
  CONDITION: 'CONDITION',
  MEASUREMENT: 'MEASUREMENT',
  MULTI_SELECT: 'MULTI_SELECT',
  TEXT: 'TEXT',
} as const;
export type InspectionItemKind = (typeof InspectionItemKind)[keyof typeof InspectionItemKind];

export const InspectionItemStatus = {
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  NOT_INSPECTED: 'NOT_INSPECTED',
} as const;
export type InspectionItemStatus = (typeof InspectionItemStatus)[keyof typeof InspectionItemStatus];

export const InspectionPositionGroup = {
  TIRE_SET: 'TIRE_SET',
  BRAKE_SET: 'BRAKE_SET',
} as const;
export type InspectionPositionGroup = (typeof InspectionPositionGroup)[keyof typeof InspectionPositionGroup];

export const QuotationStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  CONVERTED: 'CONVERTED',
} as const;
export type QuotationStatus = (typeof QuotationStatus)[keyof typeof QuotationStatus];

export const PurchaseCategory = {
  TIRES: 'TIRES',
  PARTS: 'PARTS',
  TOOLS: 'TOOLS',
  SUPPLIES: 'SUPPLIES',
  OTHER: 'OTHER',
} as const;
export type PurchaseCategory = (typeof PurchaseCategory)[keyof typeof PurchaseCategory];

export const ExpenseCategory = {
  RENT: 'RENT',
  UTILITIES: 'UTILITIES',
  INSURANCE: 'INSURANCE',
  ADVERTISING: 'ADVERTISING',
  OFFICE_SUPPLIES: 'OFFICE_SUPPLIES',
  PROFESSIONAL_FEES: 'PROFESSIONAL_FEES',
  MAINTENANCE: 'MAINTENANCE',
  VEHICLE: 'VEHICLE',
  TRAVEL: 'TRAVEL',
  TRAINING: 'TRAINING',
  SOFTWARE: 'SOFTWARE',
  OTHER: 'OTHER',
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export const PurchaseInvoiceStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;
export type PurchaseInvoiceStatus = (typeof PurchaseInvoiceStatus)[keyof typeof PurchaseInvoiceStatus];

export const RecurringPeriod = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
} as const;
export type RecurringPeriod = (typeof RecurringPeriod)[keyof typeof RecurringPeriod];

export const PurchaseExpenseType = {
  PURCHASE: 'PURCHASE',
  EXPENSE: 'EXPENSE',
} as const;
export type PurchaseExpenseType = (typeof PurchaseExpenseType)[keyof typeof PurchaseExpenseType];

export const PurchaseExpenseCategory = {
  TIRES: 'TIRES',
  RIMS: 'RIMS',
  PARTS: 'PARTS',
  TOOLS: 'TOOLS',
  SUPPLIES: 'SUPPLIES',
  RENT: 'RENT',
  UTILITIES: 'UTILITIES',
  INSURANCE: 'INSURANCE',
  ADVERTISING: 'ADVERTISING',
  OFFICE_SUPPLIES: 'OFFICE_SUPPLIES',
  PROFESSIONAL_FEES: 'PROFESSIONAL_FEES',
  MAINTENANCE: 'MAINTENANCE',
  VEHICLE: 'VEHICLE',
  TRAVEL: 'TRAVEL',
  TRAINING: 'TRAINING',
  TEAM_MEETING: 'TEAM_MEETING',
  SOFTWARE: 'SOFTWARE',
  OTHER: 'OTHER',
} as const;
export type PurchaseExpenseCategory = (typeof PurchaseExpenseCategory)[keyof typeof PurchaseExpenseCategory];

export const SmsStatus = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  UNDELIVERED: 'UNDELIVERED',
} as const;
export type SmsStatus = (typeof SmsStatus)[keyof typeof SmsStatus];

export const SmsType = {
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMATION: 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_UPDATE: 'APPOINTMENT_UPDATE',
  APPOINTMENT_CANCELLATION: 'APPOINTMENT_CANCELLATION',
  SERVICE_STATUS: 'SERVICE_STATUS',
  SERVICE_COMPLETE: 'SERVICE_COMPLETE',
  PROMOTIONAL: 'PROMOTIONAL',
  EMERGENCY: 'EMERGENCY',
  STAFF_APPOINTMENT_ALERT: 'STAFF_APPOINTMENT_ALERT',
  STAFF_SCHEDULE_REMINDER: 'STAFF_SCHEDULE_REMINDER',
  ADMIN_DAILY_SUMMARY: 'ADMIN_DAILY_SUMMARY',
  ADMIN_URGENT_ALERT: 'ADMIN_URGENT_ALERT',
} as const;
export type SmsType = (typeof SmsType)[keyof typeof SmsType];

export const EmailStatus = {
  PENDING: 'PENDING',
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  OPENED: 'OPENED',
  CLICKED: 'CLICKED',
  BOUNCED: 'BOUNCED',
  COMPLAINED: 'COMPLAINED',
  FAILED: 'FAILED',
} as const;
export type EmailStatus = (typeof EmailStatus)[keyof typeof EmailStatus];

export const EmailType = {
  APPOINTMENT_CONFIRMATION: 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLATION: 'APPOINTMENT_CANCELLATION',
  INVOICE_DELIVERY: 'INVOICE_DELIVERY',
  QUOTATION: 'QUOTATION',
  PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
  SERVICE_COMPLETE: 'SERVICE_COMPLETE',
  PROMOTIONAL: 'PROMOTIONAL',
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
} as const;
export type EmailType = (typeof EmailType)[keyof typeof EmailType];

export const BookingRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CONVERTED: 'CONVERTED',
  PROCESSED: 'PROCESSED',
} as const;
export type BookingRequestStatus = (typeof BookingRequestStatus)[keyof typeof BookingRequestStatus];

export const CommissionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;
export type CommissionStatus = (typeof CommissionStatus)[keyof typeof CommissionStatus];

