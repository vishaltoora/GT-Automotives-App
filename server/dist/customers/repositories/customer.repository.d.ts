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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }) | null>;
    findAllWithDetails(): Promise<({
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        vehicles: {
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
    findOneWithDetails(id: string): Promise<({
        appointments: ({
            vehicle: {
                customerId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                make: string;
                model: string;
                year: number;
                vin: string | null;
                licensePlate: string | null;
                mileage: number | null;
            } | null;
        } & {
            customerId: string;
            vehicleId: string | null;
            employeeId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            notes: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            paymentAmount: number | null;
            paymentBreakdown: Prisma.JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            id: string;
            endTime: string | null;
            createdAt: Date;
            updatedAt: Date;
            reminderSent: boolean;
            bookedBy: string | null;
        })[];
        invoices: ({
            vehicle: {
                customerId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
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
                quantity: number;
                total: Prisma.Decimal;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: Prisma.Decimal;
                tireId: string | null;
                invoiceId: string;
            }[];
        } & {
            customerId: string;
            vehicleId: string | null;
            notes: string | null;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string;
            total: Prisma.Decimal;
            invoiceNumber: string;
            companyId: string;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            invoiceDate: Date;
            paidAt: Date | null;
            gstAmount: Prisma.Decimal | null;
            gstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
        })[];
        vehicles: {
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }) | null>;
    search(searchTerm: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        vehicles: {
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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