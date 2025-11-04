import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  DirectionsCar as DirectionsCarIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  AttachMoney as AttachMoneyIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { formatTimeRange } from '../../utils/timeFormat';
import { PaymentDialog } from './PaymentDialog';
import { appointmentService } from '../../services/appointment.service';
import {
  AppointmentCard,
  formatPhoneNumber,
  getStatusColor,
  getStatusIcon,
  formatStatusLabel,
  formatServiceType,
} from './AppointmentCard';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
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

interface DayAppointmentsDialogProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  appointments: Appointment[];
  onEditAppointment?: (appointment: Appointment) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
  onStatusChange?: (appointmentId: string, newStatus: string, paymentData?: any) => void;
  onAddAppointment?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`day-appointments-tabpanel-${index}`}
      aria-labelledby={`day-appointments-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export const DayAppointmentsDialog: React.FC<DayAppointmentsDialogProps> = ({
  open,
  onClose,
  date,
  appointments = [],
  onEditAppointment,
  onDeleteAppointment,
  onStatusChange,
  onAddAppointment,
}) => {
  const { getToken } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [sendingEOD, setSendingEOD] = useState(false);
  const [paymentsProcessed, setPaymentsProcessed] = useState<Appointment[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch payments processed on this date
  React.useEffect(() => {
    if (open && date) {
      fetchPaymentsProcessed();
    }
  }, [open, date]);

  const fetchPaymentsProcessed = async () => {
    if (!date) return;

    try {
      const payments = await appointmentService.getByPaymentDate(date);
      setPaymentsProcessed(payments);
    } catch (error) {
      console.error('Error fetching payments processed:', error);
      setPaymentsProcessed([]);
    }
  };

  // Sort scheduled appointments by time
  const sortedAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return [...appointments].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [appointments]);

  // Filter scheduled appointments by location type
  const atGarageAppointments = useMemo(() => {
    return sortedAppointments.filter(
      (apt) => !apt.appointmentType || apt.appointmentType === 'AT_GARAGE'
    );
  }, [sortedAppointments]);

  const mobileServiceAppointments = useMemo(() => {
    return sortedAppointments.filter(
      (apt) => apt.appointmentType === 'MOBILE_SERVICE'
    );
  }, [sortedAppointments]);

  // Sort payments processed by time
  const sortedPayments = useMemo(() => {
    if (!paymentsProcessed || paymentsProcessed.length === 0) return [];
    return [...paymentsProcessed].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [paymentsProcessed]);

  // Filter payments by type
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

  // Calculate statistics - SAME AS DaySummary page
  const stats = useMemo(() => {
    // Scheduled appointments stats
    const totalDuration = sortedAppointments.reduce(
      (sum, apt) => sum + apt.duration,
      0
    );
    const statusCounts = sortedAppointments.reduce((acc, apt) => {
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
      total: sortedAppointments.length,
      totalDuration,
      totalHours: (totalDuration / 60).toFixed(1),
      statusCounts,

      // Tab counts for scheduled appointments
      atGarage: atGarageAppointments.length,
      mobileService: mobileServiceAppointments.length,

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
  }, [sortedAppointments, sortedPayments, atGarageAppointments, mobileServiceAppointments, atGaragePayments, mobileServicePayments]);

  // Check if current time is within EOD send window (currently disabled - allows all times)
  const isEODSendAllowed = () => {
    return true; // Enabled for all times during testing
    // const now = new Date();
    // const currentHour = now.getHours();
    // // Allow between 9 PM (21:00) and 11:59 PM, or between 12 AM and 7 AM
    // return currentHour >= 21 || currentHour < 7;
  };

  // Early return AFTER all hooks have been called
  if (!date) return null;

  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleReceivePayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!selectedAppointment || !onStatusChange) return;

    let updateData;

    if (isEditMode) {
      // Edit mode: Replace existing payment data
      updateData = {
        totalAmount: paymentData.totalAmount,
        payments: paymentData.payments,
        paymentNotes: paymentData.paymentNotes,
        expectedAmount: paymentData.expectedAmount,
      };
    } else {
      // Add mode: Merge with existing payment data
      const currentTotal = selectedAppointment.paymentAmount || 0;
      const newTotal = currentTotal + paymentData.totalAmount;

      // Merge existing and new payment breakdown
      let existingBreakdown = selectedAppointment.paymentBreakdown;
      if (typeof existingBreakdown === 'string') {
        try {
          existingBreakdown = JSON.parse(existingBreakdown);
        } catch (e) {
          existingBreakdown = [];
        }
      }
      const mergedBreakdown = [...(existingBreakdown || []), ...paymentData.payments];

      updateData = {
        totalAmount: newTotal,
        payments: mergedBreakdown,
        paymentNotes: paymentData.paymentNotes
          ? `${selectedAppointment.paymentNotes || ''}\n${paymentData.paymentNotes}`.trim()
          : selectedAppointment.paymentNotes,
        expectedAmount: selectedAppointment.expectedAmount,
      };
    }

    // Call the status change handler (it won't change status, just update payment)
    await onStatusChange(selectedAppointment.id, selectedAppointment.status, updateData);

    setPaymentDialogOpen(false);
    setIsEditMode(false);
    setSelectedAppointment(null);
  };

  const handleSendEOD = async () => {
    try {
      setSendingEOD(true);
      const token = await getToken();

      // Prepare EOD summary data
      const eodData = {
        date: format(date, 'yyyy-MM-dd'),
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

  const handleEditPayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditMode(true);
    setPaymentDialogOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      hideBackdrop
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          height: { xs: '100dvh', sm: '85vh' }, // Use dvh for better mobile viewport handling
          maxHeight: { xs: '100dvh', sm: '85vh' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100vw', sm: '100%' },
          display: 'flex',
          flexDirection: 'column',
          // Add safe area padding for iPhone notch and home indicator
          paddingBottom: { xs: 'env(safe-area-inset-bottom)', sm: 0 },
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: { xs: 'stretch', sm: 'center' },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon sx={{ color: 'white' }} />
          <Box>
            <Typography variant="h6" component="div" sx={{ color: 'white' }}>
              {formattedDate}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {stats.total} {stats.total === 1 ? 'appointment' : 'appointments'} •{' '}
              {stats.totalHours} hours
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 3 } }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="appointment type tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 64 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
            },
            '& .MuiTab-iconWrapper': {
              fontSize: { xs: '1rem', sm: '1.25rem' },
            },
          }}
        >
          <Tab
            icon={<LocationOnIcon />}
            iconPosition="start"
            label={`At Garage (${stats.atGarage})`}
            id="day-appointments-tab-0"
            aria-controls="day-appointments-tabpanel-0"
          />
          <Tab
            icon={<DriveEtaIcon />}
            iconPosition="start"
            label={`Mobile Service (${stats.mobileService})`}
            id="day-appointments-tab-1"
            aria-controls="day-appointments-tabpanel-1"
          />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="Day Summary"
            id="day-appointments-tab-2"
            aria-controls="day-appointments-tabpanel-2"
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ px: 3, flex: 1, overflow: 'auto' }}>
        {/* At Garage Tab */}
        <TabPanel value={currentTab} index={0}>
          {atGarageAppointments.length === 0 ? (
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
              <LocationOnIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No garage appointments
              </Typography>
              <Typography variant="body2">
                There are no at-garage appointments for this date.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {atGarageAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEditAppointment}
                  onDelete={onDeleteAppointment}
                  onStatusChange={onStatusChange}
                />
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Mobile Service Tab */}
        <TabPanel value={currentTab} index={1}>
          {mobileServiceAppointments.length === 0 ? (
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
              <DriveEtaIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No mobile service appointments
              </Typography>
              <Typography variant="body2">
                There are no mobile service appointments for this date.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {mobileServiceAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onEdit={onEditAppointment}
                  onDelete={onDeleteAppointment}
                  onStatusChange={onStatusChange}
                />
              ))}
            </Stack>
          )}
        </TabPanel>

        {/* Day Summary Tab */}
        <TabPanel value={currentTab} index={2}>
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
                      Payment Summary - Collected Today
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stats.paymentsProcessedCount} payment{stats.paymentsProcessedCount === 1 ? '' : 's'} processed today
                    </Typography>
                  </Box>
                  <Button
                    variant={sendingEOD || stats.totalPayments === 0 || !isEODSendAllowed() ? "outlined" : "contained"}
                    color="primary"
                    size="small"
                    startIcon={sendingEOD ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                    onClick={handleSendEOD}
                    disabled={sendingEOD || stats.totalPayments === 0 || !isEODSendAllowed()}
                    sx={{
                      minWidth: 120,
                      '&.Mui-disabled': {
                        borderColor: 'action.disabled',
                        color: 'text.disabled',
                      }
                    }}
                    title={
                      !isEODSendAllowed()
                        ? 'EOD summary can only be sent between 9 PM and 7 AM'
                        : stats.totalPayments === 0
                        ? 'No payments to send'
                        : ''
                    }
                  >
                    {sendingEOD
                      ? 'Sending...'
                      : !isEODSendAllowed()
                      ? 'Available at 9PM'
                      : 'Send EOD'}
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
                    {/* Cash */}
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

                    {/* E-Transfer */}
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

                    {/* Credit Card */}
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

                    {/* Debit Card */}
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

                    {/* Cheque */}
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

            {/* At Garage Breakdown Card */}
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
                      {stats.atGaragePaymentsByMethod['CASH'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                💵 Cash
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.atGaragePaymentsByMethod['CASH'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.atGaragePaymentsByMethod['E_TRANSFER'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📱 E-Transfer
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.atGaragePaymentsByMethod['E_TRANSFER'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.atGaragePaymentsByMethod['CREDIT_CARD'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                💳 Credit Card
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.atGaragePaymentsByMethod['CREDIT_CARD'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.atGaragePaymentsByMethod['DEBIT_CARD'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                💳 Debit Card
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.atGaragePaymentsByMethod['DEBIT_CARD'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.atGaragePaymentsByMethod['CHEQUE'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📝 Cheque
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.atGaragePaymentsByMethod['CHEQUE'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Mobile Service Breakdown Card */}
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
                      {stats.mobileServicePaymentsByMethod['CASH'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                💵 Cash
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.mobileServicePaymentsByMethod['CASH'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.mobileServicePaymentsByMethod['E_TRANSFER'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📱 E-Transfer
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.mobileServicePaymentsByMethod['E_TRANSFER'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.mobileServicePaymentsByMethod['CREDIT_CARD'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                💳 Credit Card
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.mobileServicePaymentsByMethod['CREDIT_CARD'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.mobileServicePaymentsByMethod['DEBIT_CARD'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                💳 Debit Card
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.mobileServicePaymentsByMethod['DEBIT_CARD'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {stats.mobileServicePaymentsByMethod['CHEQUE'] !== undefined && (
                        <Grid size={{ xs: 6, sm: 4 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                📝 Cheque
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                              ${stats.mobileServicePaymentsByMethod['CHEQUE'].toFixed(2)}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Payments Processed Today */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Payments Processed Today ({sortedPayments.length})
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
                  <AttachMoneyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    No payments processed
                  </Typography>
                  <Typography variant="body2">
                    No payments were collected on this date.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {sortedPayments.map((appointment) => {
                    // Check if appointment was scheduled today or in the past
                    const scheduledDate = new Date(appointment.scheduledDate);
                    const selectedDateOnly = new Date(date);
                    selectedDateOnly.setHours(0, 0, 0, 0);
                    scheduledDate.setHours(0, 0, 0, 0);

                    const isScheduledToday = scheduledDate.getTime() === selectedDateOnly.getTime();
                    const scheduledDateDisplay = isScheduledToday
                      ? 'Today'
                      : format(scheduledDate, 'MMM dd, yyyy');

                    return (
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
                                    <DirectionsCarIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} color="action" />
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
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
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
                                    Amount Paid:
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    ${(appointment.paymentAmount || 0).toFixed(2)}
                                  </Typography>
                                </Box>
                                {appointment.expectedAmount && appointment.expectedAmount > (appointment.paymentAmount || 0) && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>
                                      Balance Owed:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                      ${(appointment.expectedAmount - (appointment.paymentAmount || 0)).toFixed(2)}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Grid>

            {/* Customer Cards - Outstanding Balances Only */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'warning.main' }}>
                Customer Details (Outstanding Balance)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {sortedPayments.filter(apt => apt.expectedAmount && apt.expectedAmount > (apt.paymentAmount || 0)).length === 0 ? (
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
                  <BlockIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" gutterBottom>
                    No outstanding balances
                  </Typography>
                  <Typography variant="body2">
                    All payments have been collected in full.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {sortedPayments
                    .filter(apt => apt.expectedAmount && apt.expectedAmount > (apt.paymentAmount || 0))
                    .map((appointment) => (
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
                        position: 'relative',
                      }}
                    >
                      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 }, pb: { xs: 6, sm: 7 } }}>
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
                                              {![
                                                'CASH',
                                                'E_TRANSFER',
                                                'CREDIT_CARD',
                                                'DEBIT_CARD',
                                                'CHEQUE',
                                              ].includes(payment.method) && payment.method}
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
                                          $
                                          {(
                                            appointment.expectedAmount - appointment.paymentAmount
                                          ).toFixed(2)}
                                        </Typography>
                                      </Box>
                                      <Button
                                        variant="contained"
                                        color="warning"
                                        size="small"
                                        fullWidth
                                        startIcon={<MoneyIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                                        onClick={() => handleReceivePayment(appointment)}
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
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      fontStyle="italic"
                                    >
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

                        {/* Edit Button - Bottom Right (Absolute Position) */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />}
                          onClick={() => handleEditPayment(appointment)}
                          sx={{
                            position: 'absolute',
                            bottom: { xs: 12, sm: 16 },
                            right: { xs: 12, sm: 20 },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            py: { xs: 0.5, sm: 0.75 },
                            px: { xs: 1.5, sm: 2 },
                          }}
                        >
                          Edit
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Grid> {/* Close Grid size={12} for Customer Details */}
          </Grid> {/* Close outer payment grid */}
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexShrink: 0, // Prevent shrinking on mobile
          minHeight: { xs: 64, sm: 'auto' }, // Ensure minimum touch target height on mobile
          // Add safe area padding for iPhone home indicator
          paddingBottom: { xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2 },
        }}
      >
        <Button
          onClick={onAddAppointment}
          variant="contained"
          color="primary"
          disabled={!onAddAppointment}
          sx={{
            minWidth: { xs: 120, sm: 150 },
            fontWeight: 'bold',
            flex: { xs: 1, sm: 0 }, // Full width on mobile for easier tapping
            fontSize: { xs: '0.813rem', sm: '0.875rem' }, // Smaller text on mobile
            whiteSpace: 'nowrap', // Prevent text wrapping
          }}
        >
          Add Appointment
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: { xs: 1, sm: 0 }, // Full width on mobile for easier tapping
            fontSize: { xs: '0.813rem', sm: '0.875rem' }, // Smaller text on mobile
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Payment Dialog for Receiving Outstanding Balance or Editing Payment */}
      {selectedAppointment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setIsEditMode(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handlePaymentSubmit}
          appointmentId={selectedAppointment.id}
          defaultExpectedAmount={
            isEditMode
              ? selectedAppointment.expectedAmount || 0
              : selectedAppointment.expectedAmount
              ? selectedAppointment.expectedAmount - (selectedAppointment.paymentAmount || 0)
              : 0
          }
          existingPayments={
            isEditMode && selectedAppointment.paymentBreakdown
              ? typeof selectedAppointment.paymentBreakdown === 'string'
                ? JSON.parse(selectedAppointment.paymentBreakdown)
                : selectedAppointment.paymentBreakdown
              : undefined
          }
          existingNotes={isEditMode ? selectedAppointment.paymentNotes : ''}
          isEditMode={isEditMode}
        />
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
    </Dialog>
  );
};
