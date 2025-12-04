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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { ProcessPaymentDto, JobResponseDto } from '@gt-automotive/data';
import { PaymentMethod } from '@gt-automotive/data';
import { paymentService } from '../../requests/payment.requests';
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
  allJobs?: JobResponseDto[]; // All ready jobs for the employee
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
  allJobs = [],
  progressInfo,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
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
      // Initialize with current job selected
      setSelectedJobIds(new Set([job.id]));
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

  // Calculate total amount for selected jobs
  const selectedJobs = allJobs.filter(j => selectedJobIds.has(j.id));
  const totalSelectedAmount = selectedJobs.reduce((sum, j) => sum + j.payAmount, 0);

  const handleJobToggle = (jobId: string) => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedJobIds.size === allJobs.length) {
      // Deselect all
      setSelectedJobIds(new Set());
    } else {
      // Select all
      setSelectedJobIds(new Set(allJobs.map(j => j.id)));
    }
  };

  // Update amount when selection changes
  // Note: We use JSON.stringify of job IDs to prevent infinite loops from allJobs array reference changes
  useEffect(() => {
    if (selectedJobIds.size > 0) {
      const total = allJobs
        .filter(j => selectedJobIds.has(j.id))
        .reduce((sum, j) => sum + j.payAmount, 0);
      setFormData(prev => {
        // Only update if the amount actually changed to prevent unnecessary re-renders
        if (prev.amount !== total) {
          return { ...prev, amount: total };
        }
        return prev;
      });
    }
  }, [selectedJobIds, allJobs.length]);

  const handleInputChange = (field: keyof ProcessPaymentDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (selectedJobIds.size === 0) {
      setError('Please select at least one job to process');
      return;
    }

    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if ((formData.amount || 0) <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Process payments for all selected jobs
      const paymentPromises = Array.from(selectedJobIds).map(jobId => {
        const selectedJob = allJobs.find(j => j.id === jobId);
        if (!selectedJob) return Promise.resolve(null);

        return paymentService.processPayment({
          jobId,
          amount: selectedJob.payAmount,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          reference: formData.reference,
          paidBy: user?.id || '',
        });
      });

      const payments = await Promise.all(paymentPromises);

      // Call onSuccess with the first payment (for compatibility)
      if (payments.length > 0 && payments[0]) {
        onSuccess(payments[0]);
      }

      // Reset selection
      setSelectedJobIds(new Set());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process payments');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

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
            Process Payment{selectedJobIds.size > 1 ? 's' : ''}
          </Typography>
          {selectedJobIds.size > 0 && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {selectedJobIds.size} job{selectedJobIds.size > 1 ? 's' : ''} selected
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

          {/* All Jobs List - Show when processing multiple jobs */}
          {allJobs.length > 0 && (
            <Card sx={{ backgroundColor: colors.primary.light + '10', border: `1px solid ${colors.primary.light}` }}>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, color: colors.primary.main }}>
                    <WorkIcon sx={{ fontSize: isMobile ? 18 : 24 }} />
                    Jobs Ready for Payment ({allJobs.length})
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedJobIds.size === allJobs.length && allJobs.length > 0}
                        indeterminate={selectedJobIds.size > 0 && selectedJobIds.size < allJobs.length}
                        onChange={handleSelectAll}
                        size={isMobile ? 'small' : 'medium'}
                      />
                    }
                    label={
                      <Typography variant={isMobile ? 'caption' : 'body2'} fontWeight={600}>
                        Select All
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>

                {selectedJobIds.size > 0 && (
                  <Alert severity="info" sx={{ mb: 1.5, py: isMobile ? 0.5 : 1 }}>
                    <Typography variant={isMobile ? 'caption' : 'body2'} fontWeight={600}>
                      {selectedJobIds.size} job{selectedJobIds.size > 1 ? 's' : ''} selected • Total: ${totalSelectedAmount.toFixed(2)}
                    </Typography>
                  </Alert>
                )}

                <List dense sx={{ py: 0 }}>
                  {allJobs.map((listJob, index) => {
                    const isSelected = selectedJobIds.has(listJob.id);
                    const isPastJob = index < (progressInfo?.current ? progressInfo.current - 1 : 0);
                    return (
                      <ListItem
                        key={listJob.id}
                        sx={{
                          px: isMobile ? 1 : 2,
                          py: isMobile ? 0.5 : 1,
                          borderRadius: 1,
                          mb: 0.5,
                          backgroundColor: isSelected ? colors.semantic.successLight + '20' : 'transparent',
                          border: isSelected ? `2px solid ${colors.semantic.success}` : '1px solid ' + colors.neutral[200],
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: isSelected ? colors.semantic.successLight + '30' : colors.neutral[50],
                          },
                        }}
                        onClick={() => handleJobToggle(listJob.id)}
                      >
                        <ListItemIcon sx={{ minWidth: isMobile ? 32 : 40 }}>
                          <Checkbox
                            checked={isSelected}
                            size={isMobile ? 'small' : 'medium'}
                            sx={{
                              color: colors.primary.main,
                              '&.Mui-checked': {
                                color: colors.semantic.success,
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: isMobile ? 32 : 40 }}>
                          {isPastJob ? (
                            <CheckCircleIcon sx={{ color: colors.semantic.success, fontSize: isMobile ? 18 : 24 }} />
                          ) : (
                            <PaymentIcon sx={{ color: isSelected ? colors.semantic.success : colors.neutral[400], fontSize: isMobile ? 18 : 24 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight={isSelected ? 600 : 500}>
                                {listJob.title}
                              </Typography>
                              {isPastJob && (
                                <Chip
                                  label="Paid"
                                  size="small"
                                  sx={{
                                    height: isMobile ? 18 : 20,
                                    fontSize: isMobile ? '0.6rem' : '0.7rem',
                                    fontWeight: 600,
                                    bgcolor: colors.neutral[200],
                                    color: colors.neutral[600],
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                              ${listJob.payAmount.toFixed(2)} • {getEmployeeName(listJob.employee)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          )}

          {allJobs.length === 0 && <Divider />}

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
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: colors.semantic.success, fontSize: isMobile ? 18 : 24 }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={`Total amount for ${selectedJobIds.size} selected job${selectedJobIds.size > 1 ? 's' : ''}`}
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
              {selectedJobIds.size > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                  <Typography variant={isMobile ? 'body2' : 'body1'}>Jobs Selected:</Typography>
                  <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="bold">{selectedJobIds.size}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                <Typography variant={isMobile ? 'body2' : 'body1'}>Total Payment Amount:</Typography>
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="bold" color={colors.semantic.success}>
                  ${totalSelectedAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isMobile ? 0.5 : 1 }}>
                <Typography variant={isMobile ? 'body2' : 'body1'}>Payment Method:</Typography>
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="medium">{formData.paymentMethod.replace('_', ' ')}</Typography>
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
          disabled={loading || selectedJobIds.size === 0 || !formData.amount || formData.amount <= 0}
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? '100%' : 120,
            background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
          }}
        >
          {loading
            ? 'Processing...'
            : `Process ${selectedJobIds.size} Payment${selectedJobIds.size > 1 ? 's' : ''}`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};