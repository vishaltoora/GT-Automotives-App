import { Prisma, Payment, PaymentStatus } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';
export declare class PaymentRepository extends BaseRepository<Payment, Prisma.PaymentCreateInput, Prisma.PaymentUpdateInput, Prisma.PaymentFindManyArgs> {
    constructor(prisma: PrismaService);
    findByEmployee(employeeId: string, includeJob?: boolean): Promise<Payment[]>;
    findByJob(jobId: string): Promise<Payment[]>;
    findByStatus(status: PaymentStatus, includeRelations?: boolean): Promise<Payment[]>;
    findPendingPayments(): Promise<Payment[]>;
    processPayment(id: string, paidBy: string): Promise<Payment>;
    getPaymentSummary(employeeId?: string): Promise<{
        totalPayments: number;
        pendingPayments: number;
        paidPayments: number;
        totalAmount: number;
        pendingAmount: number;
        paidAmount: number;
    }>;
    findWithFilters(filters: {
        employeeId?: string;
        status?: PaymentStatus;
        paymentMethod?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Payment[]>;
    getPayrollReport(startDate: Date, endDate: Date, employeeId?: string): Promise<any[]>;
}
//# sourceMappingURL=payment.repository.d.ts.map