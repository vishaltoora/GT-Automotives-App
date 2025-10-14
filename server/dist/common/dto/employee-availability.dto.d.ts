export declare class SetAvailabilityDto {
    employeeId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}
export declare class TimeSlotOverrideDto {
    employeeId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string;
}
export declare class CheckAvailabilityDto {
    employeeId?: string;
    date: Date;
    duration: number;
}
export declare class AvailableSlot {
    employeeId: string;
    employeeName: string;
    startTime: string;
    endTime: string;
    available: boolean;
}
export declare class BulkAvailabilityDto {
    employeeId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    repeatWeeks?: number;
}
//# sourceMappingURL=employee-availability.dto.d.ts.map