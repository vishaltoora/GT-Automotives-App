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
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        } | null;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phone: string | null;
            clerkId: string;
            roleId: string;
            lastLogin: Date | null;
            isActive: boolean;
        } | null;
        appointment: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            employeeId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            notes: string | null;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            reminderSent: boolean;
            bookedBy: string | null;
        } | null;
    } & {
        id: string;
        customerId: string | null;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
        to: string;
        from: string;
        body: string;
        status: import("@prisma/client").$Enums.SmsStatus;
        type: import("@prisma/client").$Enums.SmsType;
        telnyxMessageId: string | null;
        cost: import(".prisma/client/runtime/library").Decimal | null;
        segments: number | null;
        errorMessage: string | null;
        appointmentId: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
    })[]>;
    /**
     * Get customer preferences
     */
    getCustomerPreferences(customerId: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Get user (staff/admin) preferences
     */
    getUserPreferences(userId: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
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
}
//# sourceMappingURL=sms.controller.d.ts.map