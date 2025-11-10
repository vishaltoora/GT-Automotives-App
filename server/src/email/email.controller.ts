import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Send EOD (End of Day) summary to admin users
   */
  @Post('send-eod-summary')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async sendEODSummary(
    @Body() data: {
      date: string;
      totalPayments: number;
      totalOwed: number;
      paymentsByMethod: Record<string, number>;
      atGaragePayments: number;
      atGarageCount: number;
      atGaragePaymentsByMethod: Record<string, number>;
      mobileServicePayments: number;
      mobileServiceCount: number;
      mobileServicePaymentsByMethod: Record<string, number>;
    },
  ) {
    const result = await this.emailService.sendEODSummary(data);
    return result;
  }

  /**
   * Send employee day schedule
   */
  @Post('send-employee-schedule')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'SUPERVISOR', 'STAFF')
  async sendEmployeeSchedule(
    @Body() data: {
      employeeEmail: string;
      employeeName: string;
      date: string;
      appointments: Array<{
        time: string;
        customerName: string;
        serviceType: string;
        vehicleInfo: string;
        location: string;
        duration: number;
        notes?: string;
      }>;
    },
  ) {
    const result = await this.emailService.sendEmployeeDaySchedule(data);
    return result;
  }
}
