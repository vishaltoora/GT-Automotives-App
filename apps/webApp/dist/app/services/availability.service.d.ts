export interface SetAvailabilityRequest {
    employeeId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}
export interface TimeSlotOverrideRequest {
    employeeId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string;
}
export interface EmployeeAvailability {
    id: string;
    employeeId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TimeSlotOverride {
    id: string;
    employeeId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const availabilityService: {
    /**
     * Set or update recurring availability for an employee
     */
    setRecurringAvailability(data: SetAvailabilityRequest): Promise<EmployeeAvailability>;
    /**
     * Get employee's recurring availability
     */
    getEmployeeAvailability(employeeId: string): Promise<EmployeeAvailability[]>;
    /**
     * Add a time slot override (vacation, sick day, extra shift)
     */
    addOverride(data: TimeSlotOverrideRequest): Promise<TimeSlotOverride>;
    /**
     * Get overrides for an employee within a date range
     */
    getOverrides(employeeId: string, startDate: Date, endDate: Date): Promise<TimeSlotOverride[]>;
    /**
     * Delete an override
     */
    deleteOverride(overrideId: string): Promise<void>;
};
//# sourceMappingURL=availability.service.d.ts.map