import { TireRepository } from './repositories/tire.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CreateTireDto } from '../common/dto/tire.dto';
import { UpdateTireDto } from '../common/dto/tire.dto';
import { TireFiltersDto } from '../common/dto/tire.dto';
import { TireSearchDto, TireSearchResultDto, TireResponseDto, StockAdjustmentDto, InventoryReportDto } from '../common/dto/tire.dto';
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
}
//# sourceMappingURL=tires.service.d.ts.map