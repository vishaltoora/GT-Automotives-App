import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

interface PaymentMethodBreakdownProps {
  paymentsByMethod: Record<string, number>;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: '💵 Cash',
  E_TRANSFER: '📱 E-Transfer',
  CREDIT_CARD: '💳 Credit Card',
  DEBIT_CARD: '💳 Debit Card',
  CHEQUE: '📝 Cheque',
};

export const PaymentMethodBreakdown: React.FC<PaymentMethodBreakdownProps> = ({
  paymentsByMethod,
  showLabel = false,
  size = 'medium',
}) => {
  const methods = Object.keys(paymentsByMethod);

  if (methods.length === 0) {
    return null;
  }

  const fontSize = size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem';
  const titleFontSize = size === 'small' ? 'h6' : size === 'medium' ? 'h6' : 'h5';

  return (
    <Box>
      {showLabel && (
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="medium"
          display="block"
          sx={{ mb: 1 }}
        >
          Payment Methods:
        </Typography>
      )}
      <Grid container spacing={2}>
        {methods.map((method) => (
          <Grid key={method} size={{ xs: 6, sm: 6, md: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize }}>
                  {PAYMENT_METHOD_LABELS[method] || method}
                </Typography>
              </Box>
              <Typography variant={titleFontSize} fontWeight="bold">
                ${paymentsByMethod[method].toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
