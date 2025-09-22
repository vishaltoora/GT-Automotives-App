import { TireRepository } from './repositories/tire.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CreateTireDto } from '@gt-automotive/shared-dto';
import { UpdateTireDto } from '@gt-automotive/shared-dto';
import { TireFiltersDto } from '@gt-automotive/shared-dto';
import { TireSearchDto } from '@gt-automotive/shared-dto';
import { TireSearchResultDto } from '@gt-automotive/shared-dto';
import { TireResponseDto } from '@gt-automotive/shared-dto';
import { StockAdjustmentDto } from '@gt-automotive/shared-dto';
import { InventoryReportDto } from '@gt-automotive/shared-dto';
import { TireType } from '@prisma/client';
export declare class TiresService {
    private tireRepository;
    private auditRepository;
    constructor(tireRepository: TireRepository, auditRepository: AuditRepository);
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
}
//# sourceMappingURL=tires.service.d.ts.map