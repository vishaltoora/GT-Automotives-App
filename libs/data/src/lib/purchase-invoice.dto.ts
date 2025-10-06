import { PaymentMethod } from './invoice.dto';

export type PurchaseCategory = 'TIRES' | 'PARTS' | 'TOOLS' | 'SUPPLIES' | 'OTHER';
export type PurchaseInvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface PurchaseInvoiceDto {
  id: string;
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  category: PurchaseCategory;
  status: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
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

export interface CreatePurchaseInvoiceDto {
  invoiceNumber?: string;
  vendorId?: string;
  vendorName: string;
  description: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  category: PurchaseCategory;
  status?: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdBy: string;
}

export interface UpdatePurchaseInvoiceDto {
  invoiceNumber?: string;
  vendorId?: string;
  vendorName?: string;
  description?: string;
  invoiceDate?: string;
  dueDate?: string;
  amount?: number;
  taxAmount?: number;
  totalAmount?: number;
  category?: PurchaseCategory;
  status?: PurchaseInvoiceStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface PurchaseInvoiceListResponse {
  data: PurchaseInvoiceDto[];
  total: number;
  page: number;
  limit: number;
}
