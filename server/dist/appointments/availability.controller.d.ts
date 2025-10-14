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
        employeeId: string;
        id: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Get employee's recurring availability
     * Roles: ADMIN, STAFF (staff can view their own)
     */
    getRecurring(employeeId: string): Promise<{
        employeeId: string;
        id: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }[]>;
    /**
     * Add a time slot override (vacation, sick day, extra shift)
     * Roles: ADMIN, STAFF (staff can add their own overrides)
     */
    addOverride(dto: TimeSlotOverrideDto): Promise<{
        employeeId: string;
        id: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Get overrides for an employee within a date range
     * Roles: ADMIN, STAFF
     */
    getOverrides(employeeId: string, startDate: string, endDate: string): Promise<{
        employeeId: string;
        id: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: string;
        isAvailable: boolean;
        date: Date;
        reason: string | null;
    }[]>;
    /**
     * Delete an override
     * Roles: ADMIN, STAFF
     */
    deleteOverride(overrideId: string): Promise<{
        employeeId: string;
        id: string;
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: string;
        isAvailable: boolean;
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
        available: boolean;
    }>;
}
//# sourceMappingURL=availability.controller.d.ts.map