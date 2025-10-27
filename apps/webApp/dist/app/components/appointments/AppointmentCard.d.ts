import React from 'react';
export declare const formatServiceType: (serviceType: string) => string;
export declare const formatPhoneNumber: (phone: string) => string;
export declare const getStatusColor: (status: string) => "default" | "warning" | "success" | "error" | "info";
export declare const getStatusIcon: (status: string) => import("react/jsx-runtime").JSX.Element;
export declare const formatStatusLabel: (status: string) => string;
export interface AppointmentCardProps {
    appointment: {
        id: string;
        scheduledDate: string | Date;
        scheduledTime: string;
        endTime?: string;
        duration: number;
        serviceType: string;
        appointmentType?: string;
        status: string;
        notes?: string;
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
        employee?: {
            id: string;
            firstName: string;
            lastName: string;
        };
        employees?: Array<{
            employee: {
                id: string;
                firstName: string;
                lastName: string;
            };
        }>;
    };
    onEdit?: (appointment: any) => void;
    onDelete?: (appointmentId: string) => void;
    onStatusChange?: (appointmentId: string, newStatus: string, paymentData?: any) => void;
    showActions?: boolean;
}
export declare const AppointmentCard: React.FC<AppointmentCardProps>;
export default AppointmentCard;
//# sourceMappingURL=AppointmentCard.d.ts.map