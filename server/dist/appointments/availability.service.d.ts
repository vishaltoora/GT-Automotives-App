import { PrismaService } from '@gt-automotive/database';
import { SetAvailabilityDto, TimeSlotOverrideDto, CheckAvailabilityDto, AvailableSlot } from '../common/dto/employee-availability.dto';
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Set or update recurring weekly availability for an employee
     */
    setRecurringAvailability(dto: SetAvailabilityDto): Promise<{
        employeeId: string;
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Get all recurring availability for an employee
     */
    getEmployeeAvailability(employeeId: string): Promise<{
        employeeId: string;
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    /**
     * Delete a recurring availability slot
     * Both ADMIN and STAFF can delete any availability
     */
    deleteRecurringAvailability(availabilityId: string, user: any): Promise<{
        employeeId: string;
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Add a time slot override (vacation, sick day, extra shift)
     */
    addOverride(dto: TimeSlotOverrideDto): Promise<{
        employeeId: string;
        id: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reason: string | null;
    }>;
    /**
     * Get all overrides for an employee within a date range
     */
    getOverrides(employeeId: string, startDate: Date, endDate: Date): Promise<{
        employeeId: string;
        id: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        reason: string | null;
    }[]>;
    /**
     * Delete an override
     */
    deleteOverride(overrideId: string): Promise<{
        employeeId: string;
        id: string;
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
     */
    checkAvailableSlots(dto: CheckAvailabilityDto): Promise<AvailableSlot[]>;
    /**
     * Check if a specific employee is available at a specific time
     */
    isEmployeeAvailable(employeeId: string, date: Date, startTime: string, duration: number, excludeAppointmentId?: string): Promise<boolean | {
        available: false;
        reason: string;
        suggestion: string;
    }>;
    /**
     * Helper: Generate time slots for a day
     */
    private generateTimeSlots;
    /**
     * Helper: Check if a time range is within a slot
     */
    private timeInRange;
    /**
     * Helper: Check if two time ranges overlap
     * Two appointments overlap if one starts before the other ends AND ends after the other starts
     * However, if one ends exactly when the other starts, they DO NOT overlap (back-to-back is allowed)
     */
    private timeOverlaps;
    /**
     * Helper: Add minutes to a time string
     */
    private addMinutesToTime;
}
//# sourceMappingURL=availability.service.d.ts.map