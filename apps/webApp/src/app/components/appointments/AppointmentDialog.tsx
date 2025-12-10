import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Box,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AppointmentResponseDto as Appointment } from '@gt-automotive/data';
import {
  appointmentService,
  AvailableSlot,
} from '../../requests/appointment.requests';
import { customerService, Customer } from '../../requests/customer.requests';
import { userService, User } from '../../requests/user.requests';
import { CustomerDialog } from '../customers/CustomerDialog';
import { CustomerSelectionField } from './CustomerSelectionField';
import { DateTimeSelector } from './DateTimeSelector';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { EmployeeChipSelector } from './EmployeeChipSelector';
import { VehicleSelector } from './VehicleSelector';
import { getCurrentTimeRounded, isToday } from '../../utils/timeUtils';

interface AppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointment?: Appointment;
  preselectedCustomerId?: string;
  preselectedServiceType?: string;
}

export const AppointmentDialog: React.FC<AppointmentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  appointment,
  preselectedCustomerId,
  preselectedServiceType,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || '',
    vehicleId: '',
    employeeId: '', // Deprecated: kept for backward compatibility
    employeeIds: [] as string[], // New: multiple employee IDs
    scheduledDate: new Date(),
    scheduledTime: getCurrentTimeRounded(),
    duration: 60,
    serviceType: preselectedServiceType || 'TIRE_CHANGE',
    appointmentType: 'AT_GARAGE',
    notes: '',
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      loadCustomers();
      loadEmployees();
      if (appointment) {
        // Get employee IDs from either new employees array or old employeeId
        const employeeIds =
          appointment.employees?.map((e) => e.employeeId) ||
          (appointment.employeeId ? [appointment.employeeId] : []);

        setFormData({
          customerId: appointment.customerId,
          vehicleId: appointment.vehicleId || '',
          employeeId: appointment.employeeId || '',
          employeeIds: employeeIds,
          scheduledDate: new Date(appointment.scheduledDate),
          scheduledTime: appointment.scheduledTime,
          duration: appointment.duration,
          serviceType: appointment.serviceType,
          appointmentType: appointment.appointmentType || 'AT_GARAGE',
          notes: appointment.notes || '',
        });

        // Set selected customer for autocomplete
        if (appointment.customer) {
          setSelectedCustomer(appointment.customer as Customer);
        }

        // Set selected employees for autocomplete
        if (appointment.employees && appointment.employees.length > 0) {
          const empObjects = appointment.employees.map((e) => e.employee);
          setSelectedEmployees(
            empObjects.map(
              (e) =>
                ({
                  id: e.id,
                  firstName: e.firstName,
                  lastName: e.lastName,
                  email: e.email,
                } as User)
            )
          );
        } else if (appointment.employee) {
          setSelectedEmployees([
            {
              id: appointment.employee.id,
              firstName: appointment.employee.firstName,
              lastName: appointment.employee.lastName,
              email: appointment.employee.email,
            } as User,
          ]);
        }
      } else {
        // Handle preselected values when not editing an appointment
        if (preselectedCustomerId) {
          loadCustomerDetails(preselectedCustomerId);
        }
        if (preselectedServiceType) {
          setFormData((prev) => ({ ...prev, serviceType: preselectedServiceType }));
        }
      }

      // Check availability on dialog open (for default date/time)
      checkAvailability();
    }
  }, [open, appointment, preselectedCustomerId, preselectedServiceType]);

  // Auto-adjust time if date changes to today and selected time is in the past
  useEffect(() => {
    if (isToday(formData.scheduledDate)) {
      const minTime = getCurrentTimeRounded();
      if (formData.scheduledTime < minTime) {
        setFormData((prev) => ({ ...prev, scheduledTime: minTime }));
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
      // Use getCustomersSimple() for faster loading - no stats needed for autocomplete
      const data = await customerService.getCustomersSimple();
      setCustomers(data);
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const allUsers = await userService.getUsers();
      const staffAndAdminUsers = allUsers.filter(
        (user) =>
          (user.role?.name === 'STAFF' ||
            user.role?.name === 'ADMIN' ||
            user.role?.name === 'SUPERVISOR') &&
          user.isActive
      );

      // Deduplicate by user ID (in case same user appears multiple times)
      const uniqueUsers = staffAndAdminUsers.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );

      setEmployees(uniqueUsers);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      const customer = await customerService.getCustomer(customerId);
      setSelectedCustomer(customer);
      setFormData((prev) => ({ ...prev, customerId: customer.id }));
    } catch (err) {
      // Silently fail
    }
  };

  const checkAvailability = async () => {
    try {
      const slots = await appointmentService.checkAvailability({
        date: formData.scheduledDate,
        duration: formData.duration,
        employeeId: formData.employeeId || undefined,
      });
      setAvailableSlots(slots);
    } catch (err) {
      // Silently fail
    }
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setFormData({
      ...formData,
      customerId: customer?.id || '',
      vehicleId: '',
    });
  };

  const handleEmployeeToggle = (employee: User) => {
    const isSelected = selectedEmployees.some((e) => e.id === employee.id);

    let newSelected: User[];
    if (isSelected) {
      // Remove employee
      newSelected = selectedEmployees.filter((e) => e.id !== employee.id);
    } else {
      // Add employee
      newSelected = [...selectedEmployees, employee];
    }

    setSelectedEmployees(newSelected);
    setFormData({
      ...formData,
      employeeIds: newSelected.map((e) => e.id),
      employeeId: newSelected.length > 0 ? newSelected[0].id : '',
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
      // Skip frontend validation when editing - backend will properly exclude current appointment
      if (formData.employeeIds.length > 0 && !appointment) {
        for (const empId of formData.employeeIds) {
          const employeeSlot = availableSlots.find(
            (slot) =>
              slot.employeeId === empId && slot.startTime === formData.scheduledTime
          );

          if (employeeSlot && !employeeSlot.available) {
            const employee = employees.find((e) => e.id === empId);
            setError(
              `${employee?.firstName} ${employee?.lastName} is not available at ${formData.scheduledTime}. Please choose a different time or employee.`
            );
            return;
          }

          // Additional check: if we have availability data but employee not in list, they're unavailable
          if (availableSlots.length > 0 && !employeeSlot) {
            const employee = employees.find((e) => e.id === empId);
            setError(
              `${employee?.firstName} ${employee?.lastName} has no availability at ${formData.scheduledTime}. Please choose a different time or employee.`
            );
            return;
          }
        }
      }

      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, {
          employeeIds:
            formData.employeeIds.length > 0 ? formData.employeeIds : undefined,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          duration: formData.duration,
          serviceType: formData.serviceType,
          appointmentType: formData.appointmentType,
          notes: formData.notes || undefined,
        });
      } else {
        await appointmentService.createAppointment({
          customerId: formData.customerId,
          vehicleId: formData.vehicleId || undefined,
          employeeIds:
            formData.employeeIds.length > 0 ? formData.employeeIds : undefined,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          duration: formData.duration,
          serviceType: formData.serviceType,
          appointmentType: formData.appointmentType,
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
      employeeIds: [],
      scheduledDate: new Date(),
      scheduledTime: getCurrentTimeRounded(),
      duration: 60,
      serviceType: preselectedServiceType || 'TIRE_CHANGE',
      appointmentType: 'AT_GARAGE',
      notes: '',
    });
    setSelectedCustomer(null);
    setSelectedEmployees([]);
    setError(null);
    setAvailableSlots([]);
    onClose();
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
          },
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
            {/* 1. Appointment Type */}
            <Grid size={{ xs: 12 }}>
              <FormControl component="fieldset" required>
                <FormLabel component="legend">Appointment Type</FormLabel>
                <RadioGroup
                  row
                  value={formData.appointmentType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, appointmentType: e.target.value }))
                  }
                >
                  <FormControlLabel
                    value="AT_GARAGE"
                    control={<Radio />}
                    label="At Garage"
                  />
                  <FormControlLabel
                    value="MOBILE_SERVICE"
                    control={<Radio />}
                    label="Mobile Service"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* 2. Customer Selection */}
            <Grid size={{ xs: 12 }} sx={{ mt: -1 }}>
              <CustomerSelectionField
                customers={customers}
                selectedCustomer={selectedCustomer}
                onCustomerChange={handleCustomerChange}
                onAddCustomer={() => setCustomerDialogOpen(true)}
                loading={customersLoading}
                disabled={!!appointment}
                showAddButton={!appointment}
              />
            </Grid>

            {/* 3. Vehicle Selection (conditional) */}
            <VehicleSelector
              customer={selectedCustomer}
              selectedVehicleId={formData.vehicleId}
              onVehicleChange={(vehicleId) =>
                setFormData((prev) => ({ ...prev, vehicleId }))
              }
            />

            {/* 4. Date & Time */}
            <DateTimeSelector
              date={formData.scheduledDate}
              time={formData.scheduledTime}
              onDateChange={(date) =>
                date && setFormData((prev) => ({ ...prev, scheduledDate: date }))
              }
              onTimeChange={(time) =>
                setFormData((prev) => ({ ...prev, scheduledTime: time }))
              }
            />

            {/* 5. Service Type & Duration */}
            <ServiceTypeSelector
              serviceType={formData.serviceType}
              duration={formData.duration}
              onServiceTypeChange={(serviceType) =>
                setFormData((prev) => ({ ...prev, serviceType }))
              }
              onDurationChange={(duration) =>
                setFormData((prev) => ({ ...prev, duration }))
              }
            />

            {/* 6. Employee Assignment */}
            <Grid size={{ xs: 12 }}>
              <EmployeeChipSelector
                employees={employees}
                selectedEmployees={selectedEmployees}
                availableSlots={availableSlots}
                scheduledTime={formData.scheduledTime}
                onEmployeeToggle={handleEmployeeToggle}
                loading={employeesLoading}
              />
            </Grid>

            {/* 7. Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
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
        onClose={() => setCustomerDialogOpen(false)}
        onSuccess={async () => {
          setCustomerDialogOpen(false);
          await loadCustomers();
        }}
      />
    </LocalizationProvider>
  );
};
