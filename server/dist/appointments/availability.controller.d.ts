import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto, TimeSlotOverrideDto, CheckAvailabilityDto } from '../common/dto/employee-availability.dto';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    /**
     * Set or update recurring availability for an employee (ADMIN and SUPERVISOR)
     * Roles: ADMIN, SUPERVISOR
     */
    setRecurring(dto: SetAvailabilityDto, user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Set or update own recurring availability (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    setMyRecurring(dto: Omit<SetAvailabilityDto, 'employeeId'>, user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Get employee's recurring availability (ADMIN and SUPERVISOR)
     * Roles: ADMIN, SUPERVISOR
     */
    getRecurring(employeeId: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }[]>;
    /**
     * Get own recurring availability (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    getMyRecurring(user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }[]>;
    /**
     * Add a time slot override (ADMIN and SUPERVISOR)
     * Roles: ADMIN, SUPERVISOR
     */
    addOverride(dto: TimeSlotOverrideDto): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Add own time slot override (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    addMyOverride(dto: Omit<TimeSlotOverrideDto, 'employeeId'>, user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Get overrides for an employee within a date range (ADMIN and SUPERVISOR)
     * Roles: ADMIN, SUPERVISOR
     */
    getOverrides(employeeId: string, startDate: string, endDate: string): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }[]>;
    /**
     * Get own overrides within a date range (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    getMyOverrides(startDate: string, endDate: string, user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }[]>;
    /**
     * Delete a recurring availability slot (ADMIN or owner only)
     * Roles: ADMIN, STAFF
     */
    deleteRecurring(availabilityId: string, user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Delete an override (ADMIN or owner only)
     * Roles: ADMIN, STAFF
     */
    deleteOverride(overrideId: string, user: any): Promise<{
        id: string;
        employeeId: string;
        createdAt: Date;
        updatedAt: Date;
        endTime: string;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Check available time slots for a specific date and duration
     * Roles: ADMIN, SUPERVISOR, STAFF, CUSTOMER (for booking)
     */
    checkAvailability(dto: CheckAvailabilityDto): Promise<import("../common/dto/employee-availability.dto").AvailableSlot[]>;
    /**
     * Check if specific employee is available at a specific time
     * Roles: ADMIN, SUPERVISOR, STAFF
     */
    checkEmployeeAvailability(employeeId: string, date: string, startTime: string, duration: number): Promise<{
        employeeId: string;
        date: string;
        startTime: string;
        duration: number;
        available: boolean | {
            available: false;
            reason: string;
            suggestion: string;
        };
    }>;
}
//# sourceMappingURL=availability.controller.d.ts.map