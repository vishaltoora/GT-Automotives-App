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
import {
  CreateInvoiceDto,
  CreateServiceDto,
  UpdateInvoiceDto,
  UpdateServiceDto,
} from '@gt-automotive/data';
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
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(createInvoiceDto, user.id);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  findAll(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user);
  }

  @Get('search')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  search(
    @Query('customerName') customerName?: string,
    @Query('invoiceNumber') invoiceNumber?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('companyId') companyId?: string,
    @CurrentUser() user?: any
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
      user
    );
  }

  @Get('cash-report')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'ACCOUNTANT', 'SUPERVISOR', 'STAFF')
  getDailyCashReport(@Query('date') date: string, @CurrentUser() user: any) {
    // Use business timezone date if no date provided
    const reportDate = date || getCurrentBusinessDate();
    return this.invoicesService.getDailyCashReport(reportDate, user);
  }

  @Get('customer/:customerId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  getCustomerInvoices(
    @Param('customerId') customerId: string,
    @CurrentUser() user: any
  ) {
    return this.invoicesService.getCustomerInvoices(customerId, user);
  }

  @Get('day-summary')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  getDaySummaryInvoices(@Query('date') date: string, @CurrentUser() user: any) {
    const reportDate = date || getCurrentBusinessDate();
    return this.invoicesService.getDaySummaryInvoices(reportDate, user);
  }

  @Get('outstanding')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  getOutstandingInvoices(
    @Query('date') date: string,
    @CurrentUser() user: any
  ) {
    const reportDate = date || getCurrentBusinessDate();
    return this.invoicesService.getOutstandingInvoices(reportDate, user);
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: any
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, user.id);
  }

  @Post(':id/pay')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  markAsPaid(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: PaymentMethod,
    @CurrentUser() user: any
  ) {
    return this.invoicesService.markAsPaid(id, paymentMethod, user.id);
  }

  @Post(':id/payments')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  recordPayment(
    @Param('id') id: string,
    @Body()
    body: {
      amount?: number;
      paymentMethod?: PaymentMethod;
      notes?: string;
      reference?: string;
      // Split payment: multiple method/amount entries in one transaction
      payments?: Array<{
        amount?: number;
        paymentMethod: PaymentMethod;
        notes?: string;
        reference?: string;
      }>;
    },
    @CurrentUser() user: any
  ) {
    if (body.payments && body.payments.length > 0) {
      return this.invoicesService.recordPayments(id, body.payments, user.id);
    }
    return this.invoicesService.recordPayment(
      id,
      {
        amount: body.amount,
        paymentMethod: body.paymentMethod as PaymentMethod,
        notes: body.notes,
        reference: body.reference,
      },
      user.id
    );
  }

  @Post('combine')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  combineInvoices(
    @Body('customerId') customerId: string,
    @CurrentUser() user: any
  ) {
    return this.invoicesService.combineInvoices(customerId, user.id);
  }

  @Post(':id/send-email')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  sendEmail(
    @Param('id') id: string,
    @Body()
    body: { email?: string; emails?: string[]; saveToCustomer?: boolean },
    @CurrentUser() user: any
  ) {
    // Accept either a single `email` (legacy) or an `emails` array (multi-recipient)
    const emails =
      body.emails && body.emails.length > 0
        ? body.emails
        : body.email
        ? [body.email]
        : undefined;
    return this.invoicesService.sendInvoiceEmail(
      id,
      user.id,
      emails,
      body.saveToCustomer
    );
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.remove(id, user.id);
  }

  // Service endpoints
  @Get('services/all')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  getAllServices() {
    return this.invoicesService.getAllServices();
  }

  @Post('services')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  createService(@Body() createServiceDto: CreateServiceDto) {
    return this.invoicesService.createService(createServiceDto);
  }

  @Patch('services/:id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF', 'ACCOUNTANT')
  updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    return this.invoicesService.updateService(id, updateServiceDto);
  }

  @Delete('services/:id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'FOREMAN')
  deleteService(@Param('id') id: string) {
    return this.invoicesService.deleteService(id);
  }
}
