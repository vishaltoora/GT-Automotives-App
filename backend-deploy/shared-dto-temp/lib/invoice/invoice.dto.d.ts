import { PaymentMethod, InvoiceItemType } from '../common/enums.dto';
export declare class CreateCustomerDtoForInvoice {
    firstName: string;
    lastName: string;
    businessName?: string;
    address?: string;
    phone?: string;
    email?: string;
}
export declare class CreateInvoiceEnhancedDto {
    customerId?: string;
    customerData?: CreateCustomerDtoForInvoice;
    vehicleId?: string;
    items: CreateInvoiceItemEnhancedDto[];
    taxRate?: number;
    gstRate?: number;
    pstRate?: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
}
export declare class CreateInvoiceItemEnhancedDto {
    tireId?: string;
    itemType: InvoiceItemType;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class UpdateInvoiceItemEnhancedDto {
    itemType?: InvoiceItemType;
    description?: string;
    quantity?: number;
    unitPrice?: number;
}
