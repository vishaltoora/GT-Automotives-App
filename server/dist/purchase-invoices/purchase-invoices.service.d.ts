import { PurchaseInvoiceRepository } from './purchase-invoice.repository';
import { AzureBlobService } from '../common/services/azure-blob.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto, PurchaseInvoiceResponseDto, PurchaseInvoiceFilterDto } from '../common/dto/purchase-invoice.dto';
export declare class PurchaseInvoicesService {
    private purchaseInvoiceRepository;
    private azureBlobService;
    constructor(purchaseInvoiceRepository: PurchaseInvoiceRepository, azureBlobService: AzureBlobService);
    create(createDto: CreatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto>;
    findAll(filterDto: PurchaseInvoiceFilterDto): Promise<{
        data: PurchaseInvoiceResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<PurchaseInvoiceResponseDto>;
    update(id: string, updateDto: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoiceResponseDto>;
    uploadImage(id: string, file: Buffer, originalFileName: string, mimeType?: string): Promise<PurchaseInvoiceResponseDto>;
    deleteImage(id: string): Promise<PurchaseInvoiceResponseDto>;
    getImageUrl(id: string): Promise<string>;
    remove(id: string): Promise<PurchaseInvoiceResponseDto>;
    private mapToResponse;
}
//# sourceMappingURL=purchase-invoices.service.d.ts.map