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
            email: string | null;
            firstName: string;
            lastName: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
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
        model: string;
        make: string;
        year: number;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    })[]>;
    findOneWithDetails(id: string): Promise<({
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
        appointments: {
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
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                quantity: number;
                total: Prisma.Decimal;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: Prisma.Decimal;
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
            total: Prisma.Decimal;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            vehicleId: string | null;
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
    } & {
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
    }) | null>;
    findByVin(vin: string): Promise<({
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
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
    }) | null>;
    search(searchTerm: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
        };
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            address: string | null;
            businessName: string | null;
        };
    } & {
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