import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
  Stack,
} from '@mui/material';
import {
  Build as BuildIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import { PaymentEntryDto as PaymentEntry } from '@gt-automotive/data';
import { formatTimeRange } from '../../utils/timeFormat';
import {
  formatPhoneNumber,
  getStatusColor,
  getStatusIcon,
  formatStatusLabel,
  formatServiceType,
} from './AppointmentCard';
import { parsePaymentBreakdown } from '../../utils/paymentStatsUtils';

interface ProcessedPaymentCardProps {
  appointment: {
    id: string;
    scheduledTime: string;
    endTime?: string;
    serviceType: string;
    appointmentType?: string;
    status: string;
    paymentAmount?: number;
    paymentBreakdown?: PaymentEntry[] | string;
    expectedAmount?: number;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
      businessName?: string;
    };
    vehicle?: {
      id: string;
      year: number;
      make: string;
      model: string;
      licensePlate?: string;
    };
  };
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: '💵 Cash',
  E_TRANSFER: '📱 E-Transfer',
  CREDIT_CARD: '💳 Credit Card',
  DEBIT_CARD: '💳 Debit Card',
  CHEQUE: '📝 Cheque',
};

export const ProcessedPaymentCard: React.FC<ProcessedPaymentCardProps> = ({
  appointment,
}) => {
  const breakdown = parsePaymentBreakdown(appointment.paymentBreakdown);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderLeft: 4,
        borderColor:
          appointment.status === 'COMPLETED'
            ? 'success.main'
            : appointment.status === 'IN_PROGRESS'
            ? 'info.main'
            : 'grey.400',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {/* Customer Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            gap: { xs: 1.5, sm: 0 },
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Avatar
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                bgcolor: 'primary.main',
                fontSize: { xs: '1rem', sm: '1.2rem' },
              }}
            >
              {appointment.customer.firstName[0]}
              {appointment.customer.lastName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {appointment.customer.firstName} {appointment.customer.lastName}
              </Typography>
              {appointment.customer.businessName && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                >
                  {appointment.customer.businessName}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                {appointment.customer.phone && (
                  <Chip
                    label={formatPhoneNumber(appointment.customer.phone)}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: { xs: 24, sm: 28 },
                      fontSize: { xs: '0.75rem', sm: '0.813rem' },
                    }}
                  />
                )}
                <Chip
                  icon={getStatusIcon(appointment.status)}
                  label={formatStatusLabel(appointment.status)}
                  color={getStatusColor(appointment.status) as any}
                  size="small"
                  sx={{
                    height: { xs: 24, sm: 28 },
                    fontSize: { xs: '0.75rem', sm: '0.813rem' },
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, pl: { xs: 7, sm: 0 } }}>
            <Typography
              variant="h6"
              color="primary.main"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {formatTimeRange(appointment.scheduledTime, appointment.endTime || '')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Appointment Details */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 600 }}
            >
              Service Details
            </Typography>
            <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BuildIcon
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  color="action"
                />
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                >
                  {formatServiceType(appointment.serviceType)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {appointment.appointmentType === 'MOBILE_SERVICE' ? (
                  <DriveEtaIcon
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    color="action"
                  />
                ) : (
                  <LocationOnIcon
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    color="action"
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                >
                  {appointment.appointmentType === 'MOBILE_SERVICE'
                    ? 'Mobile Service'
                    : 'At Garage'}
                </Typography>
              </Box>
              {appointment.vehicle && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    color="action"
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                  >
                    {appointment.vehicle.year} {appointment.vehicle.make}{' '}
                    {appointment.vehicle.model}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 600 }}
            >
              Payment Details
            </Typography>
            <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                >
                  Amount Paid:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  ${(appointment.paymentAmount || 0).toFixed(2)}
                </Typography>
              </Box>
              {appointment.expectedAmount &&
                appointment.expectedAmount > (appointment.paymentAmount || 0) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                    >
                      Balance Owed:
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="warning.main"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      $
                      {(
                        appointment.expectedAmount - (appointment.paymentAmount || 0)
                      ).toFixed(2)}
                    </Typography>
                  </Box>
                )}
              {breakdown && Array.isArray(breakdown) && breakdown.length > 0 && (
                <Box
                  sx={{
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    p: 1,
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="medium"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Payment Methods:
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {breakdown.map((payment: PaymentEntry) => (
                      <Box
                        key={payment.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {PAYMENT_METHOD_LABELS[payment.method] || payment.method}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          ${payment.amount.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
