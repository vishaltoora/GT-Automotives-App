import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TireRepository } from './repositories/tire.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import {
  CreateTireDto,
  UpdateTireDto,
  TireDto,
  TireFiltersDto,
  TireSearchDto,
  TireSearchResultDto,
} from '@gt-automotive/shared-interfaces';
import { TireType, TireCondition } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TiresService {
  constructor(
    private tireRepository: TireRepository,
    private auditRepository: AuditRepository,
  ) {}

  async findAll(
    filters?: TireFiltersDto,
    userRole?: string,
  ): Promise<TireResponseDto[]> {
    const tires = await this.tireRepository.findAll(filters);
    return this.formatTireResponse(tires, userRole);
  }

  async findById(id: string, userRole?: string): Promise<TireResponseDto> {
    const tire = await this.tireRepository.findById(id);
    if (!tire) {
      throw new NotFoundException('Tire not found');
    }
    return this.formatSingleTireResponse(tire, userRole);
  }

  async search(
    searchParams: TireSearchDto,
    userRole?: string,
  ): Promise<TireSearchResultDto> {
    const result = await this.tireRepository.search(searchParams);
    
    return {
      items: this.formatTireResponse(result.items, userRole),
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    };
  }

  async create(
    createTireDto: CreateTireDto,
    userId: string,
    userRole: string,
  ): Promise<TireResponseDto> {
    // Check if user has permission to create tires
    if (!['STAFF', 'ADMIN'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions to create tires');
    }

    // Check for duplicates (same brand, size, type, condition)
    const existingTires = await this.tireRepository.findAll({
      brand: createTireDto.brand,
      size: createTireDto.size,
      type: createTireDto.type,
      condition: createTireDto.condition,
    });

    if (existingTires.length > 0) {
      throw new ConflictException(
        'Tire with the same specifications already exists. Consider updating the quantity instead.',
      );
    }

    // Set default values
    const tireData = {
      ...createTireDto,
      minStock: createTireDto.minStock || 5,
      price: new Decimal(createTireDto.price),
      cost: createTireDto.cost ? new Decimal(createTireDto.cost) : null,
    };

    const tire = await this.tireRepository.create(tireData);

    // Log the creation
    await this.auditRepository.create({
      userId,
      action: 'TIRE_CREATED',
      entityType: 'tire',
      entityId: tire.id,
      details: {
        brand: tire.brand,
        size: tire.size,
        quantity: tire.quantity,
      },
    });

    return this.formatSingleTireResponse(tire, userRole);
  }

  async update(
    id: string,
    updateTireDto: UpdateTireDto,
    userId: string,
    userRole: string,
  ): Promise<TireResponseDto> {
    // Check if user has permission to update tires
    if (!['STAFF', 'ADMIN'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions to update tires');
    }

    const existingTire = await this.findById(id, userRole);

    // Prepare update data
    const updateData: any = { ...updateTireDto };
    
    if (updateTireDto.price !== undefined) {
      updateData.price = new Decimal(updateTireDto.price);
    }
    
    if (updateTireDto.cost !== undefined) {
      updateData.cost = new Decimal(updateTireDto.cost);
    }

    const updatedTire = await this.tireRepository.update(id, updateData);

    // Log the update
    await this.auditRepository.create({
      userId,
      action: 'TIRE_UPDATED',
      entityType: 'tire',
      entityId: id,
      details: {
        changes: updateTireDto,
        oldValues: {
          brand: existingTire.brand,
          price: existingTire.price,
        },
      },
    });

    return this.formatSingleTireResponse(updatedTire, userRole);
  }

  async delete(id: string, userId: string, userRole: string): Promise<{ success: boolean }> {
    // Only admin can delete tires
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete tires');
    }

    const tire = await this.findById(id, userRole);
    
    // Check if tire has been used in any invoices
    // TODO: Add check for invoice items when invoice module is implemented
    
    const success = await this.tireRepository.delete(id);
    
    if (!success) {
      throw new BadRequestException('Failed to delete tire');
    }

    // Log the deletion
    await this.auditRepository.create({
      userId,
      action: 'TIRE_DELETED',
      entityType: 'tire',
      entityId: id,
      details: {
        brand: tire.brand,
        size: tire.size,
      },
    });

    return { success: true };
  }

  async adjustStock(
    id: string,
    adjustmentDto: StockAdjustmentDto,
    userId: string,
    userRole: string,
  ): Promise<TireResponseDto> {
    // Check if user has permission to adjust stock
    if (!['STAFF', 'ADMIN'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions to adjust stock');
    }

    const existingTire = await this.findById(id, userRole);
    
    // Validate adjustment
    if (adjustmentDto.type === 'remove' && adjustmentDto.quantity > existingTire.quantity) {
      throw new BadRequestException(
        `Cannot remove ${adjustmentDto.quantity} items. Only ${existingTire.quantity} in stock.`,
      );
    }

    if (adjustmentDto.quantity < 0 && adjustmentDto.type !== 'remove') {
      throw new BadRequestException('Quantity cannot be negative for add/set operations');
    }

    const oldQuantity = existingTire.quantity;
    const updatedTire = await this.tireRepository.adjustStock(id, {
      quantity: Math.abs(adjustmentDto.quantity),
      type: adjustmentDto.type,
    });

    // Log the stock adjustment
    await this.auditRepository.create({
      userId,
      action: 'STOCK_ADJUSTED',
      entityType: 'tire',
      entityId: id,
      details: {
        type: adjustmentDto.type,
        quantity: adjustmentDto.quantity,
        reason: adjustmentDto.reason,
        oldQuantity,
        newQuantity: updatedTire.quantity,
        brand: updatedTire.brand,
        size: updatedTire.size,
      },
    });

    return this.formatSingleTireResponse(updatedTire, userRole);
  }

  async getLowStock(userRole: string): Promise<TireResponseDto[]> {
    // Check if user has permission to view stock reports
    if (!['STAFF', 'ADMIN'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions to view stock reports');
    }

    const lowStockTires = await this.tireRepository.findLowStock();
    return this.formatTireResponse(lowStockTires, userRole);
  }

  async getInventoryReport(
    filters?: { startDate?: string; endDate?: string },
    userRole?: string,
  ): Promise<InventoryReportDto> {
    // Only admin can view inventory reports
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can view inventory reports');
    }

    const dateFilters = {
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    };

    const report = await this.tireRepository.getInventoryReport(dateFilters);
    
    return {
      ...report,
      lowStockItems: this.formatTireResponse(report.lowStockItems, userRole),
    };
  }

  private formatTireResponse(tires: any[], userRole?: string): TireResponseDto[] {
    return tires.map((tire) => this.formatSingleTireResponse(tire, userRole));
  }

  private formatSingleTireResponse(tire: any, userRole?: string): TireResponseDto {
    const response: any = {
      ...tire,
      price: tire.price.toNumber ? tire.price.toNumber() : tire.price,
      cost: tire.cost?.toNumber ? tire.cost.toNumber() : tire.cost,
      isLowStock: tire.quantity <= tire.minStock,
    };

    // Hide cost from non-admin users
    if (userRole !== 'ADMIN') {
      delete response.cost;
    }

    return response as TireResponseDto;
  }

  // Helper methods for specific searches
  async findByBrandAndModel(
    brand: string,
    model: string,
    userRole?: string,
  ): Promise<TireResponseDto[]> {
    const tires = await this.tireRepository.findByBrandAndModel(brand, model);
    return this.formatTireResponse(tires, userRole);
  }

  async findBySizeAndType(
    size: string,
    type?: TireType,
    userRole?: string,
  ): Promise<TireResponseDto[]> {
    const tires = await this.tireRepository.findBySizeAndType(size, type);
    return this.formatTireResponse(tires, userRole);
  }

  // Utility method to check low stock alerts
  async checkLowStockAlerts(): Promise<TireResponseDto[]> {
    const lowStockTires = await this.tireRepository.findLowStock();
    return this.formatTireResponse(lowStockTires, 'admin');
  }

  // Get all unique brands
  async getBrands(userRole?: string): Promise<string[]> {
    return this.tireRepository.getBrands();
  }

  // Get all models for a specific brand
  async getModelsForBrand(brand: string, userRole?: string): Promise<string[]> {
    return this.tireRepository.getModelsForBrand(brand);
  }

  // Get all unique sizes
  async getSizes(userRole?: string): Promise<string[]> {
    return this.tireRepository.getSizes();
  }
}