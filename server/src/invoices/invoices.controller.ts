import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from '../common/dto/invoice.dto';
import { UpdateInvoiceDto } from '../common/dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

@Controller('api/invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user);
  }

  @Get('search')
  search(
    @Query('customerName') customerName?: string,
    @Query('invoiceNumber') invoiceNumber?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('companyId') companyId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.invoicesService.searchInvoices(
      {
        customerName,
        invoiceNumber,
        startDate,
        endDate,
        status,
        companyId,
      },
      user,
    );
  }

  @Get('cash-report')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  getDailyCashReport(@Query('date') date: string, @CurrentUser() user: any) {
    const reportDate = date || new Date().toISOString().split('T')[0];
    return this.invoicesService.getDailyCashReport(reportDate, user);
  }

  @Get('customer/:customerId')
  getCustomerInvoices(@Param('customerId') customerId: string, @CurrentUser() user: any) {
    return this.invoicesService.getCustomerInvoices(customerId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, user.id);
  }

  @Post(':id/pay')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  markAsPaid(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.markAsPaid(id, paymentMethod, user.id);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.remove(id, user.id);
  }
}