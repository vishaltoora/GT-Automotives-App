import { AppointmentStatus } from '@prisma/client';
export interface CreateAppointmentRequest {
    customerId: string;
    vehicleId?: string;
    employeeId?: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    serviceType: string;
    notes?: string;
}
export interface UpdateAppointmentRequest {
    employeeId?: string;
    scheduledDate?: Date;
    scheduledTime?: string;
    duration?: number;
    status?: AppointmentStatus;
    notes?: string;
}
export interface AppointmentQueryParams {
    startDate?: Date;
    endDate?: Date;
    employeeId?: string;
    customerId?: string;
    status?: AppointmentStatus;
}
export interface CalendarQueryParams {
    startDate: Date;
    endDate: Date;
    employeeId?: string;
}
export interface Appointment {
    id: string;
    customerId: string;
    vehicleId?: string;
    employeeId?: string;
    scheduledDate: Date;
    scheduledTime: string;
    endTime?: string;
    duration: number;
    serviceType: string;
    status: AppointmentStatus;
    notes?: string;
    reminderSent: boolean;
    bookedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        businessName?: string;
    };
    vehicle?: {
        id: string;
        make: string;
        model: string;
        year: number;
        licensePlate?: string;
    };
    employee?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
export interface AvailableSlot {
    employeeId: string;
    employeeName: string;
    startTime: string;
    endTime: string;
    available: boolean;
}
export interface CheckAvailabilityRequest {
    employeeId?: string;
    date: Date;
    duration: number;
}
export declare const appointmentService: {
    /**
     * Create a new appointment
     */
    createAppointment(data: CreateAppointmentRequest): Promise<Appointment>;
    /**
     * Get all appointments with filters
     */
    getAppointments(params?: AppointmentQueryParams): Promise<Appointment[]>;
    /**
     * Get calendar view
     */
    getCalendar(params: CalendarQueryParams): Promise<Record<string, Appointment[]>>;
    /**
     * Get today's appointments
     */
    getTodayAppointments(): Promise<Appointment[]>;
    /**
     * Get customer's upcoming appointments
     */
    getCustomerAppointments(customerId: string): Promise<Appointment[]>;
    /**
     * Get single appointment by ID
     */
    getAppointment(id: string): Promise<Appointment>;
    /**
     * Update an appointment
     */
    updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<Appointment>;
    /**
     * Cancel an appointment
     */
    cancelAppointment(id: string): Promise<Appointment>;
    /**
     * Delete an appointment (admin only)
     */
    deleteAppointment(id: string): Promise<void>;
    /**
     * Check available time slots
     */
    checkAvailability(data: CheckAvailabilityRequest): Promise<AvailableSlot[]>;
    /**
     * Check if specific employee is available
     */
    checkEmployeeAvailability(employeeId: string, date: Date, startTime: string, duration: number): Promise<{
        available: boolean;
    }>;
};
//# sourceMappingURL=appointment.service.d.ts.map