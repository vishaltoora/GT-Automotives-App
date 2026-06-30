import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, PaymentSummaryDto, ProcessPaymentDto } from '@gt-automotive/data';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        notes: string | null;
        paidAt: Date | null;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        reference: string | null;
        jobId: string;
        paidBy: string | null;
    }>;
    processPayment(processPaymentDto: ProcessPaymentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        notes: string | null;
        paidAt: Date | null;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        reference: string | null;
        jobId: string;
        paidBy: string | null;
    }>;
    findAll(employeeId?: string, status?: PaymentStatus, paymentMethod?: PaymentMethod, startDate?: string, endDate?: string): Promise<PaymentResponseDto[]>;
    getPaymentSummary(employeeId?: string): Promise<PaymentSummaryDto>;
    getMyPaymentSummary(user: any): Promise<PaymentSummaryDto>;
    findPendingPayments(): Promise<PaymentResponseDto[]>;
    getPayrollReport(startDate: string, endDate: string, employeeId?: string): Promise<any[]>;
    /**
     * Get payments processed on a specific date (for EOD summary)
     * @param paymentDate - Date in YYYY-MM-DD format (e.g., "2025-11-13")
     */
    getByPaymentDate(paymentDate: string): Promise<PaymentResponseDto[]>;
    findMyPayments(user: any): Promise<PaymentResponseDto[]>;
    findByEmployee(employeeId: string): Promise<PaymentResponseDto[]>;
    findByJob(jobId: string): Promise<PaymentResponseDto[]>;
    findOne(id: string): Promise<PaymentResponseDto>;
    update(id: string, updatePaymentDto: UpdatePaymentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        notes: string | null;
        paidAt: Date | null;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        reference: string | null;
        jobId: string;
        paidBy: string | null;
    }>;
    revertPaymentStatus(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        notes: string | null;
        paidAt: Date | null;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        reference: string | null;
        jobId: string;
        paidBy: string | null;
    }>;
    remove(id: string, user: any): Promise<void>;
}
//# sourceMappingURL=payments.controller.d.ts.map