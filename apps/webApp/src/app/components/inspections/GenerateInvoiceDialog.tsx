import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { ReceiptLong as ReceiptIcon } from '@mui/icons-material';
import {
  Inspection,
  InspectionFeeItem,
  inspectionService,
} from '../../requests/inspection.requests';
import { companyService } from '../../requests/company.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

interface GenerateInvoiceDialogProps {
  open: boolean;
  inspection: Inspection | null;
  onClose: () => void;
  onGenerated: (inspection: Inspection) => void;
}

// Optional payment method; empty value leaves the invoice unpaid (PENDING).
const PAYMENT_METHODS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Leave unpaid (Pending)' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CHECK', label: 'Check' },
  { value: 'E_TRANSFER', label: 'E-Transfer' },
  { value: 'FINANCING', label: 'Financing' },
  { value: 'BANK_DEPOSIT', label: 'Bank Deposit' },
];

export function GenerateInvoiceDialog({
  open,
  inspection,
  onClose,
  onGenerated,
}: GenerateInvoiceDialogProps) {
  const { showApiError, showValidationError } = useErrorHelpers();
  const [feeItems, setFeeItems] = useState<InspectionFeeItem[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [feeItemId, setFeeItemId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFeeItemId('');
    setPaymentMethod('');
    void loadData();
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [items, company] = await Promise.all([
        inspectionService.getFeeItems(),
        companyService.getDefaultCompany(),
      ]);
      const activeItems = items.filter((item) => item.isActive);
      setFeeItems(activeItems);
      setCompanyId(company?.id || '');

      // Pre-select the fee item whose type matches the inspection's template.
      const match = activeItems.find(
        (item) => item.type && item.type === inspection?.template?.type
      );
      if (match) {
        setFeeItemId(match.id);
      }
    } catch (error) {
      showApiError(error, 'Failed to load inspection fee items');
    } finally {
      setLoading(false);
    }
  };

  const selectedFeeItem = useMemo(
    () => feeItems.find((item) => item.id === feeItemId) || null,
    [feeItems, feeItemId]
  );

  const handleGenerate = async () => {
    if (!inspection) return;
    if (!feeItemId) {
      showValidationError('Select an inspection fee item.');
      return;
    }
    if (!companyId) {
      showValidationError(
        'No default company is configured. Set one before invoicing.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const updated = await inspectionService.generateInvoice(inspection.id, {
        feeItemId,
        companyId,
        paymentMethod: paymentMethod || undefined,
      });
      onGenerated(updated);
    } catch (error) {
      showApiError(error, 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon color="primary" />
        Generate Invoice from Inspection
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5} mt={0.5}>
            {feeItems.length === 0 && (
              <Alert severity="warning">
                No active inspection fee items found. An admin must add them
                under Inspection Items &amp; Pricing first.
              </Alert>
            )}

            <FormControl fullWidth disabled={feeItems.length === 0}>
              <InputLabel>Inspection Fee</InputLabel>
              <Select
                label="Inspection Fee"
                value={feeItemId}
                onChange={(event) => setFeeItemId(event.target.value)}
              >
                {feeItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} — ${Number(item.price).toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {inspection?.repairOrderId && (
              <Alert severity="info">
                This inspection is linked to a repair order. All completed
                services and parts from that repair order will be added to the
                same invoice.
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem
                    key={method.value || 'pending'}
                    value={method.value}
                  >
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedFeeItem && (
              <Typography variant="body2" color="text.secondary">
                The invoice will include the {selectedFeeItem.name} fee plus any
                linked repair-order work, with GST/PST applied automatically.
              </Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={submitting || loading || !feeItemId}
          startIcon={
            submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <ReceiptIcon />
            )
          }
        >
          Generate Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GenerateInvoiceDialog;
