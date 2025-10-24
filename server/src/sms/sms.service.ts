import { Injectable, Logger } from '@nestjs/common';
import Telnyx from 'telnyx';
import { PrismaService } from '@gt-automotive/database';
import { SmsStatus, SmsType } from '@prisma/client';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly telnyx: any;
  private readonly fromNumber!: string;
  private readonly enabled: boolean;

  constructor(private readonly prisma: PrismaService) {
    this.enabled = process.env.SMS_ENABLED === 'true';

    if (this.enabled) {
      // Initialize Telnyx SDK correctly with API key
      const apiKey = process.env.TELNYX_API_KEY;
      if (!apiKey) {
        this.logger.error('TELNYX_API_KEY is not set');
        throw new Error('TELNYX_API_KEY environment variable is required');
      }

      // Telnyx SDK initialization - Telnyx constructor expects ClientOptions
      this.telnyx = new Telnyx({ apiKey });
      const fromNumber = process.env.TELNYX_PHONE_NUMBER;

      if (!fromNumber) {
        this.logger.error('TELNYX_PHONE_NUMBER is not set');
        throw new Error('TELNYX_PHONE_NUMBER environment variable is required');
      }

      // Use type assertion to assign to readonly property in constructor
      (this as any).fromNumber = fromNumber;

      this.logger.log('SMS Service initialized with Telnyx');
      this.logger.log(`From number: ${this.fromNumber}`);
    } else {
      this.logger.warn('SMS Service is disabled');
    }
  }

  /**
   * Format phone number to E.164 format (+1XXXXXXXXXX)
   * Handles common North American phone number formats
   */
  private formatPhoneNumber(phone: string): string | null {
    if (!phone) return null;

    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Handle different formats:
    // - 10 digits: 2506499699 → +12506499699
    // - 11 digits starting with 1: 12506499699 → +12506499699
    // - Already has +1: +12506499699 → +12506499699
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    } else if (phone.startsWith('+1') && digitsOnly.length === 11) {
      return phone;
    }

    return null; // Invalid format
  }

  /**
   * Send an SMS message to a customer or user (staff/admin)
   */
  async sendSms(params: {
    to: string;
    body: string;
    type: SmsType;
    appointmentId?: string;
    customerId?: string;
    userId?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.enabled) {
      this.logger.warn('SMS disabled - would send:', params);
      return { success: false, error: 'SMS service is disabled' };
    }

    // Format phone number to E.164
    const formattedPhone = this.formatPhoneNumber(params.to);
    if (!formattedPhone) {
      this.logger.error(`Invalid phone number format: ${params.to}`);
      return { success: false, error: 'Invalid phone number format. Please use format: +1XXXXXXXXXX or XXXXXXXXXX' };
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(formattedPhone)) {
      this.logger.error(`Invalid phone number format after formatting: ${formattedPhone}`);
      return { success: false, error: 'Invalid phone number format' };
    }

    // Check customer preferences
    if (params.customerId) {
      const prefs = await this.prisma.smsPreference.findUnique({
        where: { customerId: params.customerId },
      });

      if (!prefs?.optedIn) {
        this.logger.warn(`Customer ${params.customerId} has not opted in`);
        return { success: false, error: 'Customer has not opted in to SMS' };
      }

      // Check specific customer preferences
      if (params.type === 'PROMOTIONAL' && !prefs.promotional) {
        return { success: false, error: 'Customer opted out of promotional messages' };
      }
      if (params.type === 'APPOINTMENT_REMINDER' && !prefs.appointmentReminders) {
        return { success: false, error: 'Customer opted out of appointment reminders' };
      }
      if (['SERVICE_STATUS', 'SERVICE_COMPLETE'].includes(params.type) && !prefs.serviceUpdates) {
        return { success: false, error: 'Customer opted out of service updates' };
      }
    }

    // Check user (staff/admin) preferences
    if (params.userId) {
      const prefs = await this.prisma.smsPreference.findUnique({
        where: { userId: params.userId },
      });

      if (!prefs?.optedIn) {
        this.logger.warn(`User ${params.userId} has not opted in`);
        return { success: false, error: 'User has not opted in to SMS' };
      }

      // Check specific staff/admin preferences
      if (params.type === 'STAFF_APPOINTMENT_ALERT' && !prefs.appointmentAlerts) {
        return { success: false, error: 'User opted out of appointment alerts' };
      }
      if (params.type === 'STAFF_SCHEDULE_REMINDER' && !prefs.scheduleReminders) {
        return { success: false, error: 'User opted out of schedule reminders' };
      }
      if (params.type === 'ADMIN_DAILY_SUMMARY' && !prefs.dailySummary) {
        return { success: false, error: 'User opted out of daily summaries' };
      }
      if (params.type === 'ADMIN_URGENT_ALERT' && !prefs.urgentAlerts) {
        return { success: false, error: 'User opted out of urgent alerts' };
      }
    }

    // Create database record
    const smsRecord = await this.prisma.smsMessage.create({
      data: {
        to: formattedPhone,
        from: this.fromNumber,
        body: params.body,
        type: params.type,
        status: SmsStatus.PENDING,
        appointmentId: params.appointmentId,
        customerId: params.customerId,
        userId: params.userId,
      },
    });

    try {
      // Send via Telnyx using correct API method
      const response = await this.telnyx.messages.send({
        from: this.fromNumber,
        to: formattedPhone,
        text: params.body,
        messaging_profile_id: process.env.TELNYX_MESSAGING_PROFILE_ID,
      });

      // Update record with Telnyx response
      await this.prisma.smsMessage.update({
        where: { id: smsRecord.id },
        data: {
          status: SmsStatus.QUEUED,
          telnyxMessageId: response.data.id,
          segments: response.data.parts,
          sentAt: new Date(),
        },
      });

      this.logger.log(`SMS sent successfully: ${response.data.id}`);
      return { success: true, messageId: response.data.id };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send SMS: ${errorMessage}`, errorStack);

      // Update record with error
      await this.prisma.smsMessage.update({
        where: { id: smsRecord.id },
        data: {
          status: SmsStatus.FAILED,
          errorMessage,
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send appointment confirmation to customer (immediately after booking)
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!appointment || !appointment.customer.phone) {
      return;
    }

    const date = new Date(appointment.scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const time = appointment.scheduledTime;

    const serviceType = appointment.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();

    let message = `Hi ${appointment.customer.firstName}, your appointment at GT Automotives is confirmed!\n\n`;
    message += `Service: ${serviceType}\n`;
    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nWe'll send you a reminder 1 hour before your appointment.\n\n`;
    message += `Need to reschedule? Call us at (250) 986-9191\n\n`;
    message += `GT Automotives\nPrince George, BC`;

    await this.sendSms({
      to: appointment.customer.phone,
      body: message,
      type: SmsType.APPOINTMENT_CONFIRMATION,
      appointmentId: appointment.id,
      customerId: appointment.customer.id,
    });
  }

  /**
   * Send appointment cancellation notification to customer
   */
  async sendAppointmentCancellation(appointmentId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!appointment || !appointment.customer.phone) {
      return;
    }

    const date = new Date(appointment.scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const time = appointment.scheduledTime;

    const serviceType = appointment.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();

    let message = `Hi ${appointment.customer.firstName}, your appointment at GT Automotives has been cancelled.\n\n`;
    message += `Service: ${serviceType}\n`;
    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nNeed to reschedule? Call us at (250) 986-9191 or book online.\n\n`;
    message += `GT Automotives\nPrince George, BC`;

    await this.sendSms({
      to: appointment.customer.phone,
      body: message,
      type: SmsType.APPOINTMENT_CANCELLATION,
      appointmentId: appointment.id,
      customerId: appointment.customer.id,
    });
  }

  /**
   * Send appointment reminder to customer
   */
  async sendAppointmentReminder(appointmentId: string, daysAhead: number): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!appointment || !appointment.customer.phone) {
      return;
    }

    const date = new Date(appointment.scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const time = appointment.scheduledTime;

    const serviceType = appointment.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();

    let message = `Hi ${appointment.customer.firstName}, this is GT Automotives.\n\n`;

    if (daysAhead === 7) {
      message += `Reminder: Your appointment for ${serviceType} is coming up next week.\n\n`;
    } else if (daysAhead === 3) {
      message += `Reminder: Your appointment for ${serviceType} is in 3 days.\n\n`;
    } else if (daysAhead === 1) {
      message += `Reminder: Your appointment for ${serviceType} is TOMORROW!\n\n`;
    }

    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nCall us at (250) 986-9191 to reschedule if needed.\n\n`;
    message += `GT Automotives\nPrince George, BC`;

    await this.sendSms({
      to: appointment.customer.phone,
      body: message,
      type: SmsType.APPOINTMENT_REMINDER,
      appointmentId: appointment.id,
      customerId: appointment.customer.id,
    });
  }

  /**
   * Send staff appointment alert (when new appointment is assigned)
   */
  async sendStaffAppointmentAlert(appointmentId: string, staffId: string): Promise<void> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!appointment || !staff || !staff.phone) {
      return;
    }

    const date = new Date(appointment.scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const time = appointment.scheduledTime;
    const serviceType = appointment.serviceType || 'service';
    const customerName = `${appointment.customer.firstName} ${appointment.customer.lastName}`;

    const message = `New appointment assigned!\n\n` +
      `Service: ${serviceType}\n` +
      `Customer: ${customerName}\n` +
      `Date: ${formattedDate} at ${time}\n\n` +
      `GT Automotives`;

    await this.sendSms({
      to: staff.phone,
      body: message,
      type: SmsType.STAFF_APPOINTMENT_ALERT,
      appointmentId: appointment.id,
      userId: staff.id,
    });
  }

  /**
   * Send daily schedule reminder to staff
   */
  async sendStaffScheduleReminder(staffId: string, appointmentIds: string[]): Promise<void> {
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff || !staff.phone || appointmentIds.length === 0) {
      return;
    }

    const appointments = await this.prisma.appointment.findMany({
      where: { id: { in: appointmentIds } },
      include: {
        customer: true,
      },
      orderBy: { scheduledTime: 'asc' },
    });

    let message = `Good morning ${staff.firstName}! Your schedule for today:\n\n`;

    appointments.forEach((apt, index) => {
      const customerName = `${apt.customer.firstName} ${apt.customer.lastName}`;
      message += `${index + 1}. ${apt.scheduledTime} - ${apt.serviceType} (${customerName})\n`;
    });

    message += `\nTotal: ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}\n\n`;
    message += `GT Automotives`;

    await this.sendSms({
      to: staff.phone,
      body: message,
      type: SmsType.STAFF_SCHEDULE_REMINDER,
      userId: staff.id,
    });
  }

  /**
   * Send admin daily summary (end of day)
   */
  async sendAdminDailySummary(adminId: string, summary: {
    appointmentsCompleted: number;
    appointmentsCancelled: number;
    revenue: number;
    pendingPayments: number;
  }): Promise<void> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.phone) {
      return;
    }

    const message = `Daily Summary - ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}\n\n` +
      `✅ Completed: ${summary.appointmentsCompleted}\n` +
      `❌ Cancelled: ${summary.appointmentsCancelled}\n` +
      `💰 Revenue: $${summary.revenue.toFixed(2)}\n` +
      `⏳ Pending Payments: ${summary.pendingPayments}\n\n` +
      `GT Automotives`;

    await this.sendSms({
      to: admin.phone,
      body: message,
      type: SmsType.ADMIN_DAILY_SUMMARY,
      userId: admin.id,
    });
  }

  /**
   * Handle webhook from Telnyx for delivery status
   */
  async handleWebhook(payload: any): Promise<void> {
    const eventType = payload.data?.event_type;
    const messageId = payload.data?.payload?.id;

    if (!messageId) {
      this.logger.warn('Webhook received without message ID');
      return;
    }

    const message = await this.prisma.smsMessage.findUnique({
      where: { telnyxMessageId: messageId },
    });

    if (!message) {
      this.logger.warn(`Message not found: ${messageId}`);
      return;
    }

    let status: SmsStatus;
    switch (eventType) {
      case 'message.sent':
        status = SmsStatus.SENT;
        break;
      case 'message.delivered':
        status = SmsStatus.DELIVERED;
        await this.prisma.smsMessage.update({
          where: { id: message.id },
          data: {
            status,
            deliveredAt: new Date(),
          },
        });
        return;
      case 'message.failed':
        status = SmsStatus.FAILED;
        break;
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
        return;
    }

    await this.prisma.smsMessage.update({
      where: { id: message.id },
      data: { status },
    });

    this.logger.log(`Updated message ${messageId} status to ${status}`);
  }
}
