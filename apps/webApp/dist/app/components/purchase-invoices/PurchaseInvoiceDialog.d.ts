import React from 'react';
import { PurchaseInvoice } from '../../services/purchase-invoice.service';
interface PurchaseInvoiceDialogProps {
    open: boolean;
    invoice: PurchaseInvoice | null;
    onClose: () => void;
    onSave: (data: any, file: File | null) => void;
}
declare const PurchaseInvoiceDialog: React.FC<PurchaseInvoiceDialogProps>;
export default PurchaseInvoiceDialog;
//# sourceMappingURL=PurchaseInvoiceDialog.d.ts.map