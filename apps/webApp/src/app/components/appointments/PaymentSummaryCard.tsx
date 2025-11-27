import React from 'react';
import { Paper, Box, Typography, Grid } from '@mui/material';
import { PaymentMethodBreakdown } from './PaymentMethodBreakdown';

interface PaymentSummaryCardProps {
  paymentsProcessedCount: number;
  totalPayments: number;
  totalOwed: number;
  paymentsByMethod: Record<string, number>;
}

export const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  paymentsProcessedCount,
  totalPayments,
  totalOwed,
  paymentsByMethod,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Payment Summary - Collected Today
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {paymentsProcessedCount} payment{paymentsProcessedCount === 1 ? '' : 's'} processed today
        </Typography>
      </Box>

      {/* Total Amount and Outstanding Balance */}
      <Box
        sx={{
          mb: 3,
          pb: 3,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Amount Collected
            </Typography>
            <Typography variant="h3" fontWeight="bold" color="success.main">
              ${totalPayments.toFixed(2)}
            </Typography>
          </Grid>
          {totalOwed > 0 && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Outstanding Balance
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                ${totalOwed.toFixed(2)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                Partial payments owed
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Payment Method Breakdown */}
      {Object.keys(paymentsByMethod).length > 0 && (
        <PaymentMethodBreakdown paymentsByMethod={paymentsByMethod} />
      )}
    </Paper>
  );
};
