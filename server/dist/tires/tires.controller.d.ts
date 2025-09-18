import { TiresService } from './tires.service';
import { CreateTireDto } from '@gt-automotive/shared-dto';
import { UpdateTireDto } from '@gt-automotive/shared-dto';
import { StockAdjustmentDto } from '@gt-automotive/shared-dto';
import { TireSearchDto } from '@gt-automotive/shared-dto';
import { TireResponseDto } from '@gt-automotive/shared-dto';
import { TireSearchResultDto } from '@gt-automotive/shared-dto';
export declare class TiresController {
    private tiresService;
    constructor(tiresService: TiresService);
    findAll(searchDto: TireSearchDto, user?: any): Promise<TireSearchResultDto | TireResponseDto[]>;
    getBrands(user?: any): Promise<string[]>;
    getModelsForBrand(brand: string, user?: any): Promise<string[]>;
    getSizes(user?: any): Promise<string[]>;
    findById(id: string, user?: any): Promise<any>;
    create(createTireDto: CreateTireDto, user: any): Promise<TireResponseDto>;
    update(id: string, updateTireDto: UpdateTireDto, user: any): Promise<TireResponseDto>;
    delete(id: string, user: any): Promise<{
        success: boolean;
    }>;
    adjustStock(id: string, adjustmentDto: StockAdjustmentDto, user: any): Promise<TireResponseDto>;
    getLowStock(user: any): Promise<TireResponseDto[]>;
    getInventoryReport(startDate?: string, endDate?: string, user?: any): Promise<any>;
    findByBrandAndModel(brand: string, model: string, user: any): Promise<TireResponseDto[]>;
    findBySize(size: string, type?: string, user?: any): Promise<TireResponseDto[]>;
    getStockAlerts(): Promise<TireResponseDto[]>;
}
//# sourceMappingURL=tires.controller.d.ts.map