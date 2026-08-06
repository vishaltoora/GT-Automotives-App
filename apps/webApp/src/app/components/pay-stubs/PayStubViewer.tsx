import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close, Download, Print } from '@mui/icons-material';
import { PayStubDto } from '@gt-automotive/data';
import { payStubService } from '../../requests/pay-stub.requests';

interface PayStubViewerProps {
  payStub: PayStubDto | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Views a pay stub and prints it.
 *
 * Both actions render the same server-generated PDF — there is no second
 * on-screen template to keep in step with the printed one. The document is
 * generated on demand and never stored, so what is shown here is rebuilt from
 * the stub's frozen figures each time it is opened.
 */
export function PayStubViewer({ payStub, open, onClose }: PayStubViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open || !payStub) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const blob = await payStubService.fetchPdfBlob(payStub.id);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load the pay stub');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      // The blob stays in memory until it is revoked, and a pay stub is not
      // something to leave lying around longer than the dialog it was opened in.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPdfUrl(null);
    };
  }, [open, payStub]);

  const handlePrint = () => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };

  const handleDownload = () => {
    if (!pdfUrl || !payStub) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `paystub-${payStub.payDate}-${payStub.employeeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}.pdf`;
    link.click();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Pay Stub
          </Typography>
          {payStub && (
            <Typography variant="body2" color="text.secondary">
              {payStub.periodStart} to {payStub.periodEnd} · paid{' '}
              {payStub.payDate}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, minHeight: 480 }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}
        {pdfUrl && !loading && (
          <iframe
            ref={frameRef}
            src={pdfUrl}
            title="Pay stub"
            style={{ width: '100%', height: '70vh', border: 'none' }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          startIcon={<Download />}
          onClick={handleDownload}
          disabled={!pdfUrl}
        >
          Download
        </Button>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
          disabled={!pdfUrl}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PayStubViewer;
