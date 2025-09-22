export declare enum QuotationStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}
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
declare const UpdateQuoteDto_base: new () => Omit<CreateQuoteDto, "customerId">;
export declare class UpdateQuoteDto extends UpdateQuoteDto_base {
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
export {};
//# sourceMappingURL=quotation.dto.d.ts.map