import { TireResponseDto as ITire } from '@gt-automotive/data';
interface StockAdjustmentDialogProps {
    open: boolean;
    tire: ITire | null;
    onClose: () => void;
    onConfirm?: (adjustment: {
        quantity: number;
        type: 'add' | 'remove' | 'set';
        reason: string;
    }) => void;
}
export declare function StockAdjustmentDialog({ open, tire, onClose, onConfirm }: StockAdjustmentDialogProps): import("react/jsx-runtime").JSX.Element | null;
export default StockAdjustmentDialog;
//# sourceMappingURL=StockAdjustmentDialog.d.ts.map