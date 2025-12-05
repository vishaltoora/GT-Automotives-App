import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  IconButton,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Slide,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Link,
  Collapse,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  DirectionsCar as CarIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalanceWallet as WalletIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { customerService, Customer, Vehicle, Invoice, Appointment } from '../../requests/customer.requests';
import { appointmentService } from '../../requests/appointment.requests';
import { colors } from '../../theme/colors';
import { formatPhoneForDisplay } from '../../utils/phone';
import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { AppointmentCard } from '../appointments/AppointmentCard';
import { AppointmentDialog } from '../appointments/AppointmentDialog';
import { PaymentDialog } from '../appointments/PaymentDialog';
import { InvoiceDetailsDialog } from '../invoices/InvoiceDetailsDialog';
import { PaymentMethodDialog } from '../invoices/PaymentMethodDialog';
import { SquarePaymentForm } from '../payments/SquarePaymentForm';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { invoiceService } from '../../requests/invoice.requests';
import { PaymentMethod } from '../../../enums';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  onEdit?: (customer: Customer) => void;
  onPaymentSuccess?: () => void;
}

export const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({
  open,
  onClose,
  customerId,
  onEdit,
  onPaymentSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { confirmDelete } = useConfirmationHelpers();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [customerDetailsExpanded, setCustomerDetailsExpanded] = useState(!isMobile);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [squarePaymentDialogOpen, setSquarePaymentDialogOpen] = useState(false);
  const [selectedInvoiceForSquare, setSelectedInvoiceForSquare] = useState<Invoice | null>(null);
  const [appointmentPaymentDialogOpen, setAppointmentPaymentDialogOpen] = useState(false);
  const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (open && customerId) {
      loadCustomer();
    }
  }, [open, customerId]);

  useEffect(() => {
    // Reset tab when dialog opens
    if (open) {
      setTabValue(0);
    }
  }, [open]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getCustomer(customerId);
      setCustomer(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'warning';
      case 'DRAFT':
      case 'IN_PROGRESS':
        return 'info';
      case 'CANCELLED':
      case 'REFUNDED':
      case 'NO_SHOW':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    if (customer && onEdit) {
      onEdit(customer);
      onClose();
    }
  };

  const handleInvoiceClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setInvoiceDialogOpen(true);
  };

  const handleInvoiceDialogClose = () => {
    setInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
  };

  const handleInvoiceUpdate = () => {
    // Reload customer data when invoice is updated (e.g., marked as paid)
    loadCustomer();
  };

  // Appointment action handlers
  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setAppointmentDialogOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    const confirmed = await confirmDelete('this appointment');
    if (confirmed) {
      try {
        await appointmentService.deleteAppointment(appointmentId);
        loadCustomer();
      } catch (err) {
        console.error('Error deleting appointment:', err);
      }
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string, paymentData?: any) => {
    try {
      await appointmentService.updateAppointment(appointmentId, {
        status: newStatus as any,
        ...paymentData
      });
      loadCustomer();
    } catch (err) {
      console.error('Error updating appointment status:', err);
    }
  };

  const handleAppointmentDialogClose = () => {
    setAppointmentDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentUpdate = () => {
    loadCustomer();
    handleAppointmentDialogClose();
  };

  // Payment handlers
  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (paymentMethod: PaymentMethod) => {
    if (!selectedInvoiceForPayment) return;

    try {
      await invoiceService.markInvoiceAsPaid(selectedInvoiceForPayment.id, paymentMethod);
      loadCustomer(); // Refresh to update outstanding balance
      onPaymentSuccess?.(); // Notify parent to refresh list
    } catch (err) {
      console.error('Error marking invoice as paid:', err);
    }
    setPaymentDialogOpen(false);
    setSelectedInvoiceForPayment(null);
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialogOpen(false);
    setSelectedInvoiceForPayment(null);
  };

  // Square payment handlers for invoices
  const handlePayInvoiceWithSquare = (invoice: Invoice) => {
    setSelectedInvoiceForSquare(invoice);
    setSquarePaymentDialogOpen(true);
  };

  const handleSquarePaymentSuccess = (paymentId: string) => {
    console.log('Square payment successful:', paymentId);
    setSquarePaymentDialogOpen(false);
    setSelectedInvoiceForSquare(null);
    loadCustomer(); // Refresh to update outstanding balance
    onPaymentSuccess?.(); // Notify parent to refresh list
  };

  // Appointment payment handlers
  const handleReceiveAppointmentPayment = (appointment: Appointment) => {
    setSelectedAppointmentForPayment(appointment);
    setAppointmentPaymentDialogOpen(true);
  };

  const handleAppointmentPaymentSubmit = async (paymentData: any) => {
    if (!selectedAppointmentForPayment) return;

    try {
      // Update appointment with payment data
      // IMPORTANT: Always keep the ORIGINAL expectedAmount - don't overwrite with remaining amount
      await appointmentService.updateAppointment(selectedAppointmentForPayment.id, {
        paymentAmount: (selectedAppointmentForPayment.paymentAmount || 0) + paymentData.totalAmount,
        // Keep original expectedAmount, only set if not already set
        expectedAmount: selectedAppointmentForPayment.expectedAmount,
        paymentBreakdown: paymentData.payments,
        notes: paymentData.paymentNotes ?
          `${selectedAppointmentForPayment.notes || ''}\nPayment: ${paymentData.paymentNotes}`.trim() :
          selectedAppointmentForPayment.notes,
      });
      loadCustomer(); // Refresh to update outstanding balance
      onPaymentSuccess?.(); // Notify parent to refresh list
    } catch (err) {
      console.error('Error recording appointment payment:', err);
    }
    setAppointmentPaymentDialogOpen(false);
    setSelectedAppointmentForPayment(null);
  };

  const handleAppointmentPaymentDialogClose = () => {
    setAppointmentPaymentDialogOpen(false);
    setSelectedAppointmentForPayment(null);
  };

  // Convert appointment data to AppointmentCard format
  const convertToAppointmentCardFormat = (apt: Appointment) => {
    // Parse scheduled date and time
    const scheduledDate = parseISO(apt.scheduledDate);
    const timeStr = format(scheduledDate, 'HH:mm');

    return {
      id: apt.id,
      scheduledDate: apt.scheduledDate,
      scheduledTime: timeStr,
      endTime: undefined,
      duration: 60, // Default duration
      serviceType: apt.serviceType,
      status: apt.status,
      notes: apt.notes,
      customer: {
        id: customer?.id || '',
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        phone: customer?.phone,
        email: customer?.email,
        businessName: customer?.businessName,
        address: customer?.address,
      },
      vehicle: apt.vehicle ? {
        id: apt.vehicle.id,
        year: apt.vehicle.year,
        make: apt.vehicle.make,
        model: apt.vehicle.model,
        licensePlate: apt.vehicle.licensePlate,
      } : undefined,
      employees: apt.employees,
    };
  };

  // Separate upcoming and past appointments
  const upcomingAppointments = customer?.appointments?.filter(
    (apt) => isAfter(parseISO(apt.scheduledDate), new Date()) && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
  ) || [];

  const pastAppointments = customer?.appointments?.filter(
    (apt) => !isAfter(parseISO(apt.scheduledDate), new Date()) || ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(apt.status)
  ) || [];

  // Separate unpaid and paid invoices
  const unpaidInvoices = customer?.invoices?.filter(
    (inv) => ['PENDING', 'DRAFT'].includes(inv.status)
  ) || [];

  const paidInvoices = customer?.invoices?.filter(
    (inv) => inv.status === 'PAID'
  ) || [];

  // Find completed appointments with outstanding balance (unpaid or partially paid)
  const unpaidAppointments = customer?.appointments?.filter((apt) => {
    if (apt.status !== 'COMPLETED') return false;
    const expected = apt.expectedAmount || 0;
    const paid = apt.paymentAmount || 0;
    return expected > 0 && paid < expected;
  }) || [];

  // Calculate outstanding balance from unpaid invoices AND unpaid appointments
  const invoiceOutstanding = unpaidInvoices.reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );

  const appointmentOutstanding = unpaidAppointments.reduce((sum, apt) => {
    const expected = apt.expectedAmount || 0;
    const paid = apt.paymentAmount || 0;
    return sum + (expected - paid);
  }, 0);

  const calculatedOutstandingBalance = invoiceOutstanding + appointmentOutstanding;

  // Count total outstanding items
  const outstandingItemsCount = unpaidInvoices.length + unpaidAppointments.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? '100vh' : '90vh',
          ...(isMobile && {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          })
        }
      }}
    >
      <DialogTitle
        sx={{
          background: colors.gradients.primary,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <PersonIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
            Customer Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onEdit && !loading && customer && (
            <Tooltip title="Edit Customer">
              <IconButton
                onClick={handleEditClick}
                sx={{
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          overflow: 'auto',
          flex: '1 1 auto',
          minHeight: 0,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box p={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : customer ? (
          <Box>
            {/* Mobile: Compact Header with Expand/Collapse */}
            {isMobile ? (
              <Box sx={{ bgcolor: colors.neutral[50] }}>
                {/* Always visible: Name, Phone, and Key Stats */}
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                  }}
                  onClick={() => setCustomerDetailsExpanded(!customerDetailsExpanded)}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 44,
                      height: 44,
                      fontSize: '1rem',
                    }}
                  >
                    {getInitials(customer.firstName, customer.lastName)}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {customer.firstName} {customer.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {customer.phone ? formatPhoneForDisplay(customer.phone) : 'No phone'}
                      {customer.businessName && ` • ${customer.businessName}`}
                    </Typography>
                  </Box>
                  {/* Mini Stats */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {calculatedOutstandingBalance > 0 && (
                      <Chip
                        size="small"
                        color="warning"
                        label={formatCurrency(calculatedOutstandingBalance)}
                        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                      />
                    )}
                    <IconButton size="small">
                      {customerDetailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Collapsible: Full Details */}
                <Collapse in={customerDetailsExpanded}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {/* Contact Details */}
                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                      {customer.email && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{customer.email}</Typography>
                        </Box>
                      )}
                      {customer.address && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <LocationIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                          <Typography variant="body2">{customer.address}</Typography>
                        </Box>
                      )}
                      {customer.stats?.lastVisitDate && (
                        <Typography variant="caption" color="text.secondary">
                          Last visit: {formatDistanceToNow(parseISO(customer.stats.lastVisitDate as unknown as string), { addSuffix: true })}
                        </Typography>
                      )}
                    </Stack>

                    {/* Stats Grid - 1x2 on mobile (only Total Spent and Outstanding) */}
                    <Grid container spacing={1}>
                      <Grid size={6}>
                        <Card sx={{ bgcolor: 'success.light' }}>
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Typography variant="caption" color="success.dark" fontWeight="medium">
                              Total Spent
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="success.dark">
                              {formatCurrency(customer.stats?.totalSpent || 0)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid size={6}>
                        <Card sx={{ bgcolor: calculatedOutstandingBalance > 0 ? 'warning.light' : colors.neutral[100] }}>
                          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                            <Typography variant="caption" color={calculatedOutstandingBalance > 0 ? 'warning.dark' : 'text.secondary'} fontWeight="medium">
                              Outstanding
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color={calculatedOutstandingBalance > 0 ? 'warning.dark' : 'text.secondary'}>
                              {formatCurrency(calculatedOutstandingBalance)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>
            ) : (
              /* Desktop: Full Header */
              <Box sx={{ p: 3, bgcolor: colors.neutral[50] }}>
                <Grid container spacing={3}>
                  {/* Customer Info */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 72,
                          height: 72,
                          fontSize: '1.5rem',
                        }}
                      >
                        {getInitials(customer.firstName, customer.lastName)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight="bold">
                          {customer.firstName} {customer.lastName}
                        </Typography>
                        {customer.businessName && (
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {customer.businessName}
                            </Typography>
                          </Box>
                        )}
                        <Stack spacing={0.5} mt={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {customer.phone ? formatPhoneForDisplay(customer.phone) : 'No phone'}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {customer.email || 'No email'}
                            </Typography>
                          </Box>
                          {customer.address && (
                            <Box display="flex" alignItems="flex-start" gap={1}>
                              <LocationIcon fontSize="small" color="action" sx={{ mt: 0.2 }} />
                              <Typography variant="body2">{customer.address}</Typography>
                            </Box>
                          )}
                        </Stack>
                        {customer.stats?.lastVisitDate && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Last visit: {formatDistanceToNow(parseISO(customer.stats.lastVisitDate as unknown as string), { addSuffix: true })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Stats Cards */}
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Grid container spacing={2}>
                      {/* Total Spent */}
                      <Grid size={6}>
                        <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <TrendingUpIcon fontSize="small" sx={{ color: 'success.dark' }} />
                              <Typography variant="caption" color="success.dark" fontWeight="medium">
                                Total Spent
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="bold" color="success.dark">
                              {formatCurrency(customer.stats?.totalSpent || 0)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Outstanding Balance */}
                      <Grid size={6}>
                        <Card sx={{
                          height: '100%',
                          bgcolor: calculatedOutstandingBalance > 0 ? 'warning.light' : colors.neutral[100]
                        }}>
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              {calculatedOutstandingBalance > 0 ? (
                                <WarningIcon fontSize="small" sx={{ color: 'warning.dark' }} />
                              ) : (
                                <CheckCircleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              )}
                              <Typography
                                variant="caption"
                                color={calculatedOutstandingBalance > 0 ? 'warning.dark' : 'text.secondary'}
                                fontWeight="medium"
                              >
                                Outstanding
                              </Typography>
                            </Box>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={calculatedOutstandingBalance > 0 ? 'warning.dark' : 'text.secondary'}
                            >
                              {formatCurrency(calculatedOutstandingBalance)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Divider />

            {/* Tabs Section - Outstanding, Appointments, Invoices, Vehicles */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? 'scrollable' : 'standard'}
                scrollButtons={isMobile ? 'auto' : false}
              >
                <Tab
                  icon={<WalletIcon />}
                  iconPosition="start"
                  label={isMobile ? '' : `Outstanding (${outstandingItemsCount})`}
                  sx={{
                    minHeight: 48,
                    color: outstandingItemsCount > 0 ? 'warning.main' : undefined,
                    '&.Mui-selected': {
                      color: outstandingItemsCount > 0 ? 'warning.dark' : undefined,
                    }
                  }}
                />
                <Tab
                  icon={<CalendarIcon />}
                  iconPosition="start"
                  label={isMobile ? '' : `Appointments (${customer.appointments?.length || 0})`}
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<ReceiptIcon />}
                  iconPosition="start"
                  label={isMobile ? '' : `Invoices (${customer.invoices?.length || 0})`}
                  sx={{ minHeight: 48 }}
                />
                <Tab
                  icon={<CarIcon />}
                  iconPosition="start"
                  label={isMobile ? '' : `Vehicles (${customer.vehicles?.length || 0})`}
                  sx={{ minHeight: 48 }}
                />
              </Tabs>
            </Box>

            <Box sx={{
              p: { xs: 1.5, sm: 3 },
              minHeight: { xs: 250, sm: 400 },
              maxHeight: { xs: customerDetailsExpanded ? 'calc(100vh - 450px)' : 'calc(100vh - 220px)', sm: 400 },
              overflow: 'auto',
              flex: 1,
            }}>
              {/* Outstanding Tab (index 0) */}
              <TabPanel value={tabValue} index={0}>
                {outstandingItemsCount > 0 ? (
                  <Box>
                    {/* Summary Card */}
                    <Card sx={{ mb: 3, bgcolor: 'warning.light' }}>
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                          <Box>
                            <Typography variant="subtitle2" color="warning.dark">
                              Total Outstanding Balance
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="warning.dark">
                              {formatCurrency(calculatedOutstandingBalance)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            {unpaidInvoices.length > 0 && (
                              <Typography variant="caption" color="warning.dark" display="block">
                                {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}: {formatCurrency(invoiceOutstanding)}
                              </Typography>
                            )}
                            {unpaidAppointments.length > 0 && (
                              <Typography variant="caption" color="warning.dark" display="block">
                                {unpaidAppointments.length} unpaid appointment{unpaidAppointments.length !== 1 ? 's' : ''}: {formatCurrency(appointmentOutstanding)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Unpaid Invoice Cards */}
                    {unpaidInvoices.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="warning.main" fontWeight="bold" mb={2}>
                          Unpaid Invoices ({unpaidInvoices.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {unpaidInvoices.map((invoice: Invoice) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={invoice.id}>
                              <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent>
                                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        sx={{
                                          cursor: 'pointer',
                                          '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                                        }}
                                        onClick={() => handleInvoiceClick(invoice.id)}
                                      >
                                        #{invoice.invoiceNumber}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatDate(invoice.invoiceDate || invoice.createdAt)}
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label={invoice.status}
                                      size="small"
                                      color={getStatusColor(invoice.status)}
                                    />
                                  </Box>

                                  {invoice.vehicle && (
                                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                                      <CarIcon fontSize="small" color="action" />
                                      <Typography variant="body2" color="text.secondary">
                                        {invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}
                                      </Typography>
                                    </Box>
                                  )}

                                  <Divider sx={{ my: 1.5 }} />

                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" fontWeight="bold" color="warning.dark">
                                      {formatCurrency(invoice.total)}
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        startIcon={<CreditCardIcon />}
                                        onClick={() => handlePayInvoiceWithSquare(invoice)}
                                      >
                                        Card
                                      </Button>
                                      <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        startIcon={<PaymentIcon />}
                                        onClick={() => handlePayInvoice(invoice)}
                                      >
                                        Pay
                                      </Button>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Unpaid Appointments Cards */}
                    {unpaidAppointments.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="warning.main" fontWeight="bold" mb={2}>
                          Unpaid Appointments ({unpaidAppointments.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {unpaidAppointments.map((apt: Appointment) => {
                            const expected = apt.expectedAmount || 0;
                            const paid = apt.paymentAmount || 0;
                            const outstanding = expected - paid;
                            const isPartialPaid = paid > 0;

                            return (
                              <Grid size={{ xs: 12, sm: 6 }} key={apt.id}>
                                <Card variant="outlined" sx={{ height: '100%', borderColor: 'warning.main' }}>
                                  <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {apt.serviceType.replace(/_/g, ' ')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatDate(apt.scheduledDate)}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        label={isPartialPaid ? 'Partial' : 'Unpaid'}
                                        size="small"
                                        color="warning"
                                      />
                                    </Box>

                                    {apt.vehicle && (
                                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                                        <CarIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                          {apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model}
                                        </Typography>
                                      </Box>
                                    )}

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box>
                                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" color="text.secondary">
                                          Expected:
                                        </Typography>
                                        <Typography variant="body2">
                                          {formatCurrency(expected)}
                                        </Typography>
                                      </Box>
                                      {isPartialPaid && (
                                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                                          <Typography variant="body2" color="text.secondary">
                                            Paid:
                                          </Typography>
                                          <Typography variant="body2" color="success.main">
                                            {formatCurrency(paid)}
                                          </Typography>
                                        </Box>
                                      )}
                                      <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                          <Typography variant="body2" fontWeight="bold" color="warning.dark">
                                            Outstanding:
                                          </Typography>
                                          <Typography variant="h6" fontWeight="bold" color="warning.dark">
                                            {formatCurrency(outstanding)}
                                          </Typography>
                                        </Box>
                                        <Button
                                          variant="contained"
                                          color="success"
                                          size="small"
                                          startIcon={<PaymentIcon />}
                                          onClick={() => handleReceiveAppointmentPayment(apt)}
                                        >
                                          Receive
                                        </Button>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" color="success.main" fontWeight="medium">
                      All Paid Up!
                    </Typography>
                    <Typography color="text.secondary">
                      This customer has no outstanding balance
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              {/* Appointments Tab (index 1) */}
              <TabPanel value={tabValue} index={1}>
                {customer.appointments && customer.appointments.length > 0 ? (
                  <Box>
                    {/* Upcoming Appointments Section */}
                    {upcomingAppointments.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="info.main" fontWeight="bold" mb={2}>
                          Upcoming Appointments ({upcomingAppointments.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {upcomingAppointments.map((apt: Appointment) => (
                            <Grid size={{ xs: 12, md: 6 }} key={apt.id}>
                              <AppointmentCard
                                appointment={convertToAppointmentCardFormat(apt)}
                                showActions={true}
                                onEdit={handleEditAppointment}
                                onDelete={handleDeleteAppointment}
                                onStatusChange={handleStatusChange}
                                onPaymentComplete={loadCustomer}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Past Appointments Section */}
                    {pastAppointments.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={2}>
                          Appointment History ({pastAppointments.length})
                        </Typography>
                        <Grid container spacing={2}>
                          {pastAppointments.slice(0, 6).map((apt: Appointment) => (
                            <Grid size={{ xs: 12, md: 6 }} key={apt.id}>
                              <AppointmentCard
                                appointment={convertToAppointmentCardFormat(apt)}
                                showActions={true}
                                onEdit={handleEditAppointment}
                                onDelete={handleDeleteAppointment}
                                onStatusChange={handleStatusChange}
                                onPaymentComplete={loadCustomer}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        {pastAppointments.length > 6 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                            Showing 6 of {pastAppointments.length} past appointments
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <CalendarIcon sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                    <Typography color="text.secondary">No appointments found</Typography>
                  </Box>
                )}
              </TabPanel>

              {/* Invoices Tab (index 2) */}
              <TabPanel value={tabValue} index={2}>
                {customer.invoices && customer.invoices.length > 0 ? (
                  <Box>
                    {/* Unpaid Invoices Section */}
                    {unpaidInvoices.length > 0 && (
                      <Box mb={3}>
                        <Typography variant="subtitle2" color="warning.main" fontWeight="bold" mb={1}>
                          Unpaid Invoices ({unpaidInvoices.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Invoice #</TableCell>
                                {!isMobile && <TableCell>Date</TableCell>}
                                {!isMobile && <TableCell>Vehicle</TableCell>}
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {unpaidInvoices.map((invoice: Invoice) => (
                                <TableRow key={invoice.id} sx={{ bgcolor: 'warning.light' }}>
                                  <TableCell>
                                    <Link
                                      component="button"
                                      variant="body2"
                                      fontWeight="medium"
                                      onClick={() => handleInvoiceClick(invoice.id)}
                                      sx={{
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' },
                                      }}
                                    >
                                      {invoice.invoiceNumber}
                                    </Link>
                                    {isMobile && (
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {formatDate(invoice.invoiceDate || invoice.createdAt)}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  {!isMobile && <TableCell>{formatDate(invoice.invoiceDate || invoice.createdAt)}</TableCell>}
                                  {!isMobile && (
                                    <TableCell>
                                      {invoice.vehicle
                                        ? `${invoice.vehicle.year} ${invoice.vehicle.make} ${invoice.vehicle.model}`
                                        : '-'}
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <Chip
                                      label={invoice.status}
                                      size="small"
                                      color={getStatusColor(invoice.status)}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography fontWeight="bold" color="warning.dark">
                                      {formatCurrency(invoice.total)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}

                    {/* Paid/Other Invoices Section */}
                    {paidInvoices.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                          Invoice History
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Invoice #</TableCell>
                                {!isMobile && <TableCell>Date</TableCell>}
                                {!isMobile && <TableCell>Vehicle</TableCell>}
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {paidInvoices.slice(0, 5).map((invoice: Invoice) => (
                                <TableRow key={invoice.id} hover>
                                  <TableCell>
                                    <Link
                                      component="button"
                                      variant="body2"
                                      onClick={() => handleInvoiceClick(invoice.id)}
                                      sx={{
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' },
                                      }}
                                    >
                                      {invoice.invoiceNumber}
                                    </Link>
                                    {isMobile && (
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {formatDate(invoice.invoiceDate || invoice.createdAt)}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  {!isMobile && <TableCell>{formatDate(invoice.invoiceDate || invoice.createdAt)}</TableCell>}
                                  {!isMobile && (
                                    <TableCell>
                                      {invoice.vehicle
                                        ? `${invoice.vehicle.year} ${invoice.vehicle.make} ${invoice.vehicle.model}`
                                        : '-'}
                                    </TableCell>
                                  )}
                                  <TableCell>
                                    <Chip
                                      label={invoice.status}
                                      size="small"
                                      color={getStatusColor(invoice.status)}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(invoice.total)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {paidInvoices.length > 5 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Showing 5 of {paidInvoices.length} paid invoices
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <ReceiptIcon sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                    <Typography color="text.secondary">No invoices found</Typography>
                  </Box>
                )}
              </TabPanel>

              {/* Vehicles Tab (index 3) */}
              <TabPanel value={tabValue} index={3}>
                {customer.vehicles && customer.vehicles.length > 0 ? (
                  <Grid container spacing={2}>
                    {customer.vehicles.map((vehicle: Vehicle) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={vehicle.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <CarIcon color="primary" />
                              <Typography variant="subtitle1" fontWeight="medium">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </Typography>
                            </Box>
                            <Stack spacing={0.5}>
                              {vehicle.licensePlate && (
                                <Typography variant="body2" color="text.secondary">
                                  License: <strong>{vehicle.licensePlate}</strong>
                                </Typography>
                              )}
                              {vehicle.vin && (
                                <Typography variant="body2" color="text.secondary">
                                  VIN: {vehicle.vin}
                                </Typography>
                              )}
                              {vehicle.mileage && (
                                <Typography variant="body2" color="text.secondary">
                                  Mileage: {vehicle.mileage.toLocaleString()} km
                                </Typography>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={4}>
                    <CarIcon sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                    <Typography color="text.secondary">No vehicles registered</Typography>
                  </Box>
                )}
              </TabPanel>
            </Box>
          </Box>
        ) : null}
      </DialogContent>

      {/* Invoice Details Dialog */}
      {selectedInvoiceId && (
        <InvoiceDetailsDialog
          open={invoiceDialogOpen}
          onClose={handleInvoiceDialogClose}
          invoiceId={selectedInvoiceId}
          onInvoiceUpdate={handleInvoiceUpdate}
        />
      )}

      {/* Appointment Edit Dialog */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={handleAppointmentDialogClose}
        onSuccess={handleAppointmentUpdate}
        appointment={selectedAppointment}
        preselectedCustomerId={customer?.id}
      />

      {/* Payment Method Dialog */}
      {selectedInvoiceForPayment && (
        <PaymentMethodDialog
          open={paymentDialogOpen}
          onClose={handlePaymentDialogClose}
          onConfirm={handlePaymentConfirm}
          invoiceNumber={selectedInvoiceForPayment.invoiceNumber}
        />
      )}

      {/* Appointment Payment Dialog */}
      {selectedAppointmentForPayment && (
        <PaymentDialog
          open={appointmentPaymentDialogOpen}
          onClose={handleAppointmentPaymentDialogClose}
          onSubmit={handleAppointmentPaymentSubmit}
          appointmentId={selectedAppointmentForPayment.id}
          defaultExpectedAmount={
            // Show REMAINING amount (expected - already paid), not full expected
            (selectedAppointmentForPayment.expectedAmount || 0) - (selectedAppointmentForPayment.paymentAmount || 0)
          }
          // Don't pass existingPayments - we want a fresh payment entry for the remaining balance
          isEditMode={true}
        />
      )}

      {/* Square Payment Dialog for Invoices */}
      {selectedInvoiceForSquare && (
        <SquarePaymentForm
          open={squarePaymentDialogOpen}
          onClose={() => {
            setSquarePaymentDialogOpen(false);
            setSelectedInvoiceForSquare(null);
          }}
          invoiceId={selectedInvoiceForSquare.id}
          invoiceNumber={selectedInvoiceForSquare.invoiceNumber}
          amount={selectedInvoiceForSquare.total}
          onPaymentSuccess={handleSquarePaymentSuccess}
        />
      )}
    </Dialog>
  );
};
