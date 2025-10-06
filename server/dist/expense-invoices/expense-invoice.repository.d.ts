import { ExpenseInvoice, ExpenseCategory, PurchaseInvoiceStatus } from '@prisma/client';
import { CreateExpenseInvoiceDto, UpdateExpenseInvoiceDto } from '../common/dto/expense-invoice.dto';
export declare class ExpenseInvoiceRepository {
    private prisma;
    create(data: CreateExpenseInvoiceDto): Promise<ExpenseInvoice>;
    findAll(skip?: number, take?: number, filters?: {
        vendorId?: string;
        category?: ExpenseCategory;
        status?: PurchaseInvoiceStatus;
        isRecurring?: boolean;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ExpenseInvoice[]>;
    findById(id: string): Promise<ExpenseInvoice | null>;
    update(id: string, data: UpdateExpenseInvoiceDto): Promise<ExpenseInvoice>;
    updateImageInfo(id: string, imageUrl: string, imageName: string, imageSize: number): Promise<ExpenseInvoice>;
    delete(id: string): Promise<ExpenseInvoice>;
    count(filters?: {
        vendorId?: string;
        category?: ExpenseCategory;
        status?: PurchaseInvoiceStatus;
        isRecurring?: boolean;
        startDate?: Date;
        endDate?: Date;
    }): Promise<number>;
}
//# sourceMappingURL=expense-invoice.repository.d.ts.map