import { AppointmentStatus, AppointmentType } from '@prisma/client';
export declare class CreateAppointmentDto {
    customerId: string;
    vehicleId?: string;
    employeeId?: string;
    employeeIds?: string[];
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    serviceType: string;
    appointmentType: AppointmentType;
    serviceAddress?: string;
    notes?: string;
}
export declare class UpdateAppointmentDto implements Partial<CreateAppointmentDto> {
    employeeId?: string;
    employeeIds?: string[];
    scheduledDate?: string;
    scheduledTime?: string;
    duration?: number;
    serviceType?: string;
    status?: AppointmentStatus;
    appointmentType?: AppointmentType;
    serviceAddress?: string;
    notes?: string;
    paymentAmount?: number;
    paymentBreakdown?: any;
    paymentNotes?: string;
    expectedAmount?: number;
    productSaleAmount?: number;
    productSaleItems?: string[];
    completionEmployeeIds?: string[];
    endTime?: string;
}
export declare class AppointmentQueryDto {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    customerId?: string;
    status?: AppointmentStatus;
}
export declare class CalendarQueryDto {
    startDate: string;
    endDate: string;
    employeeId?: string;
}
export declare class PaymentDateQueryDto {
    paymentDate: string;
}
export declare class CreateETransferInvoiceDto {
    serviceAmount: number;
    tipAmount?: number;
    completionEmployeeIds?: string[];
    productSaleAmount?: number;
    productSaleItems?: string[];
}
export declare class CreateSquareDeviceInvoiceDto {
    serviceAmount: number;
    tipAmount?: number;
    cardType?: 'CREDIT_CARD' | 'DEBIT_CARD';
    completionEmployeeIds?: string[];
    productSaleAmount?: number;
    productSaleItems?: string[];
}
//# sourceMappingURL=appointment.dto.d.ts.map