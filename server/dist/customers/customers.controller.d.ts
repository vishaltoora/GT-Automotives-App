import { CreateCustomerDto, UpdateCustomerDto } from '@gt-automotive/data';
import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(createCustomerDto: CreateCustomerDto, user: any): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        additionalEmails: string[];
        pstExempt: boolean;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(user: any): Promise<{
        stats: {
            totalSpent: number;
            outstandingBalance: number;
            vehicleCount: number;
            appointmentCount: number;
            upcomingAppointments: number;
            lastVisitDate: Date | null;
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
            engineType: string | null;
        }[];
        _count: {
            appointments: number;
            invoices: number;
            vehicles: number;
        };
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        additionalEmails: string[];
        pstExempt: boolean;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllSimple(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        additionalEmails: string[];
        pstExempt: boolean;
        phone: string | null;
        address: string | null;
        businessName: string | null;
    }[]>;
    search(searchTerm: string, user: any): Promise<({
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
            engineType: string | null;
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
        additionalEmails: string[];
        pstExempt: boolean;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string, user: any): Promise<{
        stats: {
            totalSpent: number | import(".prisma/client/runtime/library").Decimal;
            outstandingBalance: number;
            vehicleCount: number;
            appointmentCount: number;
            upcomingAppointments: number;
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
                engineType: string | null;
            } | null;
            employees: ({
                employee: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                appointmentId: string;
                employeeId: string;
            })[];
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
            serviceAddress: string | null;
            paymentAmount: number | null;
            paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
            paymentNotes: string | null;
            productSaleAmount: number | null;
            productSaleItems: string[];
            expectedAmount: number | null;
            paymentDate: Date | null;
            reminderSent: boolean;
            bookedBy: string | null;
        })[];
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
                engineType: string | null;
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
            appointmentId: string | null;
            subtotal: import(".prisma/client/runtime/library").Decimal;
            taxRate: import(".prisma/client/runtime/library").Decimal;
            taxAmount: import(".prisma/client/runtime/library").Decimal;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
            amountPaid: import(".prisma/client/runtime/library").Decimal;
            notes: string | null;
            invoiceDate: Date;
            createdBy: string;
            paidAt: Date | null;
            gstAmount: import(".prisma/client/runtime/library").Decimal | null;
            gstRate: import(".prisma/client/runtime/library").Decimal | null;
            pstAmount: import(".prisma/client/runtime/library").Decimal | null;
            pstRate: import(".prisma/client/runtime/library").Decimal | null;
            combinedInvoiceId: string | null;
            repairOrderId: string | null;
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
            engineType: string | null;
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
        additionalEmails: string[];
        pstExempt: boolean;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, user: any): Promise<{
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
            engineType: string | null;
        }[];
    } & {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        additionalEmails: string[];
        pstExempt: boolean;
        phone: string | null;
        address: string | null;
        businessName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=customers.controller.d.ts.map