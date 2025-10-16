import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto, TimeSlotOverrideDto, CheckAvailabilityDto } from '../common/dto/employee-availability.dto';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    /**
     * Set or update recurring availability for an employee
     * Roles: ADMIN (any employee), STAFF (own availability only)
     */
    setRecurring(dto: SetAvailabilityDto, user: any): Promise<{
        id: string;
        employeeId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Get employee's recurring availability
     * Roles: ADMIN, STAFF (staff can view their own)
     */
    getRecurring(employeeId: string): Promise<{
        id: string;
        employeeId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * Add a time slot override (vacation, sick day, extra shift)
     * Roles: ADMIN, STAFF (staff can add their own overrides)
     */
    addOverride(dto: TimeSlotOverrideDto): Promise<{
        id: string;
        employeeId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Get overrides for an employee within a date range
     * Roles: ADMIN, STAFF
     */
    getOverrides(employeeId: string, startDate: string, endDate: string): Promise<{
        id: string;
        employeeId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reason: string | null;
    }[]>;
    /**
     * Delete a recurring availability slot
     * Roles: ADMIN, STAFF (staff can delete their own)
     */
    deleteRecurring(availabilityId: string, user: any): Promise<{
        id: string;
        employeeId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Delete an override
     * Roles: ADMIN, STAFF
     */
    deleteOverride(overrideId: string): Promise<{
        id: string;
        employeeId: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Check available time slots for a specific date and duration
     * Roles: ADMIN, STAFF, CUSTOMER (for booking)
     */
    checkAvailability(dto: CheckAvailabilityDto): Promise<import("../common/dto/employee-availability.dto").AvailableSlot[]>;
    /**
     * Check if specific employee is available at a specific time
     * Roles: ADMIN, STAFF
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