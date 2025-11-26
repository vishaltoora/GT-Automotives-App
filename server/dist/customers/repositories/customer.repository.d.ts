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
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string | null;
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
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
    findOneWithDetails(id: string): Promise<({
        appointments: ({
            vehicle: {
                id: string;
                customerId: string;
                createdAt: Date;
                updatedAt: Date;
                vin: string | null;
                make: string;
                model: string;
                year: number;
                licensePlate: string | null;
                mileage: number | null;
            } | null;
        } & {
            id: string;
            customerId: string;
            vehicleId: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string | null;
            scheduledDate: Date;
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
                customerId: string;
                createdAt: Date;
                updatedAt: Date;
                vin: string | null;
                make: string;
                model: string;
                year: number;
                licensePlate: string | null;
                mileage: number | null;
            } | null;
            items: {
                invoiceId: string;
                id: string;
                total: Prisma.Decimal;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                tireId: string | null;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: Prisma.Decimal;
            }[];
        } & {
            id: string;
            invoiceNumber: string;
            customerId: string;
            vehicleId: string | null;
            companyId: string;
            appointmentId: string | null;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            total: Prisma.Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
            invoiceDate: Date;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            paidAt: Date | null;
            gstAmount: Prisma.Decimal | null;
            gstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
        })[];
        vehicles: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        }[];
        smsPreference: {
            id: string;
            customerId: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string | null;
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
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        firstName: string;
        lastName: string;
        email: string | null;
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
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    } | null>;
}
//# sourceMappingURL=customer.repository.d.ts.map