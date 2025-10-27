export interface SmsPreference {
    optedIn: boolean;
    appointmentReminders: boolean;
    serviceUpdates: boolean;
    promotional: boolean;
}
export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    vehicles?: Vehicle[];
    smsPreference?: SmsPreference;
    _count?: {
        invoices: number;
        appointments: number;
        vehicles: number;
    };
    stats?: {
        totalSpent: number;
        vehicleCount: number;
        appointmentCount: number;
        lastVisitDate: Date | null;
    };
    createdAt: string;
    updatedAt: string;
}
export interface Vehicle {
    id: string;
    customerId: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
    _count?: {
        invoices: number;
        appointments: number;
    };
    createdAt: string;
    updatedAt: string;
}
export interface CreateCustomerDto {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    smsOptedIn?: boolean;
    smsAppointmentReminders?: boolean;
    smsServiceUpdates?: boolean;
    smsPromotional?: boolean;
}
export interface UpdateCustomerDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    businessName?: string;
    smsOptedIn?: boolean;
    smsAppointmentReminders?: boolean;
    smsServiceUpdates?: boolean;
    smsPromotional?: boolean;
}
declare class CustomerService {
    getAllCustomers(): Promise<Customer[]>;
    getCustomers(): Promise<Customer[]>;
    getCustomer(id: string): Promise<Customer>;
    getMyProfile(): Promise<Customer | null>;
    createCustomer(data: CreateCustomerDto): Promise<Customer>;
    updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer>;
    deleteCustomer(id: string): Promise<void>;
    searchCustomers(searchTerm: string): Promise<Customer[]>;
}
export declare const customerService: CustomerService;
export {};
//# sourceMappingURL=customer.service.d.ts.map