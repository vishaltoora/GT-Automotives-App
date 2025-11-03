import { CustomerRepository } from './repositories/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from '../common/dto/customer.dto';
import { AuditRepository } from '../audit/repositories/audit.repository';
import { PrismaService } from '@gt-automotive/database';
export declare class CustomersService {
    private readonly customerRepository;
    private readonly auditRepository;
    private readonly prisma;
    constructor(customerRepository: CustomerRepository, auditRepository: AuditRepository, prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto, createdBy: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }>;
    findAll(userId: string, userRole: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        vehicles: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
    findOne(id: string, userId: string, userRole: string): Promise<{
        stats: {
            totalSpent: number | import(".prisma/client/runtime/library").Decimal;
            vehicleCount: number;
            appointmentCount: number;
            lastVisitDate: Date | null;
        };
        appointments: ({
            vehicle: {
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
            } | null;
        } & {
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
        })[];
        smsPreference: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string | null;
            userId: string | null;
            optedIn: boolean;
            optedInAt: Date | null;
            optedOutAt: Date | null;
            appointmentReminders: boolean;
            serviceUpdates: boolean;
            promotional: boolean;
            appointmentAlerts: boolean;
            scheduleReminders: boolean;
            dailySummary: boolean;
            urgentAlerts: boolean;
        } | null;
        invoices: ({
            vehicle: {
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
            } | null;
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
        vehicles: {
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
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string, userRole: string): Promise<{
        vehicles: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    search(searchTerm: string, userId: string, userRole: string): Promise<({
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        vehicles: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    })[]>;
}
//# sourceMappingURL=customers.service.d.ts.map