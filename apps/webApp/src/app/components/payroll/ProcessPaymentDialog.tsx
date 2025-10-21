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
  useTheme,
  useMediaQuery,
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
import { PaymentMethod } from '@gt-automotive/data';
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
  progressInfo?: {
    current: number;
    total: number;
  };
}

export const ProcessPaymentDialog: React.FC<ProcessPaymentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  job,
  progressInfo,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProcessPaymentDto>({
    jobId: '',
    amount: 0,
    paymentMethod: 'CASH' as PaymentMethod,
    notes: '',
    reference: '',
    paidBy: user?.id || '',
  });

  useEffect(() => {
    if (open && job) {
      setFormData({
        jobId: job.id,
        amount: job.payAmount,
        paymentMethod: 'CASH' as PaymentMethod,
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

    if ((formData.amount || 0) <= 0) {
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
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 1 : 2,
          py: isMobile ? 2 : 3,
          px: isMobile ? 2 : 3,
        }}
      >
        <PaymentIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} component="div" sx={{ fontWeight: 600 }}>
            Process Payment
          </Typography>
          {progressInfo && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Job {progressInfo.current} of {progressInfo.total}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }} size={isMobile ? 'small' : 'medium'}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: isMobile ? 1 : 2 }}>
              {error}
            </Alert>
          )}

          {/* Job Details Card */}
          {job && (
            <Card sx={{ backgroundColor: colors.neutral[50] }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <WorkIcon sx={{ color: colors.primary.main, fontSize: isMobile ? 18 : 24 }} />
                  Job Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1 : 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="textSecondary">Job Title:</Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} fontWeight="medium">{job.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="textSecondary">Employee:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: isMobile ? 14 : 16 }} />
                      <Typography variant={isMobile ? 'caption' : 'body2'} fontWeight="medium">
                        {getEmployeeName(job.employee)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="textSecondary">Job Amount:</Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} fontWeight="medium">${job.payAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                    <Typography variant={isMobile ? 'caption' : 'body2'} color="textSecondary">Remaining Balance:</Typography>
                    <Typography variant={isMobile ? 'caption' : 'body2'} fontWeight="medium" color={remainingBalance > 0 ? colors.semantic.warning : colors.semantic.success}>
                      ${remainingBalance.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          <Divider />

          {/* Payment Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 3 }}>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <PaymentIcon sx={{ color: colors.semantic.success, fontSize: isMobile ? 18 : 24 }} />
              Payment Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Payment Amount"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: colors.semantic.success, fontSize: isMobile ? 18 : 24 }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={remainingBalance > 0 ? `Remaining balance: $${remainingBalance.toFixed(2)}` : 'Job fully paid'}
              />

              <FormControl fullWidth required size={isMobile ? 'small' : 'medium'}>
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
              multiline
              rows={isMobile ? 2 : 3}
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this payment..."
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>

          {/* Payment Summary */}
          <Card sx={{ backgroundColor: colors.semantic.successLight + '20' }}>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ color: colors.semantic.successDark, fontWeight: 600 }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                <Typography variant={isMobile ? 'body2' : 'body1'}>Payment Amount:</Typography>
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="bold">${formData.amount?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                <Typography variant={isMobile ? 'body2' : 'body1'}>Payment Method:</Typography>
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="medium">{formData.paymentMethod.replace('_', ' ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant={isMobile ? 'body2' : 'body1'}>New Balance:</Typography>
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="bold" color={remainingBalance - (formData.amount || 0) <= 0 ? colors.semantic.success : colors.semantic.warning}>
                  ${Math.max(0, remainingBalance - (formData.amount || 0)).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: isMobile ? 2 : 3, pt: 0, gap: 1, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size={isMobile ? 'large' : 'large'}
          sx={{ minWidth: isMobile ? '100%' : 120 }}
          fullWidth={isMobile}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size={isMobile ? 'large' : 'large'}
          disabled={loading || !formData.amount || formData.amount <= 0}
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? '100%' : 120,
            background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
          }}
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};