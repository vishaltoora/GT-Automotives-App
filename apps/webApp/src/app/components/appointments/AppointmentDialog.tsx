import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  CircularProgress,
  Alert,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  appointmentService,
  Appointment,
  AvailableSlot,
} from '../../services/appointment.service';
import { customerService, Customer } from '../../services/customer.service';
import { userService, User } from '../../services/user.service';
import { CustomerDialog } from '../customers/CustomerDialog';

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment;
  preselectedCustomerId?: string;
}

const SERVICE_TYPES = [
  { value: 'TIRE_CHANGE', label: 'Tire Change', duration: 30 },
  { value: 'TIRE_ROTATION', label: 'Tire Rotation', duration: 45 },
  { value: 'TIRE_REPAIR', label: 'Tire Repair', duration: 60 },
  { value: 'WHEEL_ALIGNMENT', label: 'Wheel Alignment', duration: 60 },
  { value: 'TIRE_BALANCE', label: 'Tire Balance', duration: 30 },
  { value: 'INSPECTION', label: 'Inspection', duration: 30 },
  { value: 'OIL_CHANGE', label: 'Oil Change', duration: 45 },
  { value: 'BRAKE_SERVICE', label: 'Brake Service', duration: 90 },
  { value: 'OTHER', label: 'Other Service', duration: 60 },
];

export const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  appointment,
  preselectedCustomerId,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || '',
    vehicleId: '',
    employeeId: '',
    scheduledDate: new Date(),
    scheduledTime: '09:00',
    duration: 60,
    serviceType: 'TIRE_CHANGE',
    notes: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    if (open) {
      loadCustomers();
      loadEmployees();
      if (appointment) {
        setFormData({
          customerId: appointment.customerId,
          vehicleId: appointment.vehicleId || '',
          employeeId: appointment.employeeId || '',
          scheduledDate: new Date(appointment.scheduledDate),
          scheduledTime: appointment.scheduledTime,
          duration: appointment.duration,
          serviceType: appointment.serviceType,
          notes: appointment.notes || '',
        });
      } else if (preselectedCustomerId) {
        loadCustomerDetails(preselectedCustomerId);
      }

      // Check availability on dialog open (for default date/time)
      checkAvailability();
    }
  }, [open, appointment, preselectedCustomerId]);

  useEffect(() => {
    if (formData.scheduledDate && formData.duration && formData.scheduledTime) {
      checkAvailability();
    }
  }, [formData.scheduledDate, formData.duration, formData.scheduledTime]);

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const allUsers = await userService.getUsers();
      console.log('All users loaded:', allUsers);
      const staffUsers = allUsers.filter(
        (user) => user.role?.name === 'STAFF' && user.isActive
      );
      console.log('Filtered STAFF users:', staffUsers);
      setEmployees(staffUsers);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      const customer = await customerService.getCustomer(customerId);
      setSelectedCustomer(customer);
    } catch (err) {
      console.error('Failed to load customer:', err);
    }
  };

  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      const slots = await appointmentService.checkAvailability({
        date: formData.scheduledDate,
        duration: formData.duration,
        employeeId: formData.employeeId || undefined,
      });
      console.log('[AVAILABILITY CHECK] Received slots:', slots);
      console.log('[AVAILABILITY CHECK] Current time:', formData.scheduledTime);
      console.log('[AVAILABILITY CHECK] Slots at current time:',
        slots.filter(s => s.startTime === formData.scheduledTime)
      );
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Failed to check availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleServiceTypeChange = (serviceType: string) => {
    const service = SERVICE_TYPES.find((s) => s.value === serviceType);
    setFormData({
      ...formData,
      serviceType,
      duration: service?.duration || 60,
    });
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setFormData({
      ...formData,
      customerId: customer?.id || '',
      vehicleId: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!formData.customerId) {
        setError('Please select a customer');
        return;
      }

      // Validate employee availability if manually selected
      if (formData.employeeId) {
        const employeeSlot = availableSlots.find(
          (slot) =>
            slot.employeeId === formData.employeeId &&
            slot.startTime === formData.scheduledTime
        );

        if (employeeSlot && !employeeSlot.available) {
          setError(
            `The selected employee is not available at ${formData.scheduledTime}. Please choose a different time or use auto-assign.`
          );
          return;
        }

        // Additional check: if we have availability data but employee not in list, they're unavailable
        if (availableSlots.length > 0 && !employeeSlot) {
          setError(
            `The selected employee has no availability at ${formData.scheduledTime}. Please choose a different time or employee.`
          );
          return;
        }
      }

      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, {
          employeeId: formData.employeeId || undefined,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          duration: formData.duration,
          notes: formData.notes || undefined,
        });
      } else {
        await appointmentService.createAppointment({
          customerId: formData.customerId,
          vehicleId: formData.vehicleId || undefined,
          employeeId: formData.employeeId || undefined,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          duration: formData.duration,
          serviceType: formData.serviceType,
          notes: formData.notes || undefined,
        });
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customerId: preselectedCustomerId || '',
      vehicleId: '',
      employeeId: '',
      scheduledDate: new Date(),
      scheduledTime: '09:00',
      duration: 60,
      serviceType: 'TIRE_CHANGE',
      notes: '',
    });
    setSelectedCustomer(null);
    setError(null);
    setAvailableSlots([]);
    onClose();
  };

  const handleAddCustomer = () => {
    setCustomerDialogOpen(true);
  };

  const handleCustomerDialogClose = () => {
    setCustomerDialogOpen(false);
  };

  const handleCustomerCreated = async () => {
    setCustomerDialogOpen(false);
    await loadCustomers();
  };

  const getAvailableTimesForSelectedTime = () => {
    return availableSlots.filter(
      (slot) => slot.startTime === formData.scheduledTime && slot.available
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Customer Selection */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  options={customers}
                  value={selectedCustomer}
                  onChange={(_, value) => handleCustomerChange(value)}
                  getOptionLabel={(customer) =>
                    customer.businessName
                      ? `${customer.businessName} (${customer.firstName} ${customer.lastName})`
                      : `${customer.firstName} ${customer.lastName}`
                  }
                  loading={customersLoading}
                  disabled={!!appointment}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer"
                      required
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {customersLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                {!appointment && (
                  <Tooltip title="Add New Customer">
                    <IconButton
                      onClick={handleAddCustomer}
                      color="primary"
                      sx={{
                        mt: 0.5,
                        border: '1px dashed',
                        borderColor: 'primary.main',
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>

            {/* Vehicle Selection */}
            {selectedCustomer?.vehicles &&
              selectedCustomer.vehicles.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle (Optional)</InputLabel>
                    <Select
                      value={formData.vehicleId}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicleId: e.target.value })
                      }
                      label="Vehicle (Optional)"
                    >
                      <MenuItem value="">None</MenuItem>
                      {selectedCustomer.vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                          {vehicle.licensePlate
                            ? ` - ${vehicle.licensePlate}`
                            : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

            {/* Employee Assignment */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Assign to Employee (Optional)</InputLabel>
                <Select
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  label="Assign to Employee (Optional)"
                  disabled={employeesLoading}
                >
                  <MenuItem value="">
                    <em>Auto-assign (system will find available employee)</em>
                  </MenuItem>
                  {employees.map((employee) => {
                    // Check if this employee is available at selected time
                    const isAvailable = availableSlots.some(
                      (slot) =>
                        slot.employeeId === employee.id &&
                        slot.startTime === formData.scheduledTime &&
                        slot.available
                    );
                    const hasSlots = availableSlots.some(
                      (slot) => slot.employeeId === employee.id
                    );

                    // Disable if we have availability data and they're unavailable
                    const isDisabled = hasSlots && !isAvailable;

                    return (
                      <MenuItem
                        key={employee.id}
                        value={employee.id}
                        disabled={isDisabled}
                        sx={isDisabled ? { opacity: 0.5 } : {}}
                      >
                        {employee.firstName} {employee.lastName}
                        {isDisabled && ' (Already booked)'}
                        {hasSlots && isAvailable && ' ✅'}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            {/* Service Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={formData.serviceType}
                  onChange={(e) => handleServiceTypeChange(e.target.value)}
                  label="Service Type"
                  disabled={!!appointment}
                >
                  {SERVICE_TYPES.map((service) => (
                    <MenuItem key={service.value} value={service.value}>
                      {service.label} ({service.duration} min)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Duration */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 15, max: 480, step: 15 }}
                required
              />
            </Grid>

            {/* Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Date"
                value={formData.scheduledDate}
                onChange={(date) =>
                  date && setFormData({ ...formData, scheduledDate: date })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>

            {/* Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 900 }}
                required
              />
            </Grid>

            {/* Available Slots */}
            {checkingAvailability ? (
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} />
                  <span>Checking availability...</span>
                </Box>
              </Grid>
            ) : (
              availableSlots.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Alert
                    severity={
                      getAvailableTimesForSelectedTime().length > 0
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {getAvailableTimesForSelectedTime().length > 0
                      ? `${
                          getAvailableTimesForSelectedTime().length
                        } employee(s) available at ${formData.scheduledTime}`
                      : 'No employees available at this time. Please select a different time.'}
                  </Alert>
                  {getAvailableTimesForSelectedTime().length > 0 && (
                    <Box mt={1}>
                      {getAvailableTimesForSelectedTime().map((slot) => (
                        <Chip
                          key={slot.employeeId}
                          label={slot.employeeName}
                          color="primary"
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
              )
            )}

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={24} />
            ) : appointment ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Customer Dialog for Adding New Customers */}
      <CustomerDialog
        open={customerDialogOpen}
        onClose={handleCustomerDialogClose}
        onSuccess={handleCustomerCreated}
      />
    </LocalizationProvider>
  );
};
