import { QuotationStatus } from '@prisma/client';
export declare enum QuotationItemType {
    TIRE = "TIRE",
    SERVICE = "SERVICE",
    PART = "PART",
    OTHER = "OTHER"
}
export declare class QuotationItemDto {
    id?: string;
    tireId?: string;
    itemType: QuotationItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    total?: number;
}
export declare class CreateQuoteDto {
    customerId: string;
    vehicleId?: string;
    items: QuotationItemDto[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total: number;
    status: QuotationStatus;
    notes?: string;
    validUntil?: string;
}
export declare class UpdateQuoteDto {
    vehicleId?: string;
    items?: QuotationItemDto[];
    subtotal?: number;
    taxRate?: number;
    taxAmount?: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total?: number;
    status?: QuotationStatus;
    notes?: string;
    validUntil?: string;
}
export declare class QuotationResponseDto {
    id: string;
    quoteNumber: string;
    customerId: string;
    customer?: any;
    vehicleId?: string;
    vehicle?: any;
    items: QuotationItemDto[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total: number;
    status: QuotationStatus;
    notes?: string;
    validUntil?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=quotation.dto.d.ts.map