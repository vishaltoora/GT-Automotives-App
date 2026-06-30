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
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { PaymentMethod } from '../../../enums';
import { NumberInput } from '../common';

export interface PaymentEntryInput {
  paymentMethod: PaymentMethod;
  amount?: number;
}

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  // Receives one or more payment entries. A single entry with amount omitted
  // means "pay the full remaining balance".
  onConfirm: (entries: PaymentEntryInput[]) => void;
  invoiceNumber: string;
  total?: number;
  amountPaid?: number;
  hasTax?: boolean;
}

const METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
  splitOk: boolean;
}[] = [
  { value: PaymentMethod.CASH, label: 'Cash (with GST/PST)', splitOk: true },
  {
    value: PaymentMethod.CASH_NO_TAX,
    label: 'Cash (no GST/PST)',
    splitOk: false,
  },
  { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card', splitOk: true },
  { value: PaymentMethod.DEBIT_CARD, label: 'Debit Card', splitOk: true },
  { value: PaymentMethod.CHECK, label: 'Check', splitOk: true },
  { value: PaymentMethod.E_TRANSFER, label: 'E-Transfer', splitOk: true },
  { value: PaymentMethod.FINANCING, label: 'Financing', splitOk: true },
  { value: PaymentMethod.BANK_DEPOSIT, label: 'Bank Deposit', splitOk: true },
];

interface Line {
  method: PaymentMethod;
  amount: string;
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
  const [lines, setLines] = useState<Line[]>([
    { method: PaymentMethod.CASH, amount: '' },
  ]);
  const [payInFull, setPayInFull] = useState(true);

  const remaining =
    total != null ? Math.max(0, Number(total) - Number(amountPaid)) : undefined;

  const isSplit = lines.length > 1;

  useEffect(() => {
    if (open) {
      setLines([
        {
          method: PaymentMethod.CASH,
          amount: remaining != null ? remaining.toFixed(2) : '',
        },
      ]);
      setPayInFull(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const allocated = lines.reduce(
    (sum, l) => sum + (parseFloat(l.amount) || 0),
    0
  );
  const noTaxSelected = lines.some(
    (l) => l.method === PaymentMethod.CASH_NO_TAX
  );

  const updateLine = (index: number, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l))
    );
  };

  const addLine = () => {
    setPayInFull(false);
    setLines((prev) => [...prev, { method: PaymentMethod.CASH, amount: '' }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (!isSplit && payInFull) {
      onConfirm([{ paymentMethod: lines[0].method }]);
    } else {
      onConfirm(
        lines.map((l) => ({
          paymentMethod: l.method,
          amount: parseFloat(l.amount),
        }))
      );
    }
    onClose();
  };

  // Whenever an explicit amount is in play (a split, or a single line that
  // isn't "pay in full"), every line needs a positive amount and the total
  // can't exceed the remaining balance.
  const needsAmounts = isSplit || !payInFull;
  const confirmDisabled =
    needsAmounts &&
    (lines.some((l) => !(parseFloat(l.amount) > 0)) ||
      (remaining != null && allocated > remaining + 0.005));

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

          {lines.map((line, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}
            >
              <FormControl fullWidth>
                <InputLabel>
                  {isSplit ? `Method ${index + 1}` : 'Payment Method'}
                </InputLabel>
                <Select
                  value={line.method}
                  label={isSplit ? `Method ${index + 1}` : 'Payment Method'}
                  onChange={(e) =>
                    updateLine(index, {
                      method: e.target.value as PaymentMethod,
                    })
                  }
                >
                  {METHOD_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      disabled={isSplit && !opt.splitOk}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(isSplit || !payInFull) && (
                <NumberInput
                  allowDecimals
                  label="Amount"
                  value={line.amount}
                  onChange={(v) =>
                    updateLine(index, {
                      amount: v === undefined ? '' : String(v),
                    })
                  }
                  min={0}
                  sx={{ width: 130 }}
                />
              )}

              {isSplit && (
                <IconButton
                  size="small"
                  onClick={() => removeLine(index)}
                  aria-label="remove method"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}

          {noTaxSelected && hasTax && (
            <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
              This removes GST/PST from the invoice — the total will be reduced
              to the pre-tax subtotal. Only allowed before any payment is
              recorded.
            </Alert>
          )}

          {!isSplit && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={payInFull}
                  onChange={(e) => setPayInFull(e.target.checked)}
                />
              }
              label="Pay full remaining balance"
            />
          )}

          {!noTaxSelected && (
            <Box sx={{ mt: 1 }}>
              <Button size="small" startIcon={<AddIcon />} onClick={addLine}>
                Add another method (split)
              </Button>
            </Box>
          )}

          {isSplit && remaining != null && (
            <Typography
              variant="caption"
              color={allocated > remaining + 0.005 ? 'error' : 'text.secondary'}
              sx={{ display: 'block', mt: 1 }}
            >
              Allocated ${allocated.toFixed(2)} of ${remaining.toFixed(2)}
              {allocated < remaining - 0.005 &&
                ` · $${(remaining - allocated).toFixed(2)} will remain owing`}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="success"
          disabled={confirmDisabled}
        >
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentMethodDialog;
