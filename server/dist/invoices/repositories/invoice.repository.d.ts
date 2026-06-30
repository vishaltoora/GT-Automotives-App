import { Prisma, Invoice, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';
export declare class InvoiceRepository extends BaseRepository<Invoice, Prisma.InvoiceCreateInput, Prisma.InvoiceUpdateInput, Prisma.InvoiceFindManyArgs> {
    constructor(prisma: PrismaService);
    findByCustomer(customerId: string, includeItems?: boolean): Promise<Invoice[]>;
    findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
    findWithDetails(id: string): Promise<Invoice | null>;
    createWithItems(invoiceData: Prisma.InvoiceCreateInput, items: Prisma.InvoiceItemCreateWithoutInvoiceInput[]): Promise<Invoice>;
    updateStatus(id: string, status: InvoiceStatus, paidAt?: Date): Promise<Invoice>;
    updateWithItems(id: string, invoiceData: Prisma.InvoiceUpdateInput, items?: Prisma.InvoiceItemCreateWithoutInvoiceInput[]): Promise<Invoice>;
    createPayment(payment: {
        invoiceId: string;
        amount: number;
        paymentMethod: PaymentMethod;
        paidAt: Date;
        createdBy: string;
        notes?: string;
        reference?: string;
    }): Promise<void>;
    /** Append a payment row and update the invoice totals/status atomically. */
    addPayment(invoiceId: string, payment: {
        invoiceId: string;
        amount: number;
        paymentMethod: PaymentMethod;
        paidAt: Date;
        createdBy: string;
        notes?: string;
        reference?: string;
    }, invoiceUpdate: Prisma.InvoiceUpdateInput): Promise<Invoice>;
    /** When a combined parent is fully paid, mark its children paid too. */
    settleConsolidatedChildren(parentId: string, paymentMethod: PaymentMethod, paidAt: Date): Promise<void>;
    linkConsolidatedChildren(parentId: string, childIds: string[]): Promise<void>;
    /** Open invoices that can be rolled into a combined invoice (excludes parents). */
    findCombinableForCustomer(customerId: string): Promise<any[]>;
    /**
     * Invoice payments collected on `date` (business timezone), grouped by
     * payment method. Deduped against appointment payments so money booked on an
     * appointment isn't also counted here.
     */
    getDaySummaryInvoicePayments(date: string): Promise<any>;
    /**
     * Outstanding pending-invoice balance: today's pending invoices and the
     * cumulative total owed grouped by customer. Uses remaining balance
     * (total - amountPaid) and excludes consolidated children.
     */
    getPendingInvoiceOutstanding(date: string): Promise<any>;
    getDailyCashReport(date: Date): Promise<any>;
    searchInvoices(searchParams: {
        customerName?: string;
        invoiceNumber?: string;
        startDate?: Date;
        endDate?: Date;
        status?: InvoiceStatus;
        companyId?: string;
    }): Promise<Invoice[]>;
    generateInvoiceNumber(): Promise<string>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=invoice.repository.d.ts.map