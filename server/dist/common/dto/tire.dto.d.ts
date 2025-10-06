import { TireType, TireCondition } from '@prisma/client';
export declare enum AdjustmentType {
    ADD = "add",
    REMOVE = "remove",
    SET = "set"
}
export declare class CreateTireDto {
    name?: string;
    sku?: string;
    brand: string;
    size: string;
    type: TireType;
    condition: TireCondition;
    price: number;
    cost?: number;
    quantity: number;
    description?: string;
    imageUrl?: string;
    minStock?: number;
    location?: string;
    notes?: string;
}
export declare class UpdateTireDto {
    name?: string;
    sku?: string;
    brand?: string;
    size?: string;
    type?: TireType;
    condition?: TireCondition;
    price?: number;
    cost?: number;
    quantity?: number;
    description?: string;
    imageUrl?: string;
    minStock?: number;
    location?: string;
    notes?: string;
}
export declare class TireResponseDto {
    id: string;
    name?: string;
    sku?: string;
    brand: string;
    size: string;
    type: TireType;
    condition: TireCondition;
    price: number;
    cost?: number;
    quantity: number;
    description?: string;
    imageUrl?: string;
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    minStock?: number;
    location?: string;
    notes?: string;
}
export declare class StockAdjustmentDto {
    quantity: number;
    type: AdjustmentType;
    reason?: string;
}
export declare class TireFiltersDto {
    brand?: string;
    size?: string;
    type?: TireType;
    condition?: TireCondition;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    lowStock?: boolean;
}
export declare class TireSearchParamsDto {
    search?: string;
    brand?: string;
    size?: string;
    type?: TireType;
    condition?: TireCondition;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    lowStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class TireSearchDto extends TireSearchParamsDto {
}
export declare class TireDto {
    id: string;
    name?: string;
    sku?: string;
    brand: string;
    size: string;
    type: TireType;
    condition: TireCondition;
    price: number;
    cost?: number;
    quantity: number;
    description?: string;
    imageUrl?: string;
    inStock: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    minStock?: number;
    location?: string;
    notes?: string;
}
export declare class TireSearchResultDto {
    items: TireDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
export declare class InventoryReportDto {
    totalValue: number;
    totalCost: number;
    totalItems: number;
    lowStockItems: any[];
    byBrand?: Record<string, number>;
    byType?: Record<string, number>;
}
//# sourceMappingURL=tire.dto.d.ts.map