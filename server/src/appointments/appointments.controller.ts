import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentInvoiceService } from './appointment-invoice.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentQueryDto,
  CalendarQueryDto,
  PaymentDateQueryDto,
  CreateETransferInvoiceDto,
  CreateSquareDeviceInvoiceDto,
} from '../common/dto/appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '@gt-automotive/database';
import { calculateTaxes } from '../config/tax.config';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentInvoiceService: AppointmentInvoiceService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new appointment
   * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
   */
  @Post()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentsService.create(createAppointmentDto, user.id);
  }

  /**
   * Get all appointments with filters
   * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
   */
  @Get()
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async findAll(@Query() query: AppointmentQueryDto, @CurrentUser() user: any) {
    return this.appointmentsService.findAll(query, user);
  }

  /**
   * Get calendar view
   * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
   */
  @Get('calendar')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getCalendar(@Query() query: CalendarQueryDto, @CurrentUser() user: any) {
    return this.appointmentsService.getCalendar(query, user);
  }

  /**
   * Get today's appointments
   * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
   */
  @Get('today')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getToday(@CurrentUser() user: any) {
    return this.appointmentsService.getTodayAppointments(user);
  }

  /**
   * Get appointments by payment date (for daily cash reports / day summary)
   * Roles: ADMIN, SUPERVISOR, STAFF
   */
  @Get('by-payment-date')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getByPaymentDate(@Query() query: PaymentDateQueryDto) {
    return this.appointmentsService.getByPaymentDate(query.paymentDate);
  }

  /**
   * Get appointments with payments in a date range (for calendar highlighting)
   * This is optimized to return all payments in one request instead of per-day requests
   * Roles: ADMIN, SUPERVISOR, STAFF
   */
  @Get('payments-by-range')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getPaymentsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appointmentsService.getPaymentsByDateRange(startDate, endDate);
  }

  /**
   * Get customer's upcoming appointments
   * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER (customers can only see their own)
   */
  @Get('customer/:customerId')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async getCustomerAppointments(@Param('customerId') customerId: string, @CurrentUser() user: any) {
    // TODO: Add permission check for customers to only see their own appointments
    return this.appointmentsService.getCustomerUpcoming(customerId);
  }

  /**
   * Create E-Transfer invoice for an appointment
   * Creates an invoice with PENDING status and completes the appointment
   * Roles: ADMIN, SUPERVISOR, STAFF
   */
  @Post(':id/e-transfer-invoice')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async createETransferInvoice(
    @Param('id') id: string,
    @Body() dto: CreateETransferInvoiceDto,
    @CurrentUser() user: any,
  ) {
    // 1. Verify appointment exists and is IN_PROGRESS or COMPLETED (for remaining payments)
    const appointment = await this.appointmentsService.findOne(id);
    if (appointment.status !== 'IN_PROGRESS' && appointment.status !== 'COMPLETED') {
      throw new BadRequestException(
        `Appointment must be IN_PROGRESS or COMPLETED to create invoice. Current status: ${appointment.status}`,
      );
    }

    // 2. Calculate taxes and total (tip is not taxed)
    const taxes = calculateTaxes(dto.serviceAmount);
    const tipAmount = dto.tipAmount || 0;
    const totalWithTip = taxes.totalAmount + tipAmount;

    // 3. Create invoice with PAID status (E-Transfer received)
    const invoice = await this.appointmentInvoiceService.createInvoiceFromAppointment({
      appointmentId: id,
      serviceAmount: dto.serviceAmount,
      tipAmount,
      userId: user.id,
      paymentMethod: 'E_TRANSFER',
      status: 'PAID',
    });

    // 4. Update appointment to COMPLETED with payment info
    // If already completed (partial payment scenario), add to existing payment
    const existingPaymentAmount = appointment.paymentAmount || 0;
    const existingBreakdown = (appointment.paymentBreakdown as any[]) || [];

    await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paymentDate: new Date(),
        expectedAmount: appointment.expectedAmount || totalWithTip,
        paymentAmount: existingPaymentAmount + totalWithTip, // Add to existing payment (includes tip)
        paymentBreakdown: [
          ...existingBreakdown,
          {
            id: crypto.randomUUID(),
            method: 'E_TRANSFER',
            amount: totalWithTip, // This E-Transfer payment (includes tip)
          },
        ],
      },
    });

    return {
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: totalWithTip,
        status: invoice.status,
      },
      message: `Invoice ${invoice.invoiceNumber} created successfully. Awaiting E-Transfer payment.`,
    };
  }

  /**
   * Create Square Device invoice for an appointment
   * Creates an invoice with PAID status (payment received via Square terminal device)
   * Roles: ADMIN, SUPERVISOR, STAFF
   */
  @Post(':id/square-device-invoice')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async createSquareDeviceInvoice(
    @Param('id') id: string,
    @Body() dto: CreateSquareDeviceInvoiceDto,
    @CurrentUser() user: any,
  ) {
    // 1. Verify appointment exists and is IN_PROGRESS or COMPLETED (for remaining payments)
    const appointment = await this.appointmentsService.findOne(id);
    if (appointment.status !== 'IN_PROGRESS' && appointment.status !== 'COMPLETED') {
      throw new BadRequestException(
        `Appointment must be IN_PROGRESS or COMPLETED to create invoice. Current status: ${appointment.status}`,
      );
    }

    // 2. Calculate taxes and total (tip is not taxed)
    const taxes = calculateTaxes(dto.serviceAmount);
    const tipAmount = dto.tipAmount || 0;
    const totalWithTip = taxes.totalAmount + tipAmount;

    // 3. Create invoice with PAID status (Square Device payment received)
    const invoice = await this.appointmentInvoiceService.createInvoiceFromAppointment({
      appointmentId: id,
      serviceAmount: dto.serviceAmount,
      tipAmount,
      userId: user.id,
      paymentMethod: 'CREDIT_CARD',
      status: 'PAID',
    });

    // 4. Update appointment to COMPLETED with payment info
    // If already completed (partial payment scenario), add to existing payment
    const existingPaymentAmount = appointment.paymentAmount || 0;
    const existingBreakdown = (appointment.paymentBreakdown as any[]) || [];

    await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paymentDate: new Date(),
        expectedAmount: appointment.expectedAmount || totalWithTip,
        paymentAmount: existingPaymentAmount + totalWithTip, // Add to existing payment (includes tip)
        paymentBreakdown: [
          ...existingBreakdown,
          {
            id: crypto.randomUUID(),
            method: 'CREDIT_CARD',
            amount: totalWithTip, // This Square Device payment (includes tip)
          },
        ],
      },
    });

    return {
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: totalWithTip,
        status: invoice.status,
      },
      message: `Invoice ${invoice.invoiceNumber} created successfully. Payment received via Square Device.`,
    };
  }

  /**
   * Get a single appointment by ID
   * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
   */
  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /**
   * Update an appointment
   * Roles: ADMIN, SUPERVISOR, STAFF
   */
  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  /**
   * Cancel an appointment
   * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
   */
  @Patch(':id/cancel')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(id);
  }

  /**
   * Delete an appointment (hard delete)
   * Roles: ADMIN, SUPERVISOR
   */
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
