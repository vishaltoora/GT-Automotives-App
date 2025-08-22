import { Injectable } from '@nestjs/common';
import { PrismaService } from '@gt-automotive/database';
import { Tire, Prisma, TireType, TireCondition } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { ITireFilters, ITireSearchParams, ITireSearchResult } from '@gt-automotive/shared-interfaces';

@Injectable()
export class TireRepository extends BaseRepository<Tire> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  async findAll(filters?: ITireFilters): Promise<Tire[]> {
    return this.prisma.tire.findMany({
      where: this.buildWhereClause(filters),
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Tire | null> {
    return this.prisma.tire.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.TireCreateInput): Promise<Tire> {
    return this.prisma.tire.create({
      data,
    });
  }

  async update(id: string, data: Prisma.TireUpdateInput): Promise<Tire> {
    return this.prisma.tire.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.tire.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async search(params: ITireSearchParams): Promise<ITireSearchResult> {
    const {
      filters,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = params;

    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters, search);

    const [items, total] = await Promise.all([
      this.prisma.tire.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.tire.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async findLowStock(): Promise<Tire[]> {
    // Use raw SQL for complex comparison since Prisma doesn't support column comparisons directly
    return this.prisma.$queryRaw`
      SELECT * FROM "Tire" 
      WHERE quantity <= "minStock" OR quantity <= 0
      ORDER BY quantity ASC
    `;
  }

  async adjustStock(
    id: string,
    adjustment: {
      quantity: number;
      type: 'add' | 'remove' | 'set';
    },
  ): Promise<Tire> {
    return this.prisma.$transaction(async (prisma) => {
      const tire = await prisma.tire.findUnique({
        where: { id },
      });

      if (!tire) {
        throw new Error('Tire not found');
      }

      let newQuantity: number;
      switch (adjustment.type) {
        case 'add':
          newQuantity = tire.quantity + adjustment.quantity;
          break;
        case 'remove':
          newQuantity = Math.max(0, tire.quantity - adjustment.quantity);
          break;
        case 'set':
          newQuantity = Math.max(0, adjustment.quantity);
          break;
        default:
          throw new Error('Invalid adjustment type');
      }

      return prisma.tire.update({
        where: { id },
        data: { quantity: newQuantity },
      });
    });
  }

  async getInventoryReport(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalValue: number;
    totalCost: number;
    totalItems: number;
    lowStockItems: Tire[];
    byBrand: Record<string, number>;
    byType: Record<TireType, number>;
  }> {
    const where: Prisma.TireWhereInput = {};
    
    if (filters?.startDate || filters?.endDate) {
      where.updatedAt = {};
      if (filters.startDate) where.updatedAt.gte = filters.startDate;
      if (filters.endDate) where.updatedAt.lte = filters.endDate;
    }

    const [
      tires,
      lowStockItems,
      brandAggregation,
      typeAggregation,
    ] = await Promise.all([
      this.prisma.tire.findMany({ where }),
      this.findLowStock(),
      this.prisma.tire.groupBy({
        by: ['brand'],
        where,
        _sum: {
          quantity: true,
        },
      }),
      this.prisma.tire.groupBy({
        by: ['type'],
        where,
        _sum: {
          quantity: true,
        },
      }),
    ]);

    const totalValue = tires.reduce(
      (sum, tire) => sum + tire.price.toNumber() * tire.quantity,
      0,
    );

    const totalCost = tires.reduce(
      (sum, tire) => sum + (tire.cost?.toNumber() || 0) * tire.quantity,
      0,
    );

    const totalItems = tires.reduce((sum, tire) => sum + tire.quantity, 0);

    const byBrand = brandAggregation.reduce(
      (acc, item) => {
        acc[item.brand] = item._sum.quantity || 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byType = typeAggregation.reduce(
      (acc, item) => {
        acc[item.type] = item._sum.quantity || 0;
        return acc;
      },
      {} as Record<TireType, number>,
    );

    return {
      totalValue,
      totalCost,
      totalItems,
      lowStockItems,
      byBrand,
      byType,
    };
  }

  async findByBrandAndModel(brand: string, model: string): Promise<Tire[]> {
    return this.prisma.tire.findMany({
      where: {
        brand: {
          equals: brand,
          mode: 'insensitive',
        },
        model: {
          equals: model,
          mode: 'insensitive',
        },
      },
    });
  }

  async findBySizeAndType(size: string, type?: TireType): Promise<Tire[]> {
    const where: Prisma.TireWhereInput = {
      size: {
        equals: size,
        mode: 'insensitive',
      },
    };

    if (type) {
      where.type = type;
    }

    return this.prisma.tire.findMany({
      where,
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });
  }

  private buildWhereClause(
    filters?: ITireFilters,
    search?: string,
  ): Prisma.TireWhereInput {
    const where: Prisma.TireWhereInput = {};

    if (filters) {
      if (filters.brand) {
        where.brand = {
          contains: filters.brand,
          mode: 'insensitive',
        };
      }

      if (filters.model) {
        where.model = {
          contains: filters.model,
          mode: 'insensitive',
        };
      }

      if (filters.size) {
        where.size = {
          contains: filters.size,
          mode: 'insensitive',
        };
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.condition) {
        where.condition = filters.condition;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined) {
          where.price.gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          where.price.lte = filters.maxPrice;
        }
      }

      if (filters.inStock) {
        where.quantity = { gt: 0 };
      }

      if (filters.lowStock) {
        // Note: For proper low stock filtering, we'll need to handle this in the service layer
        // or use a separate method since Prisma doesn't support column comparisons directly
        where.quantity = { lte: 5 }; // Default low stock threshold
      }
    }

    if (search) {
      where.OR = [
        {
          brand: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          model: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          size: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  async getBrands(): Promise<string[]> {
    const result = await this.prisma.tire.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });
    return result.map((tire) => tire.brand);
  }

  async getModelsForBrand(brand: string): Promise<string[]> {
    const result = await this.prisma.tire.findMany({
      where: {
        brand: {
          equals: brand,
          mode: 'insensitive',
        },
      },
      select: { model: true },
      distinct: ['model'],
      orderBy: { model: 'asc' },
    });
    return result.map((tire) => tire.model);
  }

  async getSizes(): Promise<string[]> {
    const result = await this.prisma.tire.findMany({
      select: { size: true },
      distinct: ['size'],
      orderBy: { size: 'asc' },
    });
    return result.map((tire) => tire.size);
  }
}