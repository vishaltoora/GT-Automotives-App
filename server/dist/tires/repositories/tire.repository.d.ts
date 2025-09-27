import { PrismaService } from '@gt-automotive/database';
import { Tire, Prisma, TireType } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { TireFiltersDto, TireSearchDto, TireSearchResultDto } from '../../common/dto/tire.dto';
export declare class TireRepository extends BaseRepository<Tire> {
    constructor(prisma: PrismaService);
    findAll(filters?: TireFiltersDto): Promise<Tire[]>;
    findById(id: string): Promise<Tire | null>;
    create(data: Prisma.TireCreateInput): Promise<Tire>;
    update(id: string, data: Prisma.TireUpdateInput): Promise<Tire>;
    delete(id: string): Promise<boolean>;
    search(params: TireSearchDto): Promise<TireSearchResultDto>;
    findLowStock(): Promise<Tire[]>;
    adjustStock(id: string, adjustment: {
        quantity: number;
        type: 'add' | 'remove' | 'set';
    }): Promise<Tire & {
        brand: {
            name: string;
            id: string;
            imageUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        size: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            size: string;
        };
    }>;
    getInventoryReport(filters?: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        totalValue: number;
        totalCost: number;
        totalItems: number;
        lowStockItems: Tire[];
        byBrand: Record<string, number>;
        byType: Record<TireType, number>;
    }>;
    findByBrandAndModel(brand: string, model: string): Promise<Tire[]>;
    findBySizeAndType(size: string, type?: TireType): Promise<Tire[]>;
    private buildWhereClause;
    getBrands(): Promise<string[]>;
    getModelsForBrand(brand: string): Promise<string[]>;
    getSizes(): Promise<string[]>;
}
//# sourceMappingURL=tire.repository.d.ts.map