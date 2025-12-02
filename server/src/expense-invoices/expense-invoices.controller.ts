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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async create(
    @Body(ValidationPipe) createDto: CreateExpenseInvoiceDto,
  ): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.create(createDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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

  // IMPORTANT: Specific routes with path segments must come BEFORE generic :id routes
  // Otherwise NestJS will match :id first and treat "image-url" as part of the id

  @Get(':id/image-url')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getImageUrl(@Param('id') id: string): Promise<{ imageUrl: string }> {
    const imageUrl = await this.expenseInvoicesService.getImageUrl(id);
    return { imageUrl };
  }

  @Post(':id/upload')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async deleteImage(@Param('id') id: string): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.deleteImage(id);
  }

  // Generic :id routes come AFTER specific routes
  @Get(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async findOne(@Param('id') id: string): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateExpenseInvoiceDto,
  ): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERVISOR')
  async remove(@Param('id') id: string): Promise<ExpenseInvoiceResponseDto> {
    return this.expenseInvoicesService.remove(id);
  }
}
