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
import {
  CreateServiceTypeDto,
  UpdateServiceTypeDto,
  ServiceTypeResponseDto,
} from '@gt-automotive/data';
import { ServiceTypesService } from './service-types.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('service-types')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Get()
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  async findAll(
    @Query('activeOnly') activeOnly?: string
  ): Promise<ServiceTypeResponseDto[]> {
    return this.serviceTypesService.findAll(activeOnly === 'true');
  }

  // Public catalog for the customer-facing booking form. Only active types.
  @Get('public')
  @Public()
  async findPublic(): Promise<ServiceTypeResponseDto[]> {
    return this.serviceTypesService.findAll(true);
  }

  @Get(':id')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  async findOne(@Param('id') id: string): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  async create(
    @Body(ValidationPipe) dto: CreateServiceTypeDto
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.create(dto);
  }

  @Put(':id')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateServiceTypeDto
  ): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR')
  async remove(@Param('id') id: string): Promise<ServiceTypeResponseDto> {
    return this.serviceTypesService.remove(id);
  }
}
