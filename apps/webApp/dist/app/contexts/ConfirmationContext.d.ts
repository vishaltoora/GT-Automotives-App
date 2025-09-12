import React, { ReactNode } from 'react';
import { ConfirmationDialogProps } from '../components/common/ConfirmationDialog';
type ConfirmOptions = Omit<ConfirmationDialogProps, 'open' | 'onClose' | 'onConfirm'>;
interface ConfirmationContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}
interface ConfirmationProviderProps {
    children: ReactNode;
}
export declare const ConfirmationProvider: React.FC<ConfirmationProviderProps>;
export declare const useConfirmation: () => ConfirmationContextType;
export declare const useConfirmationHelpers: () => {
    confirmDelete: (itemName: string) => Promise<boolean>;
    confirmCancel: (itemName: string) => Promise<boolean>;
    confirmSave: (message?: string) => Promise<boolean>;
    confirmAction: (title: string, message: string) => Promise<boolean>;
};
export {};
//# sourceMappingURL=ConfirmationContext.d.ts.map