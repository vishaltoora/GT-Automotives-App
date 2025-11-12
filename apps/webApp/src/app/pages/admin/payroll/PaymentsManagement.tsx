import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PaymentResponseDto, JobResponseDto } from '@gt-automotive/data';
import { PaymentStatus, PaymentMethod } from '@gt-automotive/data';
import { paymentService } from '../../../services/payment.service';
import { jobService } from '../../../services/job.service';
import { userService } from '../../../services/user.service';
import { ProcessPaymentDialog } from '../../../components/payroll/ProcessPaymentDialog';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useConfirmationDialog } from '../../../hooks/useConfirmationDialog';
import { colors } from '../../../theme/colors';
import { format } from 'date-fns';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: {
    name: string;
  };
}

interface EmployeePaymentSummary extends Employee {
  totalReadyJobs: number;
  totalReadyAmount: number;
  totalPaidJobs: number;
  totalPaidAmount: number;
  pendingPayments: number;
  todayEarnings: number;
  mtdEarnings: number;
  ytdEarnings: number;
}

export function PaymentsManagement() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobResponseDto[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeePaymentSummaries, setEmployeePaymentSummaries] = useState<EmployeePaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobResponseDto | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponseDto | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [processingAllJobs, setProcessingAllJobs] = useState(false);
  const [currentEmployeeJobs, setCurrentEmployeeJobs] = useState<JobResponseDto[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
    paymentMethod: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const {
    showConfirmation,
    isOpen: confirmationOpen,
    dialogData: confirmationData,
    handleConfirm: confirmationConfirm,
    handleCancel: confirmationCancel,
  } = useConfirmationDialog();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filterParams = {
        employeeId: filters.employeeId || undefined,
        status: filters.status ? (filters.status as PaymentStatus) : undefined,
        paymentMethod: filters.paymentMethod ? (filters.paymentMethod as PaymentMethod) : undefined,
        startDate: filters.startDate?.toISOString() || undefined,
        endDate: filters.endDate?.toISOString() || undefined,
      };

      const [paymentsData, pendingJobsData, users] = await Promise.all([
        paymentService.getPayments(filterParams),
        jobService.getJobsReadyForPayment(),
        userService.getUsers(),
      ]);

      setPayments(paymentsData);
      setPendingJobs(pendingJobsData);

      // Calculate employee summaries after data is fetched
      // Include STAFF, ADMIN, and SUPERVISOR users
      const staffMembers = users.filter(u => u.role?.name === 'STAFF' || u.role?.name === 'ADMIN' || u.role?.name === 'SUPERVISOR');
      setEmployees(staffMembers);

      const summaries: EmployeePaymentSummary[] = staffMembers.map((employee) => {
        // Get ready jobs for this employee
        const readyJobs = pendingJobsData.filter(job => job.employee?.id === employee.id);
        const readyAmount = readyJobs.reduce((sum, job) => sum + job.payAmount, 0);

        // Get payments for this employee
        const employeePayments = paymentsData.filter(p => p.employee?.id === employee.id);
        const paidPayments = employeePayments.filter(p => p.status === 'PAID');
        const pendingCount = employeePayments.filter(p => p.status === 'PENDING').length;
        const paidAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);

        // Calculate Today, MTD, YTD earnings
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const todayEarnings = paidPayments
          .filter(p => p.paidAt && new Date(p.paidAt) >= todayStart)
          .reduce((sum, p) => sum + p.amount, 0);

        const mtdEarnings = paidPayments
          .filter(p => p.paidAt && new Date(p.paidAt) >= monthStart)
          .reduce((sum, p) => sum + p.amount, 0);

        const ytdEarnings = paidPayments
          .filter(p => p.paidAt && new Date(p.paidAt) >= yearStart)
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          ...employee,
          totalReadyJobs: readyJobs.length,
          totalReadyAmount: readyAmount,
          totalPaidJobs: paidPayments.length,
          totalPaidAmount: paidAmount,
          pendingPayments: pendingCount,
          todayEarnings,
          mtdEarnings,
          ytdEarnings,
        };
      });

      setEmployeePaymentSummaries(summaries);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = (payment: PaymentResponseDto) => {
    // Close dialog and reset state after successful payment(s)
    setProcessDialogOpen(false);
    setProcessingAllJobs(false);
    setCurrentEmployeeJobs([]);
    setCurrentJobIndex(0);
    fetchData(); // Refresh all data
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payment: PaymentResponseDto) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPayment(null);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;

    const confirmed = await showConfirmation(
      'Delete Payment',
      `Are you sure you want to delete this payment for "${getEmployeeName(selectedPayment.employee)}"? This action cannot be undone.`,
      'Delete',
      'error'
    );

    if (confirmed) {
      try {
        await paymentService.deletePayment(selectedPayment.id);
        handleMenuClose();

        setTimeout(async () => {
          await fetchData();
        }, 100);
      } catch (err: any) {
        console.error('Delete error:', err);
        if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          setError('Payment not found. It may have already been deleted. Refreshing the list...');
          await fetchData();
        } else {
          setError(err.message || 'Failed to delete payment');
        }
        handleMenuClose();
      }
    }
  };

  const handleEditPaymentStatus = async () => {
    if (!selectedPayment) return;

    const confirmed = await showConfirmation(
      'Revert Payment Status',
      `Are you sure you want to revert this payment status back to PENDING? This will also change the related job status back to READY for reprocessing. Payment: $${selectedPayment.amount.toFixed(2)} for ${getEmployeeName(selectedPayment.employee)}.`,
      'Revert Status',
      'warning'
    );

    if (confirmed) {
      try {
        await paymentService.revertPaymentStatus(selectedPayment.id);
        handleMenuClose();

        setTimeout(async () => {
          await fetchData();
        }, 100);
      } catch (err: any) {
        console.error('Revert status error:', err);
        setError(err.message || 'Failed to revert payment status');
        handleMenuClose();
      }
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING: return 'warning';
      case PaymentStatus.PAID: return 'success';
      case PaymentStatus.FAILED: return 'error';
      case PaymentStatus.CANCELLED: return 'default';
      default: return 'default';
    }
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      status: '',
      paymentMethod: '',
      startDate: null,
      endDate: null,
    });
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

  const getEmployeeInitials = (employee: Employee) => {
    const firstInitial = employee.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = employee.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || employee.email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const avatarColors = [
      '#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2',
      '#00796b', '#c2185b', '#5d4037', '#616161', '#e64a19'
    ];
    const charCode = email.charCodeAt(0) + email.charCodeAt(email.length - 1);
    return avatarColors[charCode % avatarColors.length];
  };

  const handleProcessJobsOneByOne = async (employeeId: string) => {
    const employeeReadyJobs = pendingJobs.filter(job => job.employee?.id === employeeId);
    if (employeeReadyJobs.length > 0) {
      setCurrentEmployeeJobs(employeeReadyJobs);
      setCurrentJobIndex(0);
      setSelectedJob(employeeReadyJobs[0]);
      setProcessingAllJobs(true);
      setProcessDialogOpen(true);
    }
  };

  const toggleCardExpanded = (employeeId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  if (loading && !payments.length && !pendingJobs.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading payment data...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 0, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, px: { xs: 1.5, sm: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <PaymentIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.success }} />
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">
              Payments{isMobile ? '' : ' Management'}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, mx: { xs: 1.5, sm: 0 }, borderRadius: { xs: 0, sm: 1 } }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs - Hide on mobile, show only Employees */}
        <Box sx={{ mb: 3 }}>
          {!isMobile && (
            <Paper sx={{ mb: 0 }}>
              <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant={isTablet ? 'scrollable' : 'standard'}
                scrollButtons={isTablet ? 'auto' : false}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 'medium',
                    minWidth: { xs: 'auto', md: 160 },
                    px: { xs: 1, md: 2 },
                  },
                }}
              >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize={isTablet ? 'small' : 'medium'} />
                    <Box>
                      Employees ({employeePaymentSummaries.length})
                    </Box>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon fontSize={isTablet ? 'small' : 'medium'} />
                    <Box>
                      Jobs Ready ({pendingJobs.length})
                    </Box>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon fontSize={isTablet ? 'small' : 'medium'} />
                    <Box>
                      History ({payments.length})
                    </Box>
                  </Box>
                }
              />
            </Tabs>
            </Paper>
          )}

          {/* Mobile: No extra header - count already shown in main header */}

          {/* Mobile: Always show Employees, Desktop: Use TabPanel */}
          {isMobile ? (
            <Box sx={{ py: 1, px: 0.5 }}>
              {/* Employee Cards - Compact Mobile View */}
              <Grid container spacing={1.5}>
              {employeePaymentSummaries.map((employee) => {
                const isExpanded = expandedCards.has(employee.id);
                return (
                  <Grid size={{ xs: 12 }} key={employee.id}>
                    <Card
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        border: `1px solid ${colors.neutral[200]}`,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: colors.primary.main,
                          boxShadow: 2,
                        },
                      }}
                    >
                      {/* Compact Header */}
                      <CardContent sx={{ p: 1.5, pb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: getAvatarColor(employee.email),
                              fontSize: '1.1rem',
                              fontWeight: 600,
                            }}
                          >
                            {getEmployeeInitials(employee)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight="600" noWrap>
                              {getEmployeeName(employee)}
                            </Typography>
                            <Chip
                              label={employee.role?.name || 'STAFF'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: colors.neutral[100],
                                border: `1px solid ${colors.neutral[300]}`,
                              }}
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => toggleCardExpanded(employee.id)}
                            sx={{ ml: 'auto' }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>

                        {/* Key Metrics - Always Visible */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1,
                              bgcolor: colors.semantic.successLight + '15',
                              border: `1px solid ${colors.semantic.successLight}`,
                              borderRadius: 1,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.3 }}>
                              Ready to Pay
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem' }}>
                              ${employee.totalReadyAmount.toFixed(0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {employee.totalReadyJobs} jobs
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1,
                              bgcolor: colors.primary.light + '10',
                              border: `1px solid ${colors.primary.light}`,
                              borderRadius: 1,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.3 }}>
                              MTD Earnings
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.1rem' }}>
                              ${employee.mtdEarnings.toFixed(0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {employee.totalPaidJobs} paid
                            </Typography>
                          </Box>
                        </Box>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
                            {/* Earnings Overview */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                  Today
                                </Typography>
                                <Typography variant="body2" fontWeight="600" color="info.main">
                                  ${employee.todayEarnings.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                  MTD
                                </Typography>
                                <Typography variant="body2" fontWeight="600" color="primary.main">
                                  ${employee.mtdEarnings.toFixed(2)}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                  YTD
                                </Typography>
                                <Typography variant="body2" fontWeight="600" color="success.main">
                                  ${employee.ytdEarnings.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Payment Status Counts */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.infoLight + '10', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color="info.main">
                                  {employee.totalReadyJobs}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Ready
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.warningLight + '10', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color="warning.main">
                                  {employee.pendingPayments}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Pending
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.successLight + '10', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  {employee.totalPaidJobs}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Paid
                                </Typography>
                              </Box>
                            </Box>

                            {/* Total Paid */}
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: colors.neutral[50],
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" fontWeight="600">
                                Total Paid (All Time)
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="primary.main">
                                ${employee.totalPaidAmount.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Process Payment Button */}
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          startIcon={<PaymentIcon />}
                          onClick={() => handleProcessJobsOneByOne(employee.id)}
                          disabled={employee.totalReadyJobs === 0}
                          sx={{
                            background: employee.totalReadyJobs > 0
                              ? `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`
                              : colors.neutral[300],
                            fontWeight: 600,
                            '&:hover': {
                              background: employee.totalReadyJobs > 0
                                ? `linear-gradient(135deg, ${colors.semantic.successDark} 0%, ${colors.semantic.success} 100%)`
                                : colors.neutral[300],
                            },
                            '&.Mui-disabled': {
                              background: colors.neutral[300],
                              color: colors.neutral[500],
                            },
                          }}
                        >
                          Process {employee.totalReadyJobs > 0 ? `${employee.totalReadyJobs} Jobs` : 'Jobs'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

              {employeePaymentSummaries.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center', mx: 1.5, borderRadius: 0 }}>
                  <GroupIcon sx={{ fontSize: 64, color: colors.neutral[400], mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No employees found
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            /* Desktop: Show all tabs with TabPanel */
            <>
              <TabPanel value={tabValue} index={0}>
                {/* Employee Cards - Desktop View */}
                <Grid container spacing={2}>
                  {employeePaymentSummaries.map((employee) => {
                    const isExpanded = expandedCards.has(employee.id);
                    return (
                      <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={employee.id}>
                        <Card
                          sx={{
                            transition: 'all 0.2s ease-in-out',
                            border: `1px solid ${colors.neutral[200]}`,
                            '&:hover': {
                              borderColor: colors.primary.main,
                              boxShadow: 2,
                            },
                          }}
                        >
                          {/* Compact Header */}
                          <CardContent sx={{ p: 2, pb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: getAvatarColor(employee.email),
                                  fontSize: '1.1rem',
                                  fontWeight: 600,
                                }}
                              >
                                {getEmployeeInitials(employee)}
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight="600" noWrap>
                                  {getEmployeeName(employee)}
                                </Typography>
                                <Chip
                                  label={employee.role?.name || 'STAFF'}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: colors.neutral[100],
                                    border: `1px solid ${colors.neutral[300]}`,
                                  }}
                                />
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => toggleCardExpanded(employee.id)}
                                sx={{ ml: 'auto' }}
                              >
                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </Box>

                            {/* Key Metrics - Always Visible */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                              <Box
                                sx={{
                                  flex: 1,
                                  p: 1.5,
                                  bgcolor: colors.semantic.successLight + '15',
                                  border: `1px solid ${colors.semantic.successLight}`,
                                  borderRadius: 1,
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.5 }}>
                                  Ready to Pay
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  ${employee.totalReadyAmount.toFixed(0)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.totalReadyJobs} jobs
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  flex: 1,
                                  p: 1.5,
                                  bgcolor: colors.primary.light + '10',
                                  border: `1px solid ${colors.primary.light}`,
                                  borderRadius: 1,
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.5 }}>
                                  MTD Earnings
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                  ${employee.mtdEarnings.toFixed(0)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.totalPaidJobs} paid
                                </Typography>
                              </Box>
                            </Box>

                            {/* Expandable Details */}
                            {isExpanded && (
                              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
                                {/* Earnings Overview */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      Today
                                    </Typography>
                                    <Typography variant="body2" fontWeight="600" color="info.main">
                                      ${employee.todayEarnings.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      MTD
                                    </Typography>
                                    <Typography variant="body2" fontWeight="600" color="primary.main">
                                      ${employee.mtdEarnings.toFixed(2)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                      YTD
                                    </Typography>
                                    <Typography variant="body2" fontWeight="600" color="success.main">
                                      ${employee.ytdEarnings.toFixed(2)}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Payment Status Counts */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.infoLight + '10', borderRadius: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" color="info.main">
                                      {employee.totalReadyJobs}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Ready
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.warningLight + '10', borderRadius: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                                      {employee.pendingPayments}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Pending
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.successLight + '10', borderRadius: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" color="success.main">
                                      {employee.totalPaidJobs}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Paid
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Total Paid */}
                                <Box
                                  sx={{
                                    p: 1.5,
                                    bgcolor: colors.neutral[50],
                                    borderRadius: 1,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2,
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                                    Total Paid (All Time)
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    ${employee.totalPaidAmount.toFixed(2)}
                                  </Typography>
                                </Box>
                              </Box>
                            )}

                            {/* Process Payment Button */}
                            <Button
                              fullWidth
                              size="small"
                              variant="contained"
                              startIcon={<PaymentIcon />}
                              onClick={() => handleProcessJobsOneByOne(employee.id)}
                              disabled={employee.totalReadyJobs === 0}
                              sx={{
                                background: employee.totalReadyJobs > 0
                                  ? `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`
                                  : colors.neutral[300],
                                fontWeight: 600,
                                '&:hover': {
                                  background: employee.totalReadyJobs > 0
                                    ? `linear-gradient(135deg, ${colors.semantic.successDark} 0%, ${colors.semantic.success} 100%)`
                                    : colors.neutral[300],
                                },
                                '&.Mui-disabled': {
                                  background: colors.neutral[300],
                                  color: colors.neutral[500],
                                },
                              }}
                            >
                              Process {employee.totalReadyJobs > 0 ? `${employee.totalReadyJobs} Jobs` : 'Jobs'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {employeePaymentSummaries.length === 0 && (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <GroupIcon sx={{ fontSize: 64, color: colors.neutral[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No employees found
                    </Typography>
                  </Paper>
                )}
              </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Pending Jobs Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: colors.neutral[50] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Job</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Completed</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No jobs ready for payment.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingJobs.map((job) => (
                      <TableRow key={job.id} hover>
                        <TableCell>
                          <Box>
                            <Typography fontWeight="medium">{job.title}</Typography>
                            {job.description && (
                              <Typography variant="body2" color="textSecondary" noWrap>
                                {job.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getEmployeeName(job.employee)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium" color="success.main">
                            ${job.payAmount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {job.completedAt ? format(new Date(job.completedAt), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PaymentIcon />}
                            onClick={() => {
                              setSelectedJob(job);
                              setProcessDialogOpen(true);
                            }}
                            sx={{
                              background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
                            }}
                          >
                            Process Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Filters */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FilterIcon sx={{ color: colors.primary.main }} />
                <Typography variant="h6">Filters</Typography>
                <Button size="small" onClick={clearFilters}>Clear All</Button>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={filters.employeeId}
                      onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                      label="Employee"
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {getEmployeeName(employee)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      label="Status"
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      {Object.values(PaymentStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={filters.paymentMethod}
                      onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      label="Payment Method"
                    >
                      <MenuItem value="">All Methods</MenuItem>
                      {Object.values(PaymentMethod).map((method) => (
                        <MenuItem key={method} value={method}>
                          {method.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Payments Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: colors.neutral[50] }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Job</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No payments found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id} hover>
                        <TableCell>
                          <Box>
                            <Typography fontWeight="medium">Payment #{payment.id.slice(-8)}</Typography>
                            {payment.reference && (
                              <Typography variant="body2" color="textSecondary">
                                Ref: {payment.reference}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getEmployeeName(payment.employee)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {payment.job?.title || 'Unknown Job'}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium" color="success.main">
                            ${payment.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.paymentMethod.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={getStatusColor(payment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy') :
                           format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, payment)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
              </TabPanel>
            </>
          )}
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            View Details
          </MenuItem>
          {selectedPayment?.status === PaymentStatus.PAID && (
            <MenuItem onClick={handleEditPaymentStatus} sx={{ color: 'warning.main' }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Revert to PENDING
            </MenuItem>
          )}
          {selectedPayment?.status !== PaymentStatus.PAID && (
            <MenuItem
              onClick={handleDeletePayment}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Payment
            </MenuItem>
          )}
        </Menu>

        {/* Process Payment Dialog */}
        <ProcessPaymentDialog
          open={processDialogOpen}
          onClose={() => {
            setProcessDialogOpen(false);
            setProcessingAllJobs(false);
            setCurrentEmployeeJobs([]);
            setCurrentJobIndex(0);
          }}
          onSuccess={handleProcessPayment}
          job={selectedJob}
          allJobs={processingAllJobs ? currentEmployeeJobs : undefined}
          progressInfo={processingAllJobs ? {
            current: currentJobIndex + 1,
            total: currentEmployeeJobs.length
          } : undefined}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationOpen}
          title={confirmationData?.title || ''}
          message={confirmationData?.message || ''}
          confirmText={confirmationData?.confirmText}
          severity={confirmationData?.severity}
          onConfirm={confirmationConfirm}
          onClose={confirmationCancel}
        />
      </Box>
    </LocalizationProvider>
  );
}