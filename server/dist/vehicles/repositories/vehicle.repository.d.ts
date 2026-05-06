import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Vehicle, Prisma } from '@prisma/client';
export declare class VehicleRepository extends BaseRepository<Vehicle, Prisma.VehicleCreateInput, Prisma.VehicleUpdateInput, Prisma.VehicleWhereInput> {
    constructor(prisma: PrismaService);
    findAllWithDetails(): Promise<({
        _count: {
            appointments: number;
            invoices: number;
        };
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
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
    })[]>;
    findByCustomer(customerId: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
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
    })[]>;
    findOneWithDetails(id: string): Promise<({
        appointments: {
            id: string;
            employeeId: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            serviceAddress: string | null;
            notes: string | null;
            paymentAmount: number | null;
            paymentBreakdown: Prisma.JsonValue | null;
            paymentNotes: string | null;
            productSaleAmount: number | null;
            productSaleItems: string[];
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        invoices: ({
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
            appointmentId: string | null;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string | null;
            notes: string | null;
            invoiceNumber: string;
            companyId: string;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            total: Prisma.Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            invoiceDate: Date;
            paidAt: Date | null;
            gstAmount: Prisma.Decimal | null;
            gstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
        })[];
    } & {
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
    }) | null>;
    findByVin(vin: string): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
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
    }) | null>;
    search(searchTerm: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
        };
        customer: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
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