import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { PaymentMethodBreakdown } from './PaymentMethodBreakdown';

interface LocationBreakdownCardProps {
  icon: React.ReactNode;
  title: string;
  completedCount: number;
  totalPayments: number;
  paymentsByMethod: Record<string, number>;
}

export const LocationBreakdownCard: React.FC<LocationBreakdownCardProps> = ({
  icon,
  title,
  completedCount,
  totalPayments,
  paymentsByMethod,
}) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        border: 1,
        borderColor: 'divider',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {completedCount} completed {completedCount === 1 ? 'appointment' : 'appointments'}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: 2 }}>
        ${totalPayments.toFixed(2)}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: 'block', mb: 2 }}
      >
        Total payments collected
      </Typography>

      {/* Payment Method Breakdown */}
      {Object.keys(paymentsByMethod).length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <PaymentMethodBreakdown paymentsByMethod={paymentsByMethod} showLabel />
        </Box>
      )}
    </Paper>
  );
};
