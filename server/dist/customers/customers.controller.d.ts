import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../common/dto/customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: any): Promise<{
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }>;
    findAll(user: any): Promise<({
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            model: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
    search(searchTerm: string, user: any): Promise<({
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            model: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        stats: {
            totalSpent: number | import(".prisma/client/runtime/library").Decimal;
            vehicleCount: number;
            appointmentCount: number;
            lastVisitDate: Date | null;
        };
        appointments: ({
            vehicle: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                model: string;
                make: string;
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
            notes: string | null;
            scheduledDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            reminderSent: boolean;
        })[];
        invoices: ({
            vehicle: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                model: string;
                make: string;
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
                quantity: number;
                total: import(".prisma/client/runtime/library").Decimal;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                tireId: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            notes: string | null;
            createdBy: string;
            total: import(".prisma/client/runtime/library").Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            vehicleId: string | null;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            invoiceDate: Date;
            paidAt: Date | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
        })[];
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            model: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: any): Promise<{
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            model: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=customers.controller.d.ts.map