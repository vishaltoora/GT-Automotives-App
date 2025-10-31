import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  MoreVert as MoreVertIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { formatTimeRange } from '../../utils/timeFormat';
import { PaymentDialog } from './PaymentDialog';

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

// Export helper functions for use in other components
export const formatServiceType = (serviceType: string): string => {
  return SERVICE_TYPE_LABELS[serviceType] || serviceType.replace(/_/g, ' ');
};

// Format phone number to dash format (123-456-7890)
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `${cleaned[0]}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

export const getStatusColor = (status: string) => {
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

export const getStatusIcon = (status: string) => {
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

export const formatStatusLabel = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

export interface AppointmentCardProps {
  appointment: {
    id: string;
    scheduledDate: string | Date;
    scheduledTime: string;
    endTime?: string;
    duration: number;
    serviceType: string;
    appointmentType?: string;
    status: string;
    notes?: string;
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      businessName?: string;
      address?: string;
    };
    vehicle?: {
      id: string;
      year: number;
      make: string;
      model: string;
      licensePlate?: string;
    };
    employee?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    employees?: Array<{
      employee: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }>;
  };
  onEdit?: (appointment: any) => void;
  onDelete?: (appointmentId: string) => void;
  onStatusChange?: (appointmentId: string, newStatus: string, paymentData?: any) => void;
  showActions?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  showActions = true,
}) => {
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

  const handleDeleteClick = () => {
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
              {showActions && (onEdit || onDelete) && (
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
              <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                mt: 0.5,
              }}
            >
              {appointment.customer.firstName[0]}
              {appointment.customer.lastName[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
              {appointment.customer.address && (
                <Box
                  component="a"
                  href={`https://maps.google.com/?q=${encodeURIComponent(appointment.customer.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.5,
                    mt: 0.5,
                    textDecoration: 'none',
                    color: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: '0.875rem', mt: 0.25, flexShrink: 0 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: 1.4,
                    }}
                  >
                    {appointment.customer.address}
                  </Typography>
                </Box>
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

          {/* Assigned Employee(s) */}
          {(appointment.employee || (appointment.employees && appointment.employees.length > 0)) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Assigned to:{' '}
                {appointment.employee
                  ? `${appointment.employee.firstName} ${appointment.employee.lastName}`
                  : appointment.employees
                    ?.map((ae) => `${ae.employee.firstName} ${ae.employee.lastName}`)
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
          {showActions && onStatusChange && appointment.status !== 'COMPLETED' && (
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

export default AppointmentCard;
