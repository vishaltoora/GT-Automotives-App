import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  PointOfSale as TerminalIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useMediaQuery, useTheme } from '@mui/material';
import {
  squareTerminalService,
  TerminalDevice,
  TerminalCheckoutResponse,
} from '../../requests/square-terminal.requests';

interface TerminalPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  onPaymentSuccess?: (checkoutId: string) => void;
}

export const TerminalPaymentDialog: React.FC<TerminalPaymentDialogProps> = ({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  amount,
  onPaymentSuccess,
}) => {
  const [devices, setDevices] = useState<TerminalDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutResponse, setCheckoutResponse] =
    useState<TerminalCheckoutResponse | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<string>('');
  const [polling, setPolling] = useState(false);

  const numericAmount =
    typeof amount === 'number' ? amount : parseFloat(String(amount));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load available devices when dialog opens
  useEffect(() => {
    if (open) {
      loadDevices();
    } else {
      // Reset state when dialog closes
      resetState();
    }
  }, [open]);

  // Poll checkout status when checkout is created
  useEffect(() => {
    if (checkoutResponse && polling) {
      const interval = setInterval(async () => {
        try {
          const status = await squareTerminalService.getCheckoutStatus(
            checkoutResponse.checkoutId
          );
          setCheckoutStatus(status.status);

          // Stop polling if terminal checkout completed or failed
          if (
            status.status === 'COMPLETED' ||
            status.status === 'CANCELED' ||
            status.status === 'FAILED'
          ) {
            setPolling(false);
            if (status.status === 'COMPLETED') {
              handlePaymentSuccess();
            }
          }
        } catch (err) {
          console.error('Error polling checkout status:', err);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
    return undefined;
  }, [checkoutResponse, polling]);

  const resetState = () => {
    setDevices([]);
    setSelectedDeviceId('');
    setError(null);
    setCheckoutResponse(null);
    setCheckoutStatus('');
    setPolling(false);
    setLoading(false);
  };

  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      const deviceList = await squareTerminalService.listDevices();
      setDevices(deviceList.filter((d) => d.status === 'PAIRED'));
      if (deviceList.length === 1) {
        setSelectedDeviceId(deviceList[0].id);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load Square Terminal devices. Please try again.'
      );
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleCreateCheckout = async () => {
    if (!selectedDeviceId) {
      setError('Please select a Square Terminal device');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await squareTerminalService.createCheckout({
        invoiceId,
        amount: numericAmount,
        deviceId: selectedDeviceId,
        currency: 'CAD',
      });

      setCheckoutResponse(response);
      setCheckoutStatus(response.status);
      setPolling(true);
      setLoading(false);
    } catch (err: any) {
      console.error('Terminal checkout failed:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to create Terminal checkout. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleCancelCheckout = async () => {
    if (!checkoutResponse) return;

    try {
      await squareTerminalService.cancelCheckout(checkoutResponse.checkoutId);
      setPolling(false);
      setCheckoutStatus('CANCELED');
    } catch (err: any) {
      console.error('Failed to cancel checkout:', err);
      setError('Failed to cancel checkout');
    }
  };

  const handlePaymentSuccess = () => {
    if (onPaymentSuccess && checkoutResponse) {
      onPaymentSuccess(checkoutResponse.checkoutId);
    }

    // Auto-close after 2 seconds
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (!loading && !polling) {
      onClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <SuccessIcon />;
      case 'CANCELED':
        return <CancelIcon />;
      case 'FAILED':
        return <ErrorIcon />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      disableEscapeKeyDown={loading || polling}
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
          <TerminalIcon />
          Square Terminal Payment
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading || polling}
          sx={{ color: 'primary.contrastText' }}
        >
          <CloseIcon />
        </IconButton>
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

          <Box mt={1}>
            <Chip
              label="Card Present: 2.6% + $0.10 fee"
              size="small"
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {checkoutStatus === 'COMPLETED' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Payment successful! Invoice has been marked as paid.
          </Alert>
        )}

        {/* Device Selection */}
        {!checkoutResponse && (
          <Box>
            {loadingDevices ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">
                  Loading available devices...
                </Typography>
              </Box>
            ) : devices.length === 0 ? (
              <Alert severity="warning">
                No paired Square Terminal devices found. Please pair a device in
                your Square dashboard.
              </Alert>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Square Terminal</InputLabel>
                  <Select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    label="Select Square Terminal"
                  >
                    {devices.map((device) => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.name} ({device.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="caption" color="text.secondary">
                  The payment request will be sent to the selected Square
                  Terminal device. The customer can tap, insert, or swipe their
                  card on the device.
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Checkout Status */}
        {checkoutResponse && (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {getStatusIcon(checkoutStatus)}
              <Box flex={1}>
                <Typography variant="body1" fontWeight="bold">
                  Status: {checkoutStatus || 'PENDING'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Checkout ID: {checkoutResponse.checkoutId}
                </Typography>
              </Box>
            </Box>

            {polling && (
              <>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Waiting for customer to complete payment on Square Terminal
                  device...
                </Typography>
              </>
            )}

            {checkoutStatus === 'FAILED' && (
              <Alert severity="error">
                Payment failed. Please try again or use a different payment
                method.
              </Alert>
            )}

            {checkoutStatus === 'CANCELED' && (
              <Alert severity="warning">
                Payment was canceled. You can create a new checkout or close
                this dialog.
              </Alert>
            )}
          </Box>
        )}

        {/* Security Notice */}
        <Box mt={3}>
          <Typography variant="caption" color="text.secondary">
            🔒 Secure in-person payment processed by Square. Lower processing
            fee than online payments (2.6% + $0.10 vs 2.9% + $0.30).
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        {checkoutResponse && polling && (
          <Button onClick={handleCancelCheckout} color="error">
            Cancel Checkout
          </Button>
        )}
        <Button onClick={handleClose} disabled={loading || polling}>
          {checkoutStatus === 'COMPLETED' ? 'Close' : 'Cancel'}
        </Button>
        {!checkoutResponse && (
          <Button
            onClick={handleCreateCheckout}
            variant="contained"
            disabled={loading || loadingDevices || !selectedDeviceId}
          >
            {loading ? 'Creating...' : 'Send to Terminal'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
