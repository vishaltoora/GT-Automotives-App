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
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PaymentResponseDto, PaymentSummaryDto, JobResponseDto } from '@gt-automotive/data';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
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

export function PaymentsManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState<PaymentResponseDto[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobResponseDto[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [summary, setSummary] = useState<PaymentSummaryDto | null>(null);
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
    fetchEmployees();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filterParams = {
        employeeId: filters.employeeId || undefined,
        status: filters.status as PaymentStatus || undefined,
        paymentMethod: filters.paymentMethod as PaymentMethod || undefined,
        startDate: filters.startDate?.toISOString() || undefined,
        endDate: filters.endDate?.toISOString() || undefined,
      };

      const [paymentsData, summaryData, pendingJobsData] = await Promise.all([
        paymentService.getPayments(filterParams),
        paymentService.getPaymentSummary(filters.employeeId || undefined),
        jobService.getJobsReadyForPayment(),
      ]);

      setPayments(paymentsData);
      setSummary(summaryData);
      setPendingJobs(pendingJobsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const users = await userService.getUsers();
      const staffMembers = users.filter(u => u.role?.name === 'STAFF');
      setEmployees(staffMembers);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
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

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
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

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.infoLight} 0%, ${colors.semantic.info} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PaymentIcon />
                    <Typography variant="h6">Total Payments</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.totalPayments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.warningLight} 0%, ${colors.semantic.warning} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    <Typography variant="h6">Pending</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.pendingPayments}
                  </Typography>
                  <Typography variant="body2">
                    ${summary.pendingAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.successLight} 0%, ${colors.semantic.success} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon />
                    <Typography variant="h6">Paid</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.paidPayments}
                  </Typography>
                  <Typography variant="body2">
                    ${summary.paidAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    <Typography variant="h6">Total Value</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    ${summary.totalAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
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
            {/* Pending Jobs Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: colors.neutral[50] }}>
                    <TableCell fontWeight="bold">Job</TableCell>
                    <TableCell fontWeight="bold">Employee</TableCell>
                    <TableCell fontWeight="bold">Amount</TableCell>
                    <TableCell fontWeight="bold">Completed</TableCell>
                    <TableCell fontWeight="bold" align="center">Actions</TableCell>
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
                            <PersonIcon sx={{ fontSize: 16, color: colors.neutral[500] }} />
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

          <TabPanel value={tabValue} index={1}>
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
                    <TableCell fontWeight="bold">Payment</TableCell>
                    <TableCell fontWeight="bold">Employee</TableCell>
                    <TableCell fontWeight="bold">Job</TableCell>
                    <TableCell fontWeight="bold">Amount</TableCell>
                    <TableCell fontWeight="bold">Method</TableCell>
                    <TableCell fontWeight="bold">Status</TableCell>
                    <TableCell fontWeight="bold">Date</TableCell>
                    <TableCell fontWeight="bold" align="center">Actions</TableCell>
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
                            <PersonIcon sx={{ fontSize: 16, color: colors.neutral[500] }} />
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