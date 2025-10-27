import { ITire, ITireCreateInput, ITireUpdateInput, ITireSearchParams, ITireSearchResult, ITireImage } from '@gt-automotive/data';
export interface InventoryReport {
    totalValue: number;
    totalCost: number;
    totalItems: number;
    lowStockItems: ITire[];
    byBrand: Record<string, number>;
    byType: Record<string, number>;
}
export declare class TireService {
    /**
     * Get paginated list of tires with optional filters
     */
    static getTires(params?: ITireSearchParams): Promise<ITireSearchResult>;
    /**
     * Get a single tire by ID
     */
    static getTireById(id: string): Promise<ITire>;
    /**
     * Create a new tire
     */
    static createTire(data: ITireCreateInput): Promise<ITire>;
    /**
     * Update an existing tire
     */
    static updateTire(id: string, data: ITireUpdateInput): Promise<ITire>;
    /**
     * Delete a tire (admin only)
     */
    static deleteTire(id: string): Promise<void>;
    /**
     * Adjust tire stock quantity
     */
    static adjustStock(id: string, adjustment: {
        quantity: number;
        type: 'add' | 'remove' | 'set';
        reason: string;
    }): Promise<ITire>;
    /**
     * Get tires with low stock (staff/admin only)
     */
    static getLowStockTires(): Promise<ITire[]>;
    /**
     * Get inventory report (admin only)
     */
    static getInventoryReport(params?: {
        startDate?: string;
        endDate?: string;
    }): Promise<InventoryReport>;
    /**
     * Upload image for a tire
     */
    static uploadImage(tireId: string, file: File): Promise<ITireImage>;
    /**
     * Delete an image for a tire
     */
    static deleteImage(tireId: string, imageId: string): Promise<void>;
    /**
     * Get available tire brands for filtering
     */
    static getTireBrands(): Promise<string[]>;
    /**
     * Export tires to CSV (admin only)
     */
    static exportTires(params?: ITireSearchParams): Promise<Blob>;
    /**
     * Bulk update tire prices (admin only)
     */
    static bulkUpdatePrices(updates: {
        id: string;
        price: number;
        cost?: number;
    }[]): Promise<ITire[]>;
    /**
     * Get tire size suggestions based on input
     */
    static getTireSizeSuggestions(query: string): Promise<string[]>;
}
export declare const tireService: TireService;
export default TireService;
//# sourceMappingURL=tire.service.d.ts.map