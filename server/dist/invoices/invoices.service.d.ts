import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from '../common/dto/invoice.dto';
import { UpdateInvoiceDto } from '../common/dto/invoice.dto';
import { CreateServiceDto, UpdateServiceDto } from '../common/dto/service.dto';
import { Invoice, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ServiceRepository } from './repositories/service.repository';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
export declare class InvoicesService {
    private readonly invoiceRepository;
    private readonly auditRepository;
    private readonly customerRepository;
    private readonly serviceRepository;
    private readonly pdfService;
    private readonly emailService;
    constructor(invoiceRepository: InvoiceRepository, auditRepository: AuditRepository, customerRepository: CustomerRepository, serviceRepository: ServiceRepository, pdfService: PdfService, emailService: EmailService);
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
    getAllServices(): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }[]>;
    createService(createServiceDto: CreateServiceDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }>;
    updateService(id: string, updateServiceDto: UpdateServiceDto): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }>;
    deleteService(id: string): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        unitPrice: import(".prisma/client/runtime/library").Decimal;
    }>;
    sendInvoiceEmail(invoiceId: string, userId: string, overrideEmail?: string, saveToCustomer?: boolean): Promise<{
        success: boolean;
        message: string;
        emailUsed: string;
    }>;
}
//# sourceMappingURL=invoices.service.d.ts.map