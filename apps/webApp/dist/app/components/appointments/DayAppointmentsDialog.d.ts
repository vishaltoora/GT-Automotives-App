import React from 'react';
interface PaymentEntry {
    id: string;
    method: string;
    amount: number;
}
interface Appointment {
    id: string;
    customerId: string;
    scheduledDate: string | Date;
    scheduledTime: string;
    endTime?: string;
    duration: number;
    serviceType: string;
    appointmentType?: string;
    status: string;
    notes?: string;
    paymentAmount?: number;
    paymentBreakdown?: PaymentEntry[];
    paymentNotes?: string;
    expectedAmount?: number;
    reminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        phone?: string;
        email?: string;
        businessName?: string;
    };
    vehicle?: {
        id: string;
        year: number;
        make: string;
        model: string;
        licensePlate?: string;
    };
    employees?: Array<{
        employee: {
            id: string;
            firstName: string;
            lastName: string;
        };
    }>;
}
interface DayAppointmentsDialogProps {
    open: boolean;
    onClose: () => void;
    date: Date | null;
    appointments: Appointment[];
    onEditAppointment?: (appointment: Appointment) => void;
    onDeleteAppointment?: (appointmentId: string) => void;
    onStatusChange?: (appointmentId: string, newStatus: string, paymentData?: any) => void;
    onAddAppointment?: () => void;
}
export declare const DayAppointmentsDialog: React.FC<DayAppointmentsDialogProps>;
export {};
//# sourceMappingURL=DayAppointmentsDialog.d.ts.map