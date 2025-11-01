import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmationDialog, ConfirmationDialogProps } from '../components/common/ConfirmationDialog';

type ConfirmOptions = Omit<ConfirmationDialogProps, 'open' | 'onClose' | 'onConfirm'>;

interface ConfirmationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogConfig(options);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setDialogConfig(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setDialogConfig(null);
    setResolvePromise(null);
  }, [resolvePromise]);

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {dialogConfig && (
        <ConfirmationDialog
          open={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          {...dialogConfig}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = (): ConfirmationContextType => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

// Helper functions for common confirmation scenarios
export const useConfirmationHelpers = () => {
  const { confirm } = useConfirmation();

  return {
    confirmDelete: (itemName: string) =>
      confirm({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        severity: 'error',
        confirmButtonColor: 'error',
      }),

    confirmCancel: (itemName: string) =>
      confirm({
        title: 'Confirm Cancel',
        message: `Are you sure you want to cancel ${itemName}? Any unsaved changes will be lost.`,
        confirmText: 'Yes, Cancel',
        cancelText: 'No, Keep',
        severity: 'warning',
      }),

    confirmSave: (message?: string) =>
      confirm({
        title: 'Confirm Save',
        message: message || 'Are you sure you want to save these changes?',
        confirmText: 'Save',
        cancelText: 'Cancel',
        severity: 'info',
      }),

    confirmAction: (title: string, message: string) =>
      confirm({
        title,
        message,
        confirmText: 'Continue',
        cancelText: 'Cancel',
        severity: 'warning',
      }),

    // Expose the raw confirm function for custom use cases
    confirm,
  };
};