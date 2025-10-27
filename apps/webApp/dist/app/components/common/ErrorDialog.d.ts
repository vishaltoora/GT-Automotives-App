import React from 'react';
export interface ErrorDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    severity?: 'error' | 'warning' | 'info';
    details?: string;
    showDetails?: boolean;
    confirmText?: string;
}
export declare const ErrorDialog: React.FC<ErrorDialogProps>;
export default ErrorDialog;
//# sourceMappingURL=ErrorDialog.d.ts.map