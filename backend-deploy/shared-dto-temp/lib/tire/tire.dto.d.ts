export declare enum TireType {
    ALL_SEASON = "ALL_SEASON",
    SUMMER = "SUMMER",
    WINTER = "WINTER",
    PERFORMANCE = "PERFORMANCE",
    OFF_ROAD = "OFF_ROAD"
}
export declare enum TireCondition {
    NEW = "NEW",
    USED_EXCELLENT = "USED_EXCELLENT",
    USED_GOOD = "USED_GOOD",
    USED_FAIR = "USED_FAIR"
}
export declare class CreateTireDto {
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
export declare class UpdateTireDto {
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
export declare class StockAdjustmentDto {
    quantity: number;
    type: 'add' | 'remove' | 'set';
    reason: string;
}
export declare class StockAdjustmentWithIdDto {
    tireId: string;
    quantityChange: number;
    reason?: string;
    notes?: string;
}
export declare class TireSearchDto {
    brand?: string;
    size?: string;
    type?: TireType;
    condition?: TireCondition;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    lowStock?: boolean;
    search?: string;
    sortBy?: 'brand' | 'size' | 'price' | 'quantity' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class TireResponseDto {
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
    notes?: string;
    isLowStock?: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<TireResponseDto>);
}
export declare class TireDto {
    id: string;
    brand: string;
    size: string;
    type: TireType;
    condition: TireCondition;
    price: number;
    cost?: number;
    quantity: number;
    location?: string;
    minStock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class TireFiltersDto {
    brand?: string;
    size?: string;
    type?: TireType;
    condition?: TireCondition;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    inStock?: boolean;
    lowStock?: boolean;
}
export declare class TireSearchResultDto {
    items: TireResponseDto[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
export declare class InventoryReportDto {
    totalValue: number;
    totalCost: number;
    totalItems: number;
    lowStockItems: TireResponseDto[];
    byBrand: Record<string, number>;
    byType: Record<TireType, number>;
}
export declare class TireImageDto {
    id: string;
    tireId: string;
    url: string;
    filename?: string;
    alt?: string;
    createdAt: Date;
}
export type ITire = TireResponseDto;
export type ITireCreateInput = CreateTireDto;
export type ITireUpdateInput = UpdateTireDto;
export type ITireSearchParams = TireSearchDto;
export type ITireSearchResult = TireSearchResultDto;
export type IStockAdjustment = StockAdjustmentDto;
export type ITireImage = TireImageDto;
