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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import {
  CreatePurchaseInvoiceDto,
  UpdatePurchaseInvoiceDto,
  PurchaseInvoiceResponseDto,
  PurchaseInvoiceFilterDto,
} from '../common/dto/purchase-invoice.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('api/purchase-invoices')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PurchaseInvoicesController {
  constructor(private readonly purchaseInvoicesService: PurchaseInvoicesService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  async create(
    @Body(ValidationPipe) createDto: CreatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoiceResponseDto> {
    return this.purchaseInvoicesService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'STAFF')
  async findAll(
    @Query(ValidationPipe) filterDto: PurchaseInvoiceFilterDto,
  ): Promise<{
    data: PurchaseInvoiceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.purchaseInvoicesService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  async findOne(@Param('id') id: string): Promise<PurchaseInvoiceResponseDto> {
    return this.purchaseInvoicesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdatePurchaseInvoiceDto,
  ): Promise<PurchaseInvoiceResponseDto> {
    return this.purchaseInvoicesService.update(id, updateDto);
  }

  @Post(':id/upload')
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<PurchaseInvoiceResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.purchaseInvoicesService.uploadImage(
      id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete(':id/image')
  @Roles('ADMIN', 'STAFF')
  async deleteImage(@Param('id') id: string): Promise<PurchaseInvoiceResponseDto> {
    return this.purchaseInvoicesService.deleteImage(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<PurchaseInvoiceResponseDto> {
    return this.purchaseInvoicesService.remove(id);
  }
}
