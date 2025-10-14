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
     * Get all appointments with filters
     * Roles: ADMIN, STAFF (staff see only their assigned appointments)
     */
    findAll(query: AppointmentQueryDto, user: any): Promise<({
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
     * Get calendar view
     * Roles: ADMIN, STAFF (staff see only their assigned appointments)
     */
    getCalendar(query: CalendarQueryDto, user: any): Promise<Record<string, any[]>>;
    /**
     * Get today's appointments
     * Roles: ADMIN, STAFF (staff see only their assigned appointments)
     */
    getToday(user: any): Promise<({
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
     * Get customer's upcoming appointments
     * Roles: ADMIN, STAFF, CUSTOMER (customers can only see their own)
     */
    getCustomerAppointments(customerId: string, user: any): Promise<({
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
     * Get a single appointment by ID
     * Roles: ADMIN, STAFF, CUSTOMER
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
     * Roles: ADMIN, STAFF
     */
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<{
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
     * Roles: ADMIN, STAFF, CUSTOMER
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
        notes: string | null;
        status: import("@prisma/client").$Enums.AppointmentStatus;
        id: string;
        endTime: string | null;
        reminderSent: boolean;
        bookedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=appointments.controller.d.ts.map