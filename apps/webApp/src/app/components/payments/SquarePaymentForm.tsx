import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { paymentService } from '../../services/payment.service';

interface SquarePaymentFormProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  onPaymentSuccess?: (paymentId: string) => void;
}

export const SquarePaymentForm: React.FC<SquarePaymentFormProps> = ({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  amount,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Convert amount to number (handles string/Decimal from backend)
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));

  const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

  if (!applicationId || !locationId) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Payment Configuration Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Square payment configuration is missing. Please contact support.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const handlePayment = async (token: any) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await paymentService.createSquarePayment({
        invoiceId,
        sourceId: token.token,
        amount: numericAmount,
        currency: 'CAD',
        note: `Payment for Invoice ${invoiceNumber}`,
      });

      setSuccess(true);
      setIsProcessing(false);

      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(response.squarePaymentId);
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Payment processing failed. Please try again.',
      );
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isProcessing}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCardIcon color="primary" />
          <Typography variant="h6">Pay Invoice</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Invoice Details */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary">
            Invoice Number
          </Typography>
          <Typography variant="h6" gutterBottom>
            {invoiceNumber}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Amount Due
          </Typography>
          <Typography variant="h5" color="primary" fontWeight="bold">
            ${numericAmount.toFixed(2)} CAD
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment successful! Invoice has been marked as paid.
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment Form */}
        {!success && (
          <Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter your card details below
            </Typography>

            <PaymentForm
              applicationId={applicationId}
              locationId={locationId}
              cardTokenizeResponseReceived={handlePayment}
            >
              <CreditCard />
            </PaymentForm>

            {isProcessing && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                mt={2}
                gap={2}
              >
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  Processing payment...
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Security Notice */}
        <Box mt={3}>
          <Typography variant="caption" color="text.secondary">
            🔒 Secure payment powered by Square. Your card information is never
            stored on our servers.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isProcessing}>
          {success ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
