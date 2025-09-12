import { InvoiceItemType, QuotationStatus } from '@prisma/client';
export declare class CreateQuoteItemDto {
    tireId?: string;
    itemType: InvoiceItemType;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateQuoteDto {
    customerName: string;
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    items: CreateQuoteItemDto[];
    gstRate?: number;
    pstRate?: number;
    notes?: string;
    status?: QuotationStatus;
    validUntil?: string;
}
//# sourceMappingURL=create-quotation.dto.d.ts.map