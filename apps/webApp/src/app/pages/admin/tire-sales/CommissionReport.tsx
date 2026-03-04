import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  TireRepair as TireIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { colors } from '../../../theme/colors';
import { TireSaleService, CommissionReport as CommissionReportType } from '../../../requests/tire-sale.requests';

export function CommissionReport() {
  const [report, setReport] = useState<CommissionReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date filters
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TireSaleService.getCommissionReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load commission report:', err);
      setError(err.response?.data?.message || 'Failed to load commission report');
    } finally {
      setLoading(false);
    }
  };

  const getCommissionTier = (tireCount: number) => {
    if (tireCount >= 71) return { tier: 'Platinum', rate: 7, color: '#E5E4E2' };
    if (tireCount >= 51) return { tier: 'Gold', rate: 5, color: '#FFD700' };
    if (tireCount >= 31) return { tier: 'Silver', rate: 4, color: '#C0C0C0' };
    return { tier: 'Bronze', rate: 3, color: '#CD7F32' };
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
          Commission Report
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track employee commissions from tire sales
        </Typography>
      </Box>

      {/* Commission Tiers Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Commission Tiers (Per Month)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#CD7F32' }} />
              <Typography variant="body2">
                <strong>Bronze:</strong> 1-30 tires = $3/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#C0C0C0' }} />
              <Typography variant="body2">
                <strong>Silver:</strong> 31-50 tires = $4/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFD700' }} />
              <Typography variant="body2">
                <strong>Gold:</strong> 51-70 tires = $5/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#E5E4E2' }} />
              <Typography variant="body2">
                <strong>Platinum:</strong> 71+ tires = $7/tire
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Date Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Button variant="contained" onClick={loadReport} fullWidth>
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Report Content */}
      {!loading && report && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 32, color: colors.primary.main, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {report.employees.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TireIcon sx={{ fontSize: 32, color: colors.secondary.main, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {report.totals.totalTiresSold}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tires Sold
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 32, color: colors.semantic.success, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    ${report.totals.totalSalesAmount.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Sales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: colors.primary.main, color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MoneyIcon sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    ${report.totals.totalCommission.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">
                    Total Commission
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Pending vs Paid Summary */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    ${report.totals.pendingCommission.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Commission
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    ${report.totals.paidCommission.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid Commission
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Employee Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell align="center">Tier</TableCell>
                    <TableCell align="center">Tires Sold</TableCell>
                    <TableCell align="right">Sales Amount</TableCell>
                    <TableCell align="center">Rate</TableCell>
                    <TableCell align="right">Pending</TableCell>
                    <TableCell align="right">Paid</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No sales data for this period
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.employees.map((emp) => {
                      const tier = getCommissionTier(emp.totalTiresSold);
                      return (
                        <TableRow key={emp.employeeId} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{emp.employeeName}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                bgcolor: `${tier.color}20`,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: tier.color,
                                }}
                              />
                              <Typography variant="caption" fontWeight="bold">
                                {tier.tier}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">{emp.totalTiresSold}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            ${emp.totalSalesAmount.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold" color="success.main">
                              ${emp.commissionRate}/tire
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="warning.main">
                              ${emp.pendingCommission.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography color="success.main">
                              ${emp.paidCommission.toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}

export default CommissionReport;
