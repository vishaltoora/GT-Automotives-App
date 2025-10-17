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
            endTime: string | null;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            vehicleId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
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