import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, PaymentResponseDto, PaymentSummaryDto, ProcessPaymentDto } from '../common/dto/payment.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paidAt: Date | null;
        amount: import(".prisma/client/runtime/library").Decimal;
        jobId: string;
        paidBy: string | null;
        reference: string | null;
    }>;
    processPayment(processPaymentDto: ProcessPaymentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paidAt: Date | null;
        amount: import(".prisma/client/runtime/library").Decimal;
        jobId: string;
        paidBy: string | null;
        reference: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paidAt: Date | null;
        amount: import(".prisma/client/runtime/library").Decimal;
        jobId: string;
        paidBy: string | null;
        reference: string | null;
    }>;
    revertPaymentStatus(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        notes: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        paidAt: Date | null;
        amount: import(".prisma/client/runtime/library").Decimal;
        jobId: string;
        paidBy: string | null;
        reference: string | null;
    }>;
    remove(id: string, user: any): Promise<void>;
}
//# sourceMappingURL=payments.controller.d.ts.map