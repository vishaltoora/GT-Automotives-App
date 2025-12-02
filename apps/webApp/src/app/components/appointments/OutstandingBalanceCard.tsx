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
  Button,
} from '@mui/material';
import {
  Build as BuildIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
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

interface OutstandingBalanceCardProps {
  appointment: {
    id: string;
    scheduledTime: string;
    endTime?: string;
    serviceType: string;
    appointmentType?: string;
    status: string;
    notes?: string;
    paymentAmount?: number;
    paymentBreakdown?: PaymentEntry[] | string;
    paymentNotes?: string;
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
    employees?: Array<{
      employee: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }>;
  };
  onReceivePayment: (appointment: any) => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: '💵 Cash',
  E_TRANSFER: '📱 E-Transfer',
  CREDIT_CARD: '💳 Credit Card',
  DEBIT_CARD: '💳 Debit Card',
  CHEQUE: '📝 Cheque',
};

export const OutstandingBalanceCard: React.FC<OutstandingBalanceCardProps> = ({
  appointment,
  onReceivePayment,
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
        position: 'relative',
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CarIcon
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
              {/* Assigned Staff - inline with service details */}
              {appointment.employees && appointment.employees.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <PersonIcon
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    color="action"
                  />
                  {appointment.employees.map((emp, index) => (
                    <Typography
                      key={emp.employee.id}
                      variant="body2"
                      sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                    >
                      {emp.employee.firstName} {emp.employee.lastName}
                      {index < appointment.employees!.length - 1 ? ',' : ''}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* Payment Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              textTransform="uppercase"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 600 }}
            >
              Payment Details
            </Typography>
            {appointment.status === 'COMPLETED' &&
            appointment.paymentAmount !== undefined &&
            appointment.paymentAmount !== null ? (
              <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}
                  >
                    Total Paid:
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    ${appointment.paymentAmount.toFixed(2)}
                  </Typography>
                </Box>

                {/* Payment Breakdown */}
                {breakdown && Array.isArray(breakdown) && (
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

                {/* Outstanding Balance */}
                {appointment.expectedAmount &&
                  appointment.expectedAmount > appointment.paymentAmount && (
                    <Box
                      sx={{
                        bgcolor: 'warning.light',
                        borderRadius: 1,
                        p: { xs: 1, sm: 1.5 },
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="warning.dark"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          Outstanding Balance:
                        </Typography>
                        <Typography
                          variant="body1"
                          color="warning.dark"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          ${(appointment.expectedAmount - appointment.paymentAmount).toFixed(2)}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        fullWidth
                        startIcon={
                          <MoneyIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                        }
                        onClick={() => onReceivePayment(appointment)}
                        sx={{
                          color: 'white',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: { xs: 0.5, sm: 0.75 },
                          '&:hover': {
                            bgcolor: 'warning.dark',
                          },
                        }}
                      >
                        Receive Payment
                      </Button>
                    </Box>
                  )}

                {/* Payment Notes */}
                {appointment.paymentNotes && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontStyle="italic">
                      Note: {appointment.paymentNotes}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No payment recorded yet
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Notes */}
        {appointment.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                Notes
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {appointment.notes}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
