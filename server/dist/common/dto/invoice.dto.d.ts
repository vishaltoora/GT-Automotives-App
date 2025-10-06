import { InvoiceStatus, PaymentMethod } from '@prisma/client';
export declare enum InvoiceItemType {
    TIRE = "TIRE",
    SERVICE = "SERVICE",
    PART = "PART",
    OTHER = "OTHER",
    DISCOUNT = "DISCOUNT",
    DISCOUNT_PERCENTAGE = "DISCOUNT_PERCENTAGE"
}
export declare class InvoiceItemDto {
    id?: string;
    tireId?: string;
    tireName?: string;
    itemType: InvoiceItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    discountType?: 'amount' | 'percentage';
    discountValue?: number;
    discountAmount?: number;
    total?: number;
}
export declare class CreateInvoiceDto {
    customerId?: string;
    customerData?: any;
    vehicleId?: string;
    companyId: string;
    items: InvoiceItemDto[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total: number;
    status: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    invoiceDate?: string;
}
export declare class UpdateInvoiceDto {
    vehicleId?: string;
    items?: InvoiceItemDto[];
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total?: number;
    status?: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    paidAt?: string;
    invoiceDate?: string;
    companyId?: string;
}
export declare class InvoiceResponseDto {
    id: string;
    invoiceNumber: string;
    customerId: string;
    customer?: any;
    vehicleId?: string;
    vehicle?: any;
    items: InvoiceItemDto[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total: number;
    status: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    paidAt?: string;
    invoiceDate?: string;
}
//# sourceMappingURL=invoice.dto.d.ts.map