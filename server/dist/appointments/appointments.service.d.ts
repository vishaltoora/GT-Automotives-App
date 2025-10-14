import { PrismaService } from '@gt-automotive/database';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto, CalendarQueryDto } from '../common/dto/appointment.dto';
import { AvailabilityService } from './availability.service';
export declare class AppointmentsService {
    private prisma;
    private availabilityService;
    constructor(prisma: PrismaService, availabilityService: AvailabilityService);
    /**
     * Create a new appointment
     */
    create(dto: CreateAppointmentDto, bookedBy: string): Promise<{
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
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Find all appointments with optional filters
     * STAFF users see only their assigned appointments
     * ADMIN users see all appointments
     */
    findAll(query: AppointmentQueryDto, user?: any): Promise<({
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
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    /**
     * Get calendar view data
     * STAFF users see only their assigned appointments
     * ADMIN users see all appointments
     */
    getCalendar(query: CalendarQueryDto, user?: any): Promise<Record<string, any[]>>;
    /**
     * Find one appointment by ID
     */
    findOne(id: string): Promise<{
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
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Update an appointment
     */
    update(id: string, dto: UpdateAppointmentDto): Promise<{
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
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Cancel an appointment
     */
    cancel(id: string): Promise<{
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
        employee: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Get today's appointments for printing/display
     * STAFF users see only their assigned appointments
     * ADMIN users see all appointments
     */
    getTodayAppointments(user?: any): Promise<({
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
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    /**
     * Get upcoming appointments for a customer
     */
    getCustomerUpcoming(customerId: string): Promise<({
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
        employee: {
            id: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        customerId: string;
        vehicleId: string | null;
        employeeId: string | null;
        scheduledDate: Date;
        scheduledTime: string;
        duration: number;
        serviceType: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
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