import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../common/dto/customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    }>;
    findAll(user: any): Promise<({
        _count: {
            invoices: number;
            appointments: number;
            vehicles: number;
        };
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    })[]>;
    search(searchTerm: string, user: any): Promise<({
        _count: {
            invoices: number;
            appointments: number;
            vehicles: number;
        };
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        stats: {
            totalSpent: number | import(".prisma/client/runtime/library").Decimal;
            vehicleCount: number;
            appointmentCount: number;
            lastVisitDate: Date | null;
        };
        invoices: ({
            vehicle: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                make: string;
                model: string;
                year: number;
                vin: string | null;
                licensePlate: string | null;
                mileage: number | null;
            } | null;
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                tireId: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
                invoiceId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            total: import(".prisma/client/runtime/library").Decimal;
            vehicleId: string | null;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
            invoiceDate: Date;
            paidAt: Date | null;
            invoiceNumber: string;
            createdBy: string;
        })[];
        appointments: ({
            vehicle: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                make: string;
                model: string;
                year: number;
                vin: string | null;
                licensePlate: string | null;
                mileage: number | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            reminderSent: boolean;
        })[];
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        id: string;
        createdAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: any): Promise<{
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        updatedAt: Date;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=customers.controller.d.ts.map