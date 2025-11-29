import { useState } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Receipt,
  AttachMoney,
  Assessment,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

type ReportType = 'purchase' | 'expense' | 'tax-collection';

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>('purchase');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [taxReportData, setTaxReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleReportTypeChange = (newType: ReportType) => {
    setReportType(newType);
    setReportData(null);
    setTaxReportData(null);
    setError(null);
  };

  const handleGenerateReport = async () => {
    if (reportType === 'purchase' || reportType === 'expense') {
      await loadPurchaseExpenseReport();
    } else if (reportType === 'tax-collection') {
      await loadTaxReport();
    }
  };

  const loadPurchaseExpenseReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${baseURL}/api/reports/purchase-report`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReportData(response.data);
      setTaxReportData(null); // Clear tax report data
    } catch (err: any) {
      console.error('Error loading report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const loadTaxReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${baseURL}/api/reports/tax-report`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTaxReportData(response.data);
      setReportData(null); // Clear purchase/expense report data
    } catch (err: any) {
      console.error('Error loading tax report:', err);
      setError(err.response?.data?.message || 'Failed to load tax report');
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

    // Show only Purchase or Expense based on selected report type
    if (reportType === 'purchase') {
      return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Purchase Invoices
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
        </Grid>
      );
    } else if (reportType === 'expense') {
      return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Expense Invoices
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
        </Grid>
      );
    }

    return null;
  };

  const renderCategoryBreakdown = () => {
    if (!reportData) return null;

    // Show only Purchase or Expense categories based on report type
    const categories = reportType === 'purchase'
      ? reportData.purchasesByCategory
      : reportData.expensesByCategory;

    if (!categories?.length) return null;

    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {reportType === 'purchase' ? 'Purchase' : 'Expense'} Breakdown by Category
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat: any) => (
                <TableRow key={cat.category}>
                  <TableCell>
                    <Chip label={cat.category.replace(/_/g, ' ')} size="small" />
                  </TableCell>
                  <TableCell align="right">{cat.count}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(cat.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.topVendorsBySpending.map((vendor: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{vendor.vendorName || 'Unknown'}</TableCell>
                  <TableCell align="right">{vendor.count}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(vendor.totalAmount)}
                  </TableCell>
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
          Monthly Trends - {reportType === 'purchase' ? 'Purchases' : 'Expenses'}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.monthlyTrends.map((trend: any) => (
                <TableRow key={trend.month}>
                  <TableCell>{trend.month}</TableCell>
                  <TableCell align="right">
                    {reportType === 'purchase' ? trend.purchaseCount : trend.expenseCount}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(reportType === 'purchase' ? trend.purchaseTotal : trend.expenseTotal)}
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
        Generate comprehensive financial reports with date range filtering
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Report Configuration Section */}
        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
          Report Configuration
        </Typography>

        <Grid container spacing={3} alignItems="flex-end">
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => handleReportTypeChange(e.target.value as ReportType)}
              >
                <MenuItem value="purchase">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Receipt fontSize="small" />
                    <span>Purchase Invoices</span>
                  </Box>
                </MenuItem>
                <MenuItem value="expense">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Receipt fontSize="small" />
                    <span>Expense Invoices</span>
                  </Box>
                </MenuItem>
                <MenuItem value="tax-collection">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" />
                    <span>GST/PST Tax Collection</span>
                  </Box>
                </MenuItem>
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
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
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

      {/* Report Results Section */}
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

        {/* Purchase & Expense Report Results */}
        {!loading && (reportType === 'purchase' || reportType === 'expense') && reportData && (
          <>
            {renderSummaryCards()}
            {renderCategoryBreakdown()}
            {renderVendorAnalysis()}
            {renderMonthlyTrends()}
          </>
        )}

        {/* Tax Collection Report Results */}
        {!loading && reportType === 'tax-collection' && taxReportData && (
            <>
              {/* Tax Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Paid Invoices
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {taxReportData.totalInvoices || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        GST Collected
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatCurrency(taxReportData.totalGstCollected || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        PST Collected
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatCurrency(taxReportData.totalPstCollected || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        Total Tax Collected
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(taxReportData.totalTaxCollected || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Monthly Breakdown */}
              {taxReportData.monthlyBreakdown?.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Tax Collection
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell align="right">Invoices</TableCell>
                          <TableCell align="right">GST Collected</TableCell>
                          <TableCell align="right">PST Collected</TableCell>
                          <TableCell align="right">Total Tax</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {taxReportData.monthlyBreakdown.map((month: any) => (
                          <TableRow key={month.month}>
                            <TableCell>{month.month}</TableCell>
                            <TableCell align="right">{month.invoiceCount}</TableCell>
                            <TableCell align="right">{formatCurrency(month.gstCollected)}</TableCell>
                            <TableCell align="right">{formatCurrency(month.pstCollected)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(month.totalTaxCollected)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </>
          )}

        {/* Empty State - No Report Generated */}
        {!loading && !reportData && !taxReportData && !error && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            {reportType === 'purchase' ? (
              <>
                <Receipt sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" gutterBottom fontWeight="500">
                  No Purchase Invoice Report Generated
                </Typography>
                <Typography variant="body2">
                  Select a date range and click "Generate Report" to view purchase invoice analysis
                </Typography>
              </>
            ) : reportType === 'expense' ? (
              <>
                <Receipt sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" gutterBottom fontWeight="500">
                  No Expense Invoice Report Generated
                </Typography>
                <Typography variant="body2">
                  Select a date range and click "Generate Report" to view expense invoice analysis
                </Typography>
              </>
            ) : (
              <>
                <AttachMoney sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" gutterBottom fontWeight="500">
                  No Tax Collection Report Generated
                </Typography>
                <Typography variant="body2">
                  Select a date range and click "Generate Report" to view GST/PST tax collection from paid invoices
                </Typography>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Reports;
