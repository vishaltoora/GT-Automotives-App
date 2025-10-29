import { VehicleRepository } from './repositories/vehicle.repository';
import { CustomerRepository } from '../customers/repositories/customer.repository';
import { CreateVehicleDto } from '../common/dto/vehicle.dto';
import { UpdateVehicleDto } from '../common/dto/vehicle.dto';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';
export declare class VehiclesService {
    private readonly vehicleRepository;
    private readonly customerRepository;
    private readonly auditRepository;
    private readonly prisma;
    constructor(vehicleRepository: VehicleRepository, customerRepository: CustomerRepository, auditRepository: AuditRepository, prisma: PrismaService);
    create(createVehicleDto: CreateVehicleDto, userId: string, userRole: string): Promise<({
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
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
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
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
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
    findAll(userId: string, userRole: string): Promise<({
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
    findByCustomer(customerId: string, userId: string, userRole: string): Promise<({
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
    findOne(id: string, userId: string, userRole: string): Promise<{
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
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
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
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
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
        customerId: string;
        createdAt: Date;
        updatedAt: Date;
        year: number;
        make: string;
        model: string;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string, userRole: string): Promise<({
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
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
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
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                total: import(".prisma/client/runtime/library").Decimal;
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
    remove(id: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    search(searchTerm: string, userId: string, userRole: string): Promise<({
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
    updateMileage(id: string, mileage: number, userId: string, userRole: string): Promise<{
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
    }>;
}
//# sourceMappingURL=vehicles.service.d.ts.map