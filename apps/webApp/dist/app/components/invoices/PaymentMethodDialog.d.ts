import React from 'react';
import { PaymentMethod } from '../../../enums';
interface PaymentMethodDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (paymentMethod: PaymentMethod) => void;
    invoiceNumber: string;
}
export declare const PaymentMethodDialog: React.FC<PaymentMethodDialogProps>;
export default PaymentMethodDialog;
//# sourceMappingURL=PaymentMethodDialog.d.ts.map