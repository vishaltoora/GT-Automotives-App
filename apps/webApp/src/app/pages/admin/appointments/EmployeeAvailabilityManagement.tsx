import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import {
  availabilityService,
  EmployeeAvailability,
  TimeSlotOverride,
} from '../../../services/availability.service';
import { userService, User } from '../../../services/user.service';
import { useError } from '../../../contexts/ErrorContext';
import { useConfirmation } from '../../../contexts/ConfirmationContext';
import { useAuth } from '../../../hooks/useAuth';
import { formatTimeRange } from '../../../utils/timeFormat';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const QUICK_SCHEDULES = {
  WEEKDAYS: { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00' },
  WEEKENDS: { days: [0, 6], start: '10:00', end: '16:00' },
  ALL_WEEK: { days: [0, 1, 2, 3, 4, 5, 6], start: '09:00', end: '17:00' },
  EXTENDED: { days: [0, 1, 2, 3, 4, 5, 6], start: '09:00', end: '22:00' },
};

interface EmployeeWithAvailability extends User {
  availability: EmployeeAvailability[];
  upcomingOverrides: TimeSlotOverride[];
  totalSlots: number;
  activeDays: number;
}

export const EmployeeAvailabilityManagement: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Dialogs
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Availability Form - now supports multiple days with multiple slots per day
  interface TimeSlot {
    id?: string; // Optional ID for existing slots from database
    startTime: string;
    endTime: string;
    isExisting?: boolean; // Flag to distinguish between DB slots and new ones
  }

  interface WeeklySlots {
    [dayOfWeek: number]: TimeSlot[];
  }

  const [weeklySlots, setWeeklySlots] = useState<WeeklySlots>({
    0: [], // Sunday
    1: [], // Monday
    2: [], // Tuesday
    3: [], // Wednesday
    4: [], // Thursday
    5: [], // Friday
    6: [], // Saturday
  });

  // Temp time inputs for each day
  const [tempTimes, setTempTimes] = useState<{ [key: number]: { start: string; end: string } }>({
    0: { start: '09:00', end: '17:00' },
    1: { start: '09:00', end: '17:00' },
    2: { start: '09:00', end: '17:00' },
    3: { start: '09:00', end: '17:00' },
    4: { start: '09:00', end: '17:00' },
    5: { start: '09:00', end: '17:00' },
    6: { start: '09:00', end: '17:00' },
  });

  // Override Form
  const [overrideForm, setOverrideForm] = useState({
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: false,
    reason: '',
  });

  const { showError } = useError();
  const { confirm } = useConfirmation();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Check if current user is staff (not admin) - case insensitive
  const isStaff = currentUser?.role?.name?.toUpperCase() === 'STAFF';

  useEffect(() => {
    loadAllData();
  }, [currentUser]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getUsers();

      // If staff user, only show their own availability
      // If admin user, show all staff and admin members
      const staffUsers = isStaff
        ? allUsers.filter((user) => user.id === currentUser?.id && user.isActive)
        : allUsers.filter((user) =>
            (user.role?.name?.toUpperCase() === 'STAFF' || user.role?.name?.toUpperCase() === 'ADMIN') &&
            user.isActive
          );

      // Load availability and overrides for each employee
      const employeesWithData = await Promise.all(
        staffUsers.map(async (user) => {
          try {
            const availability = await availabilityService.getEmployeeAvailability(user.id);

            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3);
            const upcomingOverrides = await availabilityService.getOverrides(user.id, startDate, endDate);

            // Calculate metrics
            const uniqueDays = new Set(availability.map((a) => a.dayOfWeek));
            const activeDays = uniqueDays.size;
            const totalSlots = availability.length;

            return {
              ...user,
              availability,
              upcomingOverrides,
              totalSlots,
              activeDays,
            };
          } catch (err) {
            // Return user with empty data if loading fails
            return {
              ...user,
              availability: [],
              upcomingOverrides: [],
              totalSlots: 0,
              activeDays: 0,
            };
          }
        })
      );

      setEmployees(employeesWithData);

      // If staff user, automatically expand their own card
      if (isStaff && employeesWithData.length > 0 && currentUser?.id) {
        setExpandedCards(new Set([currentUser.id]));
      }
    } catch (err: any) {
      showError({
        title: 'Failed to load employees',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpanded = (employeeId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedCards(newExpanded);
  };

  const handleOpenAvailabilityDialog = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);

    // Load existing availability for this employee
    const employee = employees.find((e) => e.id === employeeId);
    const existingSlots: WeeklySlots = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    if (employee) {
      employee.availability.forEach((slot) => {
        existingSlots[slot.dayOfWeek].push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isExisting: true, // Mark as existing slot from database
        });
      });
    }

    setWeeklySlots(existingSlots);
    setTempTimes({
      0: { start: '09:00', end: '17:00' },
      1: { start: '09:00', end: '17:00' },
      2: { start: '09:00', end: '17:00' },
      3: { start: '09:00', end: '17:00' },
      4: { start: '09:00', end: '17:00' },
      5: { start: '09:00', end: '17:00' },
      6: { start: '09:00', end: '17:00' },
    });
    setAvailabilityDialogOpen(true);
  };

  const handleOpenOverrideDialog = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setOverrideDialogOpen(true);
  };

  const handleSetAvailability = async () => {
    try {
      if (!selectedEmployeeId) return;

      // Count total slots to add
      const totalSlots = Object.values(weeklySlots).reduce((sum, slots) => sum + slots.length, 0);

      if (totalSlots === 0) {
        showError({
          title: 'No time slots added',
          message: 'Please add at least one time slot before saving.',
        });
        return;
      }

      // Add all slots for all days
      for (const [dayOfWeek, slots] of Object.entries(weeklySlots)) {
        for (const slot of slots) {
          await availabilityService.setRecurringAvailability({
            employeeId: selectedEmployeeId,
            dayOfWeek: Number(dayOfWeek),
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          });
        }
      }

      await loadAllData();
      setAvailabilityDialogOpen(false);
    } catch (err: any) {
      showError({
        title: 'Failed to set availability',
        message: err.message,
      });
    }
  };

  const handleAddSlotToDay = (dayOfWeek: number, startTime: string, endTime: string) => {
    if (!startTime || !endTime) {
      showError({
        title: 'Invalid time',
        message: 'Please enter both start and end times.',
      });
      return;
    }

    if (startTime >= endTime) {
      showError({
        title: 'Invalid time range',
        message: 'End time must be after start time.',
      });
      return;
    }

    setWeeklySlots((prev) => ({
      ...prev,
      [dayOfWeek]: [...prev[dayOfWeek], { startTime, endTime }],
    }));
  };

  const handleRemoveSlotFromDay = async (dayOfWeek: number, slotIndex: number) => {
    const slot = weeklySlots[dayOfWeek][slotIndex];

    // If it's an existing slot from the database, delete it via API
    if (slot.isExisting && slot.id) {
      const confirmed = await confirm({
        title: 'Delete Time Slot',
        message: `Are you sure you want to delete the ${slot.startTime} - ${slot.endTime} time slot?`,
        confirmText: 'Delete',
        severity: 'warning',
      });

      if (confirmed) {
        try {
          await availabilityService.deleteRecurringAvailability(slot.id);

          // Update local state immediately by removing the slot
          setWeeklySlots((prev) => ({
            ...prev,
            [dayOfWeek]: prev[dayOfWeek].filter((_, index) => index !== slotIndex),
          }));

          // Reload data in background to sync with server
          await loadAllData();
        } catch (err: any) {
          showError({
            title: 'Failed to delete time slot',
            message: err.message,
          });
        }
      }
    } else {
      // For newly added slots (not yet saved), just remove from local state
      setWeeklySlots((prev) => ({
        ...prev,
        [dayOfWeek]: prev[dayOfWeek].filter((_, index) => index !== slotIndex),
      }));
    }
  };

  const handleApplyQuickTemplate = (template: keyof typeof QUICK_SCHEDULES) => {
    const schedule = QUICK_SCHEDULES[template];
    const newSlots: WeeklySlots = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    schedule.days.forEach((day) => {
      newSlots[day] = [{ startTime: schedule.start, endTime: schedule.end }];
    });

    setWeeklySlots(newSlots);
  };

  const handleUpdateTempTime = (dayOfWeek: number, field: 'start' | 'end', value: string) => {
    setTempTimes((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  const handleAddOverride = async () => {
    try {
      if (!selectedEmployeeId) return;

      await availabilityService.addOverride({
        employeeId: selectedEmployeeId,
        ...overrideForm,
      });

      await loadAllData();
      setOverrideDialogOpen(false);
      setOverrideForm({
        date: new Date(),
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false,
        reason: '',
      });
    } catch (err: any) {
      showError({
        title: 'Failed to add override',
        message: err.message,
      });
    }
  };

  const handleDeleteOverride = async (employeeId: string, overrideId: string, isAvailable: boolean) => {
    const confirmed = await confirm({
      title: 'Delete Override',
      message: `Are you sure you want to delete this ${isAvailable ? 'extra shift' : 'time off'}?`,
      confirmText: 'Delete',
      severity: 'warning',
    });

    if (confirmed) {
      try {
        await availabilityService.deleteOverride(overrideId);
        await loadAllData();
      } catch (err: any) {
        showError({
          title: 'Failed to delete override',
          message: err.message,
        });
      }
    }
  };

  const handleQuickSchedule = async (employeeId: string, scheduleType: keyof typeof QUICK_SCHEDULES) => {
    const confirmed = await confirm({
      title: 'Apply Quick Schedule',
      message: `Apply ${scheduleType.replace('_', ' ')} schedule? This will add multiple time slots.`,
      confirmText: 'Apply',
      severity: 'info',
    });

    if (confirmed) {
      try {
        const schedule = QUICK_SCHEDULES[scheduleType];
        for (const day of schedule.days) {
          await availabilityService.setRecurringAvailability({
            employeeId,
            dayOfWeek: day,
            startTime: schedule.start,
            endTime: schedule.end,
            isAvailable: true,
          });
        }
        await loadAllData();
      } catch (err: any) {
        showError({
          title: 'Failed to apply quick schedule',
          message: err.message,
        });
      }
    }
  };

  const getAvailabilityForDay = (availability: EmployeeAvailability[], dayOfWeek: number) => {
    return availability.filter((a) => a.dayOfWeek === dayOfWeek);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button */}
      <Box mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/appointments')}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          Back to Appointments
        </Button>
      </Box>

      {/* Header */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 1, sm: 0 }}
        mb={3}
      >
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Employee Availability
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {employees.length} Team Member{employees.length !== 1 ? 's' : ''} (Staff & Admin)
        </Typography>
      </Box>

      {/* Employee Cards Grid */}
      <Grid container spacing={3}>
        {employees.map((employee) => {
          const isExpanded = expandedCards.has(employee.id);

          return (
            <Grid size={{ xs: 12 }} key={employee.id}>
              <Card>
                <CardContent>
                  {/* Card Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }} flex={1}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                      >
                        {getInitials(employee.firstName, employee.lastName)}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {employee.email}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={() => toggleCardExpanded(employee.id)}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  {/* Metrics Chips */}
                  <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                    <Chip
                      icon={<ScheduleIcon />}
                      label={`${employee.activeDays} Active Days`}
                      color={employee.activeDays > 0 ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`${employee.totalSlots} Time Slots`}
                      size="small"
                    />
                    <Chip
                      icon={<EventIcon />}
                      label={`${employee.upcomingOverrides.length} Upcoming Overrides`}
                      color={employee.upcomingOverrides.length > 0 ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>

                  {/* Quick Actions (when collapsed) */}
                  {!isExpanded && (
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1} mt={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ScheduleIcon />}
                        onClick={() => handleOpenAvailabilityDialog(employee.id)}
                        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                      >
                        Manage Availability
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EventIcon />}
                        onClick={() => handleOpenOverrideDialog(employee.id)}
                        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                      >
                        Add Override
                      </Button>
                    </Box>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <Box mt={3}>
                      {/* Quick Schedule Buttons */}
                      <Box mb={2}>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: { xs: 0.5, sm: 1 } }}
                        >
                          Quick Schedules
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={{ xs: 0.5, sm: 1 }}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'WEEKDAYS')}
                            sx={{
                              textTransform: 'none',
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              px: { xs: 1, sm: 2 },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            Mon-Fri 9am-5pm
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'WEEKENDS')}
                            sx={{
                              textTransform: 'none',
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              px: { xs: 1, sm: 2 },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            Weekends 10am-4pm
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'ALL_WEEK')}
                            sx={{
                              textTransform: 'none',
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              px: { xs: 1, sm: 2 },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            All Week 9am-5pm
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'EXTENDED')}
                            sx={{
                              textTransform: 'none',
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              px: { xs: 1, sm: 2 },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            All Week 9am-10pm
                          </Button>
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Weekly Schedule */}
                      <Box mb={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                          <Typography variant="subtitle2">
                            Weekly Schedule
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ScheduleIcon />}
                            onClick={() => handleOpenAvailabilityDialog(employee.id)}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                          >
                            Manage Availability
                          </Button>
                        </Box>

                        {/* Desktop Table View */}
                        <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', sm: 'block' } }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Day</strong></TableCell>
                                <TableCell><strong>Time Slots</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {DAYS_OF_WEEK.map((day) => {
                                const slots = getAvailabilityForDay(employee.availability, day.value);
                                return (
                                  <TableRow key={day.value}>
                                    <TableCell width="150px">
                                      <strong>{day.label}</strong>
                                    </TableCell>
                                    <TableCell>
                                      {slots.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                          Not available
                                        </Typography>
                                      ) : (
                                        <Box display="flex" flexWrap="wrap" gap={1}>
                                          {slots.map((slot) => (
                                            <Chip
                                              key={slot.id}
                                              label={formatTimeRange(slot.startTime, slot.endTime)}
                                              color={slot.isAvailable ? 'success' : 'default'}
                                              size="small"
                                            />
                                          ))}
                                        </Box>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* Mobile Card View */}
                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                          <Stack spacing={1}>
                            {DAYS_OF_WEEK.map((day) => {
                              const slots = getAvailabilityForDay(employee.availability, day.value);
                              return (
                                <Paper key={day.value} variant="outlined" sx={{ p: 1.5 }}>
                                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                    {day.label}
                                  </Typography>
                                  {slots.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                                      Not available
                                    </Typography>
                                  ) : (
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                      {slots.map((slot) => (
                                        <Chip
                                          key={slot.id}
                                          label={formatTimeRange(slot.startTime, slot.endTime)}
                                          color={slot.isAvailable ? 'success' : 'default'}
                                          size="small"
                                          sx={{ fontSize: '0.75rem', height: '24px' }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Paper>
                              );
                            })}
                          </Stack>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Upcoming Overrides */}
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                          <Typography variant="subtitle2">
                            Upcoming Time Off & Extra Shifts
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EventIcon />}
                            onClick={() => handleOpenOverrideDialog(employee.id)}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                          >
                            Add Override
                          </Button>
                        </Box>
                        {employee.upcomingOverrides.length === 0 ? (
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary" align="center">
                              No upcoming overrides
                            </Typography>
                          </Paper>
                        ) : (
                          <>
                            {/* Desktop Table View */}
                            <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', sm: 'block' } }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Time</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Reason</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {employee.upcomingOverrides.map((override) => (
                                    <TableRow key={override.id}>
                                      <TableCell>
                                        {new Date(override.date).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        {formatTimeRange(override.startTime, override.endTime)}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          icon={override.isAvailable ? <EventAvailableIcon /> : <EventBusyIcon />}
                                          label={override.isAvailable ? 'Extra Shift' : 'Time Off'}
                                          color={override.isAvailable ? 'success' : 'error'}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell>{override.reason || '—'}</TableCell>
                                      <TableCell align="right">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteOverride(employee.id, override.id, override.isAvailable)}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* Mobile Card View */}
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                              <Stack spacing={1}>
                                {employee.upcomingOverrides.map((override) => (
                                  <Paper key={override.id} variant="outlined" sx={{ p: 1.5 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                      <Box flex={1}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                          {new Date(override.date).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                                          {formatTimeRange(override.startTime, override.endTime)}
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteOverride(employee.id, override.id, override.isAvailable)}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                    <Box display="flex" flexDirection="column" gap={0.5}>
                                      <Chip
                                        icon={override.isAvailable ? <EventAvailableIcon /> : <EventBusyIcon />}
                                        label={override.isAvailable ? 'Extra Shift' : 'Time Off'}
                                        color={override.isAvailable ? 'success' : 'error'}
                                        size="small"
                                        sx={{ width: 'fit-content', fontSize: '0.75rem', height: '24px' }}
                                      />
                                      {override.reason && (
                                        <Typography variant="body2" fontSize="0.8125rem" color="text.secondary">
                                          <strong>Reason:</strong> {override.reason}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Paper>
                                ))}
                              </Stack>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {employees.length === 0 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            No team members found. Add staff or admin users to manage their availability.
          </Typography>
        </Paper>
      )}

      {/* Add Availability Dialog - Redesigned with Card Layout */}
      <Dialog
        open={availabilityDialogOpen}
        onClose={(event, reason) => {
          // Prevent closing on backdrop click
          if (reason === 'backdropClick') {
            return;
          }
          setAvailabilityDialogOpen(false);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: { xs: '100vh', sm: '90vh' },
            m: { xs: 0, sm: 2 },
            borderRadius: { xs: 0, sm: '16px' },
            width: { lg: '1200px' },
            maxWidth: { lg: '1200px' },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 2, sm: 2 },
            pt: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            borderBottom: { xs: 1, sm: 0 },
            borderColor: 'divider',
            bgcolor: 'primary.main',
            color: 'white',
            position: 'relative',
            borderTopLeftRadius: { xs: 0, sm: '16px' },
            borderTopRightRadius: { xs: 0, sm: '16px' },
          }}
        >
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontSize: { xs: '1.125rem', sm: '1.5rem' },
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              Manage Weekly Availability
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, color: 'rgba(255, 255, 255, 0.9)' }}
            >
              {selectedEmployeeId &&
                (() => {
                  const employee = employees.find((e) => e.id === selectedEmployeeId);
                  return employee
                    ? `${employee.firstName} ${employee.lastName}'s Schedule`
                    : '';
                })()}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setAvailabilityDialogOpen(false)}
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
        <DialogContent
          dividers
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          {/* Quick Templates */}
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2 },
              mb: { xs: 2.5, sm: 3 },
              bgcolor: 'background.default',
            }}
          >
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.9375rem', sm: '1rem' },
              }}
            >
              Quick Templates
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 1 }}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="contained"
                size="medium"
                onClick={() => handleApplyQuickTemplate('WEEKDAYS')}
                sx={{
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  py: { xs: 1.5, sm: 1 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Mon-Fri 9am-5pm
              </Button>
              <Button
                variant="contained"
                size="medium"
                onClick={() => handleApplyQuickTemplate('WEEKENDS')}
                sx={{
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  py: { xs: 1.5, sm: 1 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Sat-Sun 10am-4pm
              </Button>
              <Button
                variant="contained"
                size="medium"
                onClick={() => handleApplyQuickTemplate('ALL_WEEK')}
                sx={{
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  py: { xs: 1.5, sm: 1 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Every Day 9am-5pm
              </Button>
              <Button
                variant="contained"
                size="medium"
                onClick={() => handleApplyQuickTemplate('EXTENDED')}
                sx={{
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  py: { xs: 1.5, sm: 1 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Every Day 9am-10pm
              </Button>
            </Stack>
          </Paper>

          {/* Day Cards Grid */}
          <Grid container spacing={{ xs: 2, sm: 2 }}>
            {DAYS_OF_WEEK.map((day) => {
              const hasSlots = weeklySlots[day.value].length > 0;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 6 }} key={day.value}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      border: hasSlots ? 2 : 1,
                      borderColor: hasSlots ? 'primary.main' : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 2 },
                        '&:last-child': { pb: { xs: 2, sm: 2 } },
                      }}
                    >
                      {/* Day Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={{ xs: 1.5, sm: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                            }}
                          >
                            {day.label}
                          </Typography>
                          {hasSlots && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label={`${weeklySlots[day.value].length} slot${weeklySlots[day.value].length !== 1 ? 's' : ''}`}
                              color="primary"
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Existing Slots */}
                      {hasSlots ? (
                        <Box mb={{ xs: 2, sm: 2 }}>
                          <Box display="flex" flexWrap="wrap" gap={{ xs: 1, sm: 1.5 }}>
                            {weeklySlots[day.value].map((slot, index) => (
                              <Chip
                                key={index}
                                icon={<AccessTimeIcon />}
                                label={formatTimeRange(slot.startTime, slot.endTime)}
                                onDelete={() => handleRemoveSlotFromDay(day.value, index)}
                                color="primary"
                                variant="filled"
                                size="medium"
                                sx={{
                                  fontWeight: 'medium',
                                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                  height: 'auto',
                                  minHeight: { xs: '44px', sm: '40px' },
                                  py: { xs: 1.75, sm: 1.5 },
                                  px: 0.5,
                                  '& .MuiChip-label': {
                                    px: { xs: 1.5, sm: 2 },
                                    py: 0.5,
                                  },
                                  '& .MuiChip-icon': {
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                    ml: { xs: 1.25, sm: 1.5 },
                                    mr: -0.5,
                                  },
                                  '& .MuiChip-deleteIcon': {
                                    fontSize: { xs: '1.3rem', sm: '1.25rem' },
                                    mr: { xs: 0.75, sm: 1 },
                                    ml: 0.5,
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      ) : (
                        <Box mb={{ xs: 2, sm: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontStyle: 'italic',
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            }}
                          >
                            No time slots added yet
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: { xs: 2, sm: 2 } }} />

                      {/* Add New Slot */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{
                            fontWeight: 'bold',
                            mb: { xs: 1.5, sm: 1 },
                            fontSize: { xs: '0.875rem', sm: '0.875rem' },
                          }}
                        >
                          Add Time Slot
                        </Typography>
                        <Stack spacing={{ xs: 1.5, sm: 1 }}>
                          <Grid container spacing={{ xs: 1.5, sm: 1 }}>
                            <Grid size={{ xs: 6 }}>
                              <TextField
                                fullWidth
                                size="medium"
                                label="Start"
                                type="time"
                                value={tempTimes[day.value].start}
                                onChange={(e) => handleUpdateTempTime(day.value, 'start', e.target.value)}
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: { xs: '48px', sm: '40px' },
                                  },
                                  '& .MuiInputBase-input': {
                                    fontSize: { xs: '1rem', sm: '1rem' },
                                    py: { xs: 1.5, sm: 1 },
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <TextField
                                fullWidth
                                size="medium"
                                label="End"
                                type="time"
                                value={tempTimes[day.value].end}
                                onChange={(e) => handleUpdateTempTime(day.value, 'end', e.target.value)}
                                slotProps={{
                                  inputLabel: { shrink: true },
                                }}
                                sx={{
                                  '& .MuiInputBase-root': {
                                    height: { xs: '48px', sm: '40px' },
                                  },
                                  '& .MuiInputBase-input': {
                                    fontSize: { xs: '1rem', sm: '1rem' },
                                    py: { xs: 1.5, sm: 1 },
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                          <Button
                            fullWidth
                            variant="outlined"
                            size="medium"
                            startIcon={<AddIcon />}
                            onClick={() =>
                              handleAddSlotToDay(
                                day.value,
                                tempTimes[day.value].start,
                                tempTimes[day.value].end
                              )
                            }
                            sx={{
                              textTransform: 'none',
                              fontSize: { xs: '0.9375rem', sm: '0.875rem' },
                              py: { xs: 1.5, sm: 1 },
                              minHeight: { xs: '48px', sm: '40px' },
                            }}
                          >
                            Add to {day.label}
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2.5, sm: 2 },
            borderTop: { xs: 2, sm: 0 },
            borderColor: { xs: 'divider', sm: 'transparent' },
            bgcolor: { xs: 'background.paper', sm: 'transparent' },
            position: { xs: 'sticky', sm: 'static' },
            bottom: { xs: 0, sm: 'auto' },
            zIndex: { xs: 1, sm: 'auto' },
            boxShadow: { xs: '0px -2px 8px rgba(0, 0, 0, 0.1)', sm: 'none' },
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: 'column-reverse', sm: 'row' }}
            justifyContent="space-between"
            width="100%"
            alignItems="stretch"
            gap={{ xs: 2, sm: 0 }}
          >
            <Box
              display="flex"
              gap={{ xs: 2, sm: 1 }}
              width={{ xs: '100%', sm: 'auto' }}
              flexDirection={{ xs: 'column', sm: 'row' }}
            >
              <Button
                onClick={() => setAvailabilityDialogOpen(false)}
                size="large"
                variant="outlined"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: { xs: '52px', sm: '40px' },
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  fontWeight: { xs: 'bold', sm: 'medium' },
                  borderWidth: { xs: 2, sm: 1 },
                  order: { xs: 2, sm: 1 },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSetAvailability}
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minHeight: { xs: '52px', sm: '40px' },
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  fontWeight: 'bold',
                  boxShadow: { xs: 2, sm: 1 },
                  order: { xs: 1, sm: 2 },
                  '&:hover': {
                    boxShadow: { xs: 4, sm: 2 },
                  },
                }}
              >
                Save All Changes
              </Button>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: { xs: 'medium', sm: 'normal' },
                textAlign: { xs: 'center', sm: 'left' },
                alignSelf: 'center',
                order: { xs: 3, sm: 1 },
              }}
            >
              Total: {Object.values(weeklySlots).reduce((sum, slots) => sum + slots.length, 0)} time slot(s)
            </Typography>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Add Override Dialog */}
      <Dialog
        open={overrideDialogOpen}
        onClose={(event, reason) => {
          // Prevent closing on backdrop click
          if (reason === 'backdropClick') {
            return;
          }
          setOverrideDialogOpen(false);
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            position: 'relative',
          }}
        >
          Add Time Off / Extra Shift
          <IconButton
            aria-label="close"
            onClick={() => setOverrideDialogOpen(false)}
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
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <ToggleButtonGroup
                  value={overrideForm.isAvailable ? 'available' : 'unavailable'}
                  exclusive
                  onChange={(_, value) => {
                    if (value !== null) {
                      setOverrideForm({ ...overrideForm, isAvailable: value === 'available' });
                    }
                  }}
                  fullWidth
                >
                  <ToggleButton value="unavailable" color="error">
                    <EventBusyIcon sx={{ mr: 1 }} />
                    Time Off
                  </ToggleButton>
                  <ToggleButton value="available" color="success">
                    <EventAvailableIcon sx={{ mr: 1 }} />
                    Extra Shift
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DatePicker
                  label="Date"
                  value={overrideForm.date}
                  onChange={(date) => date && setOverrideForm({ ...overrideForm, date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={overrideForm.startTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={overrideForm.endTime}
                  onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="Vacation, Sick Leave, Extra Coverage..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddOverride} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
