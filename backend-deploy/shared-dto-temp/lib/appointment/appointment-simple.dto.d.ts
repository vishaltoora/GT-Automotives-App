export declare class AppointmentDto {
    id: string;
    customerId: string;
    vehicleId?: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    serviceType: string;
    status: string;
    notes?: string;
    reminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateAppointmentDto {
    customerId: string;
    vehicleId?: string;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    serviceType: string;
    notes?: string;
}
export declare class UpdateAppointmentDto {
    scheduledDate?: Date;
    scheduledTime?: string;
    duration?: number;
    serviceType?: string;
    status?: string;
    notes?: string;
    reminderSent?: boolean;
}
