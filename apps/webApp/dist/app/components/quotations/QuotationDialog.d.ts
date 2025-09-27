import React from 'react';
interface QuoteDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    quoteId?: string;
}
declare const QuoteDialog: React.FC<QuoteDialogProps>;
export default QuoteDialog;
export declare const QuotationDialog: React.FC<QuoteDialogProps>;
//# sourceMappingURL=QuotationDialog.d.ts.map