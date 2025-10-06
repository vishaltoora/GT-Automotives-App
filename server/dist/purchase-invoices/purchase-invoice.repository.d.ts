import { PurchaseInvoice, PurchaseCategory, PurchaseInvoiceStatus } from '@prisma/client';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from '../common/dto/purchase-invoice.dto';
export declare class PurchaseInvoiceRepository {
    private prisma;
    create(data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice>;
    findAll(skip?: number, take?: number, filters?: {
        vendorId?: string;
        category?: PurchaseCategory;
        status?: PurchaseInvoiceStatus;
        startDate?: Date;
        endDate?: Date;
    }): Promise<PurchaseInvoice[]>;
    findById(id: string): Promise<PurchaseInvoice | null>;
    update(id: string, data: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoice>;
    updateImageInfo(id: string, imageUrl: string, imageName: string, imageSize: number): Promise<PurchaseInvoice>;
    delete(id: string): Promise<PurchaseInvoice>;
    count(filters?: {
        vendorId?: string;
        category?: PurchaseCategory;
        status?: PurchaseInvoiceStatus;
        startDate?: Date;
        endDate?: Date;
    }): Promise<number>;
}
//# sourceMappingURL=purchase-invoice.repository.d.ts.map