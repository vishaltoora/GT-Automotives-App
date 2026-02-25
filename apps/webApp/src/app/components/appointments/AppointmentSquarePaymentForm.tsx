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
  IconButton,
  Paper,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useMediaQuery, useTheme } from '@mui/material';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

interface AppointmentSquarePaymentFormProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  serviceAmount: number;
  tipAmount?: number;
  onPaymentSuccess?: (paymentId: string) => void;
}

/**
 * AppointmentSquarePaymentForm Component
 *
 * Embedded Square Web Payments SDK form for appointment payments
 * Uses same pattern as invoice "Pay with Card" for consistency
 */
export const AppointmentSquarePaymentForm: React.FC<AppointmentSquarePaymentFormProps> = ({
  open,
  onClose,
  appointmentId,
  serviceAmount,
  tipAmount = 0,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getToken } = useAuth();

  // Get Square environment variables
  const applicationId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

  // Calculate taxes (GST 5% + PST 7%) - tips are not taxed
  const GST_RATE = 0.05;
  const PST_RATE = 0.07;
  const gstAmount = serviceAmount * GST_RATE;
  const pstAmount = serviceAmount * PST_RATE;
  const tip = tipAmount || 0;
  const totalAmount = serviceAmount + gstAmount + pstAmount + tip;

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
      // Get Clerk authentication token
      const authToken = await getToken();

      if (!authToken) {
        setError('Authentication required. Please log in again.');
        setIsProcessing(false);
        return;
      }

      // Call backend to create Square payment
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(
        `${apiUrl}/api/square/payments/appointment`,
        {
          appointmentId,
          sourceId: token.token,
          serviceAmount,
          tipAmount: tip > 0 ? tip : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setSuccess(true);
      setIsProcessing(false);

      // Call success callback
      if (onPaymentSuccess) {
        onPaymentSuccess(response.data.squarePaymentId);
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
      fullScreen={isMobile}
      disableEscapeKeyDown={isProcessing}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCardIcon />
          Complete Appointment Payment
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isProcessing}
          sx={{ color: 'primary.contrastText' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Amount Details */}
        <Box mb={3} mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Service Amount
          </Typography>
          <Typography variant="h6">
            ${serviceAmount.toFixed(2)} CAD
          </Typography>

          {/* Tax Breakdown */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mt: 2,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tax Breakdown
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  ${serviceAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  GST (5%):
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${gstAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  PST (7%):
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${pstAmount.toFixed(2)}
                </Typography>
              </Box>

              {/* Show tips if present */}
              {tip > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="success.main">
                    Tips:
                  </Typography>
                  <Typography variant="body2" color="success.main" fontWeight={500}>
                    ${tip.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="primary">
                  Total to Charge:
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  ${totalAmount.toFixed(2)} CAD
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment successful! Appointment has been completed and invoice created.
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
              <CreditCard includeInputLabels />
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
