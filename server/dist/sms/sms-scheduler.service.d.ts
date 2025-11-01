import { PrismaService } from '@gt-automotive/database';
import { SmsService } from './sms.service';
export declare class SmsSchedulerService {
    private readonly prisma;
    private readonly smsService;
    private readonly logger;
    constructor(prisma: PrismaService, smsService: SmsService);
    /**
     * Run daily at 8:00 AM to send daily schedule to staff members
     * Sends list of today's appointments to each assigned staff member
     */
    sendDailyScheduleToStaff(): Promise<void>;
    /**
     * DISABLED: One-hour reminder functionality
     * Run every 15 minutes to check for appointments that need 1-hour reminders
     * Sends reminder to customer 1 hour before appointment
     */
    sendOneHourReminders(): Promise<void>;
}
//# sourceMappingURL=sms-scheduler.service.d.ts.map