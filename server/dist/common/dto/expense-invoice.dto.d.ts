import { ExpenseCategory, PurchaseInvoiceStatus, PaymentMethod, RecurringPeriod } from '@prisma/client';
export declare class CreateExpenseInvoiceDto {
    invoiceNumber?: string;
    vendorId?: string;
    vendorName: string;
    description: string;
    invoiceDate: string;
    amount: number;
    taxAmount?: number;
    totalAmount: number;
    category: ExpenseCategory;
    status?: PurchaseInvoiceStatus;
    paymentDate?: string;
    paymentMethod?: PaymentMethod;
    isRecurring?: boolean;
    recurringPeriod?: RecurringPeriod;
    notes?: string;
    createdBy: string;
}
export declare class UpdateExpenseInvoiceDto {
    invoiceNumber?: string;
    vendorId?: string;
    vendorName?: string;
    description?: string;
    invoiceDate?: string;
    amount?: number;
    taxAmount?: number;
    totalAmount?: number;
    category?: ExpenseCategory;
    status?: PurchaseInvoiceStatus;
    paymentDate?: string;
    paymentMethod?: PaymentMethod;
    isRecurring?: boolean;
    recurringPeriod?: RecurringPeriod;
    notes?: string;
}
export declare class ExpenseInvoiceResponseDto {
    id: string;
    invoiceNumber?: string;
    vendorId?: string;
    vendorName: string;
    description: string;
    invoiceDate: Date;
    amount: number;
    taxAmount?: number;
    totalAmount: number;
    category: ExpenseCategory;
    status: PurchaseInvoiceStatus;
    paymentDate?: Date;
    paymentMethod?: PaymentMethod;
    isRecurring: boolean;
    recurringPeriod?: RecurringPeriod;
    notes?: string;
    imageUrl?: string;
    imageName?: string;
    imageSize?: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    vendor?: {
        id: string;
        name: string;
        contactPerson?: string;
        email?: string;
        phone?: string;
    };
}
export declare class ExpenseInvoiceFilterDto {
    vendorId?: string;
    category?: ExpenseCategory;
    status?: PurchaseInvoiceStatus;
    isRecurring?: boolean;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
}
//# sourceMappingURL=expense-invoice.dto.d.ts.map