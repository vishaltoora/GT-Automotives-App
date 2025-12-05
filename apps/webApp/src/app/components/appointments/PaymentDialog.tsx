import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { ServiceAmountInput } from './ServiceAmountInput';
import { AppointmentSquarePaymentForm } from './AppointmentSquarePaymentForm';
import { appointmentService } from '../../requests/appointment.requests';
import { CircularProgress } from '@mui/material';

interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
}

interface PaymentData {
  totalAmount: number;
  payments: PaymentEntry[];
  paymentNotes?: string;
  expectedAmount?: number;
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (paymentData: PaymentData) => void;
  appointmentId: string;
  defaultExpectedAmount?: number;
  existingPayments?: PaymentEntry[];
  existingNotes?: string;
  isEditMode?: boolean;
}

// Cash payment tab only uses CASH method - simplified UI

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  onSubmit,
  appointmentId,
  defaultExpectedAmount = 0,
  existingPayments,
  existingNotes = '',
  isEditMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Tab state (0 = Cash Payment, 1 = E-Transfer with Invoice, 2 = Pay with Square)
  const [activeTab, setActiveTab] = useState(0);

  // E-Transfer with Invoice state
  const [eTransferAmount, setETransferAmount] = useState(0);
  const [eTransferProcessing, setETransferProcessing] = useState(false);
  const [eTransferError, setETransferError] = useState<string | null>(null);

  // Manual payment state
  const [payments, setPayments] = useState<PaymentEntry[]>(
    existingPayments && existingPayments.length > 0
      ? existingPayments
      : [{ id: crypto.randomUUID(), method: 'CASH', amount: 0 }]
  );
  const [paymentNotes, setPaymentNotes] = useState(existingNotes);
  const [expectedAmount, setExpectedAmount] = useState(defaultExpectedAmount);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Square payment state
  const [serviceAmount, setServiceAmount] = useState(0);
  const [squareFormOpen, setSquareFormOpen] = useState(false);

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingBalance = expectedAmount - totalAmount;
  const isPartialPayment = expectedAmount > 0 && totalAmount < expectedAmount;

  // Handle tab change - reset amounts when switching tabs
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset amounts for each tab when switching
    if (newValue === 0) {
      // Reset cash payments
      setPayments([{ id: crypto.randomUUID(), method: 'CASH', amount: 0 }]);
      setExpectedAmount(defaultExpectedAmount);
      setPaymentNotes('');
      setErrors({});
    } else if (newValue === 1) {
      // Reset E-Transfer amount
      setETransferAmount(0);
      setETransferError(null);
    } else if (newValue === 2) {
      // Reset Square amount
      setServiceAmount(0);
    }
  };

  // Handle opening Square payment form
  const handleOpenSquareForm = () => {
    if (serviceAmount <= 0) {
      return;
    }
    setSquareFormOpen(true);
  };

  // Handle Square payment success
  const handleSquarePaymentSuccess = (paymentId: string) => {
    console.log('Square payment successful:', paymentId);
    // Close both dialogs
    setSquareFormOpen(false);
    handleClose();
    // Refresh the page to show updated appointment status
    window.location.reload();
  };

  // Handle E-Transfer with Invoice submission
  const handleETransferSubmit = async () => {
    if (eTransferAmount <= 0) {
      setETransferError('Please enter a valid service amount');
      return;
    }

    setETransferProcessing(true);
    setETransferError(null);

    try {
      await appointmentService.createETransferInvoice(appointmentId, eTransferAmount);
      // Close dialog and refresh
      handleClose();
      window.location.reload();
    } catch (err: any) {
      console.error('E-Transfer invoice creation failed:', err);
      setETransferError(
        err.response?.data?.message ||
        err.message ||
        'Failed to create invoice. Please try again.'
      );
    } finally {
      setETransferProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setPayments([{ id: crypto.randomUUID(), method: 'CASH', amount: 0 }]);
    setPaymentNotes('');
    setServiceAmount(0);
    setETransferAmount(0);
    setETransferError(null);
    setActiveTab(0);
    setErrors({});
    setSquareFormOpen(false);
    onClose();
  };

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      { id: crypto.randomUUID(), method: 'CASH', amount: 0 },
    ]);
  };

  const handleRemovePayment = (id: string) => {
    if (payments.length > 1) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const handlePaymentChange = (
    id: string,
    field: 'method' | 'amount',
    value: string | number
  ) => {
    setPayments(
      payments.map((p) => {
        if (p.id === id) {
          if (field === 'amount') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return { ...p, amount: isNaN(numValue) ? 0 : numValue };
          }
          return { ...p, method: String(value) };
        }
        return p;
      })
    );
    // Clear error for this field
    setErrors({ ...errors, [id]: '' });
  };

  const handleSubmit = () => {
    // Validate
    const newErrors: Record<string, string> = {};
    let hasError = false;

    payments.forEach((payment) => {
      if (payment.amount === null || payment.amount === undefined || payment.amount < 0) {
        newErrors[payment.id] = 'Amount cannot be negative';
        hasError = true;
      }
    });

    // Allow $0 total for "pay later" scenarios
    if (totalAmount < 0) {
      newErrors.total = 'Total payment cannot be negative';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Submit
    const paymentData = {
      totalAmount,
      payments,
      paymentNotes,
      expectedAmount: expectedAmount > 0 ? expectedAmount : undefined,
    };
    console.log('PaymentDialog - Submitting payment data:', paymentData);
    onSubmit(paymentData);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'success.main',
          color: 'white',
          py: isMobile ? 1.5 : 2,
          px: isMobile ? 2 : 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} component="div" sx={{ fontWeight: 600 }}>
            {isEditMode
              ? isMobile ? 'Edit Payment' : 'Edit Payment Details'
              : isMobile ? 'Payment Details' : 'Complete Appointment - Payment Details'}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Payment Method Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={isMobile ? 'Cash' : 'Cash Payment'}
            icon={<MoneyIcon />}
            iconPosition="start"
          />
          <Tab
            label="E-Transfer"
            icon={<ReceiptIcon />}
            iconPosition="start"
          />
          <Tab
            label={isMobile ? 'Card' : 'Pay with Square'}
            icon={<CreditCardIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ pt: isMobile ? 2 : 3, px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          {/* Manual Payment Tab */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Expected Amount Field */}
              <TextField
            label="Expected Amount (Optional)"
            type="number"
            value={expectedAmount || ''}
            onChange={(e) => setExpectedAmount(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => {
              if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                e.preventDefault();
              }
            }}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            helperText="Enter the expected total amount to track partial payments"
            autoComplete="off"
          />

          {/* Total Amount Display */}
          <Card
            elevation={0}
            sx={{
              bgcolor: totalAmount > 0 ? 'success.light' : 'grey.100',
              borderLeft: 4,
              borderColor: totalAmount > 0 ? 'success.main' : 'grey.400',
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: isPartialPayment ? 1 : 0,
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Total Payment Received
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={totalAmount > 0 ? 'success.dark' : 'text.secondary'}
                >
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
              {isPartialPayment && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="warning.dark" fontWeight="medium">
                    Remaining Balance Owed
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.dark">
                    ${remainingBalance.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {errors.total && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.total}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Cash Payment Entries */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                mb: 2,
                gap: isMobile ? 1 : 0,
              }}
            >
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
                Cash Payment Entries
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddPayment}
                variant="outlined"
                size={isMobile ? 'medium' : 'small'}
                color="primary"
                fullWidth={isMobile}
              >
                Add Another Payment
              </Button>
            </Box>

            <Stack spacing={2}>
              {payments.map((payment, index) => (
                <Card
                  key={payment.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: errors[payment.id] ? 'error.main' : 'divider',
                  }}
                >
                  <CardContent sx={{ p: isMobile ? 1.5 : 2, '&:last-child': { pb: isMobile ? 1.5 : 2 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: isMobile ? 1.5 : 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color="primary"
                          sx={{ minWidth: 45 }}
                        />
                        <Chip
                          label="Cash"
                          size="small"
                          variant="outlined"
                          icon={<MoneyIcon sx={{ fontSize: 16 }} />}
                        />
                        {isMobile && payments.length > 1 && (
                          <IconButton
                            onClick={() => handleRemovePayment(payment.id)}
                            disabled={payments.length === 1}
                            size="small"
                            color="error"
                            sx={{ ml: 'auto' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>

                      {/* Amount */}
                      <TextField
                        label="Cash Amount"
                        type="number"
                        value={payment.amount || ''}
                        onChange={(e) =>
                          handlePaymentChange(payment.id, 'amount', e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                            e.preventDefault();
                          }
                        }}
                        error={!!errors[payment.id]}
                        helperText={errors[payment.id]}
                        size="small"
                        sx={{ width: isMobile ? '100%' : 180 }}
                        fullWidth={isMobile}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        inputProps={{
                          min: 0,
                          step: 0.01,
                        }}
                        autoComplete="off"
                      />

                      {/* Delete Button - Desktop only */}
                      {!isMobile && (
                        <IconButton
                          onClick={() => handleRemovePayment(payment.id)}
                          disabled={payments.length === 1}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          <Divider />

              {/* Payment Notes */}
              <TextField
                label="Payment Notes (Optional)"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., Invoice number, reference number, partial payment, etc."
              />
            </Box>
          )}

          {/* E-Transfer with Invoice Tab */}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  E-Transfer with Invoice
                </Typography>
                <Typography variant="caption">
                  Enter the service amount to calculate taxes (GST + PST). An invoice will be automatically created and marked as PAID, and the appointment will be marked as completed.
                </Typography>
              </Alert>

              {/* Expected Amount Field - Reference for user */}
              {defaultExpectedAmount > 0 && (
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: 'info.light',
                    borderLeft: 4,
                    borderColor: 'info.main',
                  }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="info.dark" fontWeight="medium">
                        Expected Amount (Reference)
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="info.dark">
                        ${defaultExpectedAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Error Message */}
              {eTransferError && (
                <Alert severity="error" onClose={() => setETransferError(null)}>
                  {eTransferError}
                </Alert>
              )}

              {/* Service Amount Input with Tax Calculation */}
              <ServiceAmountInput
                value={eTransferAmount}
                onChange={setETransferAmount}
                disabled={eTransferProcessing}
              />

              {/* Instructions */}
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    📋 What happens next:
                  </Typography>
                  <Box component="ol" sx={{ pl: 2, m: 0 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Invoice is created with calculated taxes (GST 5% + PST 7%)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Invoice is marked as PAID with E-Transfer payment method
                    </Typography>
                    <Typography component="li" variant="body2">
                      Appointment is marked as COMPLETED
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Square Payment Tab */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={500} gutterBottom>
                  Pay with Card (Square)
                </Typography>
                <Typography variant="caption">
                  Enter the service amount and click "Pay with Card" to open a secure payment form. The customer can pay with credit card, debit card, Apple Pay, or Google Pay. Once payment is successful, the appointment will be automatically marked as completed and an invoice will be created.
                </Typography>
              </Alert>

              {/* Expected Amount Field - Reference for user */}
              {defaultExpectedAmount > 0 && (
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: 'info.light',
                    borderLeft: 4,
                    borderColor: 'info.main',
                  }}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="info.dark" fontWeight="medium">
                        Expected Amount (Reference)
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="info.dark">
                        ${defaultExpectedAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Service Amount Input with Tax Calculation */}
              <ServiceAmountInput
                value={serviceAmount}
                onChange={setServiceAmount}
                disabled={false}
              />

              {/* Instructions */}
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    📋 What happens next:
                  </Typography>
                  <Box component="ol" sx={{ pl: 2, m: 0 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Secure payment form opens with embedded card entry
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Customer enters card details (never stored on our servers)
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                      Invoice is automatically created and marked as PAID
                    </Typography>
                    <Typography component="li" variant="body2">
                      Appointment is marked as COMPLETED
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: isMobile ? 2 : 2,
          gap: 1,
          flexDirection: isMobile ? 'column-reverse' : 'row',
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          fullWidth={isMobile}
          size={isMobile ? 'large' : 'medium'}
        >
          Cancel
        </Button>

        {/* Manual Payment Button */}
        {activeTab === 0 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            startIcon={<MoneyIcon />}
            disabled={totalAmount < 0}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
          >
            {isEditMode ? 'Save Changes' : 'Complete & Record Payment'}
          </Button>
        )}

        {/* E-Transfer with Invoice Button */}
        {activeTab === 1 && (
          <Button
            onClick={handleETransferSubmit}
            variant={eTransferAmount <= 0 ? 'outlined' : 'contained'}
            color="warning"
            startIcon={eTransferProcessing ? <CircularProgress size={20} color="inherit" /> : <ReceiptIcon />}
            disabled={eTransferAmount <= 0 || eTransferProcessing}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={eTransferAmount <= 0 ? {
              borderColor: 'grey.400',
              color: 'grey.500',
              '&.Mui-disabled': {
                borderColor: 'grey.400',
                color: 'grey.500',
              },
            } : {}}
          >
            {eTransferProcessing ? 'Creating Invoice...' : 'Create Invoice & Complete'}
          </Button>
        )}

        {/* Square Payment Button */}
        {activeTab === 2 && (
          <Button
            onClick={handleOpenSquareForm}
            variant={serviceAmount <= 0 ? 'outlined' : 'contained'}
            color="primary"
            startIcon={<CreditCardIcon />}
            disabled={serviceAmount <= 0}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={serviceAmount <= 0 ? {
              borderColor: 'grey.400',
              color: 'grey.500',
              '&.Mui-disabled': {
                borderColor: 'grey.400',
                color: 'grey.500',
              },
            } : {}}
          >
            Pay with Card
          </Button>
        )}
      </DialogActions>

      {/* Square Payment Form Dialog */}
      <AppointmentSquarePaymentForm
        open={squareFormOpen}
        onClose={() => setSquareFormOpen(false)}
        appointmentId={appointmentId}
        serviceAmount={serviceAmount}
        onPaymentSuccess={handleSquarePaymentSuccess}
      />
    </Dialog>
  );
};
