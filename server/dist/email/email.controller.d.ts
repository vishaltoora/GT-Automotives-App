import { EmailService } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
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
        sent: number;
        failed: number;
    }>;
    /**
     * Send employee day schedule
     */
    sendEmployeeSchedule(data: {
        employeeEmail: string;
        employeeName: string;
        date: string;
        appointments: Array<{
            time: string;
            customerName: string;
            serviceType: string;
            vehicleInfo: string;
            location: string;
            duration: number;
            notes?: string;
        }>;
    }): Promise<{
        success: boolean;
        messageId?: string;
    }>;
}
//# sourceMappingURL=email.controller.d.ts.map