import React from 'react';
interface InvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (invoice: any) => void;
    invoice?: any;
}
export declare const InvoiceDialog: React.FC<InvoiceDialogProps>;
export default InvoiceDialog;
//# sourceMappingURL=InvoiceDialog.d.ts.map