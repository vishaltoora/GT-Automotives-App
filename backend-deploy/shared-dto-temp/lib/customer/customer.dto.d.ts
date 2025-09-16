export declare class CreateCustomerDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
}
export declare class UpdateCustomerDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
}
export declare class CustomerDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    vehicleCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CustomerReferenceDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
}
