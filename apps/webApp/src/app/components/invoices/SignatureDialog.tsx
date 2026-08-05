import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Draw as DrawIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { SignaturePad, SignaturePadHandle } from './SignaturePad';
import { invoiceService, Invoice } from '../../requests/invoice.requests';
import { colors } from '../../theme/colors';

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  /** Called with the updated invoice after a capture or a clear. */
  onSaved: (invoice: Invoice) => void;
}

/**
 * Capture (or replace) the customer signature on an invoice.
 *
 * Signing is optional throughout: nothing here gates payment, and an invoice
 * left unsigned simply prints a blank signature line for a wet signature.
 */
export function SignatureDialog({
  open,
  onClose,
  invoice,
  onSaved,
}: SignatureDialogProps) {
  const padRef = useRef<SignaturePadHandle>(null);
  const [signedByName, setSignedByName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingSignature = invoice.signatureUrl ?? null;

  const defaultName =
    [invoice.customer?.firstName, invoice.customer?.lastName]
      .filter(Boolean)
      .join(' ') ||
    invoice.customer?.businessName ||
    '';

  useEffect(() => {
    if (open) {
      setSignedByName(invoice.signatureSignedByName || defaultName);
      setHasSignature(false);
      setError(null);
      padRef.current?.clear();
    }
    // defaultName is derived from invoice, which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice]);

  const handleSave = async () => {
    const dataUrl = padRef.current?.toDataUrl();
    if (!dataUrl) {
      setError('Please sign in the box before saving.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await invoiceService.captureSignature(
        invoice.id,
        dataUrl,
        signedByName.trim() || undefined
      );
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not save the signature. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClearExisting = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await invoiceService.clearSignature(invoice.id);
      onSaved(updated);
      padRef.current?.clear();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not remove the signature. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DrawIcon color="primary" />
          <span>Customer Signature</span>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={saving}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Invoice {invoice.invoiceNumber}. Signing is optional — an unsigned
          invoice prints with a blank signature line.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {existingSignature && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              border: `1px solid ${colors.neutral[300]}`,
              borderRadius: 1,
              backgroundColor: colors.neutral[50],
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Current signature
            </Typography>
            <Box
              component="img"
              src={existingSignature}
              alt="Current customer signature"
              sx={{
                display: 'block',
                maxHeight: 70,
                maxWidth: '100%',
                mt: 0.5,
              }}
            />
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearExisting}
              disabled={saving}
              sx={{ mt: 1 }}
            >
              Remove signature
            </Button>
          </Box>
        )}

        <SignaturePad
          ref={padRef}
          onDirtyChange={setHasSignature}
          disabled={saving}
        />

        <TextField
          label="Printed name"
          value={signedByName}
          onChange={(e) => setSignedByName(e.target.value)}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
          disabled={saving}
          helperText="Printed below the signature on the invoice"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !hasSignature}
        >
          {saving
            ? 'Saving…'
            : existingSignature
            ? 'Replace signature'
            : 'Save signature'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SignatureDialog;
