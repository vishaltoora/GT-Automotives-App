import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Customer, Prisma } from '@prisma/client';
export declare class CustomerRepository extends BaseRepository<Customer, Prisma.CustomerCreateInput, Prisma.CustomerUpdateInput, Prisma.CustomerFindManyArgs> {
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        _count: {
            invoices: number;
            appointments: number;
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
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }) | null>;
    findAllWithDetails(): Promise<({
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
            model: string;
            make: string;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
    findOneWithDetails(id: string): Promise<({
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
                description: string;
                createdAt: Date;
                updatedAt: Date;
                total: Prisma.Decimal;
                quantity: number;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: Prisma.Decimal;
                tireId: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            invoiceDate: Date;
            taxAmount: Prisma.Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            total: Prisma.Decimal;
            invoiceNumber: string;
            customerId: string;
            vehicleId: string | null;
            companyId: string;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            paidAt: Date | null;
            gstAmount: Prisma.Decimal | null;
            gstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
        })[];
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
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            vehicleId: string | null;
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
            model: string;
            make: string;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }) | null>;
    search(searchTerm: string): Promise<({
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
            model: string;
            make: string;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
    } | null>;
}
//# sourceMappingURL=customer.repository.d.ts.map