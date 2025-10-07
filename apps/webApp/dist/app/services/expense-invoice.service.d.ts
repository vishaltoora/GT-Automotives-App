import { ExpenseInvoiceDto, CreateExpenseInvoiceDto, UpdateExpenseInvoiceDto, ExpenseInvoiceListResponse, ExpenseCategory, ExpenseInvoiceStatus, PaymentMethod, RecurringPeriod } from '@gt-automotive/data';
export type ExpenseInvoice = ExpenseInvoiceDto;
export type { CreateExpenseInvoiceDto, UpdateExpenseInvoiceDto, ExpenseInvoiceListResponse, ExpenseCategory, ExpenseInvoiceStatus, PaymentMethod, RecurringPeriod, };
declare const expenseInvoiceService: {
    getAll(filters?: {
        vendorId?: string;
        category?: ExpenseCategory;
        status?: ExpenseInvoiceStatus;
        isRecurring?: boolean;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<ExpenseInvoiceListResponse>;
    getById(id: string): Promise<ExpenseInvoice>;
    create(data: CreateExpenseInvoiceDto): Promise<ExpenseInvoice>;
    update(id: string, data: Partial<CreateExpenseInvoiceDto>): Promise<ExpenseInvoice>;
    delete(id: string): Promise<ExpenseInvoice>;
    uploadImage(id: string, file: File): Promise<ExpenseInvoice>;
    deleteImage(id: string): Promise<ExpenseInvoice>;
};
export default expenseInvoiceService;
//# sourceMappingURL=expense-invoice.service.d.ts.map