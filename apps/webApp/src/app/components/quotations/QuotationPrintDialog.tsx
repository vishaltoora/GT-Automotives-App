import React, { useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Print as PrintIcon } from '@mui/icons-material';
import { quotationService, Quote } from '../../requests/quotation.requests';
import { colors } from '../../theme/colors';

interface QuotationPrintDialogProps {
  quote: Quote | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Shows the printable quotation without leaving the app.
 *
 * The document is the same HTML the printer gets — rendered into an iframe
 * rather than a popup window, so saving a quote keeps the user on the page they
 * were working on instead of dropping them into a new browser tab. Printing
 * targets the frame, so what is on screen is exactly what comes out.
 */
export const QuotationPrintDialog: React.FC<QuotationPrintDialogProps> = ({
  quote,
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const frameRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Quotation {quote?.quotationNumber ?? ''}
          </Typography>
          {quote?.customerName && (
            <Typography variant="body2" color="text.secondary">
              {quote.customerName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, background: colors.neutral[100] }}>
        {quote && (
          <iframe
            ref={frameRef}
            title={`Quotation ${quote.quotationNumber ?? ''}`}
            srcDoc={quotationService.generatePrintHTML(quote)}
            style={{
              width: '100%',
              height: isMobile ? '100%' : '70vh',
              minHeight: 400,
              border: 'none',
              background: 'white',
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} fullWidth={isMobile}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={!quote}
          fullWidth={isMobile}
          sx={{
            background: colors.primary.main,
            '&:hover': { background: colors.primary.dark },
          }}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuotationPrintDialog;
