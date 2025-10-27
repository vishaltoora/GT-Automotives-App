interface DeleteConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
    warningMessage?: string;
    isLoading?: boolean;
}
export declare function DeleteConfirmDialog({ open, onClose, onConfirm, title, message, itemName, warningMessage, isLoading, }: DeleteConfirmDialogProps): import("react/jsx-runtime").JSX.Element;
export default DeleteConfirmDialog;
//# sourceMappingURL=DeleteConfirmDialog.d.ts.map