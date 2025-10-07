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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
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

  // Filters
  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
    paymentMethod: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

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
      // Include both STAFF and ADMIN users
      const staffMembers = users.filter(u => u.role?.name === 'STAFF' || u.role?.name === 'ADMIN');
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
    fetchData(); // Refresh all data
    setProcessDialogOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payment: PaymentResponseDto) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPayment(null);
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

  const handleProcessAllReadyJobs = async (employeeId: string) => {
    const employeeReadyJobs = pendingJobs.filter(job => job.employee?.id === employeeId);
    if (employeeReadyJobs.length > 0) {
      setSelectedJob(employeeReadyJobs[0]); // Open dialog with first job
      setProcessDialogOpen(true);
    }
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
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PaymentIcon sx={{ fontSize: 32, color: colors.semantic.success }} />
            <Typography variant="h4" fontWeight="bold">
              Payments Management
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 'medium',
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  Employees ({employeePaymentSummaries.length})
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon />
                  Jobs Ready for Payment ({pendingJobs.length})
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PaymentIcon />
                  Payment History ({payments.length})
                </Box>
              }
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Employee Cards */}
            <Grid container spacing={3}>
              {employeePaymentSummaries.map((employee) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={employee.id}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.3s ease-in-out',
                      border: `1px solid ${colors.neutral[200]}`,
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 40px rgba(0,0,0,0.12)`,
                        borderColor: colors.primary.main,
                        '& .employee-header': {
                          background: colors.neutral[50],
                        },
                      },
                    }}
                  >
                    {/* Header Section */}
                    <Box
                      className="employee-header"
                      sx={{
                        background: 'white',
                        p: 3,
                        transition: 'all 0.3s',
                        borderBottom: `1px solid ${colors.neutral[200]}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            bgcolor: getAvatarColor(employee.email),
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          }}
                        >
                          {getEmployeeInitials(employee)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2, mb: 0.5 }}>
                            {getEmployeeName(employee)}
                          </Typography>
                          <Chip
                            label={employee.role?.name || 'STAFF'}
                            size="small"
                            sx={{
                              bgcolor: colors.neutral[100],
                              color: colors.neutral[800],
                              fontWeight: 600,
                              border: `1px solid ${colors.neutral[300]}`,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Earnings Overview - Today, MTD, YTD */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                        <Card sx={{ bgcolor: colors.semantic.infoLight + '15', border: `1px solid ${colors.semantic.infoLight}`, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                              Today
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.semantic.info, mt: 0.5 }}>
                              ${employee.todayEarnings.toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>

                        <Card sx={{ bgcolor: colors.primary.light + '15', border: `1px solid ${colors.primary.light}`, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                              MTD
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.primary.main, mt: 0.5 }}>
                              ${employee.mtdEarnings.toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>

                        <Card sx={{ bgcolor: colors.semantic.successLight + '15', border: `1px solid ${colors.semantic.successLight}`, boxShadow: 'none' }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                              YTD
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: colors.semantic.success, mt: 0.5 }}>
                              ${employee.ytdEarnings.toFixed(2)}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>

                      {/* Ready for Payment - Prominent Display */}
                      <Card sx={{ bgcolor: colors.semantic.successLight + '20', border: `1px solid ${colors.semantic.successLight}`, boxShadow: 'none', mt: 1.5 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Ready for Payment
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" sx={{ color: colors.semantic.success, mt: 0.5 }}>
                            ${employee.totalReadyAmount.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Stats Section */}
                    <CardContent sx={{ p: 3 }}>
                      {/* Payment Statistics Grid */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
                        <Card sx={{
                          bgcolor: colors.semantic.infoLight + '15',
                          boxShadow: 'none',
                          border: `1px solid ${colors.semantic.infoLight}`,
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                            <Typography variant="h5" fontWeight="bold" color="info.main">
                              {employee.totalReadyJobs}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Ready
                            </Typography>
                          </CardContent>
                        </Card>

                        <Card sx={{
                          bgcolor: colors.semantic.warningLight + '15',
                          boxShadow: 'none',
                          border: `1px solid ${colors.semantic.warningLight}`,
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                              {employee.pendingPayments}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Pending
                            </Typography>
                          </CardContent>
                        </Card>

                        <Card sx={{
                          bgcolor: colors.semantic.successLight + '15',
                          boxShadow: 'none',
                          border: `1px solid ${colors.semantic.successLight}`,
                        }}>
                          <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {employee.totalPaidJobs}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Paid
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>

                      {/* Total Paid Amount */}
                      <Card sx={{
                        bgcolor: colors.primary.light + '10',
                        border: `1px solid ${colors.primary.light}`,
                        boxShadow: 'none',
                        mb: 2,
                      }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight="600">
                              Total Paid
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              ${employee.totalPaidAmount.toFixed(2)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Process All Ready Jobs Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => handleProcessAllReadyJobs(employee.id)}
                        disabled={employee.totalReadyJobs === 0}
                        sx={{
                          background: employee.totalReadyJobs > 0
                            ? `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`
                            : colors.neutral[300],
                          py: 1.5,
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
                        Process All Ready Jobs ({employee.totalReadyJobs})
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
        </Paper>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            View Details
          </MenuItem>
          {selectedPayment?.status === PaymentStatus.PENDING && (
            <MenuItem onClick={handleMenuClose}>
              Edit Payment
            </MenuItem>
          )}
        </Menu>

        {/* Process Payment Dialog */}
        <ProcessPaymentDialog
          open={processDialogOpen}
          onClose={() => setProcessDialogOpen(false)}
          onSuccess={handleProcessPayment}
          job={selectedJob}
        />
      </Box>
    </LocalizationProvider>
  );
}