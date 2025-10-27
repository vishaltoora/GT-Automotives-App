import { PrismaService } from '@gt-automotive/database';
import { SmsType } from '@prisma/client';
export declare class SmsService {
    private readonly prisma;
    private readonly logger;
    private readonly telnyx;
    private readonly fromNumber;
    private readonly enabled;
    constructor(prisma: PrismaService);
    /**
     * Format phone number to E.164 format (+1XXXXXXXXXX)
     * Handles common North American phone number formats
     */
    private formatPhoneNumber;
    /**
     * Send an SMS message to a customer or user (staff/admin)
     */
    sendSms(params: {
        to: string;
        body: string;
        type: SmsType;
        appointmentId?: string;
        customerId?: string;
        userId?: string;
    }): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Get time-based greeting (Good morning/afternoon/evening)
     */
    private getTimeBasedGreeting;
    /**
     * Send appointment confirmation to customer (immediately after booking)
     */
    sendAppointmentConfirmation(appointmentId: string): Promise<void>;
    /**
     * Send appointment cancellation notification to customer
     */
    sendAppointmentCancellation(appointmentId: string): Promise<void>;
    /**
     * Send appointment reminder to customer
     */
    sendAppointmentReminder(appointmentId: string, daysAhead: number): Promise<void>;
    /**
     * Send staff appointment alert (when new appointment is assigned)
     */
    sendStaffAppointmentAlert(appointmentId: string, staffId: string): Promise<void>;
    /**
     * Send daily schedule reminder to staff
     */
    sendStaffScheduleReminder(staffId: string, appointmentIds: string[]): Promise<void>;
    /**
     * Send admin daily summary (end of day)
     */
    sendAdminDailySummary(adminId: string, summary: {
        appointmentsCompleted: number;
        appointmentsCancelled: number;
        revenue: number;
        pendingPayments: number;
    }): Promise<void>;
    /**
     * Handle webhook from Telnyx for delivery status
     */
    handleWebhook(payload: any): Promise<void>;
    /**
     * Send End of Day (EOD) summary to admin users
     */
    sendEODSummary(data: {
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
    }): Promise<{
        success: boolean;
        message: string;
        results?: undefined;
    } | {
        success: boolean;
        message: string;
        results: ({
            userId: string;
            success: boolean;
            messageId: string | undefined;
            error?: undefined;
        } | {
            userId: string;
            success: boolean;
            error: string | undefined;
            messageId?: undefined;
        })[];
    }>;
}
//# sourceMappingURL=sms.service.d.ts.map