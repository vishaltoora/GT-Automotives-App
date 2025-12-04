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
import { PurchaseExpenseInvoicesService } from './purchase-expense-invoices.service';
import {
  CreatePurchaseExpenseInvoiceDto,
  UpdatePurchaseExpenseInvoiceDto,
  PurchaseExpenseInvoiceFilterDto,
  PurchaseExpenseInvoiceResponseDto,
} from '../common/dto/purchase-expense-invoice.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('purchase-expense-invoices')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PurchaseExpenseInvoicesController {
  constructor(
    private readonly purchaseExpenseInvoicesService: PurchaseExpenseInvoicesService,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async create(
    @Body(ValidationPipe) createDto: CreatePurchaseExpenseInvoiceDto,
    @CurrentUser() user: any,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    return this.purchaseExpenseInvoicesService.create(createDto, user.id);
  }

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async findAll(
    @Query(ValidationPipe) filterDto: PurchaseExpenseInvoiceFilterDto,
  ): Promise<{
    data: PurchaseExpenseInvoiceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.purchaseExpenseInvoicesService.findAll(filterDto);
  }

  // IMPORTANT: Specific routes with path segments must come BEFORE generic :id routes
  // Otherwise NestJS will match :id first and treat "image-url" as part of the id

  @Get(':id/image-url')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getImageUrl(@Param('id') id: string): Promise<{ imageUrl: string }> {
    const imageUrl = await this.purchaseExpenseInvoicesService.getImageUrl(id);
    return { imageUrl };
  }

  @Post(':id/upload')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.purchaseExpenseInvoicesService.uploadImage(
      id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete(':id/image')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async deleteImage(
    @Param('id') id: string,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    return this.purchaseExpenseInvoicesService.deleteImage(id);
  }

  // Generic :id routes come AFTER specific routes
  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async findOne(
    @Param('id') id: string,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    return this.purchaseExpenseInvoicesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdatePurchaseExpenseInvoiceDto,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    return this.purchaseExpenseInvoicesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  async remove(
    @Param('id') id: string,
  ): Promise<PurchaseExpenseInvoiceResponseDto> {
    return this.purchaseExpenseInvoicesService.remove(id);
  }
}
