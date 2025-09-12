import React, { ReactNode } from 'react';
import { ErrorDialogProps } from '../components/common/ErrorDialog';
type ShowErrorOptions = Omit<ErrorDialogProps, 'open' | 'onClose'>;
interface ErrorContextType {
    showError: (options: ShowErrorOptions | string) => void;
    showWarning: (options: ShowErrorOptions | string) => void;
    showInfo: (options: ShowErrorOptions | string) => void;
}
interface ErrorProviderProps {
    children: ReactNode;
}
export declare const ErrorProvider: React.FC<ErrorProviderProps>;
export declare const useError: () => ErrorContextType;
export declare const useErrorHelpers: () => {
    showApiError: (error: any, customMessage?: string) => void;
    showValidationError: (message: string, details?: string) => void;
    showNetworkError: (error?: any) => void;
    showPermissionError: (action?: string) => void;
    showSuccess: (message: string) => void;
    showCustomError: (title: string, message: string, details?: string) => void;
};
export {};
//# sourceMappingURL=ErrorContext.d.ts.map