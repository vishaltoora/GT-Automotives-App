import React from 'react';
import { Grid, Typography, Divider, Stack } from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  AttachMoney as AttachMoneyIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { AppointmentResponseDto as Appointment } from '@gt-automotive/data';
import { PaymentSummaryCard } from './PaymentSummaryCard';
import { LocationBreakdownCard } from './LocationBreakdownCard';
import { ProcessedPaymentCard } from './ProcessedPaymentCard';
import { OutstandingBalanceCard } from './OutstandingBalanceCard';
import { EmptyStateMessage } from './EmptyStateMessage';

interface PaymentStats {
  paymentsProcessedCount: number;
  totalPayments: number;
  totalOwed: number;
  paymentsByMethod: Record<string, number>;
  atGaragePayments: number;
  completedAtGarage: number;
  atGaragePaymentsByMethod: Record<string, number>;
  mobileServicePayments: number;
  completedMobileService: number;
  mobileServicePaymentsByMethod: Record<string, number>;
}

interface DaySummaryTabPanelProps {
  stats: PaymentStats;
  sortedPayments: Appointment[];
  onReceivePayment: (appointment: Appointment) => void;
}

export const DaySummaryTabPanel: React.FC<DaySummaryTabPanelProps> = ({
  stats,
  sortedPayments,
  onReceivePayment,
}) => {
  const outstandingBalancePayments = sortedPayments.filter(
    (apt) => apt.expectedAmount && apt.expectedAmount > (apt.paymentAmount || 0)
  );

  return (
    <Grid container spacing={3}>
      {/* Payment Summary */}
      <Grid size={12}>
        <PaymentSummaryCard
          paymentsProcessedCount={stats.paymentsProcessedCount}
          totalPayments={stats.totalPayments}
          totalOwed={stats.totalOwed}
          paymentsByMethod={stats.paymentsByMethod}
        />
      </Grid>

      {/* At Garage Breakdown Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <LocationBreakdownCard
          icon={<LocationOnIcon color="primary" />}
          title="At Garage"
          completedCount={stats.completedAtGarage}
          totalPayments={stats.atGaragePayments}
          paymentsByMethod={stats.atGaragePaymentsByMethod}
        />
      </Grid>

      {/* Mobile Service Breakdown Card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <LocationBreakdownCard
          icon={<DriveEtaIcon color="primary" />}
          title="Mobile Service"
          completedCount={stats.completedMobileService}
          totalPayments={stats.mobileServicePayments}
          paymentsByMethod={stats.mobileServicePaymentsByMethod}
        />
      </Grid>

      {/* Payments Processed Today */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Payments Processed Today ({sortedPayments.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {sortedPayments.length === 0 ? (
          <EmptyStateMessage
            icon={<AttachMoneyIcon />}
            title="No payments processed"
            message="No payments were collected on this date."
          />
        ) : (
          <Stack spacing={2}>
            {sortedPayments.map((appointment) => (
              <ProcessedPaymentCard key={appointment.id} appointment={appointment} />
            ))}
          </Stack>
        )}
      </Grid>

      {/* Customer Cards - Outstanding Balances Only */}
      <Grid size={12}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'warning.main' }}>
          Customer Details (Outstanding Balance)
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {outstandingBalancePayments.length === 0 ? (
          <EmptyStateMessage
            icon={<BlockIcon />}
            title="No outstanding balances"
            message="All payments have been collected in full."
          />
        ) : (
          <Stack spacing={2}>
            {outstandingBalancePayments.map((appointment) => (
              <OutstandingBalanceCard
                key={appointment.id}
                appointment={appointment}
                onReceivePayment={onReceivePayment}
              />
            ))}
          </Stack>
        )}
      </Grid>
    </Grid>
  );
};
