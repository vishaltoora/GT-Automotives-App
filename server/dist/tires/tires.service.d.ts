import { TireRepository } from './repositories/tire.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CreateTireDto } from '../common/dto/tire.dto';
import { UpdateTireDto } from '../common/dto/tire.dto';
import { TireFiltersDto } from '../common/dto/tire.dto';
import { TireSearchDto, TireSearchResultDto, TireResponseDto, StockAdjustmentDto, InventoryReportDto } from '../common/dto/tire.dto';
import { CreateTireBrandDto, UpdateTireBrandDto, TireBrandDto } from '../common/dto/tire-brand.dto';
import { CreateTireSizeDto, UpdateTireSizeDto, TireSizeDto } from '../common/dto/tire-size.dto';
import { TireType } from '@prisma/client';
import { PrismaService } from '@gt-automotive/database';
export declare class TiresService {
    private tireRepository;
    private auditRepository;
    private prisma;
    constructor(tireRepository: TireRepository, auditRepository: AuditRepository, prisma: PrismaService);
    findAll(filters?: TireFiltersDto, userRole?: string): Promise<TireResponseDto[]>;
    findById(id: string, userRole?: string): Promise<TireResponseDto>;
    search(searchParams: TireSearchDto, userRole?: string): Promise<TireSearchResultDto>;
    create(createTireDto: CreateTireDto, userId: string, userRole: string): Promise<TireResponseDto>;
    update(id: string, updateTireDto: UpdateTireDto, userId: string, userRole: string): Promise<TireResponseDto>;
    delete(id: string, userId: string, userRole: string): Promise<{
        success: boolean;
    }>;
    adjustStock(id: string, adjustmentDto: StockAdjustmentDto, userId: string, userRole: string): Promise<TireResponseDto>;
    getLowStock(userRole: string): Promise<TireResponseDto[]>;
    getInventoryReport(filters?: {
        startDate?: string;
        endDate?: string;
    }, userRole?: string): Promise<InventoryReportDto>;
    private formatTireResponse;
    private formatSingleTireResponse;
    findByBrandAndModel(brand: string, model: string, userRole?: string): Promise<TireResponseDto[]>;
    findBySizeAndType(size: string, type?: TireType, userRole?: string): Promise<TireResponseDto[]>;
    checkLowStockAlerts(): Promise<TireResponseDto[]>;
    getBrands(userRole?: string): Promise<string[]>;
    getModelsForBrand(brand: string, userRole?: string): Promise<string[]>;
    getSizes(userRole?: string): Promise<string[]>;
    getAllTireBrands(): Promise<TireBrandDto[]>;
    createTireBrand(dto: CreateTireBrandDto, userId: string): Promise<TireBrandDto>;
    updateTireBrand(id: string, dto: UpdateTireBrandDto, userId: string): Promise<TireBrandDto>;
    deleteTireBrand(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    getAllTireSizes(): Promise<TireSizeDto[]>;
    createTireSize(dto: CreateTireSizeDto, userId: string): Promise<TireSizeDto>;
    updateTireSize(id: string, dto: UpdateTireSizeDto, userId: string): Promise<TireSizeDto>;
    deleteTireSize(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    getAllLocations(): Promise<any[]>;
    getLocations(userRole?: string): Promise<string[]>;
    createLocation(createLocationDto: any, userId: string): Promise<any>;
    updateLocation(id: string, updateLocationDto: any, userId: string): Promise<any>;
    deleteLocation(id: string, userId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=tires.service.d.ts.map