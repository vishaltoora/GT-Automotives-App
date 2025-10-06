import { QuotationStatus } from '@prisma/client';
export declare enum QuotationItemType {
    TIRE = "TIRE",
    SERVICE = "SERVICE",
    PART = "PART",
    OTHER = "OTHER",
    LEVY = "LEVY",
    DISCOUNT = "DISCOUNT",
    DISCOUNT_PERCENTAGE = "DISCOUNT_PERCENTAGE"
}
export declare class QuotationItemDto {
    id?: string;
    tireId?: string;
    tireName?: string;
    itemType: QuotationItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    discountType?: 'amount' | 'percentage';
    discountValue?: number;
    discountAmount?: number;
    total?: number;
}
export declare class CreateQuoteDto {
    customerName: string;
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    items: QuotationItemDto[];
    gstRate?: number;
    pstRate?: number;
    status?: QuotationStatus;
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