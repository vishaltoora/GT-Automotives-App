import { CreateInvoiceEnhancedDto } from '@gt-automotive/shared-dto';
import { PaymentMethod, InvoiceItemType } from '@prisma/client';
export declare function setClerkTokenGetter(getter: () => Promise<string | null>): void;
export interface InvoiceItem {
    id?: string;
    tireId?: string;
    tire?: any;
    itemType: InvoiceItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    total?: number;
}
export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customer?: any;
    vehicleId?: string;
    vehicle?: any;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total: number;
    status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
}
export type CreateInvoiceDto = CreateInvoiceEnhancedDto;
export interface UpdateInvoiceDto {
    status?: Invoice['status'];
    paymentMethod?: PaymentMethod;
    notes?: string;
    paidAt?: string;
}
declare class InvoiceService {
    private getAuthToken;
    private getHeaders;
    createInvoice(data: CreateInvoiceDto): Promise<Invoice>;
    getInvoices(): Promise<Invoice[]>;
    getInvoice(id: string): Promise<Invoice>;
    updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice>;
    markInvoiceAsPaid(id: string, paymentMethod: Invoice['paymentMethod']): Promise<Invoice>;
    cancelInvoice(id: string): Promise<void>;
    searchInvoices(params: {
        customerName?: string;
        invoiceNumber?: string;
        startDate?: string;
        endDate?: string;
        status?: Invoice['status'];
    }): Promise<Invoice[]>;
    getCustomerInvoices(customerId: string): Promise<Invoice[]>;
    getDailyCashReport(date?: string): Promise<any>;
    generatePrintHTML(invoice: Invoice): string;
    getPrintContent(invoice: Invoice): string;
    printInvoice(invoice: Invoice): void;
}
export declare const invoiceService: InvoiceService;
export {};
//# sourceMappingURL=invoice.service.d.ts.map