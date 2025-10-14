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
        endTime: string;
        createdAt: Date;
        updatedAt: Date;
        dayOfWeek: number;
        startTime: string;
        isAvailable: boolean;
    }>;
    /**
     * Get all recurring availability for an employee
     */
    getEmployeeAvailability(employeeId: string): Promise<{
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
     * Get all overrides for an employee within a date range
     */
    getOverrides(employeeId: string, startDate: Date, endDate: Date): Promise<{
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
     */
    checkAvailableSlots(dto: CheckAvailabilityDto): Promise<AvailableSlot[]>;
    /**
     * Check if a specific employee is available at a specific time
     */
    isEmployeeAvailable(employeeId: string, date: Date, startTime: string, duration: number, excludeAppointmentId?: string): Promise<boolean>;
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
     */
    private timeOverlaps;
    /**
     * Helper: Add minutes to a time string
     */
    private addMinutesToTime;
    /**
     * Helper: Convert time string to total minutes
     */
    private timeInMinutes;
}
//# sourceMappingURL=availability.service.d.ts.map