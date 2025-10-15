export interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'warning' | 'error' | 'info' | 'success';
    confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    showCancelButton?: boolean;
}
export declare const ConfirmationDialog: React.FC<ConfirmationDialogProps>;
//# sourceMappingURL=ConfirmationDialog.d.ts.map