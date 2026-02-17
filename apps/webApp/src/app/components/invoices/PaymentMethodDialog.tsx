import React, { useState } from 'react';
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
} from '@mui/material';
import { Close as CloseIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { PaymentMethod } from '../../../enums';

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  invoiceNumber: string;
}

export const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onClose,
  onConfirm,
  invoiceNumber,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const handleConfirm = () => {
    onConfirm(paymentMethod);
    onClose();
  };

  const handleClose = () => {
    setPaymentMethod(PaymentMethod.CASH); // Reset to default
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            <Typography variant="h6">Mark Invoice as Paid</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Invoice: <strong>#{invoiceNumber}</strong>
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <MenuItem value={PaymentMethod.CASH}>Cash</MenuItem>
              <MenuItem value={PaymentMethod.CREDIT_CARD}>Credit Card</MenuItem>
              <MenuItem value={PaymentMethod.DEBIT_CARD}>Debit Card</MenuItem>
              <MenuItem value={PaymentMethod.CHECK}>Check</MenuItem>
              <MenuItem value={PaymentMethod.E_TRANSFER}>E-Transfer</MenuItem>
              <MenuItem value={PaymentMethod.FINANCING}>Financing</MenuItem>
              <MenuItem value={PaymentMethod.BANK_DEPOSIT}>Bank Deposit</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="success">
          Mark as Paid
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentMethodDialog;
