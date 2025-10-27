import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SmsService } from './sms.service';
import { PrismaService } from '@gt-automotive/database';

@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Telnyx webhook endpoint (no auth required)
   */
  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    await this.smsService.handleWebhook(payload);
    return { success: true };
  }

  /**
   * Get SMS history (admin only)
   */
  @Get('history')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  async getHistory(
    @Query('customerId') customerId?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit = '50',
  ) {
    const messages = await this.prisma.smsMessage.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(userId && { userId }),
      },
      include: {
        customer: true,
        user: true,
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    return messages;
  }

  /**
   * Get customer preferences
   */
  @Get('preferences/customer')
  @UseGuards(JwtAuthGuard)
  async getCustomerPreferences(@Query('customerId') customerId: string) {
    let prefs = await this.prisma.smsPreference.findUnique({
      where: { customerId },
    });

    if (!prefs) {
      // Create default preferences for customer
      prefs = await this.prisma.smsPreference.create({
        data: {
          customerId,
          optedIn: false,
          appointmentReminders: true,
          serviceUpdates: true,
          promotional: false,
          appointmentAlerts: false,
          scheduleReminders: false,
          dailySummary: false,
          urgentAlerts: false,
        },
      });
    }

    return prefs;
  }

  /**
   * Get user (staff/admin) preferences
   */
  @Get('preferences/user')
  @UseGuards(JwtAuthGuard)
  async getUserPreferences(@Query('userId') userId: string) {
    let prefs = await this.prisma.smsPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Create default preferences for user (staff/admin)
      prefs = await this.prisma.smsPreference.create({
        data: {
          userId,
          optedIn: false,
          appointmentReminders: false,
          serviceUpdates: false,
          promotional: false,
          appointmentAlerts: true,
          scheduleReminders: true,
          dailySummary: true,
          urgentAlerts: true,
        },
      });
    }

    return prefs;
  }

  /**
   * Update customer preferences
   */
  @Post('preferences/customer')
  @UseGuards(JwtAuthGuard)
  async updateCustomerPreferences(
    @Body() data: {
      customerId: string;
      optedIn?: boolean;
      appointmentReminders?: boolean;
      serviceUpdates?: boolean;
      promotional?: boolean;
    },
  ) {
    const updateData: any = {
      appointmentReminders: data.appointmentReminders,
      serviceUpdates: data.serviceUpdates,
      promotional: data.promotional,
    };

    if (data.optedIn !== undefined) {
      updateData.optedIn = data.optedIn;
      if (data.optedIn) {
        updateData.optedInAt = new Date();
      } else {
        updateData.optedOutAt = new Date();
      }
    }

    const prefs = await this.prisma.smsPreference.upsert({
      where: { customerId: data.customerId },
      update: updateData,
      create: {
        customerId: data.customerId,
        ...updateData,
        appointmentAlerts: false,
        scheduleReminders: false,
        dailySummary: false,
        urgentAlerts: false,
      },
    });

    return prefs;
  }

  /**
   * Update user (staff/admin) preferences
   */
  @Post('preferences/user')
  @UseGuards(JwtAuthGuard)
  async updateUserPreferences(
    @Body() data: {
      userId: string;
      optedIn?: boolean;
      appointmentAlerts?: boolean;
      scheduleReminders?: boolean;
      dailySummary?: boolean;
      urgentAlerts?: boolean;
    },
  ) {
    const updateData: any = {
      appointmentAlerts: data.appointmentAlerts,
      scheduleReminders: data.scheduleReminders,
      dailySummary: data.dailySummary,
      urgentAlerts: data.urgentAlerts,
    };

    if (data.optedIn !== undefined) {
      updateData.optedIn = data.optedIn;
      if (data.optedIn) {
        updateData.optedInAt = new Date();
      } else {
        updateData.optedOutAt = new Date();
      }
    }

    const prefs = await this.prisma.smsPreference.upsert({
      where: { userId: data.userId },
      update: updateData,
      create: {
        userId: data.userId,
        ...updateData,
        appointmentReminders: false,
        serviceUpdates: false,
        promotional: false,
      },
    });

    return prefs;
  }

  /**
   * Get SMS statistics (admin only)
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN')
  async getStatistics() {
    const totalMessages = await this.prisma.smsMessage.count();

    const deliveredMessages = await this.prisma.smsMessage.count({
      where: { status: 'DELIVERED' },
    });

    const failedMessages = await this.prisma.smsMessage.count({
      where: { status: 'FAILED' },
    });

    // Calculate cost based on segments since Telnyx doesn't return cost in API
    // Telnyx charges $0.0025 per SMS segment for Canada
    const segmentsResult = await this.prisma.smsMessage.aggregate({
      _sum: { segments: true },
    });

    const totalSegments = segmentsResult._sum.segments || 0;
    const totalCost = totalSegments * 0.0025; // $0.0025 per segment

    const messagesByType = await this.prisma.smsMessage.groupBy({
      by: ['type'],
      _count: true,
    });

    const optedInCustomers = await this.prisma.smsPreference.count({
      where: {
        optedIn: true,
        customerId: { not: null },
      },
    });

    const optedInUsers = await this.prisma.smsPreference.count({
      where: {
        optedIn: true,
        userId: { not: null },
      },
    });

    return {
      totalMessages,
      deliveredMessages,
      failedMessages,
      totalCost,
      deliveryRate: totalMessages > 0 ? (deliveredMessages / totalMessages * 100).toFixed(2) : 0,
      messagesByType,
      optedInCustomers,
      optedInUsers,
    };
  }

  /**
   * Send EOD (End of Day) summary to admin users
   */
  @Post('send-eod-summary')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN', 'STAFF')
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
    const result = await this.smsService.sendEODSummary(data);
    return result;
  }
}
