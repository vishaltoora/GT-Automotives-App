import { Prisma, Invoice, InvoiceStatus } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';
import { PrismaService } from '@gt-automotive/database';
export declare class InvoiceRepository extends BaseRepository<Invoice, Prisma.InvoiceCreateInput, Prisma.InvoiceUpdateInput, Prisma.InvoiceFindManyArgs> {
    constructor(prisma: PrismaService);
    findByCustomer(customerId: string, includeItems?: boolean): Promise<Invoice[]>;
    findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
    findWithDetails(id: string): Promise<Invoice | null>;
    createWithItems(invoiceData: Prisma.InvoiceCreateInput, items: Prisma.InvoiceItemCreateWithoutInvoiceInput[]): Promise<Invoice>;
    updateStatus(id: string, status: InvoiceStatus, paidAt?: Date): Promise<Invoice>;
    getDailyCashReport(date: Date): Promise<any>;
    searchInvoices(searchParams: {
        customerName?: string;
        invoiceNumber?: string;
        startDate?: Date;
        endDate?: Date;
        status?: InvoiceStatus;
    }): Promise<Invoice[]>;
    generateInvoiceNumber(): Promise<string>;
}
//# sourceMappingURL=invoice.repository.d.ts.map