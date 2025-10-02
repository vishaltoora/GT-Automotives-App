import { TiresService } from './tires.service';
import { CreateTireDto } from '../common/dto/tire.dto';
import { UpdateTireDto } from '../common/dto/tire.dto';
import { StockAdjustmentDto } from '../common/dto/tire.dto';
import { TireSearchDto, TireResponseDto, TireSearchResultDto } from '../common/dto/tire.dto';
import { CreateTireBrandDto, UpdateTireBrandDto, TireBrandDto } from '../common/dto/tire-brand.dto';
import { CreateTireSizeDto, UpdateTireSizeDto, TireSizeDto } from '../common/dto/tire-size.dto';
import { CreateLocationDto, UpdateLocationDto, LocationDto } from '../common/dto/location.dto';
export declare class TiresController {
    private tiresService;
    constructor(tiresService: TiresService);
    findAll(searchDto: TireSearchDto, user?: any): Promise<TireSearchResultDto | TireResponseDto[]>;
    getAllTireBrands(): Promise<TireBrandDto[]>;
    getBrands(user?: any): Promise<string[]>;
    createTireBrand(createTireBrandDto: CreateTireBrandDto, user: any): Promise<TireBrandDto>;
    getModelsForBrand(brand: string, user?: any): Promise<string[]>;
    updateTireBrand(id: string, updateTireBrandDto: UpdateTireBrandDto, user: any): Promise<TireBrandDto>;
    deleteTireBrand(id: string, user: any): Promise<{
        success: boolean;
    }>;
    getAllTireSizes(): Promise<TireSizeDto[]>;
    getSizes(user?: any): Promise<string[]>;
    createTireSize(createTireSizeDto: CreateTireSizeDto, user: any): Promise<TireSizeDto>;
    updateTireSize(id: string, updateTireSizeDto: UpdateTireSizeDto, user: any): Promise<TireSizeDto>;
    deleteTireSize(id: string, user: any): Promise<{
        success: boolean;
    }>;
    getAllLocations(): Promise<LocationDto[]>;
    getLocations(user?: any): Promise<string[]>;
    createLocation(createLocationDto: CreateLocationDto, user: any): Promise<LocationDto>;
    updateLocation(id: string, updateLocationDto: UpdateLocationDto, user: any): Promise<LocationDto>;
    deleteLocation(id: string, user: any): Promise<{
        success: boolean;
    }>;
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