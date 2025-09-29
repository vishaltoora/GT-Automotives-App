import { PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class CreatePaymentDto {
    jobId: string;
    employeeId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    reference?: string;
    paidBy: string;
}
export declare class UpdatePaymentDto {
    amount?: number;
    paymentMethod?: PaymentMethod;
    status?: PaymentStatus;
    paidAt?: string;
    notes?: string;
    reference?: string;
    paidBy?: string;
}
export declare class PaymentResponseDto {
    id: string;
    jobId: string;
    employeeId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    paidAt?: Date;
    paidBy?: string;
    notes?: string;
    reference?: string;
    createdAt: Date;
    updatedAt: Date;
    job?: {
        id: string;
        jobNumber: string;
        title: string;
        status: string;
    };
    employee?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email: string;
    };
}
export declare class PaymentSummaryDto {
    totalPayments: number;
    pendingPayments: number;
    paidPayments: number;
    totalAmount: number;
    pendingAmount: number;
    paidAmount: number;
}
export declare class ProcessPaymentDto {
    jobId: string;
    amount?: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    reference?: string;
    paidBy: string;
}
//# sourceMappingURL=payment.dto.d.ts.map