import { TireDto } from '@gt-automotive/data';
declare global {
    interface Window {
        Clerk?: {
            session?: {
                getToken(): Promise<string>;
            };
        };
    }
}
interface TireDialogProps {
    open: boolean;
    onClose: () => void;
    tire?: TireDto | null;
    onSuccess?: () => void;
}
export declare function TireDialog({ open, onClose, tire, onSuccess }: TireDialogProps): import("react/jsx-runtime").JSX.Element;
export default TireDialog;
//# sourceMappingURL=TireDialog.d.ts.map