import { PrismaService } from '@gt-automotive/database';
import { EmailType } from '@prisma/client';
export declare class EmailService {
    private readonly prisma;
    private readonly logger;
    private readonly apiInstance;
    private readonly enabled;
    private readonly senderEmail;
    private readonly senderName;
    private readonly logoBase64;
    constructor(prisma: PrismaService);
    /**
     * Get logo src for email templates
     * Uses base64 embedding for maximum compatibility
     */
    private getLogoSrc;
    /**
     * Send an email via Brevo
     */
    sendEmail(params: {
        to: string;
        subject: string;
        htmlContent: string;
        type: EmailType;
        appointmentId?: string;
        invoiceId?: string;
        quotationId?: string;
        customerId?: string;
        attachments?: Array<{
            name: string;
            content: string;
        }>;
    }): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Send a simple test email
     */
    sendTestEmail(to: string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Send appointment confirmation email
     */
    sendAppointmentConfirmation(appointmentId: string): Promise<void>;
    /**
     * Send End of Day summary email to admin users
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
        totalEmployeePayments?: number;
        employeePaymentsCount?: number;
        employeePaymentsByMethod?: Record<string, number>;
        employeePaymentsByPerson?: Record<string, {
            name: string;
            amount: number;
            count: number;
        }>;
        adjustedCash?: number;
    }): Promise<{
        success: boolean;
        sent: number;
        failed: number;
    }>;
    /**
     * Send employee day schedule email
     */
    sendEmployeeDaySchedule(data: {
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
    /**
     * Send appointment assignment notification to employee
     */
    sendAppointmentAssignment(data: {
        employeeEmail: string;
        employeeName: string;
        appointmentId: string;
        customerName: string;
        customerPhone?: string;
        vehicleInfo: string;
        serviceType: string;
        scheduledDate: string;
        scheduledTime: string;
        duration: number;
        appointmentType: 'AT_GARAGE' | 'MOBILE_SERVICE';
        address?: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        messageId?: string;
    }>;
    /**
     * Send invoice email with PDF attachment
     */
    sendInvoiceEmail(customerEmail: string, invoiceNumber: string, pdfBase64: string): Promise<{
        success: boolean;
        messageId?: string;
    }>;
    /**
     * Send quotation email with PDF attachment
     */
    sendQuotationEmail(customerEmail: string, quotationNumber: string, pdfBase64: string): Promise<{
        success: boolean;
        messageId?: string;
    }>;
}
//# sourceMappingURL=email.service.d.ts.map