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
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentResponseDto,
  PaymentSummaryDto,
  ProcessPaymentDto
} from '../common/dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

@Controller('api/payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  create(@Body() createPaymentDto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.create(createPaymentDto, user.id);
  }

  @Post('process')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  processPayment(@Body() processPaymentDto: ProcessPaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.processPayment(processPaymentDto, user.id);
  }

  @Get()
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findAll({
      employeeId,
      status,
      paymentMethod,
      startDate,
      endDate,
    });
  }

  @Get('summary')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  getPaymentSummary(@Query('employeeId') employeeId?: string): Promise<PaymentSummaryDto> {
    return this.paymentsService.getPaymentSummary(employeeId);
  }

  @Get('pending')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  findPendingPayments(): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findPendingPayments();
  }

  @Get('payroll-report')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  getPayrollReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.paymentsService.getPayrollReport(startDate, endDate, employeeId);
  }

  @Get('employee/:employeeId')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findByEmployee(@Param('employeeId') employeeId: string): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByEmployee(employeeId);
  }

  @Get('job/:jobId')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findByJob(@Param('jobId') jobId: string): Promise<PaymentResponseDto[]> {
    return this.paymentsService.findByJob(jobId);
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Roles('STAFF', 'ADMIN')
  findOne(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, user.id);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.paymentsService.remove(id, user.id);
  }
}