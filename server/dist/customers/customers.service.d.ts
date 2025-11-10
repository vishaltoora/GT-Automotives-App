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
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(userId: string, userRole: string): Promise<({
        vehicles: {
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
        }[];
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
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
                model: string;
                createdAt: Date;
                updatedAt: Date;
                customerId: string;
                make: string;
                year: number;
                vin: string | null;
                licensePlate: string | null;
                mileage: number | null;
            } | null;
        } & {
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
        })[];
        invoices: ({
            vehicle: {
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
            } | null;
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
        vehicles: {
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
        }[];
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
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string, userRole: string): Promise<{
        vehicles: {
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
        }[];
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    search(searchTerm: string, userId: string, userRole: string): Promise<({
        vehicles: {
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
        }[];
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
//# sourceMappingURL=customers.service.d.ts.map