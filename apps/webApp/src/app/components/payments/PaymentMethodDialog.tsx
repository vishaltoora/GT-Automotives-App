import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import {
  CreditCard as OnlineIcon,
  PointOfSale as TerminalIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { SquarePaymentForm } from './SquarePaymentForm';
import { TerminalPaymentDialog } from './TerminalPaymentDialog';

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  onPaymentSuccess?: (paymentId: string) => void;
}

type PaymentMethod = 'none' | 'online' | 'terminal';

export const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  amount,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('none');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    setSelectedMethod('none');
    onClose();
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentId);
    }
    handleClose();
  };

  // Show method selection
  if (selectedMethod === 'none') {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Choose Payment Method
          <IconButton
            onClick={handleClose}
            sx={{ color: 'primary.contrastText' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select how you want to process this payment for Invoice{' '}
            {invoiceNumber}
          </Typography>

          <Grid container spacing={2}>
            {/* Online Payment Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedMethod('online')}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      textAlign="center"
                      gap={2}
                    >
                      <OnlineIcon
                        sx={{ fontSize: 48 }}
                        color="primary"
                      />
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Online Payment
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Customer enters card details in web form
                        </Typography>
                        <Typography variant="caption" color="warning.main">
                          Fee: 2.9% + $0.30
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Terminal Payment Card */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedMethod('terminal')}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      textAlign="center"
                      gap={2}
                    >
                      <TerminalIcon
                        sx={{ fontSize: 48 }}
                        color="success"
                      />
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Square Terminal
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          In-person payment with card reader device
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          Fee: 2.6% + $0.10 (Save $0.20)
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="caption" color="text.secondary">
              💡 Tip: Use Square Terminal for in-person payments to save on
              processing fees. Online payment works for remote customers.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Show online payment form
  if (selectedMethod === 'online') {
    return (
      <SquarePaymentForm
        open={true}
        onClose={() => setSelectedMethod('none')}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        amount={amount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  // Show terminal payment dialog
  if (selectedMethod === 'terminal') {
    return (
      <TerminalPaymentDialog
        open={true}
        onClose={() => setSelectedMethod('none')}
        invoiceId={invoiceId}
        invoiceNumber={invoiceNumber}
        amount={amount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return null;
};
