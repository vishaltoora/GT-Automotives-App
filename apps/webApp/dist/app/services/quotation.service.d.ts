export declare function setClerkTokenGetter(getter: () => Promise<string | null>): void;
export interface QuoteItem {
    id?: string;
    tireId?: string;
    tireName?: string;
    tire?: any;
    itemType: 'TIRE' | 'SERVICE' | 'PART' | 'OTHER' | 'LEVY';
    description: string;
    quantity: number;
    unitPrice: number;
    total?: number;
}
export interface Quote {
    id: string;
    quotationNumber: string;
    customerName: string;
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    items: QuoteItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    gstRate?: number;
    gstAmount?: number;
    pstRate?: number;
    pstAmount?: number;
    total: number;
    status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
    validUntil?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    convertedToInvoiceId?: string;
}
export interface CreateQuoteDto {
    customerName: string;
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    items: Omit<QuoteItem, 'id' | 'total'>[];
    gstRate?: number;
    pstRate?: number;
    notes?: string;
    status?: Quote['status'];
    validUntil?: string;
}
export interface UpdateQuoteDto {
    customerName?: string;
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    items?: Omit<QuoteItem, 'id' | 'total'>[];
    gstRate?: number;
    pstRate?: number;
    notes?: string;
    status?: Quote['status'];
    validUntil?: string;
    convertedToInvoiceId?: string;
}
declare class QuoteService {
    private getAuthToken;
    private getHeaders;
    createQuote(data: CreateQuoteDto): Promise<Quote>;
    getQuotes(): Promise<Quote[]>;
    getQuote(id: string): Promise<Quote>;
    updateQuote(id: string, data: UpdateQuoteDto): Promise<Quote>;
    deleteQuote(id: string): Promise<void>;
    searchQuotes(params: {
        customerName?: string;
        quotationNumber?: string;
        startDate?: string;
        endDate?: string;
        status?: Quote['status'];
    }): Promise<Quote[]>;
    convertToInvoice(quoteId: string, customerId: string, vehicleId?: string): Promise<any>;
    generatePrintHTML(quote: Quote): string;
    printQuote(quote: Quote): void;
    private printUsingBlob;
}
export declare const quoteService: QuoteService;
export declare const quotationService: QuoteService;
export {};
//# sourceMappingURL=quotation.service.d.ts.map