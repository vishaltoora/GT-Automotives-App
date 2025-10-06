import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TireRepository } from './repositories/tire.repository';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CreateTireDto } from '../common/dto/tire.dto';
import { UpdateTireDto } from '../common/dto/tire.dto';
import { TireFiltersDto } from '../common/dto/tire.dto';
import { TireSearchDto, TireSearchResultDto, TireResponseDto, StockAdjustmentDto, InventoryReportDto } from '../common/dto/tire.dto';
import { CreateTireBrandDto, UpdateTireBrandDto, TireBrandDto } from '../common/dto/tire-brand.dto';
import { CreateTireSizeDto, UpdateTireSizeDto, TireSizeDto } from '../common/dto/tire-size.dto';
import { TireType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '@gt-automotive/database';

@Injectable()
export class TiresService {
  constructor(
    private tireRepository: TireRepository,
    private auditRepository: AuditRepository,
    private prisma: PrismaService,
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
      totalPages: result.totalPages,
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

    // Find or create tire brand
    let tireBrand = await this.prisma.tireBrand.findUnique({
      where: { name: createTireDto.brand },
    });

    if (!tireBrand) {
      tireBrand = await this.prisma.tireBrand.create({
        data: { name: createTireDto.brand },
      });
    }

    // Find or create tire size
    let tireSize = await this.prisma.tireSize.findUnique({
      where: { size: createTireDto.size },
    });

    if (!tireSize) {
      tireSize = await this.prisma.tireSize.create({
        data: { size: createTireDto.size },
      });
    }

    // Find or create location if provided
    let tireLocation = null;
    if (createTireDto.location && createTireDto.location.trim()) {
      tireLocation = await this.prisma.location.findUnique({
        where: { name: createTireDto.location },
      });

      if (!tireLocation) {
        tireLocation = await this.prisma.location.create({
          data: { name: createTireDto.location },
        });
      }
    }

    // Check for duplicates using the relationship IDs
    const existingTires = await this.prisma.tire.findMany({
      where: {
        brandId: tireBrand.id,
        sizeId: tireSize.id,
        type: createTireDto.type,
        condition: createTireDto.condition,
      },
    });

    if (existingTires.length > 0) {
      throw new ConflictException(
        'Tire with the same specifications already exists. Consider updating the quantity instead.',
      );
    }

    // Create tire data with relationship connections
    const tireData = {
      name: createTireDto.name,
      sku: createTireDto.sku,
      brand: { connect: { id: tireBrand.id } },
      size: { connect: { id: tireSize.id } },
      ...(tireLocation && { location: { connect: { id: tireLocation.id } } }),
      type: createTireDto.type,
      condition: createTireDto.condition,
      quantity: createTireDto.quantity,
      price: new Decimal(createTireDto.price),
      cost: createTireDto.cost ? new Decimal(createTireDto.cost) : null,
      minStock: createTireDto.minStock || 5,
      imageUrl: createTireDto.imageUrl,
      description: createTireDto.description,
      notes: createTireDto.notes,
    };

    const tire = await this.tireRepository.create(tireData);

    // Log the creation
    await this.auditRepository.create({
      userId,
      action: 'TIRE_CREATED',
      entityType: 'tire',
      entityId: tire.id,
      details: {
        brand: createTireDto.brand,
        size: createTireDto.size,
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

    // Prepare update data with relationship handling
    const updateData: any = {};

    // Handle brand relationship if provided
    if (updateTireDto.brand !== undefined) {
      let tireBrand = await this.prisma.tireBrand.findUnique({
        where: { name: updateTireDto.brand },
      });

      if (!tireBrand) {
        tireBrand = await this.prisma.tireBrand.create({
          data: { name: updateTireDto.brand },
        });
      }

      updateData.brand = { connect: { id: tireBrand.id } };
    }

    // Handle size relationship if provided
    if (updateTireDto.size !== undefined) {
      let tireSize = await this.prisma.tireSize.findUnique({
        where: { size: updateTireDto.size },
      });

      if (!tireSize) {
        tireSize = await this.prisma.tireSize.create({
          data: { size: updateTireDto.size },
        });
      }

      updateData.size = { connect: { id: tireSize.id } };
    }

    // Handle location relationship if provided
    if (updateTireDto.location !== undefined) {
      if (updateTireDto.location && updateTireDto.location.trim()) {
        let tireLocation = await this.prisma.location.findUnique({
          where: { name: updateTireDto.location },
        });

        if (!tireLocation) {
          tireLocation = await this.prisma.location.create({
            data: { name: updateTireDto.location },
          });
        }

        updateData.location = { connect: { id: tireLocation.id } };
      } else {
        // Disconnect location if empty string is provided
        updateData.location = { disconnect: true };
      }
    }

    // Handle other direct fields
    if (updateTireDto.name !== undefined) {
      updateData.name = updateTireDto.name;
    }

    if (updateTireDto.sku !== undefined) {
      updateData.sku = updateTireDto.sku;
    }

    if (updateTireDto.type !== undefined) {
      updateData.type = updateTireDto.type;
    }

    if (updateTireDto.condition !== undefined) {
      updateData.condition = updateTireDto.condition;
    }

    if (updateTireDto.quantity !== undefined) {
      updateData.quantity = updateTireDto.quantity;
    }

    if (updateTireDto.price !== undefined) {
      updateData.price = new Decimal(updateTireDto.price);
    }

    if (updateTireDto.cost !== undefined) {
      updateData.cost = new Decimal(updateTireDto.cost);
    }

    if (updateTireDto.minStock !== undefined) {
      updateData.minStock = updateTireDto.minStock;
    }

    if (updateTireDto.imageUrl !== undefined) {
      updateData.imageUrl = updateTireDto.imageUrl;
    }

    if (updateTireDto.description !== undefined) {
      updateData.description = updateTireDto.description;
    }

    if (updateTireDto.notes !== undefined) {
      updateData.notes = updateTireDto.notes;
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
        brand: updatedTire.brand?.name || 'Unknown Brand',
        size: updatedTire.size?.size || 'Unknown Size',
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
      brand: tire.brand?.name || tire.brand,
      size: tire.size?.size || tire.size,
      location: tire.location?.name || tire.location,
      price: tire.price.toNumber ? tire.price.toNumber() : tire.price,
      cost: tire.cost?.toNumber ? tire.cost.toNumber() : tire.cost,
      isLowStock: tire.quantity <= tire.minStock,
    };

    // Remove the relationship objects to avoid confusion
    delete response.brandId;
    delete response.sizeId;
    delete response.locationId;

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

  // ============ TIRE BRAND MANAGEMENT ============

  async getAllTireBrands(): Promise<TireBrandDto[]> {
    const brands = await this.prisma.tireBrand.findMany({
      orderBy: { name: 'asc' },
    });
    return brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      imageUrl: brand.imageUrl || undefined,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }));
  }

  async createTireBrand(dto: CreateTireBrandDto, userId: string): Promise<TireBrandDto> {
    try {
      const brand = await this.prisma.tireBrand.create({
        data: {
          name: dto.name,
          imageUrl: dto.imageUrl,
        },
      });

      // Log audit
      await this.auditRepository.create({
        userId,
        action: 'CREATE',
        resource: 'TireBrand',
        resourceId: brand.id,
        newValue: brand,
      });

      return {
        id: brand.id,
        name: brand.name,
        imageUrl: brand.imageUrl || undefined,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictException('Tire brand name already exists');
      }
      throw error;
    }
  }

  async updateTireBrand(id: string, dto: UpdateTireBrandDto, userId: string): Promise<TireBrandDto> {
    const existingBrand = await this.prisma.tireBrand.findUnique({ where: { id } });
    if (!existingBrand) {
      throw new NotFoundException('Tire brand not found');
    }

    try {
      const brand = await this.prisma.tireBrand.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        },
      });

      // Log audit
      await this.auditRepository.create({
        userId,
        action: 'UPDATE',
        resource: 'TireBrand',
        resourceId: brand.id,
        oldValue: existingBrand,
        newValue: brand,
      });

      return {
        id: brand.id,
        name: brand.name,
        imageUrl: brand.imageUrl || undefined,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictException('Tire brand name already exists');
      }
      throw error;
    }
  }

  async deleteTireBrand(id: string, userId: string): Promise<{ success: boolean }> {
    const existingBrand = await this.prisma.tireBrand.findUnique({ where: { id } });
    if (!existingBrand) {
      throw new NotFoundException('Tire brand not found');
    }

    // Check if brand is used by any tires
    const tiresUsingBrand = await this.prisma.tire.count({
      where: { brandId: id },
    });

    if (tiresUsingBrand > 0) {
      throw new ConflictException('Cannot delete tire brand - it is being used by existing tires');
    }

    await this.prisma.tireBrand.delete({ where: { id } });

    // Log audit
    await this.auditRepository.log({
      userId,
      action: 'DELETE',
      resource: 'TireBrand',
      resourceId: id,
      oldValue: existingBrand,
    });

    return { success: true };
  }

  // ============ TIRE SIZE MANAGEMENT ============

  async getAllTireSizes(): Promise<TireSizeDto[]> {
    const sizes = await this.prisma.tireSize.findMany({
      orderBy: { size: 'asc' },
    });
    return sizes.map(size => ({
      id: size.id,
      size: size.size,
      createdAt: size.createdAt,
      updatedAt: size.updatedAt,
    }));
  }

  async createTireSize(dto: CreateTireSizeDto, userId: string): Promise<TireSizeDto> {
    try {
      const size = await this.prisma.tireSize.create({
        data: {
          size: dto.size,
        },
      });

      // Log audit
      await this.auditRepository.create({
        userId,
        action: 'CREATE',
        resource: 'TireSize',
        resourceId: size.id,
        newValue: size,
      });

      return {
        id: size.id,
        size: size.size,
        createdAt: size.createdAt,
        updatedAt: size.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictException('Tire size already exists');
      }
      throw error;
    }
  }

  async updateTireSize(id: string, dto: UpdateTireSizeDto, userId: string): Promise<TireSizeDto> {
    const existingSize = await this.prisma.tireSize.findUnique({ where: { id } });
    if (!existingSize) {
      throw new NotFoundException('Tire size not found');
    }

    try {
      const size = await this.prisma.tireSize.update({
        where: { id },
        data: {
          ...(dto.size && { size: dto.size }),
        },
      });

      // Log audit
      await this.auditRepository.create({
        userId,
        action: 'UPDATE',
        resource: 'TireSize',
        resourceId: size.id,
        oldValue: existingSize,
        newValue: size,
      });

      return {
        id: size.id,
        size: size.size,
        createdAt: size.createdAt,
        updatedAt: size.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictException('Tire size already exists');
      }
      throw error;
    }
  }

  async deleteTireSize(id: string, userId: string): Promise<{ success: boolean }> {
    const existingSize = await this.prisma.tireSize.findUnique({ where: { id } });
    if (!existingSize) {
      throw new NotFoundException('Tire size not found');
    }

    // Check if size is used by any tires
    const tiresUsingSize = await this.prisma.tire.count({
      where: { sizeId: id },
    });

    if (tiresUsingSize > 0) {
      throw new ConflictException('Cannot delete tire size - it is being used by existing tires');
    }

    await this.prisma.tireSize.delete({ where: { id } });

    // Log audit
    await this.auditRepository.log({
      userId,
      action: 'DELETE',
      resource: 'TireSize',
      resourceId: id,
      oldValue: existingSize,
    });

    return { success: true };
  }

  // ============ LOCATION MANAGEMENT ============

  async getAllLocations(): Promise<any[]> {
    const locations = await this.prisma.location.findMany({
      orderBy: { name: 'asc' },
    });

    return locations.map(location => ({
      id: location.id,
      name: location.name,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    }));
  }

  async getLocations(userRole?: string): Promise<string[]> {
    const locations = await this.prisma.location.findMany({
      orderBy: { name: 'asc' },
      select: { name: true },
    });

    return locations.map(location => location.name);
  }

  async createLocation(createLocationDto: any, userId: string): Promise<any> {
    try {
      const location = await this.prisma.location.create({
        data: {
          name: createLocationDto.name,
        },
      });

      // Log audit
      await this.auditRepository.create({
        userId,
        action: 'CREATE',
        resource: 'Location',
        resourceId: location.id,
        newValue: location,
      });

      return {
        id: location.id,
        name: location.name,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictException('Location already exists');
      }
      throw error;
    }
  }

  async updateLocation(id: string, updateLocationDto: any, userId: string): Promise<any> {
    const existingLocation = await this.prisma.location.findUnique({ where: { id } });
    if (!existingLocation) {
      throw new NotFoundException('Location not found');
    }

    try {
      const location = await this.prisma.location.update({
        where: { id },
        data: {
          name: updateLocationDto.name,
        },
      });

      // Log audit
      await this.auditRepository.create({
        userId,
        action: 'UPDATE',
        resource: 'Location',
        resourceId: id,
        oldValue: existingLocation,
        newValue: location,
      });

      return {
        id: location.id,
        name: location.name,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new ConflictException('Location already exists');
      }
      throw error;
    }
  }

  async deleteLocation(id: string, userId: string): Promise<{ success: boolean }> {
    const existingLocation = await this.prisma.location.findUnique({ where: { id } });
    if (!existingLocation) {
      throw new NotFoundException('Location not found');
    }

    // Check if location is used by any tires
    const tiresUsingLocation = await this.prisma.tire.count({
      where: { locationId: id },
    });

    if (tiresUsingLocation > 0) {
      throw new ConflictException('Cannot delete location - it is being used by existing tires');
    }

    await this.prisma.location.delete({ where: { id } });

    // Log audit
    await this.auditRepository.log({
      userId,
      action: 'DELETE',
      resource: 'Location',
      resourceId: id,
      oldValue: existingLocation,
    });

    return { success: true };
  }
}