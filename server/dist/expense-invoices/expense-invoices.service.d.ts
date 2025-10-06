import { ExpenseInvoiceRepository } from './expense-invoice.repository';
import { AzureBlobService } from '../common/services/azure-blob.service';
import { CreateExpenseInvoiceDto, UpdateExpenseInvoiceDto, ExpenseInvoiceResponseDto, ExpenseInvoiceFilterDto } from '../common/dto/expense-invoice.dto';
export declare class ExpenseInvoicesService {
    private expenseInvoiceRepository;
    private azureBlobService;
    constructor(expenseInvoiceRepository: ExpenseInvoiceRepository, azureBlobService: AzureBlobService);
    create(createDto: CreateExpenseInvoiceDto): Promise<ExpenseInvoiceResponseDto>;
    findAll(filterDto: ExpenseInvoiceFilterDto): Promise<{
        data: ExpenseInvoiceResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<ExpenseInvoiceResponseDto>;
    update(id: string, updateDto: UpdateExpenseInvoiceDto): Promise<ExpenseInvoiceResponseDto>;
    uploadImage(id: string, file: Buffer, originalFileName: string, mimeType?: string): Promise<ExpenseInvoiceResponseDto>;
    deleteImage(id: string): Promise<ExpenseInvoiceResponseDto>;
    remove(id: string): Promise<ExpenseInvoiceResponseDto>;
    private mapToResponse;
}
//# sourceMappingURL=expense-invoices.service.d.ts.map