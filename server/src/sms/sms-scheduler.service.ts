import { Injectable, Logger } from '@nestjs/common';
// `Cron` is deliberately not imported: both scheduled jobs in this file are
// disabled, and an unused import would not survive the linter. Restore it
// alongside whichever decorator is being re-enabled.
import { PrismaService } from '@gt-automotive/database';
import { SmsService } from './sms.service';
import { getCurrentBusinessDate } from '../config/timezone.config';

@Injectable()
export class SmsSchedulerService {
  private readonly logger = new Logger(SmsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService
  ) {}

  /**
   * Send each assigned staff member their appointments for the day.
   *
   * DISABLED at the shop's request — staff were not finding it useful, and it
   * was arriving at the wrong time anyway: `@Cron` fires on the server clock,
   * which is UTC in production, so '0 8 * * *' meant midnight Pacific rather
   * than the 8 AM the comment claimed. See GA-65.
   *
   * Kept rather than deleted so it can be re-enabled by restoring the
   * decorator. If it ever is, give it the timezone —
   * `@Cron('0 8 * * *', { timeZone: BUSINESS_TIMEZONE })` — or it will go out
   * in the middle of the night again.
   */
  // @Cron('0 8 * * *', { timeZone: BUSINESS_TIMEZONE }) - DISABLED (GA-65)
  async sendDailyScheduleToStaff() {
    this.logger.log('Sending daily schedule to staff members');

    // Use business timezone (PST/PDT) to get correct date
    const todayString = getCurrentBusinessDate();

    // Find all appointments scheduled for today with assigned staff
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: todayString,
      },
      include: {
        customer: true,
        vehicle: true,
        employees: {
          include: {
            employee: true,
          },
        },
      },
    });

    // Group appointments by staff member
    const staffAppointments = new Map<string, any[]>();

    for (const appointment of appointments) {
      if (appointment.employees && appointment.employees.length > 0) {
        for (const appointmentEmployee of appointment.employees) {
          const staff = appointmentEmployee.employee;
          if (!staffAppointments.has(staff.id)) {
            staffAppointments.set(staff.id, []);
          }
          staffAppointments.get(staff.id)!.push(appointment);
        }
      }
    }

    let messagesSent = 0;

    // Send daily schedule to each staff member
    for (const [staffId, staffAppts] of staffAppointments.entries()) {
      const staff = await this.prisma.user.findUnique({
        where: { id: staffId },
      });

      if (!staff || !staff.phone || staffAppts.length === 0) {
        continue;
      }

      // Build schedule message
      let message = `Good morning ${staff.firstName}! Your schedule for today:\n\n`;

      // Sort appointments by time
      staffAppts.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

      for (const apt of staffAppts) {
        const customerName = `${apt.customer.firstName} ${apt.customer.lastName}`;
        message += `${apt.scheduledTime} - ${apt.serviceType}\n`;
        message += `Customer: ${customerName}\n`;
        if (apt.appointmentType === 'MOBILE_SERVICE' && apt.customer.address) {
          message += `Location: ${apt.customer.address}\n`;
        }
        message += `\n`;
      }

      message += `Total appointments: ${staffAppts.length}\n\n`;
      message += `Have a great day!\n\n`;
      message += `GT Automotives`;

      await this.smsService.sendSms({
        to: staff.phone,
        body: message,
        type: 'STAFF_DAILY_SCHEDULE' as any,
        userId: staff.id,
      });

      messagesSent++;
    }

    if (messagesSent > 0) {
      this.logger.log(`Sent daily schedule to ${messagesSent} staff members`);
    }
  }

  /**
   * DISABLED: One-hour reminder functionality
   * Run every 15 minutes to check for appointments that need 1-hour reminders
   * Sends reminder to customer 1 hour before appointment
   */
  // @Cron('*/15 * * * *') // Every 15 minutes - DISABLED
  async sendOneHourReminders() {
    this.logger.log('Checking for appointments needing 1-hour reminders');

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
    const oneHourFifteenFromNow = new Date(now.getTime() + 75 * 60 * 1000); // 1 hour 15 min ahead

    // Get today's date string in business timezone (PST/PDT)
    const todayString = getCurrentBusinessDate();

    // Find appointments scheduled between 1 hour and 1 hour 15 minutes from now
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledDate: todayString,
        reminderSent: false, // Only send reminder once
      },
      include: {
        customer: true,
        vehicle: true,
      },
    });

    let remindersSent = 0;

    for (const appointment of appointments) {
      if (!appointment.customer.phone) {
        continue;
      }

      // Parse appointment time (format: "14:30")
      const [hours, minutes] = appointment.scheduledTime.split(':').map(Number);
      const appointmentDateTime = new Date(appointment.scheduledDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Check if appointment is within the 1-hour window
      if (
        appointmentDateTime >= oneHourFromNow &&
        appointmentDateTime <= oneHourFifteenFromNow
      ) {
        await this.smsService.sendAppointmentReminder(appointment.id, 0); // 0 = 1 hour before

        // Mark reminder as sent
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: { reminderSent: true },
        });

        remindersSent++;
      }
    }

    if (remindersSent > 0) {
      this.logger.log(
        `Sent 1-hour reminders for ${remindersSent} appointments`
      );
    }
  }
}
