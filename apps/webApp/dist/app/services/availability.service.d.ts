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
     * Set or update recurring availability for an employee (ADMIN only)
     */
    setRecurringAvailability(data: SetAvailabilityRequest): Promise<EmployeeAvailability>;
    /**
     * Set or update own recurring availability (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    setMyRecurringAvailability(data: Omit<SetAvailabilityRequest, "employeeId">): Promise<EmployeeAvailability>;
    /**
     * Get employee's recurring availability (ADMIN only)
     */
    getEmployeeAvailability(employeeId: string): Promise<EmployeeAvailability[]>;
    /**
     * Get own recurring availability (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    getMyRecurringAvailability(): Promise<EmployeeAvailability[]>;
    /**
     * Delete a recurring availability slot
     */
    deleteRecurringAvailability(availabilityId: string): Promise<void>;
    /**
     * Add a time slot override (ADMIN only)
     */
    addOverride(data: TimeSlotOverrideRequest): Promise<TimeSlotOverride>;
    /**
     * Add own time slot override (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    addMyOverride(data: Omit<TimeSlotOverrideRequest, "employeeId">): Promise<TimeSlotOverride>;
    /**
     * Get overrides for an employee within a date range (ADMIN only)
     */
    getOverrides(employeeId: string, startDate: Date, endDate: Date): Promise<TimeSlotOverride[]>;
    /**
     * Get own overrides within a date range (STAFF secure endpoint)
     * Uses authenticated user's ID from token
     */
    getMyOverrides(startDate: Date, endDate: Date): Promise<TimeSlotOverride[]>;
    /**
     * Delete an override
     */
    deleteOverride(overrideId: string): Promise<void>;
};
//# sourceMappingURL=availability.service.d.ts.map