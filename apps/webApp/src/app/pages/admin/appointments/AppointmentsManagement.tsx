import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
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
  MenuItem,
  Paper,
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
import { AppointmentStatus } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentDialog } from '../../../components/appointments/AppointmentDialog';
import { useConfirmation } from '../../../contexts/ConfirmationContext';
import { useError } from '../../../contexts/ErrorContext';
import {
  Appointment,
  appointmentService,
} from '../../../services/appointment.service';

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
  const [view, setView] = useState<'all' | 'today'>('today');

  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: '' as AppointmentStatus | '',
  });

  const { showError } = useError();
  const { confirm } = useConfirmation();
  const navigate = useNavigate();

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
      ).toLocaleDateString()} at ${appointment.scheduledTime}?`,
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
    return endTime ? `${time} - ${endTime}` : time;
  };

  const renderAppointmentRow = (appointment: Appointment) => (
    <TableRow key={appointment.id} hover>
      <TableCell>
        {new Date(appointment.scheduledDate).toLocaleDateString()}
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Appointments</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={() => navigate('/admin/appointments/availability')}
            >
              Manage Availability
            </Button>
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
            variant={view === 'today' ? 'contained' : 'outlined'}
            startIcon={<TodayIcon />}
            onClick={() => setView('today')}
            sx={{ mr: 1 }}
          >
            Today ({todayAppointments.length})
          </Button>
          <Button
            variant={view === 'all' ? 'contained' : 'outlined'}
            startIcon={<CalendarIcon />}
            onClick={() => setView('all')}
          >
            All Appointments
          </Button>
        </Box>

        {/* Today's Appointments */}
        {view === 'today' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule -{' '}
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {todayAppointments.length === 0 ? (
                <Alert severity="info">
                  No appointments scheduled for today
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
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
                      {todayAppointments.map(renderAppointmentRow)}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
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

            {/* Appointments Table */}
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
          </Paper>
        )}

        {/* Dialog */}
        <AppointmentDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleDialogSuccess}
          appointment={selectedAppointment}
        />
      </Box>
    </LocalizationProvider>
  );
};
