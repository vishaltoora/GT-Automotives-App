import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from '../common/dto/invoice.dto';
import { UpdateInvoiceDto } from '../common/dto/invoice.dto';
import { Invoice, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
export declare class InvoicesService {
    private readonly invoiceRepository;
    private readonly auditRepository;
    private readonly customerRepository;
    constructor(invoiceRepository: InvoiceRepository, auditRepository: AuditRepository, customerRepository: CustomerRepository);
    create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice>;
    findAll(user: any): Promise<Invoice[]>;
    findOne(id: string, user: any): Promise<Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice>;
    remove(id: string, userId: string): Promise<void>;
    searchInvoices(searchParams: {
        customerName?: string;
        invoiceNumber?: string;
        startDate?: string;
        endDate?: string;
        status?: InvoiceStatus;
        companyId?: string;
    }, user: any): Promise<Invoice[]>;
    getDailyCashReport(date: string, user: any): Promise<any>;
    getCustomerInvoices(customerId: string, user: any): Promise<Invoice[]>;
    markAsPaid(id: string, paymentMethod: PaymentMethod, userId: string): Promise<Invoice>;
}
//# sourceMappingURL=invoices.service.d.ts.map