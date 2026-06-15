import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, PurchaseInvoiceResponseDto, PurchaseInvoiceFilterDto } from '@gt-automotive/data';
export declare class PurchaseInvoicesController {
    private readonly purchaseInvoicesService;
    constructor(purchaseInvoicesService: PurchaseInvoicesService);
    create(createDto: CreatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto>;
    findAll(filterDto: PurchaseInvoiceFilterDto): Promise<{
        data: PurchaseInvoiceResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getImageUrl(id: string): Promise<{
        imageUrl: string;
    }>;
    uploadImage(id: string, file: any): Promise<PurchaseInvoiceResponseDto>;
    deleteImage(id: string): Promise<PurchaseInvoiceResponseDto>;
    findOne(id: string): Promise<PurchaseInvoiceResponseDto>;
    update(id: string, updateDto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto>;
    remove(id: string): Promise<PurchaseInvoiceResponseDto>;
}
//# sourceMappingURL=purchase-invoices.controller.d.ts.map