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
  UsePipes,
} from '@nestjs/common';
import { TiresService } from './tires.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateTireDto } from '../common/dto/tire.dto';
import { UpdateTireDto } from '../common/dto/tire.dto';
import { StockAdjustmentDto } from '../common/dto/tire.dto';
import { TireSearchDto, TireResponseDto, TireSearchResultDto } from '../common/dto/tire.dto';
import { CreateTireBrandDto, UpdateTireBrandDto, TireBrandDto } from '../common/dto/tire-brand.dto';
import { CreateTireSizeDto, UpdateTireSizeDto, TireSizeDto } from '../common/dto/tire-size.dto';
import { CreateLocationDto, UpdateLocationDto, LocationDto } from '../common/dto/location.dto';

@Controller('tires')
export class TiresController {
  constructor(private tiresService: TiresService) {}

  // Public endpoint - customers can view tires
  @Get()
  @Public()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) searchDto: TireSearchDto,
    @CurrentUser() user?: any,
  ): Promise<TireSearchResultDto | TireResponseDto[]> {
    const userRole = user?.role?.name;

    // If search parameters are provided, use search method
    if (Object.keys(searchDto).length > 0) {
      return this.tiresService.search(searchDto, userRole);
    }

    // Simple findAll for basic requests
    const filters: any = {
      inStock: true, // Only show in-stock items by default for public
    };

    return this.tiresService.findAll(filters, userRole);
  }

  // ============ TIRE BRAND MANAGEMENT ============

  // Get all tire brands (CRUD endpoint - must come before generic 'brands' route)
  @Get('brands/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getAllTireBrands(): Promise<TireBrandDto[]> {
    return this.tiresService.getAllTireBrands();
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

  // Create new tire brand
  @Post('brands')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTireBrand(
    @Body() createTireBrandDto: CreateTireBrandDto,
    @CurrentUser() user: any,
  ): Promise<TireBrandDto> {
    return this.tiresService.createTireBrand(createTireBrandDto, user.id);
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

  // Update tire brand
  @Put('brands/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTireBrand(
    @Param('id') id: string,
    @Body() updateTireBrandDto: UpdateTireBrandDto,
    @CurrentUser() user: any,
  ): Promise<TireBrandDto> {
    return this.tiresService.updateTireBrand(id, updateTireBrandDto, user.id);
  }

  // Delete tire brand
  @Delete('brands/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTireBrand(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    return this.tiresService.deleteTireBrand(id, user.id);
  }

  // ============ TIRE SIZE MANAGEMENT ============

  // Get all tire sizes (CRUD endpoint - must come before generic 'sizes' route)
  @Get('sizes/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getAllTireSizes(): Promise<TireSizeDto[]> {
    return this.tiresService.getAllTireSizes();
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

  // Create new tire size
  @Post('sizes')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTireSize(
    @Body() createTireSizeDto: CreateTireSizeDto,
    @CurrentUser() user: any,
  ): Promise<TireSizeDto> {
    return this.tiresService.createTireSize(createTireSizeDto, user.id);
  }

  // Update tire size
  @Put('sizes/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTireSize(
    @Param('id') id: string,
    @Body() updateTireSizeDto: UpdateTireSizeDto,
    @CurrentUser() user: any,
  ): Promise<TireSizeDto> {
    return this.tiresService.updateTireSize(id, updateTireSizeDto, user.id);
  }

  // Delete tire size
  @Delete('sizes/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTireSize(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    return this.tiresService.deleteTireSize(id, user.id);
  }

  // ============ LOCATION MANAGEMENT ============

  // Get all locations (CRUD endpoint - must come before generic 'locations' route)
  @Get('locations/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getAllLocations(): Promise<LocationDto[]> {
    return this.tiresService.getAllLocations();
  }

  // Public endpoint - get all locations
  @Get('locations')
  @Public()
  async getLocations(
    @CurrentUser() user?: any,
  ): Promise<string[]> {
    const userRole = user?.role?.name;
    return this.tiresService.getLocations(userRole);
  }

  // Create new location
  @Post('locations')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createLocation(
    @Body() createLocationDto: CreateLocationDto,
    @CurrentUser() user: any,
  ): Promise<LocationDto> {
    return this.tiresService.createLocation(createLocationDto, user.id);
  }

  // Update location
  @Put('locations/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser() user: any,
  ): Promise<LocationDto> {
    return this.tiresService.updateLocation(id, updateLocationDto, user.id);
  }

  // Delete location
  @Delete('locations/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLocation(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    return this.tiresService.deleteLocation(id, user.id);
  }

  // Public endpoint - customers can view individual tires
  @Get(':id')
  @Public()
  async findById(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ): Promise<any> {
    const userRole = user?.role?.name;
    return this.tiresService.findById(id, userRole);
  }

  // Staff and Admin - Create new tire
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
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
  @Roles('ADMIN', 'SUPERVISOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean }> {
    return this.tiresService.delete(id, user.id, user.role.name);
  }

  // Staff and Admin - Adjust stock
  @Post(':id/adjust-stock')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UsePipes(new ValidationPipe({ transform: true }))
  async adjustStock(
    @Param('id') id: string,
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getLowStock(
    @CurrentUser() user: any,
  ): Promise<TireResponseDto[]> {
    return this.tiresService.getLowStock(user.role.name);
  }

  // Admin only - Get inventory report
  @Get('reports/inventory')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  async getInventoryReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ): Promise<any> {
    const filters = {
      startDate,
      endDate,
    };
    return this.tiresService.getInventoryReport(filters, user?.role?.name);
  }

  // Staff and Admin - Search by brand and model
  @Get('search/brand/:brand/model/:model')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getStockAlerts(): Promise<TireResponseDto[]> {
    return this.tiresService.checkLowStockAlerts();
  }


  // TODO: Image upload endpoints
  // @Post(':id/images')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles('staff', 'admin')
  // async uploadImage(
  //   @Param('id') id: string,
  //   @UploadedFile() file: Express.Multer.File,
  //   @CurrentUser() user: any,
  // ): Promise<{ imageUrl: string }> {
  //   // Implementation for image upload
  // }

  // @Delete(':id/images/:imageId')
  // @UseGuards(JwtAuthGuard, RoleGuard)
  // @Roles('staff', 'admin')
  // async deleteImage(
  //   @Param('id') id: string,
  //   @Param('imageId', ParseUUIDPipe) imageId: string,
  //   @CurrentUser() user: any,
  // ): Promise<{ success: boolean }> {
  //   // Implementation for image deletion
  // }
}