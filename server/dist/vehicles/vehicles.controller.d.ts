import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from '../common/dto/vehicle.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto, user: any): Promise<({
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
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
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
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            createdBy: string;
            total: import(".prisma/client/runtime/library").Decimal;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
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
    findAll(user: any): Promise<({
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
    search(searchTerm: string, user: any): Promise<({
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
    findByCustomer(customerId: string, user: any): Promise<({
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
    findOne(id: string, user: any): Promise<{
        stats: {
            serviceCount: number;
            totalSpent: number | import(".prisma/client/runtime/library").Decimal;
            lastServiceDate: Date | null;
            nextAppointment: {
                scheduledDate: Date;
                scheduledTime: string;
                serviceType: string;
            } | null;
        };
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
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
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
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            createdBy: string;
            total: import(".prisma/client/runtime/library").Decimal;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            paidAt: Date | null;
        })[];
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
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, user: any): Promise<({
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
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
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
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            createdBy: string;
            total: import(".prisma/client/runtime/library").Decimal;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
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
    updateMileage(id: string, mileage: number, user: any): Promise<{
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
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=vehicles.controller.d.ts.map