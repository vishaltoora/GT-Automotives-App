import { PrismaService } from '@gt-automotive/database';
import { SetAvailabilityDto, TimeSlotOverrideDto, CheckAvailabilityDto, AvailableSlot } from '../common/dto/employee-availability.dto';
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Set or update recurring weekly availability for an employee
     */
    setRecurringAvailability(dto: SetAvailabilityDto): Promise<{
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
     * Get all recurring availability for an employee
     */
    getEmployeeAvailability(employeeId: string): Promise<{
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
     * Delete a recurring availability slot
     * Both ADMIN and STAFF can delete any availability
     */
    deleteRecurringAvailability(availabilityId: string, user: any): Promise<{
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
     * Add a time slot override (vacation, sick day, extra shift)
     */
    addOverride(dto: TimeSlotOverrideDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        employeeId: string;
        endTime: string;
        date: Date;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Get all overrides for an employee within a date range
     */
    getOverrides(employeeId: string, startDate: Date, endDate: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        employeeId: string;
        endTime: string;
        date: Date;
        startTime: string;
        isAvailable: boolean;
    }[]>;
    /**
     * Delete an override
     */
    deleteOverride(overrideId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        reason: string | null;
        employeeId: string;
        endTime: string;
        date: Date;
        startTime: string;
        isAvailable: boolean;
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