import { AppointmentStatus, AppointmentType } from '@prisma/client';
export declare class CreateAppointmentDto {
    customerId: string;
    vehicleId?: string;
    employeeId?: string;
    employeeIds?: string[];
    scheduledDate: Date;
    scheduledTime: string;
    duration: number;
    serviceType: string;
    appointmentType: AppointmentType;
    notes?: string;
}
export declare class UpdateAppointmentDto implements Partial<CreateAppointmentDto> {
    employeeId?: string;
    employeeIds?: string[];
    scheduledDate?: Date;
    scheduledTime?: string;
    duration?: number;
    status?: AppointmentStatus;
    appointmentType?: AppointmentType;
    notes?: string;
    paymentAmount?: number;
    paymentBreakdown?: any;
    paymentNotes?: string;
    expectedAmount?: number;
    endTime?: string;
}
export declare class AppointmentQueryDto {
    startDate?: Date;
    endDate?: Date;
    employeeId?: string;
    customerId?: string;
    status?: AppointmentStatus;
}
export declare class CalendarQueryDto {
    startDate: Date;
    endDate: Date;
    employeeId?: string;
}
export declare class PaymentDateQueryDto {
    paymentDate: string;
}
//# sourceMappingURL=appointment.dto.d.ts.map