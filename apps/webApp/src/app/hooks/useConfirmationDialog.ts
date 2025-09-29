import { useState, useCallback, useRef } from 'react';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info';
}

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState<ConfirmationDialogData | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const showConfirmation = useCallback((
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    severity: 'error' | 'warning' | 'info' = 'warning'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogData({
        title,
        message,
        confirmText,
        severity,
      });
      setIsOpen(true);
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsOpen(false);
    setDialogData(null);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setDialogData(null);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setDialogData(null);
  }, []);

  return {
    isOpen,
    dialogData,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel,
  };
};