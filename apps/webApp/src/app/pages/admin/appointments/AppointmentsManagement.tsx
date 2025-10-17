import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  ViewList as ViewListIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AppointmentStatus } from '@gt-automotive/data';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentDialog } from '../../../components/appointments/AppointmentDialog';
import { useConfirmation } from '../../../contexts/ConfirmationContext';
import { useError } from '../../../contexts/ErrorContext';
import { useAuth } from '../../../hooks/useAuth';
import {
  Appointment,
  appointmentService,
} from '../../../services/appointment.service';
import { format12Hour, formatTimeRange, formatDateLocal } from '../../../utils/timeFormat';

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

export const AppointmentsManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | undefined
  >();
  const [view, setView] = useState<'calendar' | 'all'>('calendar');
  const [calendarView, setCalendarView] = useState<'month' | 'today'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAppointmentId, setMenuAppointmentId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: '' as AppointmentStatus | '',
  });

  const { showError } = useError();
  const { confirm } = useConfirmation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Check if current user is staff (not admin)
  const isStaff = currentUser?.role?.name?.toUpperCase() === 'STAFF';

  useEffect(() => {
    loadAppointments();
    loadTodayAppointments();
  }, [filters]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;

      const data = await appointmentService.getAppointments(params);
      setAppointments(data);
    } catch (err: any) {
      showError({
        title: 'Failed to load appointments',
        message: err.message,
      });
    } finally {
      setLoading(false);
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
    setSelectedDate(null);
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

  const renderAppointmentRow = (appointment: Appointment) => (
    <TableRow key={appointment.id} hover>
      <TableCell>
        {formatDateLocal(appointment.scheduledDate)}
        <br />
        <Typography variant="caption" color="text.secondary">
          {formatTime(appointment.scheduledTime, appointment.endTime)}
        </Typography>
      </TableCell>
      <TableCell>
        {appointment.customer.businessName && (
          <>
            <strong>{appointment.customer.businessName}</strong>
            <br />
          </>
        )}
        {appointment.customer.firstName} {appointment.customer.lastName}
        {appointment.customer.phone && (
          <>
            <br />
            <Typography variant="caption" color="text.secondary">
              {appointment.customer.phone}
            </Typography>
          </>
        )}
      </TableCell>
      <TableCell>
        {appointment.vehicle
          ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
          : '—'}
        {appointment.vehicle?.licensePlate && (
          <>
            <br />
            <Typography variant="caption" color="text.secondary">
              {appointment.vehicle.licensePlate}
            </Typography>
          </>
        )}
      </TableCell>
      <TableCell>{appointment.serviceType.replace(/_/g, ' ')}</TableCell>
      <TableCell>{appointment.duration} min</TableCell>
      <TableCell>
        {appointment.employee
          ? `${appointment.employee.firstName} ${appointment.employee.lastName}`
          : 'Unassigned'}
      </TableCell>
      <TableCell>
        <Chip
          label={appointment.status}
          color={STATUS_COLORS[appointment.status]}
          size="small"
        />
      </TableCell>
      <TableCell>
        <IconButton
          size="small"
          onClick={() => handleEdit(appointment)}
          title="Edit"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        {appointment.status !== AppointmentStatus.CANCELLED &&
          appointment.status !== AppointmentStatus.COMPLETED && (
            <IconButton
              size="small"
              onClick={() => handleCancel(appointment)}
              color="warning"
              title="Cancel"
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          )}
        <IconButton
          size="small"
          onClick={() => handleDelete(appointment)}
          color="error"
          title="Delete"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

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
                onClick={() => setView('all')}
                color={view === 'all' ? 'primary' : 'default'}
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
              <Box display="flex" gap={1}>
                {!isStaff && (
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={() => navigate('/admin/appointments/availability')}
                  >
                    Manage Availability
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreate}
                >
                  New Appointment
                </Button>
              </Box>
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
                variant={view === 'all' ? 'contained' : 'outlined'}
                startIcon={<ViewListIcon />}
                onClick={() => setView('all')}
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
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
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
                  <Grid container spacing={{ xs: 0.5, sm: 1 }}>
                    {getMonthDays(currentMonth).map((date, index) => {
                      const dayAppointments = getAppointmentsForDay(date);
                      const isToday =
                        date &&
                        date.toDateString() === new Date().toDateString();
                      const isPast = date && date < new Date() && !isToday;

                      return (
                        <Grid size={{ xs: 12 / 7 }} key={index}>
                          <Box
                            sx={{
                              minHeight: { xs: '70px', sm: '100px', md: '120px' },
                              border: 1,
                              borderColor: isToday ? 'primary.main' : 'divider',
                              borderWidth: isToday ? 2 : 1,
                              bgcolor: date
                                ? isPast
                                  ? 'action.hover'
                                  : 'background.paper'
                                : 'action.disabledBackground',
                              borderRadius: { xs: 0.5, sm: 1 },
                              p: { xs: 0.5, sm: 0.5, md: 1 },
                              display: 'flex',
                              flexDirection: 'column',
                              position: 'relative',
                              '&:hover': date
                                ? {
                                    boxShadow: 1,
                                    cursor: 'pointer',
                                  }
                                : {},
                            }}
                            onClick={() => handleDayClick(date)}
                          >
                            {date && (
                              <>
                                <Typography
                                  variant="body2"
                                  fontWeight={isToday ? 'bold' : 'normal'}
                                  color={
                                    isToday
                                      ? 'primary.main'
                                      : isPast
                                      ? 'text.disabled'
                                      : 'text.primary'
                                  }
                                  mb={{ xs: 0.25, sm: 0.5 }}
                                  sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                    textAlign: 'center'
                                  }}
                                >
                                  {date.getDate()}
                                </Typography>
                                {dayAppointments.length > 0 && (
                                  <Box flex={1} overflow="auto">
                                    {/* Mobile: Show small count badge */}
                                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                      <Box
                                        sx={{
                                          bgcolor: 'primary.main',
                                          color: 'primary.contrastText',
                                          borderRadius: '50%',
                                          width: '20px',
                                          height: '20px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.65rem',
                                          fontWeight: 'bold',
                                          margin: '0 auto',
                                        }}
                                      >
                                        {dayAppointments.length}
                                      </Box>
                                    </Box>

                                    {/* Tablet: Show appointment details */}
                                    <Box sx={{ display: { xs: 'none', sm: 'block', lg: 'none' } }}>
                                      {dayAppointments.slice(0, 2).map((apt) => (
                                        <Box
                                          key={apt.id}
                                          sx={{
                                            fontSize: { sm: '0.65rem', md: '0.7rem' },
                                            mb: 0.5,
                                            p: { sm: 0.25, md: 0.5 },
                                            bgcolor: 'primary.light',
                                            color: 'primary.contrastText',
                                            borderRadius: 0.5,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            '&:hover': {
                                              bgcolor: 'primary.main',
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
                                      ))}
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
                                          bgcolor: 'primary.main',
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
                                            color: 'primary.contrastText',
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
                                          color: 'primary.main',
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
                      {/* Card View for All Screen Sizes */}
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
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
                                        {appointment.serviceType.replace(/_/g, ' ')}
                                      </Typography>
                                      <Chip label={`${appointment.duration} min`} size="small" sx={{ height: '20px', fontSize: '0.75rem' }} />
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

        {/* All Appointments */}
        {view === 'all' && (
          <Paper>
            {/* Filters */}
            <Box p={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) =>
                      setFilters({ ...filters, startDate: date })
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: 'small' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) =>
                      setFilters({ ...filters, endDate: date })
                    }
                    slotProps={{
                      textField: { fullWidth: true, size: 'small' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    select
                    size="small"
                    label="Status"
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status: e.target.value as AppointmentStatus | '',
                      })
                    }
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {Object.values(AppointmentStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Desktop Table View */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Employee</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map(renderAppointmentRow)
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mobile Card View */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, px: 2, py: 2 }}>
              {loading ? (
                <Typography align="center" color="text.secondary" fontSize="0.875rem">
                  Loading...
                </Typography>
              ) : appointments.length === 0 ? (
                <Typography align="center" color="text.secondary" fontSize="0.875rem">
                  No appointments found
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {appointments.map((appointment) => {
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
                          bgcolor: getBgColor(),
                          border: 1,
                          borderColor: getBorderColor(),
                        }}
                      >
                        <CardContent sx={{ p: 2, pb: '16px !important' }}>
                          {/* Header: Date/Time and Status */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                            <Box flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold" fontSize="0.9375rem" color="text.primary">
                                {formatDateLocal(appointment.scheduledDate)}
                              </Typography>
                              <Typography variant="body2" fontSize="0.8125rem" fontWeight={500} color="text.secondary">
                                {formatTime(appointment.scheduledTime, appointment.endTime)}
                              </Typography>
                            </Box>
                            <Chip
                              label={appointment.status}
                              color={STATUS_COLORS[appointment.status]}
                              size="small"
                              sx={{ fontSize: '0.75rem', height: '24px', ml: 1 }}
                            />
                          </Box>

                          <Divider sx={{ mb: 1.5 }} />

                          {/* Customer and Employee Info */}
                          <Box mb={1.5}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                              <Box flex={1} minWidth={0}>
                                <Typography variant="caption" color="primary.main" fontWeight="bold" fontSize="0.7rem" display="block" mb={0.5}>
                                  CUSTOMER
                                </Typography>
                                {appointment.customer.businessName && (
                                  <Typography variant="body2" fontWeight={600} fontSize="0.875rem" color="text.primary">
                                    {appointment.customer.businessName}
                                  </Typography>
                                )}
                                <Typography variant="body2" fontWeight={600} fontSize="0.875rem" color="text.primary">
                                  {appointment.customer.firstName} {appointment.customer.lastName}
                                </Typography>
                                {appointment.customer.phone && (
                                  <Typography variant="caption" fontSize="0.75rem" fontWeight={500} color="text.secondary">
                                    {appointment.customer.phone}
                                  </Typography>
                                )}
                              </Box>
                              <Box textAlign="right" minWidth={0}>
                                <Typography variant="caption" color="primary.main" fontWeight="bold" fontSize="0.7rem" display="block" mb={0.5}>
                                  EMPLOYEE
                                </Typography>
                                <Typography variant="body2" fontWeight={600} fontSize="0.875rem" noWrap color="text.primary">
                                  {appointment.employee
                                    ? `${appointment.employee.firstName} ${appointment.employee.lastName}`
                                    : 'Unassigned'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {/* Vehicle Info */}
                          {appointment.vehicle && (
                            <Box mb={1.5}>
                              <Typography variant="caption" color="primary.main" fontWeight="bold" fontSize="0.7rem" display="block" mb={0.5}>
                                VEHICLE
                              </Typography>
                              <Typography variant="body2" fontSize="0.875rem" fontWeight={600} color="text.primary">
                                {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                              </Typography>
                              {appointment.vehicle.licensePlate && (
                                <Typography variant="caption" fontSize="0.75rem" fontWeight={500} color="text.secondary">
                                  {appointment.vehicle.licensePlate}
                                </Typography>
                              )}
                            </Box>
                          )}

                          {/* Service and Duration */}
                          <Box display="flex" gap={2} mb={1.5}>
                            <Box flex={1}>
                              <Typography variant="caption" color="primary.main" fontWeight="bold" fontSize="0.7rem" display="block" mb={0.5}>
                                SERVICE
                              </Typography>
                              <Typography variant="body2" fontSize="0.875rem" fontWeight={600} color="text.primary">
                                {appointment.serviceType.replace(/_/g, ' ')}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="primary.main" fontWeight="bold" fontSize="0.7rem" display="block" mb={0.5}>
                                DURATION
                              </Typography>
                              <Typography variant="body2" fontSize="0.875rem" fontWeight={600} color="text.primary">
                                {appointment.duration} min
                              </Typography>
                            </Box>
                          </Box>

                          {/* Notes */}
                          {appointment.notes && (
                            <Box mb={1.5}>
                              <Typography variant="caption" color="primary.main" fontWeight="bold" fontSize="0.7rem" display="block" mb={0.5}>
                                NOTES
                              </Typography>
                              <Typography
                                variant="body2"
                                fontSize="0.875rem"
                                fontWeight={500}
                                fontStyle="italic"
                                color={isPast ? 'warning.dark' : 'info.dark'}
                              >
                                {appointment.notes}
                              </Typography>
                            </Box>
                          )}

                          <Divider sx={{ mb: 1.5 }} />

                          {/* Actions */}
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(appointment)}
                              fullWidth
                              sx={{ fontSize: '0.8125rem', py: 0.75 }}
                            >
                              Edit
                            </Button>
                            {appointment.status !== AppointmentStatus.CANCELLED &&
                              appointment.status !== AppointmentStatus.COMPLETED && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  startIcon={<CancelIcon />}
                                  onClick={() => handleCancel(appointment)}
                                  fullWidth
                                  sx={{ fontSize: '0.8125rem', py: 0.75 }}
                                >
                                  Cancel
                                </Button>
                              )}
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(appointment)}
                              color="error"
                              sx={{ minWidth: '40px' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
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
        <Dialog
          open={dayDialogOpen}
          onClose={(event, reason) => {
            if (reason === 'backdropClick') {
              return; // Prevent closing on backdrop click
            }
            handleCloseDayDialog();
          }}
          maxWidth="lg"
          fullWidth
          fullScreen={window.innerWidth < 600} // Fullscreen on small screens
          PaperProps={{
            sx: {
              maxHeight: { xs: '100vh', sm: '90vh' },
              m: { xs: 0, sm: 2 },
              width: { lg: '1200px' },
              maxWidth: { lg: '1200px' },
              borderRadius: { xs: 0, sm: 2 },
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              position: 'relative',
              pb: 2,
              borderTopLeftRadius: { xs: 0, sm: 2 },
              borderTopRightRadius: { xs: 0, sm: 2 },
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                {getSelectedDayAppointments().length} appointment{getSelectedDayAppointments().length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={handleCloseDayDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ py: 2 }}>
              {getSelectedDayAppointments().map((appointment) => {
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
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
                            {appointment.serviceType.replace(/_/g, ' ')}
                          </Typography>
                          <Chip label={`${appointment.duration} min`} size="small" sx={{ height: '20px', fontSize: '0.75rem' }} />
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDayDialog}>Close</Button>
          </DialogActions>
        </Dialog>

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
