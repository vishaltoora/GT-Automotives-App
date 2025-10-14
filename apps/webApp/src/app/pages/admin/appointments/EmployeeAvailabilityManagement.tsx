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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  availabilityService,
  EmployeeAvailability,
  TimeSlotOverride,
} from '../../../services/availability.service';
import { userService, User } from '../../../services/user.service';
import { useError } from '../../../contexts/ErrorContext';
import { useConfirmation } from '../../../contexts/ConfirmationContext';

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

  // Availability Form
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
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

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getUsers();
      const staffUsers = allUsers.filter((user) => user.role?.name === 'STAFF' && user.isActive);

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
    setAvailabilityDialogOpen(true);
  };

  const handleOpenOverrideDialog = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setOverrideDialogOpen(true);
  };

  const handleSetAvailability = async () => {
    try {
      if (!selectedEmployeeId) return;

      await availabilityService.setRecurringAvailability({
        employeeId: selectedEmployeeId,
        ...availabilityForm,
      });

      await loadAllData();
      setAvailabilityDialogOpen(false);
      setAvailabilityForm({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      });
    } catch (err: any) {
      showError({
        title: 'Failed to set availability',
        message: err.message,
      });
    }
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Employee Availability</Typography>
        <Typography variant="body2" color="text.secondary">
          {employees.length} Staff Member{employees.length !== 1 ? 's' : ''}
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
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                        }}
                      >
                        {getInitials(employee.firstName, employee.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
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
                    <Box display="flex" gap={1} mt={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAvailabilityDialog(employee.id)}
                      >
                        Add Slot
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EventIcon />}
                        onClick={() => handleOpenOverrideDialog(employee.id)}
                      >
                        Add Override
                      </Button>
                    </Box>
                  )}

                  {/* Expanded Content */}
                  {isExpanded && (
                    <Box mt={3}>
                      {/* Quick Schedule Buttons */}
                      <Box mb={3}>
                        <Typography variant="subtitle2" gutterBottom>
                          Quick Schedules
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'WEEKDAYS')}
                          >
                            Mon-Fri 9-5
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'WEEKENDS')}
                          >
                            Weekends 10-4
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickSchedule(employee.id, 'ALL_WEEK')}
                          >
                            All Week 9-5
                          </Button>
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Weekly Schedule */}
                      <Box mb={3}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle2">
                            Weekly Schedule
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenAvailabilityDialog(employee.id)}
                          >
                            Add Time Slot
                          </Button>
                        </Box>
                        <TableContainer component={Paper} variant="outlined">
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
                                              label={`${slot.startTime} - ${slot.endTime}`}
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
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Upcoming Overrides */}
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle2">
                            Upcoming Time Off & Extra Shifts
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<EventIcon />}
                            onClick={() => handleOpenOverrideDialog(employee.id)}
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
                          <TableContainer component={Paper} variant="outlined">
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
                                      {override.startTime} - {override.endTime}
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
            No staff members found. Add staff users to manage their availability.
          </Typography>
        </Paper>
      )}

      {/* Add Availability Dialog */}
      <Dialog open={availabilityDialogOpen} onClose={() => setAvailabilityDialogOpen(false)}>
        <DialogTitle>Add Weekly Time Slot</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Day of Week</InputLabel>
                <Select
                  value={availabilityForm.dayOfWeek}
                  onChange={(e) =>
                    setAvailabilityForm({ ...availabilityForm, dayOfWeek: Number(e.target.value) })
                  }
                  label="Day of Week"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={availabilityForm.startTime}
                onChange={(e) =>
                  setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={availabilityForm.endTime}
                onChange={(e) =>
                  setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvailabilityDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSetAvailability} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Override Dialog */}
      <Dialog open={overrideDialogOpen} onClose={() => setOverrideDialogOpen(false)}>
        <DialogTitle>Add Time Off / Extra Shift</DialogTitle>
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
