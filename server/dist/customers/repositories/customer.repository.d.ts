import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Customer, Prisma } from '@prisma/client';
export declare class CustomerRepository extends BaseRepository<Customer, Prisma.CustomerCreateInput, Prisma.CustomerUpdateInput, Prisma.CustomerFindManyArgs> {
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        vehicles: {
            id: string;
            model: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findAllWithDetails(): Promise<({
        vehicles: {
            id: string;
            model: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOneWithDetails(id: string): Promise<({
        appointments: ({
            vehicle: {
                id: string;
                model: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
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
            scheduledDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            notes: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: Prisma.JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        })[];
        invoices: ({
            vehicle: {
                id: string;
                model: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
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
                total: Prisma.Decimal;
                description: string;
                invoiceId: string;
                tireId: string | null;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: Prisma.Decimal;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            total: Prisma.Decimal;
            invoiceNumber: string;
            vehicleId: string | null;
            companyId: string;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
            invoiceDate: Date;
            createdBy: string;
            paidAt: Date | null;
            gstAmount: Prisma.Decimal | null;
            gstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
        })[];
        vehicles: {
            id: string;
            model: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        smsPreference: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string | null;
            userId: string | null;
            optedIn: boolean;
            optedInAt: Date | null;
            optedOutAt: Date | null;
            appointmentReminders: boolean;
            serviceUpdates: boolean;
            promotional: boolean;
            appointmentAlerts: boolean;
            scheduleReminders: boolean;
            dailySummary: boolean;
            urgentAlerts: boolean;
        } | null;
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    search(searchTerm: string): Promise<({
        vehicles: {
            id: string;
            model: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            make: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getCustomerStats(customerId: string): Promise<{
        totalSpent: number | Prisma.Decimal;
        vehicleCount: number;
        appointmentCount: number;
        lastVisitDate: Date | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
//# sourceMappingURL=customer.repository.d.ts.map