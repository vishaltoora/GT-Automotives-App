import { PrismaService } from '@gt-automotive/database';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Vehicle, Prisma } from '@prisma/client';
export declare class VehicleRepository extends BaseRepository<Vehicle, Prisma.VehicleCreateInput, Prisma.VehicleUpdateInput, Prisma.VehicleWhereInput> {
    constructor(prisma: PrismaService);
    findAllWithDetails(): Promise<({
        customer: {
            id: string;
            createdAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            updatedAt: Date;
            businessName: string | null;
            address: string | null;
            phone: string | null;
        };
        _count: {
            invoices: number;
            appointments: number;
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
            invoices: number;
            appointments: number;
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
        customer: {
            id: string;
            createdAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            updatedAt: Date;
            businessName: string | null;
            address: string | null;
            phone: string | null;
        };
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                tireId: string | null;
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
            total: Prisma.Decimal;
            vehicleId: string | null;
            companyId: string;
            subtotal: Prisma.Decimal;
            taxRate: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            gstRate: Prisma.Decimal | null;
            gstAmount: Prisma.Decimal | null;
            pstRate: Prisma.Decimal | null;
            pstAmount: Prisma.Decimal | null;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
            invoiceDate: Date;
            paidAt: Date | null;
            invoiceNumber: string;
            createdBy: string;
        })[];
        appointments: {
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
        }[];
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
            email: string | null;
            firstName: string;
            lastName: string;
            updatedAt: Date;
            businessName: string | null;
            address: string | null;
            phone: string | null;
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
        customer: {
            id: string;
            createdAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            updatedAt: Date;
            businessName: string | null;
            address: string | null;
            phone: string | null;
        };
        _count: {
            invoices: number;
            appointments: number;
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