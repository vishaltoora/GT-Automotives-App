import React from 'react';
interface PaymentEntry {
    id: string;
    method: string;
    amount: number;
}
interface PaymentData {
    totalAmount: number;
    payments: PaymentEntry[];
    paymentNotes?: string;
    expectedAmount?: number;
}
interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (paymentData: PaymentData) => void;
    appointmentId: string;
    defaultExpectedAmount?: number;
    existingPayments?: PaymentEntry[];
    existingNotes?: string;
    isEditMode?: boolean;
}
export declare const PaymentDialog: React.FC<PaymentDialogProps>;
export {};
//# sourceMappingURL=PaymentDialog.d.ts.map