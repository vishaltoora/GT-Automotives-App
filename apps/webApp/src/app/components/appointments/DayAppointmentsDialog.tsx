import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Stack,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  DriveEta as DriveEtaIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { AppointmentResponseDto as Appointment } from '@gt-automotive/data';
import { PaymentDialog } from './PaymentDialog';
import { appointmentService } from '../../requests/appointment.requests';
import { AppointmentCard } from './AppointmentCard';
import { EmptyStateMessage } from './EmptyStateMessage';
import { DaySummaryTabPanel } from './DaySummaryTabPanel';
import { calculatePaymentStats } from '../../utils/paymentStatsUtils';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [paymentsProcessed, setPaymentsProcessed] = useState<Appointment[]>([]);

  // Fetch payments processed on this date
  React.useEffect(() => {
    if (open && date) {
      fetchPaymentsProcessed();
    }
  }, [open, date]);

  const fetchPaymentsProcessed = async () => {
    if (!date) return;

    try {
      const payments = await appointmentService.getByPaymentDate(date);
      setPaymentsProcessed(payments);
    } catch (error) {
      console.error('Error fetching payments processed:', error);
      setPaymentsProcessed([]);
    }
  };

  // Sort scheduled appointments by time
  const sortedAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    return [...appointments].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [appointments]);

  // Filter scheduled appointments by location type
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

  // Sort payments processed by time
  const sortedPayments = useMemo(() => {
    if (!paymentsProcessed || paymentsProcessed.length === 0) return [];
    return [...paymentsProcessed].sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [paymentsProcessed]);

  // Calculate statistics using utility function
  const stats = useMemo(() => {
    return calculatePaymentStats(sortedAppointments, sortedPayments);
  }, [sortedAppointments, sortedPayments]);

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

    let updateData;

    if (isEditMode) {
      // Edit mode: Replace existing payment data
      updateData = {
        totalAmount: paymentData.totalAmount,
        payments: paymentData.payments,
        paymentNotes: paymentData.paymentNotes,
        expectedAmount: paymentData.expectedAmount,
      };
    } else {
      // Add mode: Merge with existing payment data
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

      updateData = {
        totalAmount: newTotal,
        payments: mergedBreakdown,
        paymentNotes: paymentData.paymentNotes
          ? `${selectedAppointment.paymentNotes || ''}\n${paymentData.paymentNotes}`.trim()
          : selectedAppointment.paymentNotes,
        expectedAmount: selectedAppointment.expectedAmount,
      };
    }

    // Call the status change handler (it won't change status, just update payment)
    onStatusChange(selectedAppointment.id, selectedAppointment.status, updateData);

    setPaymentDialogOpen(false);
    setIsEditMode(false);
    setSelectedAppointment(null);
  };

  const handleEditPayment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditMode(true);
    setPaymentDialogOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return; // Prevent closing on backdrop click
        }
        onClose();
      }}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          height: { xs: '100dvh', sm: '85vh' },
          maxHeight: { xs: '100dvh', sm: '85vh' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100vw', sm: '100%' },
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: { xs: 'env(safe-area-inset-bottom)', sm: 0 },
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
            <EmptyStateMessage
              icon={<LocationOnIcon />}
              title="No garage appointments"
              message="There are no at-garage appointments for this date."
            />
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
            <EmptyStateMessage
              icon={<DriveEtaIcon />}
              title="No mobile service appointments"
              message="There are no mobile service appointments for this date."
            />
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
          <DaySummaryTabPanel
            stats={stats}
            sortedPayments={sortedPayments}
            onReceivePayment={handleReceivePayment}
            onEditPayment={handleEditPayment}
          />
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexShrink: 0,
          minHeight: { xs: 64, sm: 'auto' },
          paddingBottom: { xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2 },
        }}
      >
        <Button
          onClick={onAddAppointment}
          variant="contained"
          color="primary"
          disabled={!onAddAppointment}
          sx={{
            minWidth: { xs: 120, sm: 150 },
            fontWeight: 'bold',
            flex: { xs: 1, sm: 0 },
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
            whiteSpace: 'nowrap',
          }}
        >
          Add Appointment
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            flex: { xs: 1, sm: 0 },
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Payment Dialog for Receiving Outstanding Balance or Editing Payment */}
      {selectedAppointment && (
        <PaymentDialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setIsEditMode(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handlePaymentSubmit}
          appointmentId={selectedAppointment.id}
          defaultExpectedAmount={
            isEditMode
              ? selectedAppointment.expectedAmount || 0
              : selectedAppointment.expectedAmount
              ? selectedAppointment.expectedAmount - (selectedAppointment.paymentAmount || 0)
              : 0
          }
          existingPayments={
            isEditMode && selectedAppointment.paymentBreakdown
              ? typeof selectedAppointment.paymentBreakdown === 'string'
                ? JSON.parse(selectedAppointment.paymentBreakdown)
                : selectedAppointment.paymentBreakdown
              : undefined
          }
          existingNotes={isEditMode ? selectedAppointment.paymentNotes : ''}
          isEditMode={isEditMode}
        />
      )}
    </Dialog>
  );
};
