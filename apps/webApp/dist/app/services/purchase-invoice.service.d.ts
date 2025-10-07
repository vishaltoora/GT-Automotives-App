import { PurchaseInvoiceDto, CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, PurchaseInvoiceListResponse, PurchaseCategory, PurchaseInvoiceStatus, PaymentMethod } from '@gt-automotive/data';
export type PurchaseInvoice = PurchaseInvoiceDto;
export type { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, PurchaseInvoiceListResponse, PurchaseCategory, PurchaseInvoiceStatus, PaymentMethod, };
declare const purchaseInvoiceService: {
    getAll(filters?: {
        vendorId?: string;
        category?: PurchaseCategory;
        status?: PurchaseInvoiceStatus;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<PurchaseInvoiceListResponse>;
    getById(id: string): Promise<PurchaseInvoice>;
    create(data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice>;
    update(id: string, data: Partial<CreatePurchaseInvoiceDto>): Promise<PurchaseInvoice>;
    delete(id: string): Promise<PurchaseInvoice>;
    uploadImage(id: string, file: File): Promise<PurchaseInvoice>;
    deleteImage(id: string): Promise<PurchaseInvoice>;
};
export default purchaseInvoiceService;
//# sourceMappingURL=purchase-invoice.service.d.ts.map