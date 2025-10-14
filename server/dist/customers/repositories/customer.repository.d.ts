import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Customer, Prisma } from '@prisma/client';
export declare class CustomerRepository extends BaseRepository<Customer, Prisma.CustomerCreateInput, Prisma.CustomerUpdateInput, Prisma.CustomerFindManyArgs> {
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
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
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    }) | null>;
    findAllWithDetails(): Promise<({
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
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    })[]>;
    findOneWithDetails(id: string): Promise<({
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
            employeeId: string | null;
            endTime: string | null;
            duration: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            serviceType: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            reminderSent: boolean;
            bookedBy: string | null;
        })[];
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
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: Prisma.Decimal;
                total: Prisma.Decimal;
                invoiceId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string | null;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            notes: string | null;
            invoiceNumber: string;
            invoiceDate: Date;
            taxAmount: Prisma.Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            createdBy: string;
            total: Prisma.Decimal;
            companyId: string;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            gstRate: Prisma.Decimal | null;
            gstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            paidAt: Date | null;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    }) | null>;
    search(searchTerm: string): Promise<({
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
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    })[]>;
    getCustomerStats(customerId: string): Promise<{
        totalSpent: number | Prisma.Decimal;
        vehicleCount: number;
        appointmentCount: number;
        lastVisitDate: Date | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        businessName: string | null;
        address: string | null;
        phone: string | null;
    } | null>;
}
//# sourceMappingURL=customer.repository.d.ts.map