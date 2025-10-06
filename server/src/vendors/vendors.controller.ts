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
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorResponseDto, VendorSearchDto } from '../common/dto/vendor.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RoleGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles(['ADMIN'])
  async create(
    @Body(ValidationPipe) createVendorDto: CreateVendorDto,
  ): Promise<VendorResponseDto> {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  @Roles(['ADMIN', 'STAFF'])
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: VendorResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.vendorsService.findAll(pageNum, limitNum);
  }

  @Get('search')
  @Roles(['ADMIN', 'STAFF'])
  async search(
    @Query(ValidationPipe) searchDto: VendorSearchDto,
  ): Promise<VendorResponseDto[]> {
    const query = searchDto.query || '';
    const limit = searchDto.limit ? parseInt(searchDto.limit, 10) : 10;
    return this.vendorsService.search(query, limit);
  }

  @Get('active')
  @Roles(['ADMIN', 'STAFF'])
  async findActive(): Promise<VendorResponseDto[]> {
    return this.vendorsService.findActive();
  }

  @Get(':id')
  @Roles(['ADMIN', 'STAFF'])
  async findOne(@Param('id') id: string): Promise<VendorResponseDto> {
    return this.vendorsService.findOne(id);
  }

  @Put(':id')
  @Roles(['ADMIN'])
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVendorDto: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    return this.vendorsService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  async remove(@Param('id') id: string): Promise<VendorResponseDto> {
    return this.vendorsService.remove(id);
  }
}
