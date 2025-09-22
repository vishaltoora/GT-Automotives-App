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
export declare enum AdjustmentType {
    ADD = "add",
    REMOVE = "remove",
    SET = "set"
}
export declare class CreateTireDto {
    brand: string;
    size: string;
    type: TireType;
    condition: TireCondition;
    price: number;
    cost: number;
    quantity: number;
    description?: string;
    imageUrl?: string;
    minStock?: number;
    location?: string;
    notes?: string;
}
export declare class UpdateTireDto implements Partial<CreateTireDto> {
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
export declare class TireSearchResultResponseDto {
    items: TireResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}
export declare class TireImageDto {
    id: string;
    url: string;
    alt?: string;
}
export declare class InventoryReportDto {
    totalValue: number;
    totalCost: number;
    totalItems: number;
    lowStockItems: TireResponseDto[];
}
export { TireSearchParamsDto as TireSearchDto };
export { TireSearchResultResponseDto as TireSearchResultDto };
export { TireImageDto as TireImageResponseDto };
export type TireDto = TireResponseDto;
export type ITire = TireResponseDto;
export type ITireCreateInput = CreateTireDto;
export type ITireUpdateInput = UpdateTireDto;
export type ITireSearchParams = TireSearchParamsDto;
export type ITireSearchResult = TireSearchResultResponseDto;
export type ITireImage = TireImageDto;
//# sourceMappingURL=tire.dto.d.ts.map