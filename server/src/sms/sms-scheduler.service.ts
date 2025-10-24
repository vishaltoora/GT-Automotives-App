import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@gt-automotive/database';
import { SmsService } from './sms.service';

@Injectable()
export class SmsSchedulerService {
  private readonly logger = new Logger(SmsSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * Run daily at 8:00 AM to send daily schedule to staff members
   * Sends list of today's appointments to each assigned staff member
   */
  @Cron('0 8 * * *') // Every day at 8:00 AM
  async sendDailyScheduleToStaff() {
    this.logger.log('Sending daily schedule to staff members');

    const now = new Date();
    const todayString = now.toISOString().split('T')[0];

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
   * Run every 15 minutes to check for appointments that need 1-hour reminders
   * Sends reminder to customer 1 hour before appointment
   */
  @Cron('*/15 * * * *') // Every 15 minutes
  async sendOneHourReminders() {
    this.logger.log('Checking for appointments needing 1-hour reminders');

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead
    const oneHourFifteenFromNow = new Date(now.getTime() + 75 * 60 * 1000); // 1 hour 15 min ahead

    // Get today's date string
    const todayString = now.toISOString().split('T')[0];

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
      if (appointmentDateTime >= oneHourFromNow && appointmentDateTime <= oneHourFifteenFromNow) {
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
      this.logger.log(`Sent 1-hour reminders for ${remindersSent} appointments`);
    }
  }
}
