import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto, PaymentDateQueryDto } from '../common/dto/appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    /**
     * Create a new appointment
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
     */
    create(createAppointmentDto: CreateAppointmentDto, user: any): Promise<{
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    }>;
    /**
     * Get all appointments with filters
     * Roles: ADMIN, SUPERVISOR, STAFF (staff see only their assigned appointments)
     */
    findAll(query: AppointmentQueryDto, user: any): Promise<({
        invoice: {
            id: string;
            invoiceNumber: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
        invoice: {
            id: string;
            invoiceNumber: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    })[]>;
    /**
     * Get appointments by payment date (for daily cash reports / day summary)
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    getByPaymentDate(query: PaymentDateQueryDto): Promise<({
        invoice: {
            id: string;
            invoiceNumber: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    })[]>;
    /**
     * Get customer's upcoming appointments
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER (customers can only see their own)
     */
    getCustomerAppointments(customerId: string, user: any): Promise<({
        invoice: {
            id: string;
            invoiceNumber: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    })[]>;
    /**
     * Get a single appointment by ID
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
     */
    findOne(id: string): Promise<{
        invoice: {
            id: string;
            invoiceNumber: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    }>;
    /**
     * Update an appointment
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<{
        invoice: {
            id: string;
            invoiceNumber: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod | null;
        } | null;
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
        employees: ({
            employee: {
                id: string;
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
        } & {
            id: string;
            appointmentId: string;
            createdAt: Date;
            employeeId: string;
        })[];
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    }>;
    /**
     * Cancel an appointment
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER
     */
    cancel(id: string): Promise<{
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
        vehicle: {
            id: string;
            customerId: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            make: string;
            model: string;
            year: number;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        } | null;
    } & {
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    }>;
    /**
     * Delete an appointment (hard delete)
     * Roles: ADMIN, SUPERVISOR
     */
    remove(id: string): Promise<{
        id: string;
        customerId: string;
        vehicleId: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
        scheduledDate: Date;
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
    }>;
}
//# sourceMappingURL=appointments.controller.d.ts.map