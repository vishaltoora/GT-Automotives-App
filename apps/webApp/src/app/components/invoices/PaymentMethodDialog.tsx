import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { PaymentMethod } from '../../../enums';

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  // amount is omitted when the full remaining balance is being paid
  onConfirm: (paymentMethod: PaymentMethod, amount?: number) => void;
  invoiceNumber: string;
  total?: number;
  amountPaid?: number;
  hasTax?: boolean;
}

export const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onClose,
  onConfirm,
  invoiceNumber,
  total,
  amountPaid = 0,
  hasTax = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH
  );
  const [payInFull, setPayInFull] = useState(true);
  const [amount, setAmount] = useState('');

  const remaining =
    total != null ? Math.max(0, Number(total) - Number(amountPaid)) : undefined;

  useEffect(() => {
    if (open) {
      setPaymentMethod(PaymentMethod.CASH);
      setPayInFull(true);
      setAmount(remaining != null ? remaining.toFixed(2) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const noTaxSelected = paymentMethod === PaymentMethod.CASH_NO_TAX;

  const handleConfirm = () => {
    const parsed = parseFloat(amount);
    const amountToSend = payInFull || isNaN(parsed) ? undefined : parsed;
    onConfirm(paymentMethod, amountToSend);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            <Typography variant="h6">Record Payment</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Invoice: <strong>#{invoiceNumber}</strong>
          </Typography>
          {remaining != null && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Remaining balance: <strong>${remaining.toFixed(2)}</strong>
              {amountPaid > 0 && ` (already paid $${amountPaid.toFixed(2)})`}
            </Typography>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
            >
              <MenuItem value={PaymentMethod.CASH}>
                Cash (with GST/PST)
              </MenuItem>
              <MenuItem value={PaymentMethod.CASH_NO_TAX}>
                Cash (no GST/PST)
              </MenuItem>
              <MenuItem value={PaymentMethod.CREDIT_CARD}>Credit Card</MenuItem>
              <MenuItem value={PaymentMethod.DEBIT_CARD}>Debit Card</MenuItem>
              <MenuItem value={PaymentMethod.CHECK}>Check</MenuItem>
              <MenuItem value={PaymentMethod.E_TRANSFER}>E-Transfer</MenuItem>
              <MenuItem value={PaymentMethod.FINANCING}>Financing</MenuItem>
              <MenuItem value={PaymentMethod.BANK_DEPOSIT}>
                Bank Deposit
              </MenuItem>
            </Select>
          </FormControl>

          {noTaxSelected && hasTax && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This removes GST/PST from the invoice — the total will be reduced
              to the pre-tax subtotal. Only allowed before any payment is
              recorded.
            </Alert>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={payInFull}
                onChange={(e) => setPayInFull(e.target.checked)}
              />
            }
            label="Pay full remaining balance"
          />

          {!payInFull && (
            <TextField
              fullWidth
              type="number"
              label="Payment amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="success">
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentMethodDialog;
