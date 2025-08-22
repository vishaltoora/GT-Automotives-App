import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';
import { TiresService } from './tires.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import {
  CreateTireDto,
  UpdateTireDto,
  StockAdjustmentDto,
  TireSearchDto,
  TireResponseDto,
  TireSearchResultDto,
  InventoryReportDto,
} from '@gt-automotive/shared-dto';
import { ITireFilters, ITireSearchParams } from '@gt-automotive/shared-interfaces';

@Controller('api/tires')
export class TiresController {
  constructor(private tiresService: TiresService) {}

  // Public endpoint - customers can view tires
  @Get()
  @Public()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) searchDto: TireSearchDto,
    @CurrentUser() user?: any,
  ): Promise<TireResponseDto[] | TireSearchResultDto> {
    const userRole = user?.role?.name;

    // If search parameters are provided, use search method
    if (Object.keys(searchDto).length > 0) {
      const searchParams: ITireSearchParams = {
        filters: {
          brand: searchDto.brand,
          model: searchDto.model,
          size: searchDto.size,
          type: searchDto.type,
          condition: searchDto.condition,
          minPrice: searchDto.minPrice,
          maxPrice: searchDto.maxPrice,
          inStock: searchDto.inStock,
          lowStock: searchDto.lowStock,
        },
        search: searchDto.search,
        sortBy: searchDto.sortBy || 'updatedAt',
        sortOrder: searchDto.sortOrder || 'desc',
        page: searchDto.page || 1,
        limit: searchDto.limit || 20,
      };

      return this.tiresService.search(searchParams, userRole);
    }

    // Simple findAll for basic requests
    const filters: ITireFilters = {
      inStock: true, // Only show in-stock items by default for public
    };

    return this.tiresService.findAll(filters, userRole);
  }

  // Public endpoint - get all tire brands
  @Get('brands')
  @Public()
  async getBrands(
    @CurrentUser() user?: any,
  ): Promise<string[]> {
    const userRole = user?.role?.name;
    return this.tiresService.getBrands(userRole);
  }

  // Public endpoint - get all tire models for a brand
  @Get('brands/:brand/models')
  @Public()
  async getModelsForBrand(
    @Param('brand') brand: string,
    @CurrentUser() user?: any,
  ): Promise<string[]> {
    const userRole = user?.role?.name;
    return this.tiresService.getModelsForBrand(brand, userRole);
  }

  // Public endpoint - get all tire sizes
  @Get('sizes')
  @Public()
  async getSizes(
    @CurrentUser() user?: any,
  ): Promise<string[]> {
    const userRole = user?.role?.name;
    return this.tiresService.getSizes(userRole);
  }

  // Public endpoint - customers can view individual tires
  @Get(':id')
  @Public()
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: any,
  ): Promise<TireResponseDto> {
    const userRole = user?.role?.name;
    return this.tiresService.findById(id, userRole);
  }

  // Staff and Admin - Create new tire
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('staff', 'admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createTireDto: CreateTireDto,
    @CurrentUser() user: any,
  ): Promise<TireResponseDto> {
    return this.tiresService.create(
      createTireDto,
      user.id,
      user.role.name,
    );
  }

  // Staff and Admin - Update tire
  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('staff', 'admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTireDto: UpdateTireDto,
    @CurrentUser() user: any,
  ): Promise<TireResponseDto> {
    return this.tiresService.update(
      id,
      updateTireDto,
      user.id,
      user.role.name,
    );
  }

  // Admin only - Delete tire
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    return this.tiresService.delete(id, user.id, user.role.name);
  }

  // Staff and Admin - Adjust stock
  @Post(':id/adjust-stock')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('staff', 'admin')
  @UsePipes(new ValidationPipe({ transform: true }))
  async adjustStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adjustmentDto: StockAdjustmentDto,
    @CurrentUser() user: any,
  ): Promise<TireResponseDto> {
    return this.tiresService.adjustStock(
      id,
      adjustmentDto,
      user.id,
      user.role.name,
    );
  }

  // Staff and Admin - Get low stock items
  @Get('reports/low-stock')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('staff', 'admin')
  async getLowStock(
    @CurrentUser() user: any,
  ): Promise<TireResponseDto[]> {
    return this.tiresService.getLowStock(user.role.name);
  }

  // Admin only - Get inventory report
  @Get('reports/inventory')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  async getInventoryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ): Promise<InventoryReportDto> {
    const filters = {
      startDate,
      endDate,
    };
    return this.tiresService.getInventoryReport(filters, user?.role?.name);
  }

  // Staff and Admin - Search by brand and model
  @Get('search/brand/:brand/model/:model')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('staff', 'admin')
  async findByBrandAndModel(
    @Param('brand') brand: string,
    @Param('model') model: string,
    @CurrentUser() user: any,
  ): Promise<TireResponseDto[]> {
    return this.tiresService.findByBrandAndModel(
      brand,
      model,
      user.role.name,
    );
  }

  // Public - Search by size (useful for customers)
  @Get('search/size/:size')
  @Public()
  async findBySize(
    @Param('size') size: string,
    @Query('type') type?: string,
    @CurrentUser() user?: any,
  ): Promise<TireResponseDto[]> {
    const userRole = user?.role?.name;
    return this.tiresService.findBySizeAndType(size, type as any, userRole);
  }

  // Staff and Admin - Get stock alerts
  @Get('alerts/low-stock')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('staff', 'admin')
  async getStockAlerts(): Promise<TireResponseDto[]> {
    return this.tiresService.checkLowStockAlerts();
  }

  // TODO: Image upload endpoints
  // @Post(':id/images')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles('staff', 'admin')
  // async uploadImage(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @UploadedFile() file: Express.Multer.File,
  //   @CurrentUser() user: any,
  // ): Promise<{ imageUrl: string }> {
  //   // Implementation for image upload
  // }

  // @Delete(':id/images/:imageId')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles('staff', 'admin')
  // async deleteImage(
  //   @Param('id', ParseUUIDPipe) id: string,
  //   @Param('imageId', ParseUUIDPipe) imageId: string,
  //   @CurrentUser() user: any,
  // ): Promise<{ success: boolean }> {
  //   // Implementation for image deletion
  // }
}