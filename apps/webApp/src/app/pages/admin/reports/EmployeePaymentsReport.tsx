import { useState, useEffect } from 'react';
// Employee Payments Report Component
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Assessment,
  Person,
  AttachMoney,
  Work,
  CalendarToday,
} from '@mui/icons-material';
import { paymentService } from '../../../requests/payment.requests';
import { userService, User } from '../../../requests/user.requests';
import { colors } from '../../../theme/colors';

interface EmployeePayrollData {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paidAt: string;
    job?: {
      id: string;
      jobNumber: string;
      title: string;
      jobType: string;
    };
  }>;
  totalAmount: number;
}

interface DailySummary {
  date: string;
  payments: number;
  totalAmount: number;
}

export function EmployeePaymentsReport() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<EmployeePayrollData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set default date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date();

    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Load employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const users = await userService.getUsers();
        // Filter to only show staff and admin users (employees)
        const staffUsers = users.filter(
          (u) => u.role?.name === 'STAFF' || u.role?.name === 'ADMIN' || u.role?.name === 'SUPERVISOR'
        );
        setEmployees(staffUsers);
      } catch (err: unknown) {
        console.error('Error loading employees:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await paymentService.getPayrollReport(
        startDate,
        endDate,
        selectedEmployee || undefined
      );

      setReportData(data);
    } catch (err: unknown) {
      console.error('Error loading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate totals
  const totalPayments = reportData?.reduce((sum, emp) => sum + emp.payments.length, 0) || 0;
  const totalAmount = reportData?.reduce((sum, emp) => sum + emp.totalAmount, 0) || 0;

  // Calculate daily summaries - group all payments by date
  const getDailySummaries = (): DailySummary[] => {
    if (!reportData) return [];

    const dailyMap = new Map<string, { payments: number; totalAmount: number }>();

    reportData.forEach((empData) => {
      empData.payments.forEach((payment) => {
        if (payment.paidAt) {
          const dateKey = new Date(payment.paidAt).toISOString().split('T')[0];
          const existing = dailyMap.get(dateKey) || { payments: 0, totalAmount: 0 };
          dailyMap.set(dateKey, {
            payments: existing.payments + 1,
            totalAmount: existing.totalAmount + Number(payment.amount),
          });
        }
      });
    });

    // Convert to array and sort by date descending
    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        payments: data.payments,
        totalAmount: data.totalAmount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const dailySummaries = getDailySummaries();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Employee Payments Report
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Generate detailed payment reports by employee with date range filtering
      </Typography>

      {/* Report Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
          Report Configuration
        </Typography>

        <Grid container spacing={3} alignItems="flex-end">
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                label="Employee"
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={loadingEmployees}
              >
                <MenuItem value="">
                  <em>All Employees</em>
                </MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      <span>
                        {emp.firstName} {emp.lastName}
                      </span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
              onClick={handleGenerateReport}
              disabled={loading}
              sx={{ height: 56 }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Results */}
      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {!loading && reportData && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Person />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Employees
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {reportData.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.successDark} 100%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoney />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Paid
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors.semantic.info} 0%, ${colors.semantic.infoDark} 100%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Work />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Payments
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {totalPayments}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${colors.semantic.warning} 0%, ${colors.semantic.warningDark} 100%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarToday />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Date Range
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="bold">
                      {formatDate(startDate)} - {formatDate(endDate)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Daily Summary Table */}
            {dailySummaries.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.neutral[50] }}>
                      <TableCell>
                        <Typography fontWeight="bold">Date</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight="bold">Number of Payments</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">Total Amount</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dailySummaries.map((summary) => (
                      <TableRow key={summary.date} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday fontSize="small" color="action" />
                            <Typography fontWeight="500">
                              {formatDate(summary.date)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${summary.payments} payment${summary.payments !== 1 ? 's' : ''}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {formatCurrency(summary.totalAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Work sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">No payments found</Typography>
                <Typography variant="body2">
                  No payments were processed during the selected date range
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !reportData && !error && (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <AttachMoney sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
            <Typography variant="h6" gutterBottom fontWeight="500">
              No Report Generated
            </Typography>
            <Typography variant="body2">
              Select an employee (or all employees) and date range, then click "Generate Report"
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default EmployeePaymentsReport;
