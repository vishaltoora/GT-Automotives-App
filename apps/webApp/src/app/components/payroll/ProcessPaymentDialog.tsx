import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Slide,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { ProcessPaymentDto, JobResponseDto } from '@gt-automotive/data';
import { PaymentMethod } from '@prisma/client';
import { paymentService } from '../../services/payment.service';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ProcessPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payment: any) => void;
  job: JobResponseDto | null;
}

export const ProcessPaymentDialog: React.FC<ProcessPaymentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  job,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProcessPaymentDto>({
    jobId: '',
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    notes: '',
    reference: '',
    paidBy: user?.id || '',
  });

  useEffect(() => {
    if (open && job) {
      setFormData({
        jobId: job.id,
        amount: job.payAmount,
        paymentMethod: PaymentMethod.CASH,
        notes: '',
        reference: '',
        paidBy: user?.id || '',
      });
      setError(null);
    }
  }, [open, job, user]);

  const handleInputChange = (field: keyof ProcessPaymentDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.jobId || !formData.paymentMethod) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.amount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payment = await paymentService.processPayment(formData);
      onSuccess(payment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

  const remainingBalance = job ? job.payAmount - (job.payments?.reduce((sum, p) => sum + p.amount, 0) || 0) : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3,
        }}
      >
        <PaymentIcon />
        <Typography variant="h5" component="div" sx={{ flex: 1 }}>
          Process Payment
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Job Details Card */}
          {job && (
            <Card sx={{ backgroundColor: colors.neutral[50] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon sx={{ color: colors.primary.main }} />
                  Job Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Job Title:</Typography>
                    <Typography variant="body2" fontWeight="medium">{job.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Employee:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" fontWeight="medium">
                        {getEmployeeName(job.employee)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Job Amount:</Typography>
                    <Typography variant="body2" fontWeight="medium">${job.payAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Remaining Balance:</Typography>
                    <Typography variant="body2" fontWeight="medium" color={remainingBalance > 0 ? colors.semantic.warning : colors.semantic.success}>
                      ${remainingBalance.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          <Divider />

          {/* Payment Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon sx={{ color: colors.semantic.success }} />
              Payment Information
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Payment Amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: colors.semantic.success }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={remainingBalance > 0 ? `Remaining balance: $${remainingBalance.toFixed(2)}` : 'Job fully paid'}
              />

              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  label="Payment Method"
                >
                  {Object.values(PaymentMethod).map((method) => (
                    <MenuItem key={method} value={method}>
                      {method.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Reference Number (Optional)"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              placeholder="e.g., Check #1234, Transaction ID, etc."
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this payment..."
            />
          </Box>

          {/* Payment Summary */}
          <Card sx={{ backgroundColor: colors.semantic.successLight + '20' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: colors.semantic.successDark }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Payment Amount:</Typography>
                <Typography fontWeight="bold">${formData.amount?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Payment Method:</Typography>
                <Typography fontWeight="medium">{formData.paymentMethod.replace('_', ' ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>New Balance:</Typography>
                <Typography fontWeight="bold" color={remainingBalance - formData.amount <= 0 ? colors.semantic.success : colors.semantic.warning}>
                  ${Math.max(0, remainingBalance - (formData.amount || 0)).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ minWidth: 120 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading || !formData.amount || formData.amount <= 0}
          sx={{
            minWidth: 120,
            background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
          }}
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};