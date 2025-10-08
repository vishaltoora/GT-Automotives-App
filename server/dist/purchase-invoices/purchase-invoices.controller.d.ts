import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, PurchaseInvoiceResponseDto, PurchaseInvoiceFilterDto } from '../common/dto/purchase-invoice.dto';
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
    findOne(id: string): Promise<PurchaseInvoiceResponseDto>;
    update(id: string, updateDto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto>;
    uploadImage(id: string, file: any): Promise<PurchaseInvoiceResponseDto>;
    deleteImage(id: string): Promise<PurchaseInvoiceResponseDto>;
    getImageUrl(id: string): Promise<{
        imageUrl: string;
    }>;
    remove(id: string): Promise<PurchaseInvoiceResponseDto>;
}
//# sourceMappingURL=purchase-invoices.controller.d.ts.map