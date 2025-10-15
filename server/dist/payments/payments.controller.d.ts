import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, PaymentSummaryDto, ProcessPaymentDto } from '../common/dto/payment.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, user: any): Promise<{
        id: string;
        jobId: string;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paidAt: Date | null;
        paidBy: string | null;
        notes: string | null;
        reference: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    processPayment(processPaymentDto: ProcessPaymentDto, user: any): Promise<{
        id: string;
        jobId: string;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paidAt: Date | null;
        paidBy: string | null;
        notes: string | null;
        reference: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(employeeId?: string, status?: PaymentStatus, paymentMethod?: PaymentMethod, startDate?: string, endDate?: string): Promise<PaymentResponseDto[]>;
    getPaymentSummary(employeeId?: string): Promise<PaymentSummaryDto>;
    findPendingPayments(): Promise<PaymentResponseDto[]>;
    getPayrollReport(startDate: string, endDate: string, employeeId?: string): Promise<any[]>;
    findByEmployee(employeeId: string): Promise<PaymentResponseDto[]>;
    findByJob(jobId: string): Promise<PaymentResponseDto[]>;
    findOne(id: string): Promise<PaymentResponseDto>;
    update(id: string, updatePaymentDto: UpdatePaymentDto, user: any): Promise<{
        id: string;
        jobId: string;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paidAt: Date | null;
        paidBy: string | null;
        notes: string | null;
        reference: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    revertPaymentStatus(id: string, user: any): Promise<{
        id: string;
        jobId: string;
        employeeId: string;
        amount: import(".prisma/client/runtime/library").Decimal;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        status: import("@prisma/client").$Enums.PaymentStatus;
        paidAt: Date | null;
        paidBy: string | null;
        notes: string | null;
        reference: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<void>;
}
//# sourceMappingURL=payments.controller.d.ts.map