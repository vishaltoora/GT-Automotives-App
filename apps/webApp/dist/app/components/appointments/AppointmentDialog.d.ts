import React from 'react';
import { Appointment } from '../../services/appointment.service';
interface AppointmentDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    appointment?: Appointment;
    preselectedCustomerId?: string;
}
export declare const AppointmentDialog: React.FC<AppointmentDialogProps>;
export {};
//# sourceMappingURL=AppointmentDialog.d.ts.map