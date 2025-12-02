import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  ViewList as ViewListIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppointmentStatus } from '@gt-automotive/data';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentDialog } from '../../../components/appointments/AppointmentDialog';
import { DayAppointmentsDialog } from '../../../components/appointments/DayAppointmentsDialog';
import { AppointmentCard } from '../../../components/appointments/AppointmentCard';
import { useConfirmation } from '../../../contexts/ConfirmationContext';
import { useError } from '../../../contexts/ErrorContext';
import { useAuth } from '../../../hooks/useAuth';
import {
  Appointment,
  appointmentService,
} from '../../../requests/appointment.requests';
import { format12Hour, formatTimeRange } from '../../../utils/timeFormat';

const STATUS_COLORS: Record<
  AppointmentStatus,
  'default' | 'primary' | 'warning' | 'success' | 'error'
> = {
  SCHEDULED: 'primary',
  CONFIRMED: 'success',
  IN_PROGRESS: 'warning',
  COMPLETED: 'default',
  CANCELLED: 'error',
  NO_SHOW: 'error',
};

const getAppointmentTypeIcon = (type: string) => {
  return type === 'MOBILE_SERVICE' ? <DriveEtaIcon fontSize="small" /> : <LocationOnIcon fontSize="small" />;
};

const getAppointmentTypeLabel = (type: string) => {
  return type === 'MOBILE_SERVICE' ? 'Mobile Service' : 'At Garage';
};

const getAppointmentTypeColor = (type: string) => {
  return type === 'MOBILE_SERVICE' ? 'secondary' : 'primary';
};

export const AppointmentsManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [monthPaymentDates, setMonthPaymentDates] = useState<Record<string, Appointment[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | undefined
  >();
  const [view, setView] = useState<'calendar' | 'list'>('calendar'); // Default to calendar view
  const [currentTab, setCurrentTab] = useState(0); // 0: At Garage, 1: Mobile Service, 2: Day Summary
  const [calendarView, setCalendarView] = useState<'month' | 'today'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAppointmentId, setMenuAppointmentId] = useState<string | null>(null);

  const { showError } = useError();
  const { confirm } = useConfirmation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Check if current user is staff (not admin)
  const isStaff = currentUser?.role?.name?.toUpperCase() === 'STAFF';

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (view === 'list') {
        await loadAllAppointments();
      } else {
        await loadMonthAppointments();
        if (!cancelled) {
          loadTodayAppointments(); // Non-blocking
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [view, currentMonth]);

  const loadAllAppointments = async () => {
    try {
      setLoading(true);
      // Load all appointments without date filter
      const data = await appointmentService.getAppointments({});
      // Sort in descending order (newest first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
        const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
        return dateB.getTime() - dateA.getTime();
      });
      setAppointments(sortedData);
    } catch (err: any) {
      showError({
        title: 'Failed to load appointments',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonthAppointments = async () => {
    try {
      setLoading(true);
      // Get first and last day of the current month
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Format dates as YYYY-MM-DD strings to avoid timezone issues
      const formatDateOnly = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const params: any = {
        startDate: formatDateOnly(firstDay),
        endDate: formatDateOnly(lastDay),
      };

      const data = await appointmentService.getAppointments(params);
      setAppointments(data);

      // Also fetch all appointments with payments processed in this month
      // Group them by payment date for efficient calendar highlighting
      await loadMonthPaymentDates();
    } catch (err: any) {
      showError({
        title: 'Failed to load appointments',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonthPaymentDates = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // Format start and end dates for the month
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Single API call to fetch all payments for the month
      const payments = await appointmentService.getPaymentsByDateRange(startDate, endDate);

      // Group payments by date
      const paymentsByDate: Record<string, Appointment[]> = {};
      for (const payment of payments) {
        // Use paymentDate if available, otherwise fall back to scheduledDate
        let dateStr: string;
        if (payment.paymentDate) {
          dateStr = new Date(payment.paymentDate).toISOString().split('T')[0];
        } else if (typeof payment.scheduledDate === 'string') {
          dateStr = payment.scheduledDate;
        } else {
          dateStr = new Date(payment.scheduledDate).toISOString().split('T')[0];
        }

        if (!paymentsByDate[dateStr]) {
          paymentsByDate[dateStr] = [];
        }
        paymentsByDate[dateStr].push(payment);
      }

      setMonthPaymentDates(paymentsByDate);
    } catch (err: any) {
      console.error('Failed to load payment dates:', err);
    }
  };

  const loadTodayAppointments = async () => {
    try {
      const data = await appointmentService.getTodayAppointments();
      setTodayAppointments(data);
    } catch (err: any) {
      console.error("Failed to load today's appointments:", err);
    }
  };

  // Unified reload function that loads data based on current view
  const loadAppointments = () => {
    if (view === 'list') {
      loadAllAppointments();
    } else {
      loadMonthAppointments();
    }
    loadTodayAppointments();
  };

  const handleCreate = () => {
    setSelectedAppointment(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const handleCancel = async (appointment: Appointment) => {
    const confirmed = await confirm({
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel the appointment for ${
        appointment.customer.firstName
      } ${appointment.customer.lastName} on ${new Date(
        appointment.scheduledDate
      ).toLocaleDateString()} at ${formatTime(appointment.scheduledTime, appointment.endTime)}?`,
      confirmText: 'Cancel Appointment',
      severity: 'warning',
    });

    if (confirmed) {
      try {
        await appointmentService.cancelAppointment(appointment.id);
        loadAppointments();
        loadTodayAppointments();
      } catch (err: any) {
        showError({
          title: 'Failed to cancel appointment',
          message: err.message,
        });
      }
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string, paymentData?: any) => {
    try {
      // If status is being changed to CANCELLED, use the cancel endpoint to send SMS
      if (newStatus === 'CANCELLED') {
        await appointmentService.cancelAppointment(appointmentId);
        loadAppointments();
        loadTodayAppointments();
        return;
      }

      const updateData: any = {
        status: newStatus as AppointmentStatus,
      };

      // If payment data is provided (completing or updating payment), include it
      if (paymentData) {
        console.log('AppointmentsManagement - Received payment data:', paymentData);
        updateData.paymentAmount = paymentData.totalAmount;
        updateData.paymentBreakdown = paymentData.payments; // Array of payment entries
        updateData.paymentNotes = paymentData.paymentNotes;
        if (paymentData.expectedAmount !== undefined) {
          updateData.expectedAmount = paymentData.expectedAmount;
        }
        console.log('AppointmentsManagement - Update data being sent:', updateData);
      }

      await appointmentService.updateAppointment(appointmentId, updateData);
      loadAppointments();
      loadTodayAppointments();
    } catch (err: any) {
      showError({
        title: 'Failed to update appointment status',
        message: err.message,
      });
    }
  };

  const handleDelete = async (appointment: Appointment) => {
    const confirmed = await confirm({
      title: 'Delete Appointment',
      message: `Are you sure you want to permanently delete this appointment? This action cannot be undone.`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      try {
        await appointmentService.deleteAppointment(appointment.id);
        loadAppointments();
        loadTodayAppointments();
      } catch (err: any) {
        showError({
          title: 'Failed to delete appointment',
          message: err.message,
        });
      }
    }
  };

  const handleDeleteById = async (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      await handleDelete(appointment);
    }
  };

  const handleDialogSuccess = () => {
    loadAppointments();
    loadTodayAppointments();
  };

  const formatTime = (time: string, endTime?: string) => {
    return endTime ? formatTimeRange(time, endTime) : format12Hour(time);
  };

  /**
   * Get the time-based status of an appointment
   * Returns: 'current' | 'past' | 'future'
   */
  const getAppointmentTimeStatus = (appointment: Appointment): 'current' | 'past' | 'future' => {
    const scheduledDate = typeof appointment.scheduledDate === 'string'
      ? new Date(appointment.scheduledDate)
      : appointment.scheduledDate;

    const dateStr = scheduledDate.toISOString().split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    const [startHours, startMinutes] = appointment.scheduledTime.split(':').map(Number);

    // Calculate appointment start and end times
    const appointmentStart = new Date(year, month - 1, day, startHours, startMinutes, 0, 0);
    const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);

    const now = new Date();

    // Check if current time is within appointment range
    if (now >= appointmentStart && now <= appointmentEnd) {
      return 'current';
    }

    // Check if appointment has ended
    if (now > appointmentEnd) {
      return 'past';
    }

    // Appointment is in the future
    return 'future';
  };

  // Calendar helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduledDate).toISOString().split('T')[0];
      // Only include appointments scheduled on this date
      // Payments processed on this date are fetched separately in DayAppointmentsDialog
      return aptDate === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date | null) => {
    if (!date) return;
    const dayAppointments = getAppointmentsForDay(date);
    if (dayAppointments.length > 0) {
      setSelectedDate(date);
      setDayDialogOpen(true);
    }
  };

  const handleCloseDayDialog = () => {
    setDayDialogOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, appointmentId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuAppointmentId(appointmentId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuAppointmentId(null);
  };

  const handleMenuEdit = () => {
    const appointment = appointments.find(a => a.id === menuAppointmentId);
    if (appointment) {
      handleCloseDayDialog();
      handleEdit(appointment);
    }
    handleMenuClose();
  };

  const handleMenuCancel = () => {
    const appointment = appointments.find(a => a.id === menuAppointmentId);
    if (appointment) {
      handleCloseDayDialog();
      handleCancel(appointment);
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    const appointment = appointments.find(a => a.id === menuAppointmentId);
    if (appointment) {
      handleCloseDayDialog();
      handleDelete(appointment);
    }
    handleMenuClose();
  };

  const getSelectedDayAppointments = () => {
    return selectedDate ? getAppointmentsForDay(selectedDate) : [];
  };

  // Filter appointments by type (including all appointments - past and future)
  const atGarageAppointments = appointments.filter(
    (apt) => apt.appointmentType !== 'MOBILE_SERVICE'
  );
  const mobileServiceAppointments = appointments.filter(
    (apt) => apt.appointmentType === 'MOBILE_SERVICE'
  );

  // Get appointments based on current tab (0: At Garage, 1: Mobile Service)
  const getDisplayedAppointments = () => {
    if (currentTab === 0) return atGarageAppointments;
    return mobileServiceAppointments;
  };

  const displayedAppointments = getDisplayedAppointments();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box mb={{ xs: 2, sm: 3 }}>
          {/* Mobile Compact Header */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {/* Title Row */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h5" sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                Appointments
              </Typography>
              <IconButton
                color="primary"
                onClick={handleCreate}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  width: 40,
                  height: 40,
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* Action Chips Row - Full Width */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              {!isStaff && (
                <Chip
                  icon={<ScheduleIcon sx={{ fontSize: '0.875rem !important' }} />}
                  label="Availability"
                  onClick={() => navigate('/admin/appointments/availability')}
                  size="small"
                  clickable
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: '32px', flex: 1, minWidth: '120px' }}
                />
              )}
              <Chip
                icon={<CalendarIcon sx={{ fontSize: '0.875rem !important' }} />}
                label="Calendar"
                onClick={() => setView('calendar')}
                color={view === 'calendar' ? 'primary' : 'default'}
                size="small"
                clickable
                sx={{ fontSize: '0.75rem', height: '32px', flex: 1, minWidth: '100px' }}
              />
              <Chip
                icon={<ViewListIcon sx={{ fontSize: '0.875rem !important' }} />}
                label="List"
                onClick={() => setView('list')}
                color={view === 'list' ? 'primary' : 'default'}
                size="small"
                clickable
                sx={{ fontSize: '0.75rem', height: '32px', flex: 1, minWidth: '80px' }}
              />
            </Box>
          </Box>

          {/* Desktop Header (unchanged) */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h4">Appointments</Typography>
            </Box>

            {/* View Toggle */}
            <Box mb={3}>
              <Button
                variant={view === 'calendar' ? 'contained' : 'outlined'}
                startIcon={<CalendarIcon />}
                onClick={() => setView('calendar')}
                sx={{ mr: 1 }}
              >
                Calendar
              </Button>
              <Button
                variant={view === 'list' ? 'contained' : 'outlined'}
                startIcon={<ViewListIcon />}
                onClick={() => setView('list')}
              >
                List View
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Calendar View */}
        {view === 'calendar' && (
          <Paper>
            {/* Calendar Header - Mobile Optimized */}
            <Box
              sx={{
                p: { xs: 1, sm: 2 },
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              {/* Mobile Compact Header */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {/* Top Row: Month/Year with Navigation */}
                {calendarView === 'month' && (
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <IconButton onClick={goToPreviousMonth} size="small">
                      <ChevronLeftIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                      {currentMonth.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Typography>
                    <IconButton onClick={goToNextMonth} size="small">
                      <ChevronRightIcon />
                    </IconButton>
                  </Box>
                )}

                {/* Today View Title */}
                {calendarView === 'today' && (
                  <Box mb={1}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                      Today's Schedule
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                )}

                {/* Bottom Row: Compact Toggle Chips */}
                <Box display="flex" gap={1} justifyContent="center">
                  <Chip
                    icon={<TodayIcon sx={{ fontSize: '0.875rem !important' }} />}
                    label="Today"
                    onClick={() => setCalendarView('today')}
                    color={calendarView === 'today' ? 'primary' : 'default'}
                    size="small"
                    clickable
                    sx={{ fontSize: '0.75rem', height: '28px', flex: 1 }}
                  />
                  <Chip
                    icon={<CalendarIcon sx={{ fontSize: '0.875rem !important' }} />}
                    label="Month"
                    onClick={() => setCalendarView('month')}
                    color={calendarView === 'month' ? 'primary' : 'default'}
                    size="small"
                    clickable
                    sx={{ fontSize: '0.75rem', height: '28px', flex: 1 }}
                  />
                  {calendarView === 'month' && (
                    <Chip
                      label="Jump to Today"
                      onClick={goToToday}
                      variant="outlined"
                      size="small"
                      clickable
                      sx={{ fontSize: '0.7rem', height: '28px', flex: 1 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Desktop Header (unchanged) */}
              <Box
                sx={{ display: { xs: 'none', sm: 'flex' } }}
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                {/* Month Navigation (only show in month view) */}
                {calendarView === 'month' && (
                  <>
                    <IconButton onClick={goToPreviousMonth} size="small">
                      <ChevronLeftIcon />
                    </IconButton>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h5">
                        {currentMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={goToToday}>
                        Today
                      </Button>
                    </Box>
                    <IconButton onClick={goToNextMonth} size="small">
                      <ChevronRightIcon />
                    </IconButton>
                  </>
                )}

                {/* Today View Header */}
                {calendarView === 'today' && (
                  <Box flex={1}>
                    <Typography variant="h5">Today's Schedule</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                )}

                {/* View Toggle and Quick Actions */}
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                  >
                    Add Appointment
                  </Button>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <Button
                    variant={calendarView === 'today' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<TodayIcon />}
                    onClick={() => setCalendarView('today')}
                  >
                    Today
                  </Button>
                  <Button
                    variant={calendarView === 'month' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<CalendarIcon />}
                    onClick={() => setCalendarView('month')}
                  >
                    Month
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Calendar Content */}
            <Box p={{ xs: 0.5, sm: 2 }}>
              {/* Month View */}
              {calendarView === 'month' && (
                <>
                  {/* Day Headers */}
                  <Grid container spacing={{ xs: 0.5, sm: 1 }} mb={{ xs: 0.5, sm: 1 }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <Grid size={{ xs: 12 / 7 }} key={day}>
                        <Box
                          textAlign="center"
                          fontWeight="bold"
                          color="text.secondary"
                          py={{ xs: 0.25, sm: 1 }}
                          sx={{
                            fontSize: { xs: '0.65rem', sm: '0.875rem' },
                          }}
                        >
                          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{day}</Box>
                          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                            {day.charAt(0)}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Calendar Days */}
                  <Grid container spacing={{ xs: 0.75, sm: 1 }}>
                    {getMonthDays(currentMonth).map((date, index) => {
                      const dayAppointments = getAppointmentsForDay(date);
                      const dateStr = date ? date.toISOString().split('T')[0] : '';
                      const isToday =
                        date &&
                        date.toDateString() === new Date().toDateString();
                      const isPast = date && date < new Date() && !isToday;

                      // Check for appointments needing attention:
                      // 1. Appointments with IN_PROGRESS status on this date
                      // 2. Appointments with payments processed on this date that have outstanding balance
                      const appointmentsNeedingAttention = dayAppointments.filter(
                        (apt) => {
                          const aptScheduledDate = new Date(apt.scheduledDate).toISOString().split('T')[0];

                          // Case 1: Appointment scheduled on this date and is IN_PROGRESS
                          if (aptScheduledDate === dateStr && apt.status === 'IN_PROGRESS') {
                            return true;
                          }

                          return false;
                        }
                      );

                      // Check payment-date appointments for outstanding balances
                      const paymentDateAppointments = monthPaymentDates[dateStr] || [];
                      const paymentsNeedingAttention = paymentDateAppointments.filter((apt) => {
                        // Check if payment was processed on this date and has outstanding balance
                        // CRITICAL FIX: Check paymentAmount !== undefined instead of truthiness
                        // This ensures $0 payments with outstanding balance are highlighted
                        const hasOutstandingBalance = apt.expectedAmount && apt.paymentAmount !== undefined && apt.paymentAmount < apt.expectedAmount;
                        return hasOutstandingBalance;
                      });

                      const hasAttentionNeeded = appointmentsNeedingAttention.length > 0 || paymentsNeedingAttention.length > 0;

                      return (
                        <Grid size={{ xs: 12 / 7 }} key={index}>
                          <Box
                            sx={{
                              minHeight: { xs: '75px', sm: '100px', md: '120px' },
                              border: 1,
                              borderColor: hasAttentionNeeded
                                ? 'warning.main'
                                : isToday
                                ? 'primary.main'
                                : 'divider',
                              borderWidth: hasAttentionNeeded ? { xs: 3, sm: 2 } : isToday ? 2 : 1,
                              bgcolor: date
                                ? isPast
                                  ? 'action.hover'
                                  : hasAttentionNeeded
                                  ? { xs: 'warning.light', sm: 'warning.lighter' }
                                  : 'background.paper'
                                : 'action.disabledBackground',
                              borderRadius: { xs: 1, sm: 1 },
                              p: { xs: 0.75, sm: 0.5, md: 1 },
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              // Mobile: Add touch feedback
                              '&:active': date
                                ? {
                                    transform: { xs: 'scale(0.95)', sm: 'none' },
                                    transition: 'transform 0.1s ease',
                                  }
                                : {},
                              '&:hover': date
                                ? {
                                    boxShadow: 1,
                                    cursor: 'pointer',
                                  }
                                : {},
                              // Add a small attention indicator in the top-right corner
                              '&::before': hasAttentionNeeded
                                ? {
                                    content: '""',
                                    position: 'absolute',
                                    top: { xs: 3, sm: 4 },
                                    right: { xs: 3, sm: 4 },
                                    width: { xs: '8px', sm: '8px' },
                                    height: { xs: '8px', sm: '8px' },
                                    borderRadius: '50%',
                                    bgcolor: 'warning.dark',
                                    boxShadow: {
                                      xs: '0 0 0 3px rgba(255, 152, 0, 0.3)',
                                      sm: '0 0 0 2px rgba(255, 152, 0, 0.2)'
                                    },
                                    animation: 'pulse 2s ease-in-out infinite',
                                    '@keyframes pulse': {
                                      '0%, 100%': {
                                        opacity: 1,
                                        transform: 'scale(1)',
                                      },
                                      '50%': {
                                        opacity: 0.6,
                                        transform: 'scale(1.2)',
                                      },
                                    },
                                    zIndex: 1,
                                  }
                                : {},
                            }}
                            onClick={() => handleDayClick(date)}
                          >
                            {date && (
                              <>
                                <Typography
                                  variant="body2"
                                  fontWeight={isToday || hasAttentionNeeded ? 'bold' : 'normal'}
                                  color={
                                    hasAttentionNeeded
                                      ? 'warning.dark'
                                      : isToday
                                      ? 'primary.main'
                                      : isPast
                                      ? 'text.disabled'
                                      : 'text.primary'
                                  }
                                  mb={{ xs: 0.5, sm: 0.5 }}
                                  sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    textAlign: 'center'
                                  }}
                                >
                                  {date.getDate()}
                                </Typography>
                                {dayAppointments.length > 0 && (
                                  <Box flex={1} overflow="auto">
                                    {/* Mobile: Show simple badge with color indicator */}
                                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                      <Box
                                        sx={{
                                          bgcolor: hasAttentionNeeded ? 'warning.main' : 'primary.main',
                                          color: hasAttentionNeeded ? 'warning.contrastText' : 'primary.contrastText',
                                          borderRadius: '6px',
                                          width: '24px',
                                          height: '24px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.7rem',
                                          fontWeight: 'bold',
                                          margin: '0 auto',
                                        }}
                                      >
                                        {dayAppointments.length}
                                      </Box>
                                    </Box>

                                    {/* Tablet: Show appointment details */}
                                    <Box sx={{ display: { xs: 'none', sm: 'block', lg: 'none' } }}>
                                      {dayAppointments.slice(0, 2).map((apt) => {
                                        // CRITICAL FIX: Check paymentAmount properly for $0 payments
                                        const needsAttention =
                                          apt.status === 'IN_PROGRESS' ||
                                          (apt.status === 'COMPLETED' &&
                                            (apt.paymentAmount === undefined || apt.paymentAmount === null || apt.paymentAmount < (apt.expectedAmount || 0)));
                                        return (
                                          <Box
                                            key={apt.id}
                                            sx={{
                                              fontSize: { sm: '0.65rem', md: '0.7rem' },
                                              mb: 0.5,
                                              p: { sm: 0.25, md: 0.5 },
                                              bgcolor: needsAttention ? 'warning.light' : 'primary.light',
                                              color: needsAttention ? 'warning.contrastText' : 'primary.contrastText',
                                              borderRadius: 0.5,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              cursor: 'pointer',
                                              border: needsAttention ? '1px solid' : 'none',
                                              borderColor: 'warning.main',
                                              '&:hover': {
                                                bgcolor: needsAttention ? 'warning.main' : 'primary.main',
                                              },
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(apt);
                                            }}
                                          >
                                            <Box sx={{ display: { sm: 'none', md: 'block' } }}>
                                              {formatTime(apt.scheduledTime, apt.endTime)} - {apt.customer.firstName}{' '}
                                              {apt.customer.lastName}
                                            </Box>
                                            <Box sx={{ display: { sm: 'block', md: 'none' } }}>
                                              {formatTime(apt.scheduledTime, apt.endTime)}
                                            </Box>
                                          </Box>
                                        );
                                      })}
                                      {dayAppointments.length > 2 && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ fontSize: { sm: '0.6rem', md: '0.65rem' } }}
                                        >
                                          +{dayAppointments.length - 2}
                                        </Typography>
                                      )}
                                    </Box>

                                    {/* Large Screens: Show styled count badge */}
                                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0.5 }}>
                                      <Box
                                        sx={{
                                          width: '44px',
                                          height: '44px',
                                          borderRadius: '10px',
                                          bgcolor: hasAttentionNeeded ? 'warning.main' : 'primary.main',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: 2,
                                          border: '2px solid',
                                          borderColor: 'background.paper',
                                        }}
                                      >
                                        <Typography
                                          sx={{
                                            fontSize: '1.5rem',
                                            fontWeight: 700,
                                            color: hasAttentionNeeded ? 'warning.contrastText' : 'primary.contrastText',
                                            lineHeight: 1,
                                          }}
                                        >
                                          {dayAppointments.length}
                                        </Typography>
                                      </Box>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          color: hasAttentionNeeded ? 'warning.main' : 'primary.main',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px',
                                        }}
                                      >
                                        {dayAppointments.length === 1 ? 'appointment' : 'appointments'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}
                              </>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </>
              )}

              {/* Today View */}
              {calendarView === 'today' && (
                <>
                  {todayAppointments.length === 0 ? (
                    <Alert severity="info" sx={{ m: { xs: 1, sm: 0 } }}>
                      No appointments scheduled for today
                    </Alert>
                  ) : (
                    <>
                      {/* Card View using AppointmentCard component */}
                      <Box sx={{ p: 2 }}>
                        {todayAppointments.map((appointment) => {
                          return (
                            <Box key={appointment.id} sx={{ mb: 2 }}>
                              <AppointmentCard
                                appointment={appointment}
                                onEdit={handleEdit}
                                onDelete={(appointmentId) => {
                                  const apt = todayAppointments.find(a => a.id === appointmentId);
                                  if (apt) handleDelete(apt);
                                }}
                                onStatusChange={handleStatusChange}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </>
                  )}
                </>
              )}

              {/* List View - Hidden for now, keeping old custom card implementation below for reference */}
              {false && calendarView === 'today' && (
                <>
                  {todayAppointments.length === 0 ? (
                    <Alert severity="info" sx={{ m: { xs: 1, sm: 0 } }}>
                      No appointments scheduled for today
                    </Alert>
                  ) : (
                    <>
                      {/* OLD Card View - Disabled */}
                      <Box sx={{ p: 1 }}>
                        {todayAppointments.map((appointment) => {
                          // Get time-based status for the appointment
                          const timeStatus = getAppointmentTimeStatus(appointment);

                          // Don't show time-based status for cancelled or no-show appointments
                          const isCancelled = appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW';
                          const isManuallyCompleted = appointment.status === 'COMPLETED';

                          // Determine visual styling based on status
                          const isCurrent = timeStatus === 'current' && !isCancelled && !isManuallyCompleted;
                          const isCompleted = (timeStatus === 'past' || isManuallyCompleted) && !isCancelled;
                          const isUpcoming = timeStatus === 'future' && !isCancelled && !isManuallyCompleted;
                          const isPast = timeStatus === 'past';

                          // Background colors
                          const getBgColor = () => {
                            if (isCancelled) return '#ffebee'; // Very light red
                            if (isCurrent) return '#e3f2fd'; // Very light blue
                            if (isCompleted) return '#e8f5e9'; // Light green
                            // No background color for upcoming
                            return 'background.paper';
                          };

                          const getBorderColor = () => {
                            if (isCancelled) return 'error.light';
                            if (isCurrent) return 'info.main';
                            if (isCompleted) return 'success.light';
                            if (isUpcoming) return 'warning.light';
                            return 'divider';
                          };

                          return (
                            <Card
                              key={appointment.id}
                              variant="outlined"
                              sx={{
                                mb: 2,
                                '&:last-child': { mb: 0 },
                                bgcolor: getBgColor(),
                                border: 1,
                                borderColor: getBorderColor(),
                              }}
                            >
                              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                {/* Header Row: Time and Status */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'primary.main' }}>
                                      {formatTime(appointment.scheduledTime, appointment.endTime)}
                                    </Typography>
                                    <Chip
                                      label={appointment.status}
                                      color={STATUS_COLORS[appointment.status]}
                                      size="small"
                                      sx={{ height: '24px', fontSize: '0.75rem', fontWeight: 600 }}
                                    />
                                    {isCurrent && (
                                      <Chip label="IN PROGRESS" size="small" color="info" sx={{ height: '24px', fontSize: '0.7rem', fontWeight: 600 }} />
                                    )}
                                    {isCompleted && !isManuallyCompleted && (
                                      <Chip label="COMPLETED" size="small" color="success" sx={{ height: '24px', fontSize: '0.7rem', fontWeight: 600 }} />
                                    )}
                                    {isUpcoming && (
                                      <Chip label="UPCOMING" size="small" color="warning" sx={{ height: '24px', fontSize: '0.7rem', fontWeight: 600 }} />
                                    )}
                                  </Box>
                                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, appointment.id)} sx={{ padding: '6px' }}>
                                    <MoreVertIcon />
                                  </IconButton>
                                </Box>

                                {/* Customer Section */}
                                <Box mb={2}>
                                  <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                                    {appointment.customer.businessName || `${appointment.customer.firstName} ${appointment.customer.lastName}`}
                                    {appointment.customer.phone && (
                                      <Typography component="span" sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
                                        ({appointment.customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').replace(/^\+?1?[-.\s]?/, '')})
                                      </Typography>
                                    )}
                                  </Typography>
                                  {appointment.customer.businessName && (
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 0.5 }}>
                                      {appointment.customer.firstName} {appointment.customer.lastName}
                                    </Typography>
                                  )}
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Service & Technician Row */}
                                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                                  {/* Service */}
                                  <Box flex={1} minWidth="200px">
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                      Service
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
                                        {appointment.serviceType.replace(/_/g, ' ')}
                                      </Typography>
                                      <Chip label={`${appointment.duration} min`} size="small" sx={{ height: '20px', fontSize: '0.75rem' }} />
                                      <Chip
                                        icon={getAppointmentTypeIcon(appointment.appointmentType || 'AT_GARAGE')}
                                        label={getAppointmentTypeLabel(appointment.appointmentType || 'AT_GARAGE')}
                                        color={getAppointmentTypeColor(appointment.appointmentType || 'AT_GARAGE') as any}
                                        size="small"
                                        sx={{ height: '20px', fontSize: '0.75rem' }}
                                      />
                                    </Box>
                                  </Box>

                                  {/* Technician(s) */}
                                  {(appointment.employees && appointment.employees.length > 0) ? (
                                    <Box flex={1} minWidth="200px">
                                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                        {appointment.employees.length > 1 ? 'Technicians' : 'Technician'}
                                      </Typography>
                                      {appointment.employees.map((empAssignment, index) => (
                                        <Typography key={empAssignment.id} sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                                          {empAssignment.employee.firstName} {empAssignment.employee.lastName}
                                          {index < appointment.employees!.length - 1 && ', '}
                                        </Typography>
                                      ))}
                                    </Box>
                                  ) : appointment.employee && (
                                    <Box flex={1} minWidth="200px">
                                      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                        Technician
                                      </Typography>
                                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                                        {appointment.employee.firstName} {appointment.employee.lastName}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                {/* Vehicle Info */}
                                {appointment.vehicle && (
                                  <Box>
                                    <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>
                                      Vehicle
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
                                        {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                                      </Typography>
                                      {appointment.vehicle.licensePlate && (
                                        <Chip
                                          label={appointment.vehicle.licensePlate}
                                          size="small"
                                          variant="outlined"
                                          sx={{ height: '20px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}

                                {/* Notes (if present) */}
                                {appointment.notes && (
                                  <Box
                                    mt={1.5}
                                    p={1.5}
                                    sx={{
                                      bgcolor: isPast ? '#fffbf0' : '#e3f2fd',
                                      borderRadius: 1,
                                      borderLeft: 3,
                                      borderColor: isPast ? 'warning.main' : 'info.main'
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: '0.9375rem',
                                        fontWeight: 500,
                                        fontStyle: 'italic',
                                        color: isPast ? 'warning.dark' : 'info.dark',
                                        whiteSpace: 'pre-wrap'
                                      }}
                                    >
                                      {appointment.notes}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Box>
                    </>
                  )}
                </>
              )}
            </Box>
          </Paper>
        )}

        {/* List View with Tabs */}
        {view === 'list' && (
          <Paper>
            {/* Tabs - Mobile Optimized */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={currentTab}
                onChange={(_e, newValue) => setCurrentTab(newValue)}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    fontWeight: 500,
                    minHeight: { xs: '48px', sm: '64px' },
                    px: { xs: 1, sm: 2 },
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: { xs: '1.1rem', sm: '1.5rem' },
                  },
                }}
              >
                <Tab
                  icon={<LocationOnIcon />}
                  iconPosition="start"
                  label={`At Garage (${atGarageAppointments.length})`}
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      mr: { xs: 0.5, sm: 1 },
                    },
                  }}
                />
                <Tab
                  icon={<DriveEtaIcon />}
                  iconPosition="start"
                  label={`Mobile Service (${mobileServiceAppointments.length})`}
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      mr: { xs: 0.5, sm: 1 },
                    },
                  }}
                />
              </Tabs>
            </Box>

            {/* Card View - All Screen Sizes */}
            <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
              {loading ? (
                <Typography align="center" color="text.secondary" fontSize="0.875rem">
                  Loading...
                </Typography>
              ) : displayedAppointments.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No appointments found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentTab === 0 ? 'No at-garage appointments found' : 'No mobile service appointments found'}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Group appointments by date */}
                  {(() => {
                    // Group appointments by date
                    const appointmentsByDate = displayedAppointments.reduce((acc, appointment) => {
                      const dateStr = new Date(appointment.scheduledDate).toISOString().split('T')[0];
                      if (!acc[dateStr]) {
                        acc[dateStr] = [];
                      }
                      acc[dateStr].push(appointment);
                      return acc;
                    }, {} as Record<string, typeof displayedAppointments>);

                    // Sort dates in descending order
                    const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => b.localeCompare(a));

                    return sortedDates.map((dateStr) => {
                      const date = new Date(dateStr + 'T00:00:00');
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const appointmentDate = new Date(date);
                      appointmentDate.setHours(0, 0, 0, 0);

                      const isToday = appointmentDate.getTime() === today.getTime();
                      const isPast = appointmentDate < today;
                      const isFuture = appointmentDate > today;

                      // Format date label
                      let dateLabel = date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });

                      if (isToday) {
                        dateLabel = `Today - ${dateLabel}`;
                      } else if (isPast) {
                        const daysAgo = Math.floor((today.getTime() - appointmentDate.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysAgo === 1) {
                          dateLabel = `Yesterday - ${dateLabel}`;
                        } else {
                          dateLabel = `${daysAgo} days ago - ${dateLabel}`;
                        }
                      } else if (isFuture) {
                        const daysAhead = Math.floor((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysAhead === 1) {
                          dateLabel = `Tomorrow - ${dateLabel}`;
                        } else {
                          dateLabel = `In ${daysAhead} days - ${dateLabel}`;
                        }
                      }

                      return (
                        <Box key={dateStr} mb={{ xs: 3, sm: 4 }}>
                          {/* Date Header - Mobile Optimized */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              gap: { xs: 1, sm: 0 },
                              mb: { xs: 1.5, sm: 2 },
                              pb: { xs: 1, sm: 1 },
                              borderBottom: 2,
                              borderColor: isToday ? 'primary.main' : 'divider',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <CalendarIcon
                                sx={{
                                  mr: { xs: 1, sm: 1.5 },
                                  color: isToday ? 'primary.main' : 'text.secondary',
                                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                }}
                              />
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  color: isToday ? 'primary.main' : 'text.primary',
                                  fontSize: { xs: '0.95rem', sm: '1.25rem' },
                                  lineHeight: 1.2,
                                }}
                              >
                                {dateLabel}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${appointmentsByDate[dateStr].length} ${appointmentsByDate[dateStr].length === 1 ? 'appointment' : 'appointments'}`}
                              size="small"
                              sx={{
                                ml: { xs: 4, sm: 2 },
                                fontWeight: 600,
                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                height: { xs: '22px', sm: '24px' },
                              }}
                              color={isToday ? 'primary' : 'default'}
                            />
                          </Box>

                          {/* Appointments Grid */}
                          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                            {appointmentsByDate[dateStr].map((appointment) => (
                              <Grid size={{ xs: 12, lg: 6 }} key={appointment.id}>
                                <AppointmentCard
                                  appointment={appointment}
                                  onEdit={handleEdit}
                                  onDelete={handleDeleteById}
                                  onStatusChange={handleStatusChange}
                                  showActions={true}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    });
                  })()}
                </>
              )}
            </Box>
          </Paper>
        )}

        {/* Appointment Edit Dialog */}
        <AppointmentDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleDialogSuccess}
          appointment={selectedAppointment}
        />

        {/* Day Appointments Dialog */}
        <DayAppointmentsDialog
          open={dayDialogOpen}
          onClose={handleCloseDayDialog}
          date={selectedDate}
          appointments={getSelectedDayAppointments() as any}
          onEditAppointment={handleEdit as any}
          onDeleteAppointment={handleDeleteById}
          onStatusChange={handleStatusChange}
          onAddAppointment={handleCreate}
          onRefresh={async () => {
            // Reload appointments and payment data when payment is received in dialog
            await loadMonthAppointments();
            await loadTodayAppointments();
          }}
        />

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          {menuAppointmentId && appointments.find(a => a.id === menuAppointmentId)?.status !== AppointmentStatus.CANCELLED &&
            appointments.find(a => a.id === menuAppointmentId)?.status !== AppointmentStatus.COMPLETED && (
              <MenuItem onClick={handleMenuCancel}>
                <ListItemIcon>
                  <CancelIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText>Cancel Appointment</ListItemText>
              </MenuItem>
            )}
          <MenuItem onClick={handleMenuDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </LocalizationProvider>
  );
};
