import { TireResponseDto as ITire, CreateTireDto as ITireCreateInput, UpdateTireDto as ITireUpdateInput, TireSearchDto as ITireSearchParams } from '@gt-automotive/shared-dto';
export declare const TIRE_QUERY_KEYS: {
    all: readonly ["tires"];
    lists: () => readonly ["tires", "list"];
    list: (params: ITireSearchParams) => readonly ["tires", "list", ITireSearchParams];
    details: () => readonly ["tires", "detail"];
    detail: (id: string) => readonly ["tires", "detail", string];
    lowStock: () => readonly ["tires", "low-stock"];
    inventoryReport: () => readonly ["tires", "inventory-report"];
    brands: () => readonly ["tires", "brands"];
    sizeSuggestions: (query: string) => readonly ["tires", "size-suggestions", string];
};
export declare function useTires(params?: ITireSearchParams): import("@tanstack/react-query").UseQueryResult<import("@gt-automotive/shared-dto").TireSearchResultResponseDto, Error>;
export declare function useTire(id: string, enabled?: boolean): import("@tanstack/react-query").UseQueryResult<ITire, Error>;
export declare function useLowStockTires(enabled?: boolean): import("@tanstack/react-query").UseQueryResult<ITire[], Error>;
export declare function useInventoryReport(params?: {
    startDate?: string;
    endDate?: string;
}, enabled?: boolean): import("@tanstack/react-query").UseQueryResult<import("../services/tire.service").InventoryReport, Error>;
export declare function useTireBrands(): import("@tanstack/react-query").UseQueryResult<string[], Error>;
export declare function useTireSizeSuggestions(query: string, enabled?: boolean): import("@tanstack/react-query").UseQueryResult<string[], Error>;
export declare function useCreateTire(): import("@tanstack/react-query").UseMutationResult<ITire, Error, ITireCreateInput, unknown>;
export declare function useUpdateTire(): import("@tanstack/react-query").UseMutationResult<ITire, Error, {
    id: string;
    data: ITireUpdateInput;
}, {
    previousTire: unknown;
}>;
export declare function useDeleteTire(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
export declare function useStockAdjustment(): import("@tanstack/react-query").UseMutationResult<ITire, Error, {
    id: string;
    adjustment: {
        quantity: number;
        type: "add" | "remove" | "set";
        reason: string;
    };
}, {
    previousTire: ITire | undefined;
}>;
export declare function useUploadTireImage(): import("@tanstack/react-query").UseMutationResult<import("@gt-automotive/shared-dto").TireImageDto, Error, {
    tireId: string;
    file: File;
}, unknown>;
export declare function useDeleteTireImage(): import("@tanstack/react-query").UseMutationResult<void, Error, {
    tireId: string;
    imageId: string;
}, unknown>;
export declare function useBulkUpdatePrices(): import("@tanstack/react-query").UseMutationResult<ITire[], Error, {
    id: string;
    price: number;
    cost?: number;
}[], unknown>;
export declare function useExportTires(): import("@tanstack/react-query").UseMutationResult<Blob, Error, ITireSearchParams, unknown>;
export declare function usePrefetchTire(): (id: string) => void;
export declare function useInvalidateTireQueries(): () => void;
//# sourceMappingURL=useTires.d.ts.map