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
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            notes: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                total: import(".prisma/client/runtime/library").Decimal;
                description: string;
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
            status: import("@prisma/client").$Enums.InvoiceStatus;
            total: import(".prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            vehicleId: string | null;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
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
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
        year: number;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    }) | null>;
    findAll(userId: string, userRole: string): Promise<({
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
        id: string;
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
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
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
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
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            notes: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                total: import(".prisma/client/runtime/library").Decimal;
                description: string;
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
            status: import("@prisma/client").$Enums.InvoiceStatus;
            total: import(".prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            vehicleId: string | null;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
            invoiceDate: Date;
            createdBy: string;
            paidAt: Date | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
        })[];
        id: string;
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
        year: number;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, userId: string, userRole: string): Promise<({
        customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        appointments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            scheduledDate: Date;
            status: import("@prisma/client").$Enums.AppointmentStatus;
            vehicleId: string | null;
            notes: string | null;
            employeeId: string | null;
            scheduledTime: string;
            endTime: string | null;
            duration: number;
            serviceType: string;
            appointmentType: import("@prisma/client").$Enums.AppointmentType;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        }[];
        invoices: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                total: import(".prisma/client/runtime/library").Decimal;
                description: string;
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
            status: import("@prisma/client").$Enums.InvoiceStatus;
            total: import(".prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            vehicleId: string | null;
            companyId: string;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            notes: string | null;
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
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
        year: number;
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
            firstName: string;
            lastName: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            businessName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        _count: {
            appointments: number;
            invoices: number;
        };
    } & {
        id: string;
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
        year: number;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    })[]>;
    updateMileage(id: string, mileage: number, userId: string, userRole: string): Promise<{
        id: string;
        model: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        make: string;
        year: number;
        vin: string | null;
        licensePlate: string | null;
        mileage: number | null;
    }>;
}
//# sourceMappingURL=vehicles.service.d.ts.map