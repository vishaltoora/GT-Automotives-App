export declare class InvoiceDto {
    id: string;
    invoiceNumber: string;
    customerId: string;
    vehicleId?: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    status: string;
    paymentMethod?: string;
    notes?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    paidAt?: Date;
}
export declare class CreateInvoiceDto {
    customerId: string;
    vehicleId?: string;
    taxRate: number;
    paymentMethod?: string;
    notes?: string;
    createdBy: string;
}
export declare class UpdateInvoiceDto {
    status?: string;
    paymentMethod?: string;
    notes?: string;
    paidAt?: Date;
}
export declare class InvoiceItemDto {
    id: string;
    invoiceId: string;
    invoice?: InvoiceDto;
    tireId?: string;
    tire?: TireReferenceDto;
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateInvoiceItemDto {
    tireId?: string;
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class UpdateInvoiceItemDto {
    description?: string;
    quantity?: number;
    unitPrice?: number;
}
export declare class CustomerReferenceDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
}
export declare class VehicleReferenceDto {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
}
export declare class TireReferenceDto {
    id: string;
    brand: string;
    size: string;
    type: string;
    condition: string;
    price: number;
}
