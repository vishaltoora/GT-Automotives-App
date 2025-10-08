import React from 'react';
import { PurchaseInvoice } from '../../services/purchase-invoice.service';
import { ExpenseInvoice } from '../../services/expense-invoice.service';
interface PurchaseInvoiceDialogProps {
    open: boolean;
    invoice: PurchaseInvoice | ExpenseInvoice | null;
    onClose: () => void;
    onSave: (data: any, file: File | null, invoiceType: 'purchase' | 'expense') => void;
}
declare const PurchaseInvoiceDialog: React.FC<PurchaseInvoiceDialogProps>;
export default PurchaseInvoiceDialog;
//# sourceMappingURL=PurchaseInvoiceDialog.d.ts.map