import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto, CreateServiceDto, UpdateInvoiceDto, UpdateServiceDto } from '@gt-automotive/data';
import { Invoice, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ServiceRepository } from './repositories/service.repository';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CarfaxService } from '../carfax/carfax.service';
export declare class InvoicesService {
    private readonly invoiceRepository;
    private readonly auditRepository;
    private readonly customerRepository;
    private readonly serviceRepository;
    private readonly pdfService;
    private readonly emailService;
    private readonly carfaxService;
    constructor(invoiceRepository: InvoiceRepository, auditRepository: AuditRepository, customerRepository: CustomerRepository, serviceRepository: ServiceRepository, pdfService: PdfService, emailService: EmailService, carfaxService: CarfaxService);
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
    /**
     * Record a payment against an invoice. Supports partial and split payments:
     * each call appends an InvoicePayment row, recomputes `amountPaid`, and moves
     * the invoice through PENDING -> PARTIALLY_PAID -> PAID. When `amount` is
     * omitted the full remaining balance is paid (the old "mark as paid").
     */
    recordPayment(id: string, payment: {
        amount?: number;
        paymentMethod: PaymentMethod;
        notes?: string;
        reference?: string;
    }, userId: string): Promise<Invoice>;
    /**
     * Backward-compatible "mark as paid": records a single payment for the full
     * remaining balance.
     */
    markAsPaid(id: string, paymentMethod: PaymentMethod, userId: string): Promise<Invoice>;
    /**
     * Day Summary invoice money: InvoicePayment rows collected on `date`,
     * deduped against appointment payments so money isn't counted twice.
     */
    getDaySummaryInvoices(date: string, user: any): Promise<any>;
    /**
     * Pending-invoice outstanding balance for the Day Summary: today's pending
     * and the cumulative total owed, grouped by customer.
     */
    getOutstandingInvoices(date: string, user: any): Promise<any>;
    /**
     * Roll a customer's open (PENDING / PARTIALLY_PAID) invoices into one
     * combined invoice. Each line item is a source invoice's remaining balance;
     * no extra tax is applied since the source totals are already taxed. Sources
     * are linked to the parent and drop out of the outstanding lists. (GA-33.)
     */
    combineInvoices(customerId: string, userId: string): Promise<Invoice>;
    getAllServices(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }[]>;
    createService(createServiceDto: CreateServiceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }>;
    updateService(id: string, updateServiceDto: UpdateServiceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }>;
    deleteService(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }>;
    sendInvoiceEmail(invoiceId: string, userId: string, emails?: string[], saveToCustomer?: boolean): Promise<{
        success: boolean;
        message: string;
        emailUsed: string;
    }>;
}
//# sourceMappingURL=invoices.service.d.ts.map