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
import { CreateServiceDto, UpdateServiceDto } from '../common/dto/service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { getCurrentBusinessDate } from '../config/timezone.config';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  getDailyCashReport(@Query('date') date: string, @CurrentUser() user: any) {
    // Use business timezone date if no date provided
    const reportDate = date || getCurrentBusinessDate();
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
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, user.id);
  }

  @Post(':id/pay')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'STAFF')
  markAsPaid(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.markAsPaid(id, paymentMethod, user.id);
  }

  @Post(':id/send-email')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  sendEmail(
    @Param('id') id: string,
    @Body() body: { email?: string; saveToCustomer?: boolean },
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.sendInvoiceEmail(id, user.id, body.email, body.saveToCustomer);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.remove(id, user.id);
  }

  // Service endpoints
  @Get('services/all')
  getAllServices() {
    return this.invoicesService.getAllServices();
  }

  @Post('services')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  createService(@Body() createServiceDto: CreateServiceDto) {
    return this.invoicesService.createService(createServiceDto);
  }

  @Patch('services/:id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  updateService(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.invoicesService.updateService(id, updateServiceDto);
  }

  @Delete('services/:id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  deleteService(@Param('id') id: string) {
    return this.invoicesService.deleteService(id);
  }
}