import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { JobSummaryDto, PaymentSummaryDto, JobResponseDto, PaymentResponseDto } from '@gt-automotive/data';
import { jobService } from '../../../services/job.service';
import { paymentService } from '../../../services/payment.service';
import { userService } from '../../../services/user.service';
import { colors } from '../../../theme/colors';
import { format } from 'date-fns';

export function PayrollDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobSummary, setJobSummary] = useState<JobSummaryDto | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryDto | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobResponseDto[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentResponseDto[]>([]);
  const [pendingJobs, setPendingJobs] = useState<JobResponseDto[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        jobSummaryData,
        paymentSummaryData,
        jobsData,
        paymentsData,
        pendingJobsData,
        usersData,
      ] = await Promise.all([
        jobService.getJobSummary(),
        paymentService.getPaymentSummary(),
        jobService.getJobs(),
        paymentService.getPayments(),
        jobService.getJobsReadyForPayment(),
        userService.getUsers(),
      ]);

      setJobSummary(jobSummaryData);
      setPaymentSummary(paymentSummaryData);
      setRecentJobs(jobsData.slice(0, 5)); // Latest 5 jobs
      setRecentPayments(paymentsData.slice(0, 5)); // Latest 5 payments
      setPendingJobs(pendingJobsData);
      setEmployees(usersData.filter(u => u.role?.name === 'STAFF'));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

  const calculatePayrollProgress = () => {
    if (!jobSummary) return 0;
    return jobSummary.totalJobs > 0 ? (jobSummary.paidJobs / jobSummary.totalJobs) * 100 : 0;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading payroll dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <MoneyIcon sx={{ fontSize: 32, color: colors.primary.main }} />
          Payroll Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage employee jobs, payments, and payroll activities
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <WorkIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6">Active Jobs</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {jobSummary?.totalJobs || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {jobSummary?.pendingJobs || 0} pending • {jobSummary?.readyJobs || 0} ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.successLight} 0%, ${colors.semantic.success} 100%)`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <PaymentIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6">Payments</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {paymentSummary?.totalPayments || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                ${paymentSummary?.totalAmount.toFixed(2) || '0.00'} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.warningLight} 0%, ${colors.semantic.warning} 100%)`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <ScheduleIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {pendingJobs.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Jobs ready for payment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.infoLight} 0%, ${colors.semantic.info} 100%)`, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <PersonIcon sx={{ fontSize: 24 }} />
                <Typography variant="h6">Employees</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {employees.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active staff members
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payroll Progress */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: colors.primary.main }} />
                Payroll Progress
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="textSecondary">Jobs Completed & Paid</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {jobSummary?.paidJobs || 0} / {jobSummary?.totalJobs || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={calculatePayrollProgress()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.neutral[200],
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
                  }
                }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {calculatePayrollProgress().toFixed(1)}% of jobs paid this period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon sx={{ color: colors.semantic.success }} />
                Outstanding Payments
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                ${jobSummary?.pendingPayAmount.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Across {(jobSummary?.pendingJobs || 0) + (jobSummary?.readyJobs || 0)} pending jobs
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<PaymentIcon />}
                onClick={() => navigate('/admin/payroll/payments')}
                sx={{
                  mt: 2,
                  background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
                }}
              >
                Process Payments
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}
                onClick={() => navigate('/admin/payroll/jobs')}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <WorkIcon sx={{ fontSize: 48, color: colors.primary.main, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Manage Jobs</Typography>
              <Typography variant="body2" color="textSecondary">
                Create and manage employee jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}
                onClick={() => navigate('/admin/payroll/payments')}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PaymentIcon sx={{ fontSize: 48, color: colors.semantic.success, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Process Payments</Typography>
              <Typography variant="body2" color="textSecondary">
                Pay employees for completed jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 48, color: colors.semantic.info, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Employee Reports</Typography>
              <Typography variant="body2" color="textSecondary">
                View individual payroll reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: colors.semantic.warning, mb: 2 }} />
              <Typography variant="h6" fontWeight="bold">Payroll Analytics</Typography>
              <Typography variant="body2" color="textSecondary">
                View trends and insights
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Recent Jobs</Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/payroll/jobs')}
                size="small"
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Job</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="textSecondary">No recent jobs</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{getEmployeeName(job.employee)}</TableCell>
                        <TableCell>
                          <Chip
                            label={job.status.replace('_', ' ')}
                            size="small"
                            color={job.status === 'PAID' ? 'success' : job.status === 'READY' ? 'info' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">${job.payAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Recent Payments</Typography>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/admin/payroll/payments')}
                size="small"
              >
                View All
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="textSecondary">No recent payments</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{getEmployeeName(payment.employee)}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.paymentMethod.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd') : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                          ${payment.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}