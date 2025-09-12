import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorDialog, ErrorDialogProps } from '../components/common/ErrorDialog';

type ShowErrorOptions = Omit<ErrorDialogProps, 'open' | 'onClose'>;

interface ErrorContextType {
  showError: (options: ShowErrorOptions | string) => void;
  showWarning: (options: ShowErrorOptions | string) => void;
  showInfo: (options: ShowErrorOptions | string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState<ShowErrorOptions | null>(null);

  const showDialog = useCallback((options: ShowErrorOptions | string, severity: 'error' | 'warning' | 'info' = 'error') => {
    if (typeof options === 'string') {
      setDialogConfig({
        message: options,
        severity,
      });
    } else {
      setDialogConfig({
        ...options,
        severity: options.severity || severity,
      });
    }
  }, []);

  const showError = useCallback((options: ShowErrorOptions | string) => {
    showDialog(options, 'error');
  }, [showDialog]);

  const showWarning = useCallback((options: ShowErrorOptions | string) => {
    showDialog(options, 'warning');
  }, [showDialog]);

  const showInfo = useCallback((options: ShowErrorOptions | string) => {
    showDialog(options, 'info');
  }, [showDialog]);

  const handleClose = useCallback(() => {
    setDialogConfig(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, showWarning, showInfo }}>
      {children}
      {dialogConfig && (
        <ErrorDialog
          open={true}
          onClose={handleClose}
          {...dialogConfig}
        />
      )}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Helper functions for common error scenarios
export const useErrorHelpers = () => {
  const { showError, showInfo } = useError();

  return {
    // API Error handling
    showApiError: (error: any, customMessage?: string) => {
      const message = customMessage || 'An error occurred while processing your request.';
      const details = error?.response?.data?.message || error?.message || JSON.stringify(error, null, 2);
      
      showError({
        title: 'API Error',
        message,
        details,
      });
    },

    // Validation errors
    showValidationError: (message: string, details?: string) => {
      showError({
        title: 'Validation Error',
        message,
        details,
        severity: 'warning',
      });
    },

    // Network errors
    showNetworkError: (error?: any) => {
      showError({
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        details: error?.message || 'Network request failed',
      });
    },

    // Permission errors
    showPermissionError: (action?: string) => {
      showError({
        title: 'Permission Denied',
        message: action 
          ? `You don't have permission to ${action}.` 
          : 'You don\'t have permission to perform this action.',
        severity: 'warning',
      });
    },

    // Success messages (using info)
    showSuccess: (message: string) => {
      showInfo({
        title: 'Success',
        message,
        severity: 'info',
        confirmText: 'Great!',
      });
    },

    // Generic error with custom title
    showCustomError: (title: string, message: string, details?: string) => {
      showError({
        title,
        message,
        details,
      });
    },
  };
};