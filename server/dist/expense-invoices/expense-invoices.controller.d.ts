import { ExpenseInvoicesService } from './expense-invoices.service';
import { CreateExpenseInvoiceDto, UpdateExpenseInvoiceDto, ExpenseInvoiceResponseDto, ExpenseInvoiceFilterDto } from '../common/dto/expense-invoice.dto';
export declare class ExpenseInvoicesController {
    private readonly expenseInvoicesService;
    constructor(expenseInvoicesService: ExpenseInvoicesService);
    create(createDto: CreateExpenseInvoiceDto): Promise<ExpenseInvoiceResponseDto>;
    findAll(filterDto: ExpenseInvoiceFilterDto): Promise<{
        data: ExpenseInvoiceResponseDto[];
        total: number;
        page: number;
        limit: number;
    }>;
    getImageUrl(id: string): Promise<{
        imageUrl: string;
    }>;
    uploadImage(id: string, file: any): Promise<ExpenseInvoiceResponseDto>;
    deleteImage(id: string): Promise<ExpenseInvoiceResponseDto>;
    findOne(id: string): Promise<ExpenseInvoiceResponseDto>;
    update(id: string, updateDto: UpdateExpenseInvoiceDto): Promise<ExpenseInvoiceResponseDto>;
    remove(id: string): Promise<ExpenseInvoiceResponseDto>;
}
//# sourceMappingURL=expense-invoices.controller.d.ts.map