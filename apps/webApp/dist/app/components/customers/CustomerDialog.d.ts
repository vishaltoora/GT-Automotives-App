import React from 'react';
import { Customer } from '../../services/customer.service';
interface CustomerDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customerId?: string;
    customer?: Customer;
}
export declare const CustomerDialog: React.FC<CustomerDialogProps>;
export {};
//# sourceMappingURL=CustomerDialog.d.ts.map