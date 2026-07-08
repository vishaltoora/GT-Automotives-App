import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People,
  Inventory,
  Receipt,
  Schedule,
  Build,
  Assignment,
  AccessTime,
  Description,
  Work,
  CalendarMonth,
  TireRepair,
  Event,
  AttachMoney,
  AssignmentTurnedIn,
  CarRepair,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {
  DashboardActionGroups,
  DashboardActionGroup,
} from '../../components/dashboard/DashboardActionGroups';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  appointmentService,
  Appointment,
} from '../../requests/appointment.requests';
import { colors } from '../../theme/colors';
import { CreateJobDialog } from '../../components/payroll/CreateJobDialog';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import QuotationDialog from '../../components/quotations/QuotationDialog';
import { CustomerDialog } from '../../components/customers/CustomerDialog';
import { AppointmentDialog } from '../../components/appointments/AppointmentDialog';
import TireDialog from '../../components/inventory/TireDialog';
import { QuickTireSaleDialog } from '../../components/tire-sales';
import { timeClockService } from '../../requests/time-clock.requests';
import { TimeEntryDto } from '@gt-automotive/data';

export function StaffDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [myJobDialogOpen, setMyJobDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [tireDialogOpen, setTireDialogOpen] = useState(false);
  const [tireSaleDialogOpen, setTireSaleDialogOpen] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntryDto | null>(
    null
  );
  const [clockActionLoading, setClockActionLoading] = useState(false);

  useEffect(() => {
    loadTodayAppointments();
    loadCurrentTimeEntry();
  }, []);

  const loadCurrentTimeEntry = async () => {
    try {
      setCurrentTimeEntry(await timeClockService.getMyCurrent());
    } catch (error) {
      console.error('Failed to load current time entry:', error);
    }
  };

  const handleQuickClockIn = async () => {
    if (currentTimeEntry) {
      window.location.href = '/staff/time-clock';
      return;
    }

    try {
      setClockActionLoading(true);
      setCurrentTimeEntry(await timeClockService.clockIn());
    } catch (error) {
      console.error('Failed to clock in:', error);
    } finally {
      setClockActionLoading(false);
    }
  };

  const loadTodayAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const data = await appointmentService.getTodayAppointments();

      // Staff can see all appointments (no filtering)
      setTodayAppointments(data);
    } catch (error) {
      console.error('Failed to load today appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatTimeRange = (
    startTime: string,
    endTime?: string,
    duration?: number
  ) => {
    const start = formatTime(startTime);

    // If endTime is provided, use it
    if (endTime) {
      const end = formatTime(endTime);
      return `${start} - ${end}`;
    }

    // Otherwise calculate from duration
    if (duration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + duration;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes
        .toString()
        .padStart(2, '0')}`;
      const end = formatTime(endTimeStr);
      return `${start} - ${end}`;
    }

    return start;
  };

  const formatPhone = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as XXX-XXX-XXXX
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }

    // Return original if not 10 digits
    return phone;
  };

  const clockLabel = clockActionLoading
    ? 'Clocking In...'
    : currentTimeEntry
    ? 'Clocked In'
    : 'Clock In';

  const actionGroups: DashboardActionGroup[] = [
    {
      title: 'My Work',
      items: [
        {
          key: 'clock',
          label: clockLabel,
          icon: <AccessTime />,
          color: colors.semantic.success,
          onClick: handleQuickClockIn,
        },
        {
          key: 'time-clock',
          label: 'Time Clock',
          icon: <Schedule />,
          color: colors.semantic.info,
          to: '/staff/time-clock',
        },
        {
          key: 'add-my-job',
          label: 'Add My Job',
          icon: <Assignment />,
          color: '#9c27b0',
          onClick: () => setMyJobDialogOpen(true),
        },
        {
          key: 'my-jobs',
          label: 'My Jobs',
          icon: <Work />,
          color: '#9c27b0',
          to: '/staff/jobs',
        },
        {
          key: 'my-earnings',
          label: 'My Earnings',
          icon: <AttachMoney />,
          color: colors.semantic.success,
          to: '/staff/earnings',
        },
        {
          key: 'my-commission',
          label: 'My Commission',
          icon: <TireRepair />,
          color: colors.tire?.new || '#1976d2',
          to: '/staff/commission',
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          key: 'appointments',
          label: 'Appointments',
          icon: <CalendarMonth />,
          color: colors.primary.lighter,
          to: '/staff/appointments',
        },
        {
          key: 'repair-orders',
          label: 'Repair Orders',
          icon: <CarRepair />,
          color: colors.secondary.main,
          to: '/staff/repair-orders',
        },
        {
          key: 'inspections',
          label: 'Inspections',
          icon: <AssignmentTurnedIn />,
          color: colors.semantic.info,
          to: '/staff/inspections',
        },
        {
          key: 'availability',
          label: 'Availability',
          icon: <Event />,
          color: colors.semantic.warning,
          to: '/staff/availability',
        },
      ],
    },
    {
      title: 'Sales & Billing',
      items: [
        {
          key: 'tire-sale',
          label: 'Quick Tire Sale',
          icon: <TireRepair />,
          color: colors.tire?.new || '#1976d2',
          onClick: () => setTireSaleDialogOpen(true),
        },
        {
          key: 'new-invoice',
          label: 'New Invoice',
          icon: <Receipt />,
          color: colors.secondary.main,
          onClick: () => setInvoiceDialogOpen(true),
        },
        {
          key: 'invoices',
          label: 'Invoices',
          icon: <Receipt />,
          color: colors.secondary.dark,
          to: '/staff/invoices',
        },
        {
          key: 'new-quote',
          label: 'New Quote',
          icon: <Description />,
          color: colors.semantic.info,
          onClick: () => setQuotationDialogOpen(true),
        },
        {
          key: 'quotations',
          label: 'Quotations',
          icon: <Description />,
          color: colors.primary.main,
          to: '/staff/quotations',
        },
      ],
    },
    {
      title: 'Inventory & Setup',
      items: [
        {
          key: 'inventory',
          label: 'Inventory',
          icon: <Inventory />,
          color: colors.primary.main,
          to: '/staff/inventory',
        },
        {
          key: 'add-tires',
          label: 'Add Tires',
          icon: <Build />,
          color: colors.secondary.main,
          onClick: () => setTireDialogOpen(true),
        },
        {
          key: 'add-customer',
          label: 'Add Customer',
          icon: <People />,
          color: colors.primary.lighter,
          onClick: () => setCustomerDialogOpen(true),
        },
      ],
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 0 } }}>
      {/* Waving hand animation - global for both mobile and desktop */}
      <style>
        {`
          @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            10%, 30% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            40%, 60% { transform: rotate(14deg); }
            50% { transform: rotate(-8deg); }
            70% { transform: rotate(0deg); }
          }
        `}
      </style>

      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        {isMobile ? (
          /* Mobile Header */
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: colors.secondary.main,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}
              >
                {user?.firstName?.charAt(0) || 'S'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: colors.secondary.main }}
                >
                  Welcome {user?.firstName || 'Staff'}{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      animation: 'wave 1.5s ease-in-out infinite',
                      transformOrigin: '70% 70%',
                    }}
                  >
                    👋
                  </span>
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <AccessTime sx={{ fontSize: 12 }} />
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          /* Desktop Header */
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: colors.secondary.main,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {user?.firstName?.charAt(0) || 'S'}
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: colors.secondary.main }}
                >
                  Welcome Back {user?.firstName || 'Staff Member'}{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      animation: 'wave 1.5s ease-in-out infinite',
                      transformOrigin: '70% 70%',
                    }}
                  >
                    👋
                  </span>
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AccessTime sx={{ fontSize: 16 }} />
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="Operations"
              color="secondary"
              icon={<Build />}
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Box>
        )}
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        {/* Quick Actions Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardActionGroups groups={actionGroups} />
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Today's Schedule */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 3 },
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              mb: { xs: 1.5, sm: 3 },
              background: `linear-gradient(135deg, ${colors.semantic.info}10 0%, white 100%)`,
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', lg: '800px' },
              maxHeight: { xs: 'none', lg: '800px' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{ fontWeight: 700, color: colors.semantic.info }}
              >
                Today's Schedule
              </Typography>
              {appointmentsLoading ? (
                <CircularProgress
                  size={20}
                  sx={{ color: colors.semantic.info }}
                />
              ) : (
                <Chip
                  label={`${todayAppointments.length} ${
                    todayAppointments.length === 1
                      ? 'Appointment'
                      : 'Appointments'
                  }`}
                  size="small"
                  sx={{
                    backgroundColor: colors.semantic.info,
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                mb: 2,
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: colors.neutral[100],
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: colors.semantic.info,
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: colors.primary.main,
                  },
                },
              }}
            >
              {appointmentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress
                    size={32}
                    sx={{ color: colors.semantic.info }}
                  />
                </Box>
              ) : todayAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Schedule
                    sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    No appointments scheduled for today
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} divider={<Divider />}>
                  {todayAppointments.map((appointment) => {
                    const customerName = `${appointment.customer.firstName} ${appointment.customer.lastName}`;
                    const customerPhone = appointment.customer.phone
                      ? formatPhone(appointment.customer.phone)
                      : 'No phone';
                    const vehicleInfo = appointment.vehicle
                      ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
                      : null;
                    const technicianName = appointment.employee
                      ? `${appointment.employee.firstName} ${appointment.employee.lastName}`
                      : 'Unassigned';

                    return (
                      <Box key={appointment.id}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: colors.semantic.info,
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            }}
                          >
                            {appointment.customer.firstName.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: colors.neutral[900],
                              }}
                            >
                              {formatTimeRange(
                                appointment.scheduledTime,
                                appointment.endTime,
                                appointment.duration
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: colors.neutral[900] }}
                            >
                              {appointment.serviceType}
                            </Typography>
                          </Box>
                          <Chip
                            label={appointment.status}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 20,
                              backgroundColor:
                                appointment.status === 'CONFIRMED'
                                  ? colors.semantic.success
                                  : appointment.status === 'IN_PROGRESS'
                                  ? colors.semantic.warning
                                  : colors.semantic.info,
                              color: 'white',
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ ml: 5, color: colors.neutral[900] }}
                        >
                          {customerName} • {customerPhone}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            ml: 5,
                            display: 'block',
                            color: colors.neutral[900],
                          }}
                        >
                          {vehicleInfo ? `${vehicleInfo} • ` : ''}Tech:{' '}
                          {technicianName}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/staff/appointments"
              sx={{
                borderColor: colors.semantic.info,
                color: colors.semantic.info,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: colors.semantic.info,
                  color: 'white',
                },
              }}
            >
              View Full Schedule
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* My Job Dialog - For staff to add their own job */}
      <CreateJobDialog
        open={myJobDialogOpen}
        onClose={() => setMyJobDialogOpen(false)}
        onSuccess={(job) => {
          setMyJobDialogOpen(false);
        }}
        preselectedEmployeeId={user?.id}
        hideEmployeeSelect={true}
      />

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onSuccess={() => {
          setInvoiceDialogOpen(false);
        }}
      />

      {/* Quotation Dialog */}
      <QuotationDialog
        open={quotationDialogOpen}
        onClose={() => setQuotationDialogOpen(false)}
        onSuccess={() => {
          setQuotationDialogOpen(false);
        }}
      />

      {/* Customer Dialog */}
      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onSuccess={() => {
          setCustomerDialogOpen(false);
        }}
      />

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        onSuccess={() => {
          setAppointmentDialogOpen(false);
          loadTodayAppointments();
        }}
      />

      {/* Tire Dialog */}
      <TireDialog
        open={tireDialogOpen}
        onClose={() => setTireDialogOpen(false)}
        onSuccess={() => {
          setTireDialogOpen(false);
        }}
      />

      {/* Quick Tire Sale Dialog */}
      <QuickTireSaleDialog
        open={tireSaleDialogOpen}
        onClose={() => setTireSaleDialogOpen(false)}
        onSuccess={() => {}}
      />
    </Box>
  );
}
