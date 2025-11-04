import React from 'react';
import { ExpenseInvoice } from '../../services/expense-invoice.service';
interface ExpenseInvoiceDialogProps {
    open: boolean;
    invoice: ExpenseInvoice | null;
    onClose: () => void;
    onSave: (data: any) => void;
    onImageUpload?: (invoiceId: string, file: File) => void;
}
declare const ExpenseInvoiceDialog: React.FC<ExpenseInvoiceDialogProps>;
export default ExpenseInvoiceDialog;
//# sourceMappingURL=ExpenseInvoiceDialog.d.ts.map