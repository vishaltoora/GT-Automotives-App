import { Injectable, Logger } from '@nestjs/common';
import Telnyx from 'telnyx';
import { PrismaService } from '@gt-automotive/database';
import { SmsStatus, SmsType } from '@prisma/client';
import { extractBusinessDate } from '../config/timezone.config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly telnyx: any;
  private readonly fromNumber!: string;
  private readonly enabled: boolean;

  constructor(private readonly prisma: PrismaService) {
    this.enabled = process.env.SMS_ENABLED === 'true';

    if (this.enabled) {
      try {
        // Initialize Telnyx SDK correctly with API key
        const apiKey = process.env.TELNYX_API_KEY;
        if (!apiKey) {
          this.logger.error('TELNYX_API_KEY is not set - SMS will be disabled');
          (this as any).enabled = false;
          return;
        }

        const fromNumber = process.env.TELNYX_PHONE_NUMBER;
        if (!fromNumber) {
          this.logger.error('TELNYX_PHONE_NUMBER is not set - SMS will be disabled');
          (this as any).enabled = false;
          return;
        }

        // Telnyx SDK initialization - Telnyx constructor expects ClientOptions
        this.telnyx = new Telnyx({ apiKey });

        // Use type assertion to assign to readonly property in constructor
        (this as any).fromNumber = fromNumber;

        this.logger.log('SMS Service initialized successfully with Telnyx');
        this.logger.log(`From number: ${this.fromNumber}`);
      } catch (error) {
        this.logger.error('Failed to initialize Telnyx SDK - SMS will be disabled:', error);
        (this as any).enabled = false;
      }
    } else {
      this.logger.warn('SMS Service is disabled (SMS_ENABLED is not true)');
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
    this.logger.log(`[SMS] sendSms called - enabled: ${this.enabled}, to: ${params.to}, type: ${params.type}`);

    if (!this.enabled) {
      this.logger.warn('[SMS] SMS Service is DISABLED. Set SMS_ENABLED=true to enable.');
      this.logger.warn('[SMS] Would send:', { to: params.to, type: params.type, appointmentId: params.appointmentId });
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
   * Get time-based greeting (Good morning/afternoon/evening)
   */
  private getTimeBasedGreeting(customerName: string): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return `Good morning ${customerName}`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon ${customerName}`;
    } else {
      return `Good evening ${customerName}`;
    }
  }

  /**
   * Send appointment confirmation to customer (immediately after booking)
   */
  async sendAppointmentConfirmation(appointmentId: string): Promise<void> {
    this.logger.log(`[SMS] sendAppointmentConfirmation called for appointment: ${appointmentId}`);
    this.logger.log(`[SMS] SMS Service enabled: ${this.enabled}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!appointment) {
      this.logger.warn(`[SMS] Appointment ${appointmentId} not found`);
      return;
    }

    if (!appointment.customer.phone) {
      this.logger.warn(`[SMS] Customer ${appointment.customer.id} (${appointment.customer.firstName} ${appointment.customer.lastName}) has no phone number. Skipping SMS.`);
      return;
    }

    this.logger.log(`[SMS] Sending confirmation to: ${appointment.customer.phone}`);

    // Format date correctly using timezone-aware utility
    const businessDate = extractBusinessDate(appointment.scheduledDate);

    // CRITICAL: Format date from business date string directly to avoid timezone issues
    // Creating a Date object causes UTC conversion which shifts dates after 5 PM PST
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const [year, month, day] = businessDate.split('-').map(Number);
    const dateForWeekday = new Date(Date.UTC(year, month - 1, day));
    const weekday = weekdayNames[dateForWeekday.getUTCDay()];
    const monthName = monthNames[month - 1];
    const formattedDate = `${weekday}, ${monthName} ${day}`;

    // Format time in 12-hour format
    const [hours, minutes] = appointment.scheduledTime.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const time = timeDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const serviceType = appointment.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();
    const isMobileService = appointment.appointmentType === 'MOBILE_SERVICE';
    const contactPhone = isMobileService ? '(250) 570-2333' : '(250) 986-9191';

    const greeting = this.getTimeBasedGreeting(appointment.customer.firstName);
    let message = `${greeting}, your appointment at GT Automotives is confirmed!\n\n`;
    message += `Service: ${serviceType}\n`;
    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nTo reschedule, call/text at ${contactPhone}\n\n`;
    message += `Have a great day!`;

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
    this.logger.log(`📱 sendAppointmentCancellation called for appointment: ${appointmentId}`);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    if (!appointment) {
      this.logger.warn(`❌ Appointment not found: ${appointmentId}`);
      return;
    }

    if (!appointment.customer.phone) {
      this.logger.warn(`❌ Customer ${appointment.customer.firstName} ${appointment.customer.lastName} has no phone number`);
      return;
    }

    this.logger.log(`✅ Sending cancellation SMS to ${appointment.customer.phone}`);

    // Format date correctly using timezone-aware utility
    const businessDate = extractBusinessDate(appointment.scheduledDate);

    // CRITICAL: Format date from business date string directly to avoid timezone issues
    // Creating a Date object causes UTC conversion which shifts dates after 5 PM PST
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const [year, month, day] = businessDate.split('-').map(Number);
    const dateForWeekday = new Date(Date.UTC(year, month - 1, day));
    const weekday = weekdayNames[dateForWeekday.getUTCDay()];
    const monthName = monthNames[month - 1];
    const formattedDate = `${weekday}, ${monthName} ${day}`;

    // Format time in 12-hour format
    const [hours, minutes] = appointment.scheduledTime.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const time = timeDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const serviceType = appointment.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();
    const isMobileService = appointment.appointmentType === 'MOBILE_SERVICE';
    const contactPhone = isMobileService ? '(250) 570-2333' : '(250) 986-9191';

    const greeting = this.getTimeBasedGreeting(appointment.customer.firstName);
    let message = `${greeting}, your appointment at GT Automotives has been cancelled.\n\n`;
    message += `Service: ${serviceType}\n`;
    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nTo reschedule, call/text at ${contactPhone}\n\n`;
    message += `Have a great day!\n\n`;
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

    // Format date correctly using timezone-aware utility
    const businessDate = extractBusinessDate(appointment.scheduledDate);

    // CRITICAL: Format date from business date string directly to avoid timezone issues
    // Creating a Date object causes UTC conversion which shifts dates after 5 PM PST
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const [year, month, day] = businessDate.split('-').map(Number);
    const dateForWeekday = new Date(Date.UTC(year, month - 1, day));
    const weekday = weekdayNames[dateForWeekday.getUTCDay()];
    const monthName = monthNames[month - 1];
    const formattedDate = `${weekday}, ${monthName} ${day}`;

    // Format time in 12-hour format
    const [hours, minutes] = appointment.scheduledTime.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const time = timeDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const serviceType = appointment.serviceType || 'service';
    const vehicle = `${appointment.vehicle?.year || ''} ${appointment.vehicle?.make || ''} ${appointment.vehicle?.model || ''}`.trim();
    const isMobileService = appointment.appointmentType === 'MOBILE_SERVICE';
    const contactPhone = isMobileService ? '(250) 570-2333' : '(250) 986-9191';

    const greeting = this.getTimeBasedGreeting(appointment.customer.firstName);
    let message = `${greeting}, this is GT Automotives.\n\n`;

    if (daysAhead === 0) {
      message += `Your appointment for ${serviceType} is in 1 HOUR!\n\n`;
    } else if (daysAhead === 1) {
      message += `Reminder: Your appointment for ${serviceType} is TODAY!\n\n`;
    }

    message += `Date: ${formattedDate} at ${time}\n`;
    if (vehicle) {
      message += `Vehicle: ${vehicle}\n`;
    }
    message += `\nTo reschedule, call/text at ${contactPhone}\n\n`;
    message += `Have a great day!\n\n`;
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

    // Format date correctly using timezone-aware utility
    const businessDate = extractBusinessDate(appointment.scheduledDate);

    // CRITICAL: Format date from business date string directly to avoid timezone issues
    // Creating a Date object causes UTC conversion which shifts dates after 5 PM PST
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [year, month, day] = businessDate.split('-').map(Number);
    const dateForWeekday = new Date(Date.UTC(year, month - 1, day));
    const weekday = weekdayNamesShort[dateForWeekday.getUTCDay()];
    const monthName = monthNamesShort[month - 1];
    const formattedDate = `${weekday}, ${monthName} ${day}`;

    // Format time in 12-hour format
    const [hours, minutes] = appointment.scheduledTime.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const time = timeDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const serviceType = appointment.serviceType || 'service';
    const customerName = `${appointment.customer.firstName} ${appointment.customer.lastName}`;
    const staffName = staff.firstName;
    const isMobileService = appointment.appointmentType === 'MOBILE_SERVICE';

    // Different heading for mobile service vs garage service
    let message = isMobileService
      ? `Hi ${staffName}! New mobile service assigned to you!\n\n`
      : `Hi ${staffName}! New service assigned to you!\n\n`;

    message += `Service: ${serviceType}\n` +
      `Customer: ${customerName}\n` +
      `Date: ${formattedDate} at ${time}\n`;

    // Add customer address for mobile service appointments
    if (isMobileService && appointment.customer.address) {
      message += `Location: ${appointment.customer.address}\n`;
    }

    message += `\nGT Automotives`;

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

  /**
   * Send End of Day (EOD) summary to admin users
   */
  async sendEODSummary(data: {
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
  }) {
    // Find all admin users with SMS enabled
    const adminUsers = await this.prisma.user.findMany({
      where: {
        role: {
          name: 'ADMIN',
        },
        phone: { not: null },
        isActive: true,
      },
      include: {
        smsPreference: true,
      },
    });

    // Filter to only users who opted in and have dailySummary enabled
    const eligibleAdmins = adminUsers.filter(
      (user) => user.smsPreference?.optedIn && user.smsPreference?.dailySummary
    );

    if (eligibleAdmins.length === 0) {
      this.logger.warn('No admin users opted in for EOD summary');
      return { success: false, message: 'No admin users opted in for EOD summary' };
    }

    // Format payment methods helper
    const formatPaymentMethods = (methods: Record<string, number>) => {
      const methodLabels: Record<string, string> = {
        CASH: '💵 Cash',
        E_TRANSFER: '📱 E-Transfer',
        CREDIT_CARD: '💳 Credit',
        DEBIT_CARD: '💳 Debit',
        CHEQUE: '📝 Cheque',
      };

      return Object.entries(methods)
        .filter(([_, amount]) => amount > 0)
        .map(([method, amount]) => `${methodLabels[method] || method}: $${amount.toFixed(2)}`)
        .join('\n');
    };

    // Format date
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Build EOD message
    const atGarageBreakdown = formatPaymentMethods(data.atGaragePaymentsByMethod);
    const mobileServiceBreakdown = formatPaymentMethods(data.mobileServicePaymentsByMethod);

    // Helper function to build message for each admin
    const buildMessage = (adminName: string) => {
      let msg = `Hello ${adminName},\n\n`;
      msg += `📊 Here is the EOD Summary for ${formattedDate}\n\n`;
      msg += `💰 TOTAL COLLECTED: $${data.totalPayments.toFixed(2)}\n`;

      if (data.totalOwed > 0) {
        msg += `⚠️ Outstanding: $${data.totalOwed.toFixed(2)}\n`;
      }

      msg += `\n📍 AT GARAGE (${data.atGarageCount} jobs):\n`;
      msg += `Total: $${data.atGaragePayments.toFixed(2)}\n`;
      if (atGarageBreakdown) {
        msg += `${atGarageBreakdown}\n`;
      }

      msg += `\n🚗 MOBILE SERVICE (${data.mobileServiceCount} jobs):\n`;
      msg += `Total: $${data.mobileServicePayments.toFixed(2)}\n`;
      if (mobileServiceBreakdown) {
        msg += `${mobileServiceBreakdown}\n`;
      }

      msg += `\n\nGT Automotives`;
      return msg;
    };

    // Keep old message building for reference (will be replaced per admin below)
    let message = `📊 EOD Summary - ${formattedDate}\n\n`;
    message += `💰 TOTAL COLLECTED: $${data.totalPayments.toFixed(2)}\n`;

    if (data.totalOwed > 0) {
      message += `⚠️ Outstanding: $${data.totalOwed.toFixed(2)}\n`;
    }

    message += `\n📍 AT GARAGE (${data.atGarageCount} jobs):\n`;
    message += `Total: $${data.atGaragePayments.toFixed(2)}\n`;
    if (atGarageBreakdown) {
      message += `${atGarageBreakdown}\n`;
    }

    message += `\n🚗 MOBILE SERVICE (${data.mobileServiceCount} jobs):\n`;
    message += `Total: $${data.mobileServicePayments.toFixed(2)}\n`;
    if (mobileServiceBreakdown) {
      message += `${mobileServiceBreakdown}\n`;
    }

    message += `\n\nGT Automotives`;

    // Send SMS to each eligible admin
    this.logger.log(`Sending EOD summary to ${eligibleAdmins.length} admin users`);

    const results = await Promise.all(
      eligibleAdmins.map(async (admin) => {
        try {
          this.logger.log(`Attempting to send EOD SMS to admin ${admin.id} (${admin.email}) at phone ${admin.phone}`);

          // Build personalized message with admin's first name
          const adminName = admin.firstName || admin.email.split('@')[0];
          const personalizedMessage = buildMessage(adminName);

          const result = await this.sendSms({
            to: admin.phone!,
            body: personalizedMessage,
            type: 'ADMIN_DAILY_SUMMARY' as SmsType,
            userId: admin.id,
          });

          if (result.success) {
            this.logger.log(`EOD SMS sent successfully to admin ${admin.id}, messageId: ${result.messageId}`);
            return { userId: admin.id, success: true, messageId: result.messageId };
          } else {
            this.logger.error(`EOD SMS failed for admin ${admin.id}: ${result.error}`);
            return { userId: admin.id, success: false, error: result.error };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Exception sending EOD summary to admin ${admin.id}:`, error);
          return { userId: admin.id, success: false, error: errorMessage };
        }
      })
    );

    const successCount = results.filter((r) => r.success).length;

    return {
      success: true,
      message: `EOD summary sent to ${successCount} of ${eligibleAdmins.length} admin users`,
      results,
    };
  }
}
