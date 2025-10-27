import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Receipt,
  Description,
  PictureAsPdf,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setReportData(null);
    setError(null);
  };

  const loadReport = async (reportType: 'purchase' | 'expense') => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const endpoint = reportType === 'purchase' ? '/api/reports/purchase-report' : '/api/reports/expenses';
      const response = await axios.get(`${baseURL}${endpoint}`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReportData(response.data);
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
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

  const renderSummaryCards = () => {
    if (!reportData) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Purchases
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {reportData.totalPurchases || 0}
              </Typography>
              <Typography color="primary" variant="h6">
                {formatCurrency(reportData.totalPurchaseAmount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Expenses
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {reportData.totalExpenses || 0}
              </Typography>
              <Typography color="primary" variant="h6">
                {formatCurrency(reportData.totalExpenseAmount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Paid Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {formatCurrency(reportData.paidTotal || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pending Total
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {formatCurrency(reportData.pendingTotal || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!reportData || (!reportData.purchasesByCategory?.length && !reportData.expensesByCategory?.length)) {
      return null;
    }

    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Breakdown by Category
        </Typography>

        {reportData.purchasesByCategory?.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
              Purchase Invoices
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Pending</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.purchasesByCategory.map((cat: any) => (
                    <TableRow key={cat.category}>
                      <TableCell>
                        <Chip label={cat.category} size="small" />
                      </TableCell>
                      <TableCell align="right">{cat.count}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.totalAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.paidAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.pendingAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {reportData.expensesByCategory?.length > 0 && (
          <>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              Expense Invoices
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Paid</TableCell>
                    <TableCell align="right">Pending</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.expensesByCategory.map((cat: any) => (
                    <TableRow key={cat.category}>
                      <TableCell>
                        <Chip label={cat.category} size="small" />
                      </TableCell>
                      <TableCell align="right">{cat.count}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.totalAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.paidAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(cat.pendingAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    );
  };

  const renderVendorAnalysis = () => {
    if (!reportData || !reportData.topVendorsBySpending?.length) {
      return null;
    }

    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Top Vendors by Spending
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Vendor</TableCell>
                <TableCell align="right">Invoices</TableCell>
                <TableCell align="right">Total Spent</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Pending</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.topVendorsBySpending.map((vendor: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{vendor.vendorName || 'Unknown'}</TableCell>
                  <TableCell align="right">{vendor.count}</TableCell>
                  <TableCell align="right">{formatCurrency(vendor.totalAmount)}</TableCell>
                  <TableCell align="right">{formatCurrency(vendor.paidAmount)}</TableCell>
                  <TableCell align="right">{formatCurrency(vendor.pendingAmount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const renderMonthlyTrends = () => {
    if (!reportData || !reportData.monthlyTrends?.length) {
      return null;
    }

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Trends
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Purchases</TableCell>
                <TableCell align="right">Purchase Total</TableCell>
                <TableCell align="right">Expenses</TableCell>
                <TableCell align="right">Expense Total</TableCell>
                <TableCell align="right">Combined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.monthlyTrends.map((trend: any) => (
                <TableRow key={trend.month}>
                  <TableCell>{trend.month}</TableCell>
                  <TableCell align="right">{trend.purchaseCount}</TableCell>
                  <TableCell align="right">{formatCurrency(trend.purchaseTotal)}</TableCell>
                  <TableCell align="right">{trend.expenseCount}</TableCell>
                  <TableCell align="right">{formatCurrency(trend.expenseTotal)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(trend.combinedTotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Financial Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive purchase and expense analysis
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab icon={<Receipt />} iconPosition="start" label="Purchase & Expense Report" />
          <Tab icon={<Description />} iconPosition="start" label="Coming Soon" disabled />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                  onClick={() => loadReport('purchase')}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && reportData && (
            <>
              {renderSummaryCards()}
              {renderCategoryBreakdown()}
              {renderVendorAnalysis()}
              {renderMonthlyTrends()}
            </>
          )}

          {!loading && !reportData && !error && (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'text.secondary',
              }}
            >
              <PictureAsPdf sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                No Report Generated
              </Typography>
              <Typography variant="body2">
                Select date range and click Generate Report to view financial analysis
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Additional reports coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Reports;
