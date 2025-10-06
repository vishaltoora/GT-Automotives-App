import { PurchaseCategory, PurchaseInvoiceStatus, PaymentMethod } from '@prisma/client';
export declare class CreatePurchaseInvoiceDto {
    invoiceNumber?: string;
    vendorId?: string;
    vendorName: string;
    description: string;
    invoiceDate: string;
    dueDate?: string;
    amount: number;
    taxAmount?: number;
    totalAmount: number;
    category: PurchaseCategory;
    status?: PurchaseInvoiceStatus;
    paymentDate?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdBy: string;
}
export declare class UpdatePurchaseInvoiceDto {
    invoiceNumber?: string;
    vendorId?: string;
    vendorName?: string;
    description?: string;
    invoiceDate?: string;
    dueDate?: string;
    amount?: number;
    taxAmount?: number;
    totalAmount?: number;
    category?: PurchaseCategory;
    status?: PurchaseInvoiceStatus;
    paymentDate?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
}
export declare class PurchaseInvoiceResponseDto {
    id: string;
    invoiceNumber?: string;
    vendorId?: string;
    vendorName: string;
    description: string;
    invoiceDate: Date;
    dueDate?: Date;
    amount: number;
    taxAmount?: number;
    totalAmount: number;
    category: PurchaseCategory;
    status: PurchaseInvoiceStatus;
    paymentDate?: Date;
    paymentMethod?: PaymentMethod;
    notes?: string;
    imageUrl?: string;
    imageName?: string;
    imageSize?: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    vendor?: {
        id: string;
        name: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
    };
}
export declare class PurchaseInvoiceFilterDto {
    vendorId?: string;
    category?: PurchaseCategory;
    status?: PurchaseInvoiceStatus;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
}
//# sourceMappingURL=purchase-invoice.dto.d.ts.map