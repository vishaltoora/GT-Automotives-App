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
import { ExpenseInvoicesService } from './expense-invoices.service';
import {
  CreateExpenseInvoiceDto,
  UpdateExpenseInvoiceDto,
  ExpenseInvoiceResponseDto,
  ExpenseInvoiceFilterDto,
} from '../common/dto/expense-invoice.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('expense-invoices')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ExpenseInvoicesController {
  constructor(private readonly expenseInvoicesService: ExpenseInvoicesService) {}

  @Post()
  @Roles('ADMIN', 'STAFF')
  async create(
    @Body(ValidationPipe) createDto: CreateExpenseInvoiceDto,
  ): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'STAFF')
  async findAll(
    @Query(ValidationPipe) filterDto: ExpenseInvoiceFilterDto,
  ): Promise<{
    data: ExpenseInvoiceResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.expenseInvoicesService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  async findOne(@Param('id') id: string): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'STAFF')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateExpenseInvoiceDto,
  ): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.update(id, updateDto);
  }

  @Post(':id/upload')
  @Roles('ADMIN', 'STAFF')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ): Promise<ExpenseInvoiceResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.expenseInvoicesService.uploadImage(
      id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete(':id/image')
  @Roles('ADMIN', 'STAFF')
  async deleteImage(@Param('id') id: string): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.deleteImage(id);
  }

  @Get(':id/image-url')
  @Roles('ADMIN', 'STAFF')
  async getImageUrl(@Param('id') id: string): Promise<{ imageUrl: string }> {
    const imageUrl = await this.expenseInvoicesService.getImageUrl(id);
    return { imageUrl };
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.remove(id);
  }
}
