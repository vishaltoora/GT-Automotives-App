import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto, TimeSlotOverrideDto, CheckAvailabilityDto } from '../common/dto/employee-availability.dto';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    /**
     * Set or update recurring availability for an employee
     * Roles: ADMIN and STAFF can set availability for any employee
     */
    setRecurring(dto: SetAvailabilityDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Get employee's recurring availability
     * Roles: ADMIN, STAFF (staff can view their own)
     */
    getRecurring(employeeId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }[]>;
    /**
     * Add a time slot override (vacation, sick day, extra shift)
     * Roles: ADMIN, STAFF (staff can add their own overrides)
     */
    addOverride(dto: TimeSlotOverrideDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        endTime: string;
        date: Date;
        startTime: string;
        isAvailable: boolean;
        reason: string | null;
    }>;
    /**
     * Get overrides for an employee within a date range
     * Roles: ADMIN, STAFF
     */
    getOverrides(employeeId: string, startDate: string, endDate: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        endTime: string;
        date: Date;
        startTime: string;
        isAvailable: boolean;
        reason: string | null;
    }[]>;
    /**
     * Delete a recurring availability slot
     * Roles: ADMIN, STAFF (staff can delete their own)
     */
    deleteRecurring(availabilityId: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        endTime: string;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Delete an override
     * Roles: ADMIN, STAFF
     */
    deleteOverride(overrideId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        endTime: string;
        date: Date;
        startTime: string;
        isAvailable: boolean;
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