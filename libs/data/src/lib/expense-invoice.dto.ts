import { PaymentMethod } from './invoice.dto';

export type ExpenseCategory =
  | 'RENT'
  | 'UTILITIES'
  | 'INSURANCE'
  | 'SALARIES'
  | 'MARKETING'
  | 'OFFICE_SUPPLIES'
  | 'MAINTENANCE'
  | 'OTHER';
export type ExpenseInvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type RecurringPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';


export interface ExpenseInvoiceDto {
  id: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  category: ExpenseCategory;
  status: ExpenseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  isRecurring: boolean;
  recurringPeriod?: RecurringPeriod;
  notes?: string;
  imageUrl?: string;
  imageName?: string;
  imageSize?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
  };
}

export interface CreateExpenseInvoiceDto {
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  category: ExpenseCategory;
  status?: ExpenseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  isRecurring?: boolean;
  recurringPeriod?: RecurringPeriod;
  notes?: string;
  createdBy: string;
}

export interface UpdateExpenseInvoiceDto {
  invoiceNumber?: string;
  vendorId?: string;
  vendorName?: string;
  description?: string;
  invoiceDate?: string;
  amount?: number;
  taxAmount?: number;
  totalAmount?: number;
  category?: ExpenseCategory;
  status?: ExpenseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  isRecurring?: boolean;
  recurringPeriod?: RecurringPeriod;
  notes?: string;
}

export interface ExpenseInvoiceListResponse {
  data: ExpenseInvoiceDto[];
  total: number;
  page: number;
  limit: number;
}
