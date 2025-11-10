import { SmsService } from './sms.service';
import { PrismaService } from '@gt-automotive/database';
export declare class SmsController {
    private readonly smsService;
    private readonly prisma;
    constructor(smsService: SmsService, prisma: PrismaService);
    /**
     * Telnyx webhook endpoint (no auth required)
     */
    handleWebhook(payload: any): Promise<{
        success: boolean;
    }>;
    /**
     * Get SMS history (admin only)
     */
    getHistory(customerId?: string, userId?: string, limit?: string): Promise<({
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        appointment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            notes: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        } | null;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            clerkId: string;
            roleId: string;
            lastLogin: Date | null;
            isActive: boolean;
        } | null;
    } & {
        id: string;
        type: import("@prisma/client").$Enums.SmsType;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        status: import("@prisma/client").$Enums.SmsStatus;
        userId: string | null;
        to: string;
        from: string;
        appointmentId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
        cost: import(".prisma/client/runtime/library").Decimal | null;
        body: string;
        telnyxMessageId: string | null;
        segments: number | null;
        errorMessage: string | null;
    })[]>;
    /**
     * Get customer preferences
     */
    getCustomerPreferences(customerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        userId: string | null;
        optedIn: boolean;
        optedInAt: Date | null;
        optedOutAt: Date | null;
        appointmentReminders: boolean;
        serviceUpdates: boolean;
        promotional: boolean;
        appointmentAlerts: boolean;
        scheduleReminders: boolean;
        dailySummary: boolean;
        urgentAlerts: boolean;
    }>;
    /**
     * Get user (staff/admin) preferences
     */
    getUserPreferences(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        userId: string | null;
        optedIn: boolean;
        optedInAt: Date | null;
        optedOutAt: Date | null;
        appointmentReminders: boolean;
        serviceUpdates: boolean;
        promotional: boolean;
        appointmentAlerts: boolean;
        scheduleReminders: boolean;
        dailySummary: boolean;
        urgentAlerts: boolean;
    }>;
    /**
     * Update customer preferences
     */
    updateCustomerPreferences(data: {
        customerId: string;
        optedIn?: boolean;
        appointmentReminders?: boolean;
        serviceUpdates?: boolean;
        promotional?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        userId: string | null;
        optedIn: boolean;
        optedInAt: Date | null;
        optedOutAt: Date | null;
        appointmentReminders: boolean;
        serviceUpdates: boolean;
        promotional: boolean;
        appointmentAlerts: boolean;
        scheduleReminders: boolean;
        dailySummary: boolean;
        urgentAlerts: boolean;
    }>;
    /**
     * Update user (staff/admin) preferences
     */
    updateUserPreferences(data: {
        userId: string;
        optedIn?: boolean;
        appointmentAlerts?: boolean;
        scheduleReminders?: boolean;
        dailySummary?: boolean;
        urgentAlerts?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string | null;
        userId: string | null;
        optedIn: boolean;
        optedInAt: Date | null;
        optedOutAt: Date | null;
        appointmentReminders: boolean;
        serviceUpdates: boolean;
        promotional: boolean;
        appointmentAlerts: boolean;
        scheduleReminders: boolean;
        dailySummary: boolean;
        urgentAlerts: boolean;
    }>;
    /**
     * Get SMS statistics (admin only)
     */
    getStatistics(): Promise<{
        totalMessages: number;
        deliveredMessages: number;
        failedMessages: number;
        totalCost: number;
        deliveryRate: string | number;
        messagesByType: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.SmsMessageGroupByOutputType, "type"[]> & {
            _count: number;
        })[];
        optedInCustomers: number;
        optedInUsers: number;
    }>;
    /**
     * Send EOD (End of Day) summary to admin users
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
//# sourceMappingURL=sms.controller.d.ts.map