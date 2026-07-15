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
import { TerminalPaymentDialog } from '../payments/TerminalPaymentDialog';
import {
  PAYMENT_METHOD_SELECT_OPTIONS,
  PaymentMethodValue,
  TerminalMethod,
  isTerminalMethod,
  terminalToPaymentMethod,
} from '../../constants/payment-methods';

export interface PaymentEntryInput {
  paymentMethod: PaymentMethod;
  amount?: number;
  // Idempotency key (e.g. a Square Terminal checkout id) so a webhook can't
  // double-record a payment the browser already recorded.
  reference?: string;
}

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  // Receives one or more payment entries. A single entry with amount omitted
  // means "pay the full remaining balance".
  onConfirm: (entries: PaymentEntryInput[]) => void;
  invoiceNumber: string;
  // Required to push a Square Terminal checkout to the card reader.
  invoiceId?: string;
  total?: number;
  amountPaid?: number;
  hasTax?: boolean;
  // Pre-selects this method when the dialog opens (e.g. the method already
  // tagged on the invoice). Falls back to Cash when absent/unrecognized.
  defaultPaymentMethod?: string | null;
}

// Payment-method options are single-sourced from constants/payment-methods.
// Square Terminal options aren't real PaymentMethod values — they trigger an
// in-person card-reader checkout, then record as CREDIT_CARD / DEBIT_CARD.
type MethodValue = PaymentMethodValue;
const isTerminal = isTerminalMethod;
const METHOD_OPTIONS = PAYMENT_METHOD_SELECT_OPTIONS;

interface Line {
  method: MethodValue;
  amount: string;
}

export const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onClose,
  onConfirm,
  invoiceNumber,
  invoiceId,
  total,
  amountPaid = 0,
  hasTax = false,
  defaultPaymentMethod,
}) => {
  // Seed the picker with the invoice's tagged method when it's a recognized
  // option; otherwise fall back to Cash.
  const initialMethod: MethodValue =
    defaultPaymentMethod &&
    METHOD_OPTIONS.some((o) => o.value === defaultPaymentMethod)
      ? (defaultPaymentMethod as MethodValue)
      : PaymentMethod.CASH;
  const [lines, setLines] = useState<Line[]>([
    { method: initialMethod, amount: '' },
  ]);
  const [payInFull, setPayInFull] = useState(true);
  // Set when a Square Terminal method is confirmed — opens the reader dialog.
  const [terminalMethod, setTerminalMethod] = useState<PaymentMethod | null>(
    null
  );

  const remaining =
    total != null ? Math.max(0, Number(total) - Number(amountPaid)) : undefined;

  const isSplit = lines.length > 1;
  // Terminal is single-line, full-balance only (the reader charges the total).
  const terminalSelected = !isSplit && isTerminal(lines[0].method);

  useEffect(() => {
    if (open) {
      setLines([
        {
          method: initialMethod,
          amount: remaining != null ? remaining.toFixed(2) : '',
        },
      ]);
      setPayInFull(true);
      setTerminalMethod(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultPaymentMethod]);

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
    // Square Terminal: hand off to the card-reader dialog. The payment is
    // recorded on the invoice only once the terminal reports COMPLETED.
    if (terminalSelected) {
      setTerminalMethod(
        terminalToPaymentMethod(lines[0].method as TerminalMethod)
      );
      return;
    }
    if (!isSplit && payInFull) {
      onConfirm([{ paymentMethod: lines[0].method as PaymentMethod }]);
    } else {
      onConfirm(
        lines.map((l) => ({
          paymentMethod: l.method as PaymentMethod,
          amount: parseFloat(l.amount),
        }))
      );
    }
    onClose();
  };

  const handleTerminalSuccess = (checkoutId: string) => {
    onConfirm([
      {
        paymentMethod: terminalMethod as PaymentMethod,
        ...(remaining != null ? { amount: remaining } : {}),
        // Keyed to the checkout so the reconciliation webhook won't re-record it.
        reference: checkoutId,
      },
    ]);
    setTerminalMethod(null);
    onClose();
  };

  // Whenever an explicit amount is in play (a split, or a single line that
  // isn't "pay in full"), every line needs a positive amount and the total
  // can't exceed the remaining balance.
  const needsAmounts = isSplit || !payInFull;
  const confirmDisabled = terminalSelected
    ? !invoiceId || remaining == null || remaining <= 0
    : needsAmounts &&
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
                  onChange={(e) => {
                    const method = e.target.value as MethodValue;
                    // Terminal charges the full remaining balance — force
                    // pay-in-full so no manual amount is entered.
                    if (isTerminal(method)) setPayInFull(true);
                    updateLine(index, { method });
                  }}
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

          {!isSplit && !terminalSelected && (
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

          {terminalSelected && (
            <Alert severity="info" sx={{ mt: 1 }}>
              The full remaining balance
              {remaining != null ? ` ($${remaining.toFixed(2)})` : ''} will be
              sent to the Square Terminal for the customer to tap, insert, or
              swipe their card.
            </Alert>
          )}

          {!noTaxSelected && !terminalSelected && (
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
          {terminalSelected ? 'Send to Terminal' : 'Record Payment'}
        </Button>
      </DialogActions>

      {invoiceId && (
        <TerminalPaymentDialog
          open={terminalMethod != null}
          onClose={() => setTerminalMethod(null)}
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          amount={remaining ?? 0}
          onPaymentSuccess={handleTerminalSuccess}
        />
      )}
    </Dialog>
  );
};

export default PaymentMethodDialog;
