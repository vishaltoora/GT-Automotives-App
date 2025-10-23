import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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
