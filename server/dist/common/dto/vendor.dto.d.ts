export declare class CreateVendorDto {
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    isActive?: boolean;
    notes?: string;
}
export declare class UpdateVendorDto {
    name?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    isActive?: boolean;
    notes?: string;
}
export declare class VendorResponseDto {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    isActive: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        purchaseInvoices: number;
        expenseInvoices: number;
    };
}
export declare class VendorSearchDto {
    query?: string;
    limit?: string;
}
//# sourceMappingURL=vendor.dto.d.ts.map