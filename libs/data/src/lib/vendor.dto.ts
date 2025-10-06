export interface VendorDto {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    purchaseInvoices: number;
    expenseInvoices: number;
  };
}

export interface CreateVendorDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateVendorDto {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  isActive?: boolean;
  notes?: string;
}

export interface VendorListResponse {
  data: VendorDto[];
  total: number;
  page: number;
  limit: number;
}
