import { InvoiceRepository } from './repositories/invoice.repository';
import { CreateInvoiceDto } from '../common/dto/invoice.dto';
import { UpdateInvoiceDto } from '../common/dto/invoice.dto';
import { CreateServiceDto, UpdateServiceDto } from '../common/dto/service.dto';
import { Invoice, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { ServiceRepository } from './repositories/service.repository';
export declare class InvoicesService {
    private readonly invoiceRepository;
    private readonly auditRepository;
    private readonly customerRepository;
    private readonly serviceRepository;
    constructor(invoiceRepository: InvoiceRepository, auditRepository: AuditRepository, customerRepository: CustomerRepository, serviceRepository: ServiceRepository);
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
}
//# sourceMappingURL=invoices.service.d.ts.map