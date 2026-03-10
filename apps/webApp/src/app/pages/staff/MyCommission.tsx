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
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  TireRepair as TireIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { colors } from '../../theme/colors';
import { TireSaleService, TireSale, MonthlyStats } from '../../requests/tire-sale.requests';

const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

export function MyCommission() {
  const [sales, setSales] = useState<TireSale[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Month/Year selectors
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Generate year options (current year and 2 previous years)
  const yearOptions = [
    currentDate.getFullYear(),
    currentDate.getFullYear() - 1,
    currentDate.getFullYear() - 2,
  ];

  // Calculate date range from month/year
  const getDateRange = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    return {
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    };
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(selectedMonth, selectedYear);

      const [salesData, statsData] = await Promise.all([
        TireSaleService.getMySales({ startDate, endDate }),
        TireSaleService.getMyStats(selectedYear, selectedMonth + 1), // API expects 1-indexed month
      ]);

      setSales(salesData.items);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load commission data:', err);
      setError(err.response?.data?.message || 'Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const getCommissionTier = (tireCount: number) => {
    if (tireCount >= 71) return { tier: 'Platinum', rate: 7, color: '#E5E4E2', icon: '💎' };
    if (tireCount >= 51) return { tier: 'Gold', rate: 5, color: '#FFD700', icon: '🥇' };
    if (tireCount >= 31) return { tier: 'Silver', rate: 4, color: '#C0C0C0', icon: '🥈' };
    return { tier: 'Bronze', rate: 3, color: '#CD7F32', icon: '🥉' };
  };

  // Calculate totals from sales
  const totalTiresSold = sales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingCommission = sales
    .filter((s) => s.commissionStatus === 'PENDING')
    .reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
  const paidCommission = sales
    .filter((s) => s.commissionStatus === 'PAID')
    .reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
  const totalCommission = pendingCommission + paidCommission;

  const currentTier = getCommissionTier(totalTiresSold);
  const isCurrentMonth = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with Month/Year Selectors */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
            My Commission
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your tire sales and commission earnings
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value as number)}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 90 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={(e) => setSelectedYear(e.target.value as number)}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Current Tier Card */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h2">{currentTier.icon}</Typography>
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8 }}>
                  {isCurrentMonth ? 'Current Tier' : `${MONTHS[selectedMonth].label} ${selectedYear}`}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {currentTier.tier}
                </Typography>
                <Typography variant="h6">
                  ${currentTier.rate}/tire
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="overline" sx={{ opacity: 0.8 }}>
                {isCurrentMonth ? 'This Month' : 'Total'}
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {totalTiresSold} tires
              </Typography>
              {isCurrentMonth && stats?.nextThreshold && stats?.tiresToNextThreshold && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stats.tiresToNextThreshold} more to reach next tier (${stats.nextThreshold === 31 ? 4 : stats.nextThreshold === 51 ? 5 : 7}/tire)
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
                <strong>Bronze:</strong> 1-30 = $3/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#C0C0C0' }} />
              <Typography variant="body2">
                <strong>Silver:</strong> 31-50 = $4/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFD700' }} />
              <Typography variant="body2">
                <strong>Gold:</strong> 51-70 = $5/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#E5E4E2' }} />
              <Typography variant="body2">
                <strong>Platinum:</strong> 71+ = $7/tire
              </Typography>
            </Box>
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

      {/* Summary Cards */}
      {!loading && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TireIcon sx={{ fontSize: 32, color: colors.secondary.main, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {totalTiresSold}
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
                    ${totalSalesAmount.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Sales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MoneyIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    ${pendingCommission.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: colors.primary.main, color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrophyIcon sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    ${paidCommission.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">
                    Paid
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sales Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Sale #</TableCell>
                    <TableCell align="center">Tires</TableCell>
                    <TableCell align="right">Sale Amount</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No sales found for {MONTHS[selectedMonth].label} {selectedYear}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => {
                      const tireCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <TableRow key={sale.id} hover>
                          <TableCell>
                            {format(new Date(sale.saleDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">{sale.saleNumber}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">{tireCount}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            ${sale.total.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold" color="success.main">
                              ${(sale.commissionAmount || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={sale.commissionStatus}
                              size="small"
                              color={sale.commissionStatus === 'PAID' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Total Commission Summary */}
          {sales.length > 0 && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total Commission ({MONTHS[selectedMonth].label} {selectedYear})
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  ${totalCommission.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

export default MyCommission;
