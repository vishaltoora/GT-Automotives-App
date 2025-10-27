export interface ConfirmationDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'error' | 'warning' | 'info';
}
export declare const useConfirmationDialog: () => {
    isOpen: boolean;
    dialogData: ConfirmationDialogData | null;
    showConfirmation: (title: string, message: string, confirmText?: string, severity?: "error" | "warning" | "info") => Promise<boolean>;
    hideConfirmation: () => void;
    handleConfirm: () => void;
    handleCancel: () => void;
};
//# sourceMappingURL=useConfirmationDialog.d.ts.map