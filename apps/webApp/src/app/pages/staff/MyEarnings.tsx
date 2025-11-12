import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Work,
  Payment,
  CalendarToday,
  Refresh,
  CheckCircle,
  HourglassEmpty,
  ArrowBack,
} from '@mui/icons-material';
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/payment.service';
import { jobService } from '../../services/job.service';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { JobStatus } from '@gt-automotive/data';
import { PaymentStatus } from '@gt-automotive/data';

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
      id={`earnings-tabpanel-${index}`}
      aria-labelledby={`earnings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function MyEarnings() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Earnings data
  const [payments, setPayments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  // Filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [jobStatusFilter, setJobStatusFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');

  useEffect(() => {
    fetchEarningsData();
  }, [user?.id]);

  const fetchEarningsData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Use secure endpoints that fetch data based on the authenticated user's token
      // This prevents staff from accessing other employees' data
      const [paymentsData, jobsData] = await Promise.all([
        paymentService.getMyPayments(),
        jobService.getMyJobs(),
      ]);

      setPayments(paymentsData);
      setJobs(jobsData);
    } catch (err: any) {
      console.error('Failed to fetch earnings data:', err);
      setError(err.message || 'Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate period-based earnings
  const calculateEarnings = () => {
    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID);

    const today = paidPayments
      .filter(p => isToday(new Date(p.paidAt || p.createdAt)))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const thisWeek = paidPayments
      .filter(p => isThisWeek(new Date(p.paidAt || p.createdAt), { weekStartsOn: 1 }))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const thisMonth = paidPayments
      .filter(p => isThisMonth(new Date(p.paidAt || p.createdAt)))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const thisYear = paidPayments
      .filter(p => isThisYear(new Date(p.paidAt || p.createdAt)))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const allTime = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return { today, thisWeek, thisMonth, thisYear, allTime };
  };

  const earnings = calculateEarnings();

  // Calculate job statistics
  const jobStats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === JobStatus.PENDING).length,
    ready: jobs.filter(j => j.status === JobStatus.READY).length,
    paid: jobs.filter(j => j.status === JobStatus.PAID).length,
    readyAmount: jobs
      .filter(j => j.status === JobStatus.READY)
      .reduce((sum, j) => sum + Number(j.payAmount), 0),
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (paymentStatusFilter !== 'ALL' && payment.status !== paymentStatusFilter) return false;
    if (dateRangeFilter === 'TODAY' && !isToday(new Date(payment.paidAt || payment.createdAt))) return false;
    if (dateRangeFilter === 'WEEK' && !isThisWeek(new Date(payment.paidAt || payment.createdAt), { weekStartsOn: 1 })) return false;
    if (dateRangeFilter === 'MONTH' && !isThisMonth(new Date(payment.paidAt || payment.createdAt))) return false;
    if (dateRangeFilter === 'YEAR' && !isThisYear(new Date(payment.paidAt || payment.createdAt))) return false;
    return true;
  });

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (jobStatusFilter !== 'ALL' && job.status !== jobStatusFilter) return false;
    return true;
  });

  const getStatusColor = (status: PaymentStatus | JobStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
      case JobStatus.PAID:
        return 'success';
      case PaymentStatus.PENDING:
      case JobStatus.PENDING:
        return 'warning';
      case JobStatus.READY:
        return 'info';
      case PaymentStatus.FAILED:
      case JobStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(Number(amount));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          onClick={() => navigate(`/${role}/dashboard`)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 1,
            cursor: 'pointer',
            color: colors.primary.main,
            '&:hover': {
              color: colors.primary.dark,
              textDecoration: 'underline',
            },
          }}
        >
          <ArrowBack sx={{ fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Back to Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
              My Earnings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your earnings, payments, and job history
            </Typography>
          </Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchEarningsData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Earnings & Jobs Summary Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: `1px solid ${colors.neutral[200]}`,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {/* Earnings Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AttachMoney sx={{ fontSize: 28, color: colors.primary.main, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.neutral[800] }}>
                Earnings Overview
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, sm: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, color: colors.semantic.success, mr: 0.75 }} />
                    <Typography variant="body2" sx={{ color: colors.neutral[600], fontWeight: 600 }}>
                      Today
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: colors.neutral[900], fontWeight: 700 }}>
                    {formatCurrency(earnings.today)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ fontSize: 18, color: colors.semantic.info, mr: 0.75 }} />
                    <Typography variant="body2" sx={{ color: colors.neutral[600], fontWeight: 600 }}>
                      This Week
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: colors.neutral[900], fontWeight: 700 }}>
                    {formatCurrency(earnings.thisWeek)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, color: colors.primary.main, mr: 0.75 }} />
                    <Typography variant="body2" sx={{ color: colors.neutral[600], fontWeight: 600 }}>
                      This Month
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: colors.neutral[900], fontWeight: 700 }}>
                    {formatCurrency(earnings.thisMonth)}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ fontSize: 18, color: colors.secondary.main, mr: 0.75 }} />
                    <Typography variant="body2" sx={{ color: colors.neutral[600], fontWeight: 600 }}>
                      This Year
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ color: colors.neutral[900], fontWeight: 700 }}>
                    {formatCurrency(earnings.thisYear)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Divider */}
          <Box sx={{ borderBottom: `1px solid ${colors.neutral[200]}`, mb: 4 }} />

          {/* Jobs Summary Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Work sx={{ fontSize: 28, color: colors.secondary.main, mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: colors.neutral[800] }}>
                Jobs Summary
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, sm: 4 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Total Jobs
                  </Typography>
                  <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: colors.neutral[700] }}>
                    {jobStats.total}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Pending Jobs
                  </Typography>
                  <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: colors.semantic.warning }}>
                    {jobStats.pending}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Ready for Payment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: colors.semantic.info }}>
                      {jobStats.ready}
                    </Typography>
                    <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 600, color: colors.neutral[600] }}>
                      ({formatCurrency(jobStats.readyAmount)})
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                    Paid Jobs
                  </Typography>
                  <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700, color: colors.semantic.success }}>
                    {jobStats.paid}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label="earnings tabs">
            <Tab icon={<Payment />} iconPosition="start" label="Payment History" />
            <Tab icon={<Work />} iconPosition="start" label="My Jobs" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Payment Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | 'ALL')}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value={PaymentStatus.PAID}>Paid</MenuItem>
                <MenuItem value={PaymentStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={PaymentStatus.FAILED}>Failed</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Date Range"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as any)}
              >
                <MenuItem value="ALL">All Time</MenuItem>
                <MenuItem value="TODAY">Today</MenuItem>
                <MenuItem value="WEEK">This Week</MenuItem>
                <MenuItem value="MONTH">This Month</MenuItem>
                <MenuItem value="YEAR">This Year</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Payment Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  {!isMobile && <TableCell>Job</TableCell>}
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 4 : 5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No payments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.paidAt || payment.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {payment.job?.title || 'N/A'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.paymentMethod?.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={getStatusColor(payment.status)}
                          icon={payment.status === PaymentStatus.PAID ? <CheckCircle /> : <HourglassEmpty />}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Job Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value as JobStatus | 'ALL')}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value={JobStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={JobStatus.READY}>Ready for Payment</MenuItem>
                <MenuItem value={JobStatus.PAID}>Paid</MenuItem>
                <MenuItem value={JobStatus.PARTIALLY_PAID}>Partially Paid</MenuItem>
                <MenuItem value={JobStatus.CANCELLED}>Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Jobs Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Job</TableCell>
                  {!isMobile && <TableCell>Type</TableCell>}
                  <TableCell>Amount</TableCell>
                  {!isMobile && <TableCell>Due Date</TableCell>}
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No jobs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {job.title}
                        </Typography>
                        {isMobile && (
                          <Typography variant="caption" color="text.secondary">
                            {job.jobType?.replace('_', ' ')}
                          </Typography>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Chip label={job.jobType?.replace('_', ' ')} size="small" variant="outlined" />
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(job.payAmount)}
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          {job.dueDate ? format(new Date(job.dueDate), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={job.status}
                          size="small"
                          color={getStatusColor(job.status)}
                          icon={job.status === JobStatus.PAID ? <CheckCircle /> : job.status === JobStatus.READY ? <Payment /> : <HourglassEmpty />}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
    </Box>
  );
}
