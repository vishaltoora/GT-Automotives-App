import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  ChevronLeft,
  ChevronRight,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, subDays, isToday } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { colors } from '../../theme/colors';
import {
  formatPhoneNumber,
  getStatusColor,
  getStatusIcon,
  formatStatusLabel,
  formatServiceType,
} from '../../components/appointments/AppointmentCard';
import { formatTimeRange } from '../../utils/timeFormat';
import { appointmentService } from '../../services/appointment.service';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface PaymentEntry {
  id: string;
  method: string;
  amount: number;
}

interface Appointment {
  id: string;
  customerId: string;
  scheduledDate: string | Date;
  scheduledTime: string;
  endTime?: string;
  duration: number;
  serviceType: string;
  appointmentType?: string;
  status: string;
  notes?: string;
  paymentAmount?: number;
  paymentBreakdown?: PaymentEntry[];
  paymentNotes?: string;
  expectedAmount?: number;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
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
}

export function DaySummary() {
  const { getToken } = useAuth(); // Still needed for EOD email endpoint
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledAppointments, setScheduledAppointments] = useState<Appointment[]>([]); // Appointments scheduled for this date
  const [paymentsProcessed, setPaymentsProcessed] = useState<Appointment[]>([]); // Payments processed on this date
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingEOD, setSendingEOD] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch both scheduled appointments and payments processed for the selected date
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Fetch both scheduled appointments and payments processed on this date
      const [scheduled, payments] = await Promise.all([
        // Appointments scheduled for this date
        appointmentService.getAppointments({
          startDate: dateStr,
          endDate: dateStr,
        }),
        // Payments processed on this date (regardless of appointment date)
        appointmentService.getByPaymentDate(selectedDate),
      ]);

      setScheduledAppointments(scheduled);
      setPaymentsProcessed(payments);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Sort scheduled appointments by time
  const sortedScheduled = useMemo(() => {
    if (!scheduledAppointments || scheduledAppointments.length === 0) return [];
    return [...scheduledAppointments].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [scheduledAppointments]);

  // Sort payments processed by time
  const sortedPayments = useMemo(() => {
    if (!paymentsProcessed || paymentsProcessed.length === 0) return [];
    return [...paymentsProcessed].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [paymentsProcessed]);

  // Filter payments by appointment type
  const atGaragePayments = useMemo(() => {
    return sortedPayments.filter(
      (apt) => !apt.appointmentType || apt.appointmentType === 'AT_GARAGE'
    );
  }, [sortedPayments]);

  const mobileServicePayments = useMemo(() => {
    return sortedPayments.filter(
      (apt) => apt.appointmentType === 'MOBILE_SERVICE'
    );
  }, [sortedPayments]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Scheduled appointments stats
    const totalDuration = sortedScheduled.reduce(
      (sum, apt) => sum + apt.duration,
      0
    );
    const statusCounts = sortedScheduled.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment statistics - based on payments PROCESSED today (not scheduled)
    const totalPayments = sortedPayments.reduce(
      (sum, apt) => sum + (apt.paymentAmount || 0),
      0
    );

    const totalExpected = sortedPayments.reduce(
      (sum, apt) => sum + (apt.expectedAmount || apt.paymentAmount || 0),
      0
    );

    const totalOwed = sortedPayments.reduce(
      (sum, apt) => {
        const expected = apt.expectedAmount || 0;
        const paid = apt.paymentAmount || 0;
        return sum + Math.max(0, expected - paid);
      },
      0
    );

    // Calculate payments by method from breakdown - FROM PAYMENTS PROCESSED TODAY
    const paymentsByMethod: Record<string, number> = {};
    sortedPayments.forEach((apt) => {
      let breakdown = apt.paymentBreakdown;
      if (typeof breakdown === 'string') {
        try {
          breakdown = JSON.parse(breakdown);
        } catch (e) {
          breakdown = undefined;
        }
      }

      if (breakdown && Array.isArray(breakdown)) {
        breakdown.forEach((payment: PaymentEntry) => {
          const method = payment.method || 'CASH';
          paymentsByMethod[method] = (paymentsByMethod[method] || 0) + (payment.amount || 0);
        });
      } else if (apt.paymentAmount) {
        paymentsByMethod['CASH'] = (paymentsByMethod['CASH'] || 0) + apt.paymentAmount;
      }
    });

    // Calculate At Garage payment statistics - FROM PAYMENTS PROCESSED TODAY
    const atGarageTotalPayments = atGaragePayments.reduce(
      (sum, apt) => sum + (apt.paymentAmount || 0),
      0
    );

    const atGaragePaymentsByMethod: Record<string, number> = {};
    atGaragePayments.forEach((apt) => {
      let breakdown = apt.paymentBreakdown;
      if (typeof breakdown === 'string') {
        try {
          breakdown = JSON.parse(breakdown);
        } catch (e) {
          breakdown = undefined;
        }
      }

      if (breakdown && Array.isArray(breakdown)) {
        breakdown.forEach((payment: PaymentEntry) => {
          const method = payment.method || 'CASH';
          atGaragePaymentsByMethod[method] = (atGaragePaymentsByMethod[method] || 0) + (payment.amount || 0);
        });
      } else if (apt.paymentAmount) {
        atGaragePaymentsByMethod['CASH'] = (atGaragePaymentsByMethod['CASH'] || 0) + apt.paymentAmount;
      }
    });

    // Calculate Mobile Service payment statistics - FROM PAYMENTS PROCESSED TODAY
    const mobileServiceTotalPayments = mobileServicePayments.reduce(
      (sum, apt) => sum + (apt.paymentAmount || 0),
      0
    );

    const mobileServicePaymentsByMethod: Record<string, number> = {};
    mobileServicePayments.forEach((apt) => {
      let breakdown = apt.paymentBreakdown;
      if (typeof breakdown === 'string') {
        try {
          breakdown = JSON.parse(breakdown);
        } catch (e) {
          breakdown = undefined;
        }
      }

      if (breakdown && Array.isArray(breakdown)) {
        breakdown.forEach((payment: PaymentEntry) => {
          const method = payment.method || 'CASH';
          mobileServicePaymentsByMethod[method] = (mobileServicePaymentsByMethod[method] || 0) + (payment.amount || 0);
        });
      } else if (apt.paymentAmount) {
        mobileServicePaymentsByMethod['CASH'] = (mobileServicePaymentsByMethod['CASH'] || 0) + apt.paymentAmount;
      }
    });

    return {
      // Scheduled appointments info
      total: sortedScheduled.length,
      totalDuration,
      totalHours: (totalDuration / 60).toFixed(1),
      statusCounts,

      // Payments processed today info
      paymentsProcessedCount: sortedPayments.length,
      totalPayments,
      totalExpected,
      totalOwed,
      paymentsByMethod,
      atGaragePayments: atGarageTotalPayments,
      completedAtGarage: atGaragePayments.length,
      atGaragePaymentsByMethod,
      mobileServicePayments: mobileServiceTotalPayments,
      completedMobileService: mobileServicePayments.length,
      mobileServicePaymentsByMethod,
    };
  }, [sortedScheduled, sortedPayments, atGaragePayments, mobileServicePayments]);

  const handleSendEOD = async () => {
    try {
      setSendingEOD(true);
      const token = await getToken();

      const eodData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        totalPayments: stats.totalPayments,
        totalOwed: stats.totalOwed,
        paymentsByMethod: stats.paymentsByMethod,
        atGaragePayments: stats.atGaragePayments,
        atGarageCount: stats.completedAtGarage,
        atGaragePaymentsByMethod: stats.atGaragePaymentsByMethod,
        mobileServicePayments: stats.mobileServicePayments,
        mobileServiceCount: stats.completedMobileService,
        mobileServicePaymentsByMethod: stats.mobileServicePaymentsByMethod,
      };

      await axios.post(
        `${API_URL}/api/email/send-eod-summary`,
        eodData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      setSnackbar({
        open: true,
        message: 'EOD summary email sent successfully to admin users!',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Error sending EOD summary:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to send EOD summary',
        severity: 'error',
      });
    } finally {
      setSendingEOD(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  const isViewingToday = isToday(selectedDate);
  const dateLabel = isViewingToday ? 'Today' : format(selectedDate, 'MMMM d, yyyy');

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main, mb: 1 }}>
            Day Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daily appointment and payment summary
          </Typography>
        </Box>

        {/* Date Navigation */}
        <Card sx={{ mb: 3, border: `1px solid ${colors.neutral[200]}` }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={handlePreviousDay} color="primary">
                    <ChevronLeft />
                  </IconButton>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      {formattedDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.total} {stats.total === 1 ? 'appointment' : 'appointments'} •{' '}
                      {stats.totalHours} hours
                    </Typography>
                  </Box>
                  <IconButton onClick={handleNextDay} color="primary">
                    <ChevronRight />
                  </IconButton>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(newValue) => newValue && setSelectedDate(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleToday}
                    disabled={isToday(selectedDate)}
                  >
                    Today
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* Payment Summary */}
            <Grid size={12}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {/* Header */}
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Payment Summary - Collected {isViewingToday ? 'Today' : `on ${dateLabel}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.paymentsProcessedCount} payment{stats.paymentsProcessedCount === 1 ? '' : 's'} {isViewingToday ? 'processed today' : `on this date`}
                    </Typography>
                  </Box>
                  <Button
                    variant={sendingEOD || stats.totalPayments === 0 ? "outlined" : "contained"}
                    color="primary"
                    size="small"
                    startIcon={sendingEOD ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    onClick={handleSendEOD}
                    disabled={sendingEOD || stats.totalPayments === 0}
                    sx={{
                      minWidth: 120,
                      '&.Mui-disabled': {
                        borderColor: 'action.disabled',
                        color: 'text.disabled',
                      }
                    }}
                  >
                    {sendingEOD ? 'Sending...' : 'Send EOD'}
                  </Button>
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
                        ${stats.totalPayments.toFixed(2)}
                      </Typography>
                    </Grid>
                    {stats.totalOwed > 0 && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Outstanding Balance
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" color="warning.main">
                          ${stats.totalOwed.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Partial payments owed
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Payment Method Breakdown */}
                {Object.keys(stats.paymentsByMethod).length > 0 && (
                  <Grid container spacing={2}>
                    {stats.paymentsByMethod['CASH'] !== undefined && (
                      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              💵 Cash
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            ${stats.paymentsByMethod['CASH'].toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {stats.paymentsByMethod['E_TRANSFER'] !== undefined && (
                      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              📱 E-Transfer
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            ${stats.paymentsByMethod['E_TRANSFER'].toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {stats.paymentsByMethod['CREDIT_CARD'] !== undefined && (
                      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              💳 Credit Card
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            ${stats.paymentsByMethod['CREDIT_CARD'].toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {stats.paymentsByMethod['DEBIT_CARD'] !== undefined && (
                      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              💳 Debit Card
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            ${stats.paymentsByMethod['DEBIT_CARD'].toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {stats.paymentsByMethod['CHEQUE'] !== undefined && (
                      <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              📝 Cheque
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            ${stats.paymentsByMethod['CHEQUE'].toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* At Garage Breakdown */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                  <LocationOnIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    At Garage
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stats.completedAtGarage} completed {stats.completedAtGarage === 1 ? 'appointment' : 'appointments'}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: 2 }}>
                  ${stats.atGaragePayments.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', mb: 2 }}>
                  Total payments collected
                </Typography>

                {/* Payment Method Breakdown */}
                {Object.keys(stats.atGaragePaymentsByMethod).length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="medium" display="block" sx={{ mb: 1 }}>
                      Payment Methods:
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(stats.atGaragePaymentsByMethod).map(([method, amount]) => (
                        <Grid size={{ xs: 6, sm: 4 }} key={method}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {method === 'CASH' && '💵 Cash'}
                              {method === 'E_TRANSFER' && '📱 E-Transfer'}
                              {method === 'CREDIT_CARD' && '💳 Credit'}
                              {method === 'DEBIT_CARD' && '💳 Debit'}
                              {method === 'CHEQUE' && '📝 Cheque'}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              ${amount.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Mobile Service Breakdown */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                  <DriveEtaIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Mobile Service
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stats.completedMobileService} completed {stats.completedMobileService === 1 ? 'appointment' : 'appointments'}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: 2 }}>
                  ${stats.mobileServicePayments.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', mb: 2 }}>
                  Total payments collected
                </Typography>

                {/* Payment Method Breakdown */}
                {Object.keys(stats.mobileServicePaymentsByMethod).length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="medium" display="block" sx={{ mb: 1 }}>
                      Payment Methods:
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(stats.mobileServicePaymentsByMethod).map(([method, amount]) => (
                        <Grid size={{ xs: 6, sm: 4 }} key={method}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {method === 'CASH' && '💵 Cash'}
                              {method === 'E_TRANSFER' && '📱 E-Transfer'}
                              {method === 'CREDIT_CARD' && '💳 Credit'}
                              {method === 'DEBIT_CARD' && '💳 Debit'}
                              {method === 'CHEQUE' && '📝 Cheque'}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              ${amount.toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Outstanding Balances Section */}
            {sortedPayments.filter(apt => apt.expectedAmount && apt.expectedAmount > (apt.paymentAmount || 0)).length > 0 && (
              <Grid size={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'warning.main', fontWeight: 600 }}>
                  Customers with Outstanding Balance ({sortedPayments.filter(apt => apt.expectedAmount && apt.expectedAmount > (apt.paymentAmount || 0)).length})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {sortedPayments
                    .filter(apt => apt.expectedAmount && apt.expectedAmount > (apt.paymentAmount || 0))
                    .map((appointment) => {
                      const outstandingBalance = (appointment.expectedAmount || 0) - (appointment.paymentAmount || 0);
                      return (
                        <Card
                          key={appointment.id}
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            borderLeft: 4,
                            borderColor: 'warning.main',
                            bgcolor: 'warning.lighter',
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                  {appointment.customer.firstName[0]}
                                  {appointment.customer.lastName[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold">
                                    {appointment.customer.firstName} {appointment.customer.lastName}
                                  </Typography>
                                  {appointment.customer.businessName && (
                                    <Typography variant="body2" color="text.secondary">
                                      {appointment.customer.businessName}
                                    </Typography>
                                  )}
                                  {appointment.customer.phone && (
                                    <Chip
                                      label={formatPhoneNumber(appointment.customer.phone)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ mt: 0.5 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Outstanding Balance
                                </Typography>
                                <Typography variant="h5" color="warning.main" fontWeight="bold">
                                  ${outstandingBalance.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Grid container spacing={2}>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Expected Amount
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  ${(appointment.expectedAmount || 0).toFixed(2)}
                                </Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Amount Paid
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="success.main">
                                  ${(appointment.paymentAmount || 0).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                            <Box sx={{ mt: 1.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Service: {formatServiceType(appointment.serviceType)} • {formatTimeRange(appointment.scheduledTime, appointment.endTime || '')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                </Stack>
              </Grid>
            )}

            {/* Payments Processed */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Payments {isViewingToday ? 'Processed Today' : 'on ' + dateLabel} ({sortedPayments.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {sortedPayments.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6,
                    color: 'text.secondary',
                  }}
                >
                  <MoneyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    No payments {isViewingToday ? 'processed' : 'recorded'}
                  </Typography>
                  <Typography variant="body2">
                    No payments were {isViewingToday ? 'collected today' : 'collected on this date'}.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {sortedPayments.map((appointment) => (
                    <Card
                      key={appointment.id}
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
                              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                {appointment.customer.firstName}{' '}
                                {appointment.customer.lastName}
                              </Typography>
                              {appointment.customer.businessName && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
                                  {appointment.customer.businessName}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                {appointment.customer.phone && (
                                  <Chip
                                    label={formatPhoneNumber(appointment.customer.phone)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: { xs: 24, sm: 28 }, fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                                  />
                                )}
                                <Chip
                                  icon={getStatusIcon(appointment.status)}
                                  label={formatStatusLabel(appointment.status)}
                                  color={getStatusColor(appointment.status) as any}
                                  size="small"
                                  sx={{ height: { xs: 24, sm: 28 }, fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                                />
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, pl: { xs: 7, sm: 0 } }}>
                            <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                              {formatTimeRange(
                                appointment.scheduledTime,
                                appointment.endTime || ''
                              )}
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
                                <BuildIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} color="action" />
                                <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
                                  {formatServiceType(appointment.serviceType)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                {appointment.appointmentType === 'MOBILE_SERVICE' ? (
                                  <DriveEtaIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} color="action" />
                                ) : (
                                  <LocationOnIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} color="action" />
                                )}
                                <Typography variant="body2" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
                                  {appointment.appointmentType === 'MOBILE_SERVICE'
                                    ? 'Mobile Service'
                                    : 'At Garage'}
                                </Typography>
                              </Box>
                              {appointment.vehicle && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CarIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} color="action" />
                                  <Typography variant="body2" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
                                    {appointment.vehicle.year} {appointment.vehicle.make}{' '}
                                    {appointment.vehicle.model}
                                  </Typography>
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
                            {appointment.status === 'COMPLETED' && appointment.paymentAmount ? (
                              <Box sx={{ mt: { xs: 0.5, sm: 1 } }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
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
                                {(() => {
                                  let breakdown = appointment.paymentBreakdown;
                                  if (typeof breakdown === 'string') {
                                    try {
                                      breakdown = JSON.parse(breakdown);
                                    } catch (e) {
                                      breakdown = undefined;
                                    }
                                  }
                                  return breakdown && Array.isArray(breakdown) ? (
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
                                            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                              {payment.method === 'CASH' && '💵 Cash'}
                                              {payment.method === 'E_TRANSFER' && '📱 E-Transfer'}
                                              {payment.method === 'CREDIT_CARD' && '💳 Credit Card'}
                                              {payment.method === 'DEBIT_CARD' && '💳 Debit Card'}
                                              {payment.method === 'CHEQUE' && '📝 Cheque'}
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
                                  ) : null;
                                })()}

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
                                          $
                                          {(
                                            appointment.expectedAmount - appointment.paymentAmount
                                          ).toFixed(2)}
                                        </Typography>
                                      </Box>
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

                        {/* Employee Assignment */}
                        {appointment.employees && appointment.employees.length > 0 && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                textTransform="uppercase"
                              >
                                Assigned Staff
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                {appointment.employees.map((emp) => (
                                  <Chip
                                    key={emp.employee.id}
                                    icon={<PersonIcon />}
                                    label={`${emp.employee.firstName} ${emp.employee.lastName}`}
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                  />
                                ))}
                              </Box>
                            </Box>
                          </>
                        )}

                        {/* Notes */}
                        {appointment.notes && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                textTransform="uppercase"
                              >
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
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
        )}

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
