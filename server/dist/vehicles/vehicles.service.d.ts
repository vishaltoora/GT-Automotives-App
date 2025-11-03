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
        appointments: {
            id: string;
            employeeId: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            customerId: string;
            vehicleId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            endTime: string | null;
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
                quantity: number;
                total: import(".prisma/client/runtime/library").Decimal;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                tireId: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paidAt: Date | null;
            notes: string | null;
            customerId: string;
            vehicleId: string | null;
            total: import(".prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            invoiceDate: Date;
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
    findAll(userId: string, userRole: string): Promise<({
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
    findByCustomer(customerId: string, userId: string, userRole: string): Promise<({
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
        appointments: {
            id: string;
            employeeId: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            customerId: string;
            vehicleId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            endTime: string | null;
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
                quantity: number;
                total: import(".prisma/client/runtime/library").Decimal;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                tireId: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paidAt: Date | null;
            notes: string | null;
            customerId: string;
            vehicleId: string | null;
            total: import(".prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            invoiceDate: Date;
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
    update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string, userRole: string): Promise<({
        appointments: {
            id: string;
            employeeId: string | null;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            customerId: string;
            vehicleId: string | null;
            scheduledDate: Date;
            scheduledTime: string;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            endTime: string | null;
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
                quantity: number;
                total: import(".prisma/client/runtime/library").Decimal;
                tireName: string | null;
                itemType: import("@prisma/client").$Enums.InvoiceItemType;
                unitPrice: import(".prisma/client/runtime/library").Decimal;
                tireId: string | null;
                invoiceId: string;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            createdBy: string;
            createdAt: Date;
            updatedAt: Date;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            paidAt: Date | null;
            notes: string | null;
            customerId: string;
            vehicleId: string | null;
            total: import(".prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            invoiceDate: Date;
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
    remove(id: string, userId: string, userRole: string): Promise<{
        message: string;
    }>;
    search(searchTerm: string, userId: string, userRole: string): Promise<({
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
    updateMileage(id: string, mileage: number, userId: string, userRole: string): Promise<{
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
}
//# sourceMappingURL=vehicles.service.d.ts.map