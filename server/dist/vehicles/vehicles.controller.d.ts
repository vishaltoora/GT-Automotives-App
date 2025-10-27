import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from '../common/dto/vehicle.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto, user: any): Promise<({
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            businessName: string | null;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            vehicleId: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                total: import(".prisma/client/runtime/library").Decimal;
                invoiceId: string;
                tireId: string | null;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
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
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            total: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            invoiceDate: Date;
            createdBy: string;
            paidAt: Date | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
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
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            businessName: string | null;
        };
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
    search(searchTerm: string, user: any): Promise<({
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            businessName: string | null;
        };
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
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            businessName: string | null;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            vehicleId: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                total: import(".prisma/client/runtime/library").Decimal;
                invoiceId: string;
                tireId: string | null;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
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
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            total: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            invoiceDate: Date;
            createdBy: string;
            paidAt: Date | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
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
        customer: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            businessName: string | null;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            vehicleId: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            notes: string | null;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                total: import(".prisma/client/runtime/library").Decimal;
                invoiceId: string;
                tireId: string | null;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                quantity: number;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
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
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            total: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            invoiceDate: Date;
            createdBy: string;
            paidAt: Date | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
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