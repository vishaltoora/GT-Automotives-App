export declare class AppointmentDto {
    id: string;
    customerId: string;
    customer?: CustomerReferenceDto;
    vehicleId?: string;
    vehicle?: VehicleReferenceDto;
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
export declare class CustomerReferenceDto {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
}
export declare class VehicleReferenceDto {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
}
