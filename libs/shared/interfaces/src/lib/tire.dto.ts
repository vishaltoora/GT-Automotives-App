// Import enums from Prisma generated client to avoid duplicate definitions
import { TireType, TireCondition } from '@prisma/client';

// Simple DTO interfaces without validation decorators (validation handled in backend)
export interface TireDto {
  id: string;
  brand: string;
  size: string;
  type: TireType;
  condition: TireCondition;
  quantity: number;
  price: number;
  cost?: number;
  location?: string;
  minStock: number;
  imageUrl?: string;
  images?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTireDto {
  brand: string;
  size: string;
  type: TireType;
  condition: TireCondition;
  quantity: number;
  price: number;
  cost?: number;
  location?: string;
  minStock?: number;
  imageUrl?: string;
  notes?: string;
}

export interface UpdateTireDto {
  brand?: string;
  size?: string;
  type?: TireType;
  condition?: TireCondition;
  quantity?: number;
  price?: number;
  cost?: number;
  location?: string;
  minStock?: number;
  imageUrl?: string;
  notes?: string;
}

export interface TireFiltersDto {
  brand?: string;
  size?: string;
  type?: TireType;
  condition?: TireCondition;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
}

export interface TireSearchDto {
  filters?: TireFiltersDto;
  search?: string;
  sortBy?: 'brand' | 'size' | 'price' | 'quantity' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TireSearchResultDto {
  items: TireDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// For API requests (what the controller receives)
export interface StockAdjustmentDto {
  quantity: number;
  type: 'add' | 'remove' | 'set';
  reason: string;
}

// For database/audit records (what the service creates)
export interface StockAdjustmentRecordDto {
  tireId: string;
  quantity: number;
  type: 'add' | 'remove' | 'set';
  reason: string;
  userId: string;
  createdAt: Date;
}

export interface TireResponseDto extends TireDto {
  // This extends TireDto and can be used for API responses
  // Cost field will be conditionally included based on user role
}

export interface InventoryReportDto {
  totalValue: number;
  totalCost: number;
  totalItems: number;
  lowStockItems: TireDto[];
  byBrand: Record<string, number>;
  byType: Record<TireType, number>;
}

// Re-export enums for convenience
export { TireType, TireCondition };