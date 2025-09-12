import { PaymentMethod, InvoiceItemType } from '@prisma/client';
export declare class CreateInvoiceItemDto {
    tireId?: string;
    itemType: InvoiceItemType;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateCustomerDto {
    firstName: string;
    lastName: string;
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
}
export declare class CreateInvoiceDto {
    customerId?: string;
    customerData?: CreateCustomerDto;
    vehicleId?: string;
    items: CreateInvoiceItemDto[];
    taxRate?: number;
    gstRate?: number;
    pstRate?: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
}
//# sourceMappingURL=create-invoice.dto.d.ts.map