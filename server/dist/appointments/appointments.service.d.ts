import { PrismaService } from '@gt-automotive/database';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto } from '../common/dto/appointment.dto';
import { AvailabilityService } from './availability.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';
export declare class AppointmentsService {
    private prisma;
    private availabilityService;
    private smsService;
    private emailService;
    private readonly appointmentInclude;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService, smsService: SmsService, emailService: EmailService);
    /**
     * Create a new appointment
     */
    create(dto: CreateAppointmentDto, bookedBy: string): Promise<{
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    }>;
    /**
     * Find all appointments with optional filters
     * All users (STAFF and ADMIN) can see all appointments
     * Uses DATE-only comparison to avoid timezone issues
     */
    findAll(query: AppointmentQueryDto, user?: any): Promise<({
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get calendar view data
     * All users (STAFF and ADMIN) can see all appointments
     * Uses DATE-only comparison to avoid timezone issues
     */
    getCalendar(query: CalendarQueryDto, user?: any): Promise<Record<string, any[]>>;
    /**
     * Find one appointment by ID
     */
    findOne(id: string): Promise<{
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
     */
    update(id: string, dto: UpdateAppointmentDto): Promise<{
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
     */
    cancel(id: string): Promise<{
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
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
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
    }>;
    /**
     * Delete an appointment (hard delete - admin only)
     */
    remove(id: string): Promise<{
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
    }>;
    /**
     * Get appointments by payment date (for daily cash reports)
     * Returns appointments where payment was processed on the specified date
     *
     * TIMEZONE HANDLING:
     * - All date comparisons use Pacific Time (PST/PDT) via AT TIME ZONE
     * - This ensures payments show on the correct business day regardless of server timezone
     *
     * BACKWARDS COMPATIBILITY:
     * - If paymentDate exists: Use paymentDate (new behavior - accurate processing date)
     * - If paymentDate is NULL: Fall back to scheduledDate + COMPLETED status (old appointments)
     */
    getByPaymentDate(paymentDate: Date): Promise<({
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get today's appointments for printing/display
     * All users (STAFF and ADMIN) can see all appointments
     * Uses DATE-only comparison to avoid timezone issues
     */
    getTodayAppointments(user?: any): Promise<({
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        paymentDate: Date | null;
        reminderSent: boolean;
        bookedBy: string | null;
    })[]>;
    /**
     * Get upcoming appointments for a customer
     * Uses Pacific Time DATE comparison to ensure correct business day
     */
    getCustomerUpcoming(customerId: string): Promise<({
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
            createdAt: Date;
            employeeId: string;
            appointmentId: string;
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
        paymentAmount: number | null;
        paymentBreakdown: import(".prisma/client/runtime/library").JsonValue | null;
        paymentNotes: string | null;
        expectedAmount: number | null;
        paymentDate: Date | null;
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