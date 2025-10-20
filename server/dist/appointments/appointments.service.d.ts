import { PrismaService } from '@gt-automotive/database';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto } from '../common/dto/appointment.dto';
import { AvailabilityService } from './availability.service';
export declare class AppointmentsService {
    private prisma;
    private availabilityService;
    private readonly appointmentInclude;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService);
    /**
     * Create a new appointment
     */
    create(dto: CreateAppointmentDto, bookedBy: string): Promise<{
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
     * Find all appointments with optional filters
     * All users (STAFF and ADMIN) can see all appointments
     */
    findAll(query: AppointmentQueryDto, user?: any): Promise<({
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
     * Get calendar view data
     * All users (STAFF and ADMIN) can see all appointments
     */
    getCalendar(query: CalendarQueryDto, user?: any): Promise<Record<string, any[]>>;
    /**
     * Find one appointment by ID
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
     */
    update(id: string, dto: UpdateAppointmentDto): Promise<{
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
     * Delete an appointment (hard delete - admin only)
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
    /**
     * Get today's appointments for printing/display
     * All users (STAFF and ADMIN) can see all appointments
     */
    getTodayAppointments(user?: any): Promise<({
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
     * Get upcoming appointments for a customer
     */
    getCustomerUpcoming(customerId: string): Promise<({
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
     * Helper: Find an available employee for a time slot
     */
    private findAvailableEmployee;
    /**
     * Helper: Calculate end time from start time and duration
     */
    private calculateEndTime;
}
//# sourceMappingURL=appointments.service.d.ts.map