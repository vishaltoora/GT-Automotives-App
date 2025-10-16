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
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
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
import { format12Hour } from '../../utils/timeFormat';

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

  // Helper function to get current time rounded to next 15-minute interval
  const getCurrentTimeRounded = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 15) * 15;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Helper function to check if selected date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get minimum time based on selected date
  const getMinTime = () => {
    if (isToday(formData.scheduledDate)) {
      return getCurrentTimeRounded();
    }
    return undefined;
  };

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || '',
    vehicleId: '',
    employeeId: '',
    scheduledDate: new Date(),
    scheduledTime: getCurrentTimeRounded(),
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

  // Auto-adjust time if date changes to today and selected time is in the past
  useEffect(() => {
    if (isToday(formData.scheduledDate)) {
      const minTime = getCurrentTimeRounded();
      if (formData.scheduledTime < minTime) {
        setFormData(prev => ({ ...prev, scheduledTime: minTime }));
      }
    }
  }, [formData.scheduledDate]);

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
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const allUsers = await userService.getUsers();
      const staffUsers = allUsers.filter(
        (user) => user.role?.name === 'STAFF' && user.isActive
      );
      setEmployees(staffUsers);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      const customer = await customerService.getCustomer(customerId);
      setSelectedCustomer(customer);
    } catch (err) {
      // Silently fail
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
      setAvailableSlots(slots);
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
      // Handle specific error types
      if (err.response?.status === 409) {
        // Conflict error - scheduling conflict
        const message = err.response?.data?.message || 'Scheduling conflict detected';
        setError(
          `${message}. The selected time slot may already be booked. Please choose a different time or employee.`
        );
      } else {
        // Generic error
        setError(err.response?.data?.message || 'Failed to save appointment');
      }
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
      scheduledTime: getCurrentTimeRounded(),
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
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return; // Prevent closing on backdrop click
          }
          handleClose();
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
          <Box sx={{ fontWeight: 'bold', color: 'white' }}>
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
                  filterOptions={(options, { inputValue }) => {
                    // Filter by name, business name, or phone number
                    const filterValue = inputValue.toLowerCase();
                    return options.filter((customer) => {
                      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
                      const businessName = customer.businessName?.toLowerCase() || '';
                      const phone = customer.phone?.toLowerCase() || '';

                      return (
                        fullName.includes(filterValue) ||
                        businessName.includes(filterValue) ||
                        phone.includes(filterValue)
                      );
                    });
                  }}
                  renderOption={(props, customer) => (
                    <li {...props} key={customer.id}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <Box sx={{ fontWeight: 600 }}>
                          {customer.businessName
                            ? `${customer.businessName}`
                            : `${customer.firstName} ${customer.lastName}`}
                        </Box>
                        {customer.businessName && (
                          <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {customer.firstName} {customer.lastName}
                          </Box>
                        )}
                        {customer.phone && (
                          <Box sx={{ fontSize: '0.875rem', color: 'primary.main' }}>
                            {customer.phone}
                          </Box>
                        )}
                      </Box>
                    </li>
                  )}
                  loading={customersLoading}
                  disabled={!!appointment}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer (search by name or phone)"
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
                inputProps={{
                  step: 900,
                  min: getMinTime()
                }}
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
                        } employee(s) available at ${format12Hour(formData.scheduledTime)}`
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
