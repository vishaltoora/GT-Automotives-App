import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  PointOfSale as TerminalIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PaymentMethod } from '../../../enums';
import { invoiceService } from '../../requests/invoice.requests';
import {
  squareTerminalService,
  TerminalDevice,
} from '../../requests/square-terminal.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

/** Minimal invoice shape this dialog needs — works for both the full
 * InvoiceResponseDto and the lighter CustomerInvoiceDto. */
export interface BulkPayableInvoice {
  id: string;
  invoiceNumber: string;
  total: number | string;
  status: string;
  amountPaid?: number | string | null;
}

type TerminalMethod = 'TERMINAL_CREDIT' | 'TERMINAL_DEBIT';
type MethodValue = PaymentMethod | TerminalMethod;

const isTerminal = (m: MethodValue): m is TerminalMethod =>
  m === 'TERMINAL_CREDIT' || m === 'TERMINAL_DEBIT';

const terminalToPaymentMethod = (m: TerminalMethod): PaymentMethod =>
  m === 'TERMINAL_CREDIT'
    ? PaymentMethod.CREDIT_CARD
    : PaymentMethod.DEBIT_CARD;

const METHOD_OPTIONS: { value: MethodValue; label: string }[] = [
  { value: PaymentMethod.CASH, label: 'Cash' },
  { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card' },
  { value: PaymentMethod.DEBIT_CARD, label: 'Debit Card' },
  { value: 'TERMINAL_CREDIT', label: 'Square Terminal – Credit Card' },
  { value: 'TERMINAL_DEBIT', label: 'Square Terminal – Debit Card' },
  { value: PaymentMethod.CHECK, label: 'Check' },
  { value: PaymentMethod.E_TRANSFER, label: 'E-Transfer' },
  { value: PaymentMethod.FINANCING, label: 'Financing' },
  { value: PaymentMethod.BANK_DEPOSIT, label: 'Bank Deposit' },
];

const remainingOf = (inv: BulkPayableInvoice) =>
  Math.max(0, Number(inv.total) - Number(inv.amountPaid ?? 0));

interface BulkInvoicePaymentDialogProps {
  open: boolean;
  onClose: () => void;
  customerName: string;
  /** Payable (unpaid / partially-paid) invoices to choose from. */
  invoices: BulkPayableInvoice[];
  /** Called after one or more invoices have been paid. */
  onPaid: () => void;
}

/**
 * Pay several of a customer's outstanding invoices at once. Standard methods
 * record each selected invoice in full; Square Terminal sends the combined
 * selected total to the reader once and settles each invoice on completion.
 */
export const BulkInvoicePaymentDialog: React.FC<
  BulkInvoicePaymentDialogProps
> = ({ open, onClose, customerName, invoices, onPaid }) => {
  const { showApiError } = useErrorHelpers();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [method, setMethod] = useState<MethodValue>(PaymentMethod.CASH);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Terminal sub-flow
  const [devices, setDevices] = useState<TerminalDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [polling, setPolling] = useState(false);

  const terminal = isTerminal(method);

  const selectedInvoices = useMemo(
    () => invoices.filter((inv) => selectedIds.has(inv.id)),
    [invoices, selectedIds]
  );
  const total = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + remainingOf(inv), 0),
    [selectedInvoices]
  );
  const allSelected =
    invoices.length > 0 && selectedIds.size === invoices.length;

  // Select everything by default each time the dialog opens.
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(invoices.map((inv) => inv.id)));
      setMethod(PaymentMethod.CASH);
      setError(null);
      setCheckoutId(null);
      setCheckoutStatus('');
      setPolling(false);
      setDeviceId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Load paired readers when a terminal method is chosen.
  useEffect(() => {
    if (!open || !terminal || devices.length > 0) return;
    setLoadingDevices(true);
    squareTerminalService
      .listDevices()
      .then((list) => {
        const paired = list.filter((d) => d.status === 'PAIRED');
        setDevices(paired);
        if (paired.length === 1) setDeviceId(paired[0].id);
      })
      .catch(() => setDevices([]))
      .finally(() => setLoadingDevices(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, terminal]);

  // Poll the reader until the customer completes (or cancels) the tap.
  useEffect(() => {
    if (!checkoutId || !polling) return undefined;
    const interval = setInterval(async () => {
      try {
        const status = await squareTerminalService.getCheckoutStatus(
          checkoutId
        );
        setCheckoutStatus(status.status);
        if (['COMPLETED', 'CANCELED', 'FAILED'].includes(status.status)) {
          setPolling(false);
          if (status.status === 'COMPLETED') {
            await settleSelected(
              terminalToPaymentMethod(method as TerminalMethod),
              checkoutId
            );
          }
        }
      } catch {
        // transient — keep polling
      }
    }, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutId, polling]);

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds((prev) =>
      prev.size === invoices.length
        ? new Set()
        : new Set(invoices.map((inv) => inv.id))
    );

  // Record each selected invoice in full (amount omitted = full balance).
  const settleSelected = async (
    paymentMethod: PaymentMethod,
    reference?: string
  ) => {
    setSaving(true);
    try {
      for (const inv of selectedInvoices) {
        await invoiceService.recordInvoicePayments(inv.id, [
          { paymentMethod, ...(reference ? { reference } : {}) },
        ]);
      }
      onPaid();
      handleClose();
    } catch (err) {
      showApiError(err, 'Failed to record one or more payments.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualRecord = () => {
    if (selectedInvoices.length === 0) return;
    settleSelected(method as PaymentMethod);
  };

  const handleSendToTerminal = async () => {
    if (!deviceId) {
      setError('Select a Square Terminal device.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await squareTerminalService.createBulkCheckout(
        selectedInvoices.map((inv) => inv.id),
        deviceId
      );
      setCheckoutId(res.checkoutId);
      setCheckoutStatus(res.status);
      setPolling(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to send the payment to the terminal.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelCheckout = async () => {
    if (!checkoutId) return;
    try {
      await squareTerminalService.cancelCheckout(checkoutId);
    } catch {
      // ignore — status poll will reflect the final state
    }
    setPolling(false);
    setCheckoutStatus('CANCELED');
  };

  const handleClose = () => {
    if (saving || polling) return;
    onClose();
  };

  const busy = saving || polling;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
            <Typography variant="h6">Process Payment</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={busy}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Select the invoices to pay for <strong>{customerName}</strong>.
        </Typography>

        {invoices.length === 0 ? (
          <Alert severity="info">No outstanding invoices.</Alert>
        ) : (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && selectedIds.size > 0}
                  onChange={toggleAll}
                  disabled={busy || !!checkoutId}
                />
              }
              label={`Select all (${invoices.length})`}
            />

            <List
              dense
              disablePadding
              sx={{ maxHeight: 240, overflow: 'auto' }}
            >
              {invoices.map((inv) => (
                <ListItem key={inv.id} disablePadding>
                  <ListItemButton
                    onClick={() => toggle(inv.id)}
                    disabled={busy || !!checkoutId}
                    dense
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedIds.has(inv.id)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`#${inv.invoiceNumber}`}
                      secondary={inv.status}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      ${remainingOf(inv).toFixed(2)}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle2">
                {selectedInvoices.length} selected
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                ${total.toFixed(2)}
              </Typography>
            </Box>

            <FormControl fullWidth size="small" disabled={busy || !!checkoutId}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={method}
                label="Payment Method"
                onChange={(e) => setMethod(e.target.value as MethodValue)}
              >
                {METHOD_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Square Terminal device selection + live status */}
            {terminal && !checkoutId && (
              <Box sx={{ mt: 2 }}>
                {loadingDevices ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      Loading terminals…
                    </Typography>
                  </Box>
                ) : devices.length === 0 ? (
                  <Alert severity="warning">
                    No paired Square Terminal devices found.
                  </Alert>
                ) : (
                  <FormControl fullWidth size="small">
                    <InputLabel>Square Terminal</InputLabel>
                    <Select
                      value={deviceId}
                      label="Square Terminal"
                      onChange={(e) => setDeviceId(e.target.value)}
                    >
                      {devices.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <Alert severity="info" sx={{ mt: 1.5 }}>
                  ${total.toFixed(2)} will be sent to the terminal for the
                  customer to tap, insert, or swipe.
                </Alert>
              </Box>
            )}

            {terminal && checkoutId && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Status: {checkoutStatus || 'PENDING'}
                </Typography>
                {polling && (
                  <>
                    <LinearProgress sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Waiting for the customer to complete payment on the
                      terminal…
                    </Typography>
                  </>
                )}
                {checkoutStatus === 'FAILED' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    Payment failed. Try again or use another method.
                  </Alert>
                )}
                {checkoutStatus === 'CANCELED' && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Payment was canceled.
                  </Alert>
                )}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {checkoutId && polling && (
          <Button onClick={handleCancelCheckout} color="error">
            Cancel Checkout
          </Button>
        )}
        <Button onClick={handleClose} color="inherit" disabled={busy}>
          {checkoutStatus === 'COMPLETED' ? 'Close' : 'Cancel'}
        </Button>
        {!checkoutId &&
          (terminal ? (
            <Button
              onClick={handleSendToTerminal}
              variant="contained"
              startIcon={<TerminalIcon />}
              disabled={
                busy || selectedInvoices.length === 0 || !deviceId || total <= 0
              }
            >
              Send to Terminal
            </Button>
          ) : (
            <Button
              onClick={handleManualRecord}
              variant="contained"
              color="success"
              disabled={busy || selectedInvoices.length === 0 || total <= 0}
            >
              {saving ? 'Recording…' : 'Record Payment'}
            </Button>
          ))}
      </DialogActions>
    </Dialog>
  );
};

export default BulkInvoicePaymentDialog;
