import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SquarePaymentService } from './square-payment.service';
import {
  CreateSquarePaymentDto,
  RefundSquarePaymentDto,
  SquarePaymentResponseDto,
  CreateAppointmentCheckoutDto,
  AppointmentCheckoutResponseDto,
  CreateAppointmentPaymentDto,
} from '../common/dto/square-payment.dto';
import {
  CreateTerminalCheckoutDto,
  TerminalCheckoutResponseDto,
  TerminalDeviceDto,
} from '../common/dto/square-terminal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('square/payments')
@UseGuards(JwtAuthGuard, RoleGuard)
export class SquarePaymentController {
  private readonly logger = new Logger(SquarePaymentController.name);

  constructor(private readonly squarePaymentService: SquarePaymentService) {}

  /**
   * Create a payment for an invoice
   * POST /api/square/payments
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async createPayment(
    @Body() createPaymentDto: CreateSquarePaymentDto,
  ): Promise<SquarePaymentResponseDto> {
    this.logger.log(
      `Creating Square payment for invoice ${createPaymentDto.invoiceId}`,
    );
    return this.squarePaymentService.createPayment(createPaymentDto);
  }

  /**
   * Refund a payment (full or partial)
   * POST /api/square/payments/refund
   */
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'SUPERVISOR')
  async refundPayment(
    @Body() refundDto: RefundSquarePaymentDto,
  ): Promise<SquarePaymentResponseDto> {
    this.logger.log(`Refunding Square payment ${refundDto.squarePaymentId}`);
    return this.squarePaymentService.refundPayment(refundDto);
  }

  /**
   * Create Square payment for appointment (embedded form - same as invoice flow)
   * POST /api/square/payments/appointment
   * Uses Square Web Payments SDK tokenization for card-present payment
   */
  @Post('appointment')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async createAppointmentPayment(
    @Body() paymentDto: CreateAppointmentPaymentDto,
  ): Promise<SquarePaymentResponseDto> {
    this.logger.log(
      `Creating Square payment for appointment ${paymentDto.appointmentId}: $${paymentDto.serviceAmount}${paymentDto.tipAmount ? ` (tip: $${paymentDto.tipAmount})` : ''}`,
    );
    return this.squarePaymentService.createAppointmentPayment(
      paymentDto.appointmentId,
      paymentDto.sourceId,
      paymentDto.serviceAmount,
      paymentDto.tipAmount,
    );
  }

  /**
   * Create Square Checkout Link for appointment payment
   * POST /api/square/payments/appointment/checkout
   * Generates a hosted payment page where customers can pay online (legacy method)
   */
  @Post('appointment/checkout')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async createAppointmentCheckout(
    @Body() checkoutDto: CreateAppointmentCheckoutDto,
  ): Promise<AppointmentCheckoutResponseDto> {
    this.logger.log(
      `Creating Square checkout for appointment ${checkoutDto.appointmentId}: $${checkoutDto.serviceAmount}`,
    );
    return this.squarePaymentService.createAppointmentCheckout(checkoutDto);
  }

  /**
   * Get payment details by Square payment ID
   * GET /api/square/payments/:squarePaymentId
   */
  @Get(':squarePaymentId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getPayment(
    @Param('squarePaymentId') squarePaymentId: string,
  ): Promise<SquarePaymentResponseDto> {
    return this.squarePaymentService.getPayment(squarePaymentId);
  }

  /**
   * Get all payments for an invoice
   * GET /api/square/payments/invoice/:invoiceId
   */
  @Get('invoice/:invoiceId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF', 'CUSTOMER')
  async getInvoicePayments(
    @Param('invoiceId') invoiceId: string,
  ): Promise<SquarePaymentResponseDto[]> {
    return this.squarePaymentService.getInvoicePayments(invoiceId);
  }

  /**
   * Create Terminal checkout (in-person payment with Square device)
   * POST /api/square/payments/terminal/checkout
   * Lower processing fee: 2.6% + $0.10 vs 2.9% + $0.30 online
   */
  @Post('terminal/checkout')
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async createTerminalCheckout(
    @Body() checkoutDto: CreateTerminalCheckoutDto,
  ): Promise<TerminalCheckoutResponseDto> {
    this.logger.log(
      `Creating Terminal checkout for invoice ${checkoutDto.invoiceId} on device ${checkoutDto.deviceId}`,
    );
    const result = await this.squarePaymentService.createTerminalCheckout(
      checkoutDto.invoiceId,
      checkoutDto.amount,
      checkoutDto.deviceId,
      checkoutDto.currency,
    );

    return new TerminalCheckoutResponseDto({
      checkoutId: result.checkoutId,
      status: result.status,
      deviceId: checkoutDto.deviceId,
      amount: checkoutDto.amount,
      invoiceId: checkoutDto.invoiceId,
      createdAt: new Date(),
    });
  }

  /**
   * Get Terminal checkout status
   * GET /api/square/payments/terminal/checkout/:checkoutId
   */
  @Get('terminal/checkout/:checkoutId')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async getTerminalCheckout(
    @Param('checkoutId') checkoutId: string,
  ): Promise<any> {
    return this.squarePaymentService.getTerminalCheckout(checkoutId);
  }

  /**
   * Cancel Terminal checkout
   * POST /api/square/payments/terminal/checkout/:checkoutId/cancel
   */
  @Post('terminal/checkout/:checkoutId/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async cancelTerminalCheckout(
    @Param('checkoutId') checkoutId: string,
  ): Promise<void> {
    this.logger.log(`Cancelling Terminal checkout ${checkoutId}`);
    return this.squarePaymentService.cancelTerminalCheckout(checkoutId);
  }

  /**
   * List available Terminal devices at the location
   * GET /api/square/payments/terminal/devices
   */
  @Get('terminal/devices')
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async listTerminalDevices(): Promise<TerminalDeviceDto[]> {
    const devices = await this.squarePaymentService.listTerminalDevices();

    return devices.map(
      (device) =>
        new TerminalDeviceDto({
          id: device.deviceCode?.deviceId || '',
          name: device.deviceCode?.name || 'Unknown Device',
          code: device.deviceCode?.code || '',
          status: device.deviceCode?.status || 'UNKNOWN',
          deviceType: device.deviceCode?.productType || 'TERMINAL_API',
        }),
    );
  }
}
