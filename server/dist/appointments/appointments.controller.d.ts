import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto } from '../common/dto/appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    /**
     * Create a new appointment
     * Roles: ADMIN, STAFF, CUSTOMER
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            employeeId: string;
            id: string;
            createdAt: Date;
            appointmentId: string;
        })[];
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Get all appointments with filters
     * Roles: ADMIN, STAFF (staff see only their assigned appointments)
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            employeeId: string;
            id: string;
            createdAt: Date;
            appointmentId: string;
        })[];
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get calendar view
     * Roles: ADMIN, STAFF (staff see only their assigned appointments)
     */
    getCalendar(query: CalendarQueryDto, user: any): Promise<Record<string, any[]>>;
    /**
     * Get today's appointments
     * Roles: ADMIN, STAFF (staff see only their assigned appointments)
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            employeeId: string;
            id: string;
            createdAt: Date;
            appointmentId: string;
        })[];
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get customer's upcoming appointments
     * Roles: ADMIN, STAFF, CUSTOMER (customers can only see their own)
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            employeeId: string;
            id: string;
            createdAt: Date;
            appointmentId: string;
        })[];
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get a single appointment by ID
     * Roles: ADMIN, STAFF, CUSTOMER
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            employeeId: string;
            id: string;
            createdAt: Date;
            appointmentId: string;
        })[];
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Update an appointment
     * Roles: ADMIN, STAFF
     */
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<{
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            employeeId: string;
            id: string;
            createdAt: Date;
            appointmentId: string;
        })[];
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Cancel an appointment
     * Roles: ADMIN, STAFF, CUSTOMER
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
            customerId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            make: string;
            model: string;
            year: number;
            vin: string | null;
            licensePlate: string | null;
            mileage: number | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Delete an appointment (hard delete)
     * Roles: ADMIN only
     */
    remove(id: string): Promise<{
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        appointmentType: import("@prisma/client").$Enums.AppointmentType;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        id: string;
        endTime: string | null;
        createdAt: Date;
        updatedAt: Date;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
}
//# sourceMappingURL=appointments.controller.d.ts.map