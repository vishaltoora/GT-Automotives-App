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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  EventAvailable as EventAvailableIcon,
  Block as BlockIcon,
  EventBusy as EventBusyIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { formatTimeRange } from '../../utils/timeFormat';
import { PaymentDialog } from './PaymentDialog';

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

// Service type label mapping
const SERVICE_TYPE_LABELS: Record<string, string> = {
  TIRE_CHANGE: 'Tire Mount Balance',
  TIRE_ROTATION: 'Tire Rotation',
  TIRE_REPAIR: 'Tire Repair',
  OIL_CHANGE: 'Oil Change',
  BRAKE_SERVICE: 'Brake Service',
  WHEEL_ALIGNMENT: 'Wheel Alignment',
  ENGINE_DIAGNOSTIC: 'Engine Diagnostic',
  INSPECTION: 'Inspection',
  OTHER: 'Other Service',
};

const formatServiceType = (serviceType: string): string => {
  return SERVICE_TYPE_LABELS[serviceType] || serviceType.replace(/_/g, ' ');
};

// Format phone number to dash format (123-456-7890)
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    // US/Canada format: XXX-XXX-XXXX
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US/Canada with country code: 1-XXX-XXX-XXXX
    return `${cleaned[0]}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if format doesn't match
  return phone;
};

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return 'info';
    case 'CONFIRMED':
      return 'success';
    case 'IN_PROGRESS':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'NO_SHOW':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return <ScheduleIcon fontSize="small" />;
    case 'CONFIRMED':
      return <EventAvailableIcon fontSize="small" />;
    case 'IN_PROGRESS':
      return <HourglassEmptyIcon fontSize="small" />;
    case 'COMPLETED':
      return <CheckCircleIcon fontSize="small" />;
    case 'CANCELLED':
      return <CancelIcon fontSize="small" />;
    case 'NO_SHOW':
      return <EventBusyIcon fontSize="small" />;
    default:
      return <ScheduleIcon fontSize="small" />;
  }
};

const formatStatusLabel = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

const AppointmentCard: React.FC<{
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointmentId: string) => void;
  onStatusChange?: (appointmentId: string, newStatus: string, paymentData?: any) => void;
}> = ({ appointment, onEdit, onDelete, onStatusChange }) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleComplete = () => {
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = (paymentData: any) => {
    if (onStatusChange) {
      onStatusChange(appointment.id, 'COMPLETED', paymentData);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) {
      onEdit(appointment);
    }
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(appointment.id);
    }
  };

  return (
    <>
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSubmit={handlePaymentSubmit}
        appointmentId={appointment.id}
      />
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header: Time and Status */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="action" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
            <Typography variant="h6" sx={{ fontSize: { xs: '0.938rem', sm: '1.25rem' }, fontWeight: { xs: 700, sm: 500 } }}>
              {formatTimeRange(
                appointment.scheduledTime,
                appointment.endTime || ''
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={getStatusIcon(appointment.status)}
              label={formatStatusLabel(appointment.status)}
              color={getStatusColor(appointment.status) as any}
              size="small"
            />
            {(onEdit || onDelete) && (
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

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
          {onEdit && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* Service Type */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BuildIcon fontSize="small" color="action" />
          <Typography variant="body1" fontWeight={500}>
            {formatServiceType(appointment.serviceType)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Customer Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
            }}
          >
            {appointment.customer.firstName[0]}
            {appointment.customer.lastName[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {appointment.customer.businessName ||
                `${appointment.customer.firstName} ${appointment.customer.lastName}`}
            </Typography>
            {appointment.customer.businessName && (
              <Typography variant="caption" color="text.secondary">
                {appointment.customer.firstName} {appointment.customer.lastName}
              </Typography>
            )}
            {appointment.customer.phone && (
              <Typography variant="caption" color="text.primary" sx={{ display: 'block', fontWeight: 600 }}>
                {formatPhoneNumber(appointment.customer.phone)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Vehicle Info */}
        {appointment.vehicle && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {appointment.vehicle.year} {appointment.vehicle.make}{' '}
              {appointment.vehicle.model}
              {appointment.vehicle.licensePlate &&
                ` (${appointment.vehicle.licensePlate})`}
            </Typography>
          </Box>
        )}

        {/* Assigned Employees */}
        {appointment.employees && appointment.employees.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Assigned to:{' '}
              {appointment.employees
                .map(
                  (ae) => `${ae.employee.firstName} ${ae.employee.lastName}`
                )
                .join(', ')}
            </Typography>
          </Box>
        )}

        {/* Notes */}
        {appointment.notes && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              bgcolor: 'grey.100',
              borderRadius: 1,
              borderLeft: 3,
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              Notes:
            </Typography>
            <Typography variant="body2">{appointment.notes}</Typography>
          </Box>
        )}

        {/* Quick Actions */}
        {onStatusChange && appointment.status !== 'COMPLETED' && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<HourglassEmptyIcon />}
                onClick={() => onStatusChange(appointment.id, 'IN_PROGRESS')}
              >
                Start
              </Button>
            )}
            {appointment.status === 'IN_PROGRESS' && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleComplete}
              >
                Complete
              </Button>
            )}
            {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => onStatusChange(appointment.id, 'CANCELLED')}
              >
                Cancel
              </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
    </>
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
  const [currentTab, setCurrentTab] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Sort appointments by time
  const sortedAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return [...appointments].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [appointments]);

  // Filter appointments by type
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDuration = sortedAppointments.reduce(
      (sum, apt) => sum + apt.duration,
      0
    );
    const statusCounts = sortedAppointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate payment statistics
    const completedAppointments = sortedAppointments.filter(
      (apt) => apt.status === 'COMPLETED' && apt.paymentAmount
    );

    const totalPayments = completedAppointments.reduce(
      (sum, apt) => sum + (apt.paymentAmount || 0),
      0
    );

    // Calculate total expected amount and total owed
    const totalExpected = completedAppointments.reduce(
      (sum, apt) => sum + (apt.expectedAmount || apt.paymentAmount || 0),
      0
    );

    const totalOwed = completedAppointments.reduce(
      (sum, apt) => {
        const expected = apt.expectedAmount || 0;
        const paid = apt.paymentAmount || 0;
        return sum + Math.max(0, expected - paid);
      },
      0
    );

    // Calculate payments by method from breakdown
    const paymentsByMethod: Record<string, number> = {};
    completedAppointments.forEach((apt) => {
      // Parse paymentBreakdown if it's a string (from JSON field)
      let breakdown = apt.paymentBreakdown;
      if (typeof breakdown === 'string') {
        try {
          breakdown = JSON.parse(breakdown);
        } catch (e) {
          console.error('Failed to parse paymentBreakdown:', e);
          breakdown = undefined;
        }
      }

      if (breakdown && Array.isArray(breakdown)) {
        breakdown.forEach((payment: PaymentEntry) => {
          const method = payment.method || 'CASH';
          paymentsByMethod[method] = (paymentsByMethod[method] || 0) + (payment.amount || 0);
        });
      } else if (apt.paymentAmount) {
        // Fallback for old payments without breakdown - treat as CASH
        paymentsByMethod['CASH'] = (paymentsByMethod['CASH'] || 0) + apt.paymentAmount;
      }
    });

    return {
      total: sortedAppointments.length,
      atGarage: atGarageAppointments.length,
      mobileService: mobileServiceAppointments.length,
      totalDuration,
      totalHours: (totalDuration / 60).toFixed(1),
      statusCounts,
      totalPayments,
      totalExpected,
      totalOwed,
      paymentsByMethod,
      completedWithPayment: completedAppointments.length,
    };
  }, [sortedAppointments, atGarageAppointments, mobileServiceAppointments]);

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

    // Calculate new total payment
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

    // Create update data
    const updateData = {
      totalAmount: newTotal,
      payments: mergedBreakdown,
      paymentNotes: paymentData.paymentNotes
        ? `${selectedAppointment.paymentNotes || ''}\n${paymentData.paymentNotes}`.trim()
        : selectedAppointment.paymentNotes,
      expectedAmount: selectedAppointment.expectedAmount,
    };

    // Call the status change handler (it won't change status, just update payment)
    await onStatusChange(selectedAppointment.id, selectedAppointment.status, updateData);

    setPaymentDialogOpen(false);
    setSelectedAppointment(null);
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
          height: { xs: '100vh', sm: '85vh' },
          maxHeight: { xs: '100vh', sm: '85vh' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100vw', sm: '100%' },
          display: 'flex',
          flexDirection: 'column',
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
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Payment Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.completedWithPayment} completed {stats.completedWithPayment === 1 ? 'appointment' : 'appointments'}
                  </Typography>
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
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

            {/* Customer Cards */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Customer Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {sortedAppointments.length === 0 ? (
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
                    No appointments scheduled
                  </Typography>
                  <Typography variant="body2">
                    There are no appointments for this date.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {sortedAppointments.map((appointment) => (
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
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onAddAppointment}
          variant="contained"
          color="primary"
          disabled={!onAddAppointment}
          sx={{
            minWidth: 150,
            fontWeight: 'bold',
          }}
        >
          Add Appointment
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>

      {/* Payment Dialog for Receiving Outstanding Balance */}
      {selectedAppointment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handlePaymentSubmit}
          appointmentId={selectedAppointment.id}
          defaultExpectedAmount={
            selectedAppointment.expectedAmount
              ? selectedAppointment.expectedAmount - (selectedAppointment.paymentAmount || 0)
              : 0
          }
        />
      )}
    </Dialog>
  );
};
