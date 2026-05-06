import { AppointmentsService } from './appointments.service';
import { AppointmentInvoiceService } from './appointment-invoice.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto, PaymentDateQueryDto, CreateETransferInvoiceDto, CreateSquareDeviceInvoiceDto } from '../common/dto/appointment.dto';
import { PrismaService } from '@gt-automotive/database';
export declare class AppointmentsController {
    private readonly appointmentsService;
    private readonly appointmentInvoiceService;
    private readonly prisma;
    constructor(appointmentsService: AppointmentsService, appointmentInvoiceService: AppointmentInvoiceService, prisma: PrismaService);
    /**
     * Create a new appointment
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
     */
    create(createAppointmentDto: CreateAppointmentDto, user: any): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Get all appointments with filters
     * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
     */
    findAll(query: AppointmentQueryDto, user: any): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get calendar view
     * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
     */
    getCalendar(query: CalendarQueryDto, user: any): Promise<Record<string, any[]>>;
    /**
     * Get today's appointments
     * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
     */
    getToday(user: any): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get appointments by payment date (for daily cash reports / day summary)
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    getByPaymentDate(query: PaymentDateQueryDto): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get appointments with payments in a date range (for calendar highlighting)
     * This is optimized to return all payments in one request instead of per-day requests
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    getPaymentsByDateRange(startDate: string, endDate: string): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get customer's upcoming appointments
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER (customers can only see their own)
     */
    getCustomerAppointments(customerId: string, user: any): Promise<({
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Create E-Transfer invoice for an appointment
     * Creates an invoice with PENDING status and completes the appointment
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    createETransferInvoice(id: string, dto: CreateETransferInvoiceDto, user: any): Promise<{
        success: boolean;
        invoice: {
            id: string;
            invoiceNumber: string;
            total: number;
            status: import("@prisma/client").$Enums.InvoiceStatus;
        };
        message: string;
    }>;
    /**
     * Create Square Device invoice for an appointment
     * Creates an invoice with PAID status (payment received via Square terminal device)
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    createSquareDeviceInvoice(id: string, dto: CreateSquareDeviceInvoiceDto, user: any): Promise<{
        success: boolean;
        invoice: {
            id: string;
            invoiceNumber: string;
            total: number;
            status: import("@prisma/client").$Enums.InvoiceStatus;
        };
        message: string;
    }>;
    /**
     * Get a single appointment by ID
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
     */
    findOne(id: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Update an appointment
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    update(id: string, updateAppointmentDto: UpdateAppointmentDto, user: any): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Cancel an appointment
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
     */
    cancel(id: string): Promise<{
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
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
        employees: ({
            employee: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
            };
        } & {
            id: string;
            employeeId: string;
            appointmentId: string;
            createdAt: Date;
        })[];
        bookedByUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        invoice: {
            id: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            invoiceNumber: string;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
    } & {
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Delete an appointment (hard delete)
     * Roles: ADMIN, SUPERVISOR
     */
    remove(id: string): Promise<{
        id: string;
        employeeId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        vehicleId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        endTime: string | null;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        serviceAddress: string | null;
        notes: string | null;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        productSaleAmount: number | null;
        productSaleItems: string[];
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
}
//# sourceMappingURL=appointments.controller.d.ts.map