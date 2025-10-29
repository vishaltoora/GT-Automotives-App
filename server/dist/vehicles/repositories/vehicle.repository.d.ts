import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Vehicle, Prisma } from '@prisma/client';
export declare class VehicleRepository extends BaseRepository<Vehicle, Prisma.VehicleCreateInput, Prisma.VehicleUpdateInput, Prisma.VehicleWhereInput> {
    constructor(prisma: PrismaService);
    findAllWithDetails(): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        make: string;
        model: string;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    })[]>;
    findByCustomer(customerId: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        make: string;
        model: string;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    })[]>;
    findOneWithDetails(id: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        appointments: {
            id: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string | null;
            employeeId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            notes: string | null;
            paymentAmount: number | null;
            paymentBreakdown: Prisma.JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                invoiceId: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                tireId: string | null;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: Prisma.Decimal;
                total: Prisma.Decimal;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vehicleId: string | null;
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
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        make: string;
        model: string;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    }) | null>;
    findByVin(vin: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        make: string;
        model: string;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    }) | null>;
    search(searchTerm: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
        id: string;
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        make: string;
        model: string;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    })[]>;
    getVehicleStats(vehicleId: string): Promise<{
        serviceCount: number;
        totalSpent: number | Prisma.Decimal;
        lastServiceDate: Date | null;
        nextAppointment: {
            scheduledDate: Date;
            scheduledTime: string;
            serviceType: string;
        } | null;
    }>;
}
//# sourceMappingURL=vehicle.repository.d.ts.map