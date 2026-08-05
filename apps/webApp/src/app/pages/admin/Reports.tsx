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
import { Receipt, AttachMoney, Assessment, ListAlt } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { InvoiceStatus } from '@gt-automotive/data';
import { formatDisplayDate } from '../../utils/dateUtils';
import { useAuth as useAppAuth } from '../../hooks/useAuth';

type ReportType =
  | 'purchase'
  | 'expense'
  | 'tax-collection'
  | 'gst-paid'
  | 'sales';

// Sentinel for "don't filter by status" — MUI Select can't hold undefined.
const ALL_STATUSES = 'ALL';

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>('purchase');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesStatus, setSalesStatus] = useState<string>(ALL_STATUSES);
  const [reportData, setReportData] = useState<any>(null);
  const [taxReportData, setTaxReportData] = useState<any>(null);
  const [gstPaidReportData, setGstPaidReportData] = useState<any>(null);
  const [salesReportData, setSalesReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { role } = useAppAuth();
  // This page is also routed for supervisors and foremen, but the sales report
  // endpoint is admin/accountant-only — don't offer a report they'd get a 403 on.
  const canRunSalesReport = role === 'admin' || role === 'accountant';

  const clearReports = () => {
    setReportData(null);
    setTaxReportData(null);
    setGstPaidReportData(null);
    setSalesReportData(null);
  };

  const handleReportTypeChange = (newType: ReportType) => {
    setReportType(newType);
    clearReports();
    setError(null);
  };

  const handleGenerateReport = async () => {
    if (reportType === 'purchase' || reportType === 'expense') {
      await loadPurchaseExpenseReport();
    } else if (reportType === 'tax-collection') {
      await loadTaxReport();
    } else if (reportType === 'gst-paid') {
      await loadGstPaidReport();
    } else if (reportType === 'sales') {
      await loadSalesReport();
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

      const response = await axios.get(
        `${baseURL}/api/reports/purchase-report`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReportData(response.data);
      setTaxReportData(null); // Clear tax report data
      setGstPaidReportData(null);
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
      setGstPaidReportData(null);
    } catch (err: any) {
      console.error('Error loading tax report:', err);
      setError(err.response?.data?.message || 'Failed to load tax report');
    } finally {
      setLoading(false);
    }
  };

  const loadGstPaidReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(
        `${baseURL}/api/reports/gst-paid-report`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGstPaidReportData(response.data);
      setReportData(null);
      setTaxReportData(null);
      setSalesReportData(null);
    } catch (err: any) {
      console.error('Error loading GST paid report:', err);
      setError(err.response?.data?.message || 'Failed to load GST paid report');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    // Unlike the other reports, the sales report is scoped to an explicit range
    // rather than defaulting to all time — an unbounded invoice list is never
    // what the user wants here.
    if (!startDate || !endDate) {
      setError('Select both a start date and an end date.');
      return;
    }
    if (endDate < startDate) {
      setError('The end date cannot be before the start date.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const params: any = { startDate, endDate };
      if (salesStatus !== ALL_STATUSES) params.status = salesStatus;

      const response = await axios.get(`${baseURL}/api/reports/sales-report`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSalesReportData(response.data);
      setReportData(null);
      setTaxReportData(null);
      setGstPaidReportData(null);
    } catch (err: any) {
      console.error('Error loading sales report:', err);
      setError(err.response?.data?.message || 'Failed to load sales report');
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

  // Enum values are SCREAMING_SNAKE_CASE; show them as words.
  const humanize = (value?: string | null) =>
    value ? value.replace(/_/g, ' ') : '';

  const renderSalesReport = () => {
    if (!salesReportData) return null;

    const { rows, totals, invoiceCount } = salesReportData;

    if (!rows?.length) {
      return (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ListAlt sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
          <Typography variant="h6" gutterBottom fontWeight="500">
            No invoices found
          </Typography>
          <Typography variant="body2">
            No invoices match{' '}
            {formatDisplayDate(salesReportData.startDate, 'short')}
            {' – '}
            {formatDisplayDate(salesReportData.endDate, 'short')}
            {salesStatus !== ALL_STATUSES &&
              ` with status ${humanize(salesStatus)}`}
            .
          </Typography>
        </Box>
      );
    }

    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Invoices — {formatDisplayDate(salesReportData.startDate, 'short')} to{' '}
          {formatDisplayDate(salesReportData.endDate, 'short')} ({invoiceCount})
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Sub Total</TableCell>
                <TableCell align="right">GST</TableCell>
                <TableCell align="right">PST</TableCell>
                <TableCell align="right">Net Total</TableCell>
                <TableCell>Mode of Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={row.invoiceId} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDisplayDate(row.date, 'short')}
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(row.subtotal)}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(row.gst)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.pst)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(row.netTotal)}
                  </TableCell>
                  <TableCell>
                    {row.paymentMethod ? (
                      <Chip label={humanize(row.paymentMethod)} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unpaid
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ '& td': { borderTop: 2, fontWeight: 'bold' } }}>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell align="right">
                  {formatCurrency(totals.subtotal)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(totals.gst)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(totals.pst)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(totals.netTotal)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const renderSummaryCards = () => {
    if (!reportData) return null;

    // Show only Purchase or Expense based on selected report type
    if (reportType === 'purchase') {
      return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
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
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
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
    const categories =
      reportType === 'purchase'
        ? reportData.purchasesByCategory
        : reportData.expensesByCategory;

    if (!categories?.length) return null;

    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {reportType === 'purchase' ? 'Purchase' : 'Expense'} Breakdown by
          Category
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
                    <Chip
                      label={cat.category.replace(/_/g, ' ')}
                      size="small"
                    />
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
              {reportData.topVendorsBySpending.map(
                (vendor: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{vendor.vendorName || 'Unknown'}</TableCell>
                    <TableCell align="right">{vendor.count}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(vendor.totalAmount)}
                    </TableCell>
                  </TableRow>
                )
              )}
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
          Monthly Trends -{' '}
          {reportType === 'purchase' ? 'Purchases' : 'Expenses'}
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
                    {reportType === 'purchase'
                      ? trend.purchaseCount
                      : trend.expenseCount}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(
                      reportType === 'purchase'
                        ? trend.purchaseTotal
                        : trend.expenseTotal
                    )}
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
                onChange={(e) =>
                  handleReportTypeChange(e.target.value as ReportType)
                }
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
                <MenuItem value="gst-paid">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney fontSize="small" />
                    <span>GST Paid on Purchase & Expense</span>
                  </Box>
                </MenuItem>
                {canRunSalesReport && (
                  <MenuItem value="sales">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ListAlt fontSize="small" />
                      <span>Invoice Sales</span>
                    </Box>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {reportType === 'sales' && (
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={salesStatus}
                  label="Status"
                  onChange={(e) => setSalesStatus(e.target.value)}
                >
                  <MenuItem value={ALL_STATUSES}>All Statuses</MenuItem>
                  {Object.values(InvoiceStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {humanize(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

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
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Assessment />
                )
              }
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

        {/* Invoice Sales Report Results */}
        {!loading &&
          reportType === 'sales' &&
          salesReportData &&
          renderSalesReport()}

        {/* Purchase & Expense Report Results */}
        {!loading &&
          (reportType === 'purchase' || reportType === 'expense') &&
          reportData && (
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
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
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
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      GST Collected
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {formatCurrency(taxReportData.totalGstCollected || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      PST Collected
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {formatCurrency(taxReportData.totalPstCollected || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
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
                          <TableCell align="right">
                            {month.invoiceCount}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(month.gstCollected)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(month.pstCollected)}
                          </TableCell>
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

        {/* GST Paid on Purchase & Expense Report Results */}
        {!loading && reportType === 'gst-paid' && gstPaidReportData && (
          <>
            {/* GST Paid Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      Total Paid Invoices
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {gstPaidReportData.totalInvoices || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {gstPaidReportData.totalPurchaseInvoices || 0} Purchase,{' '}
                      {gstPaidReportData.totalExpenseInvoices || 0} Expense
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      GST Paid
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {formatCurrency(gstPaidReportData.totalGstPaid || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchase:{' '}
                      {formatCurrency(gstPaidReportData.purchaseGstPaid || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      PST Paid
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {formatCurrency(gstPaidReportData.totalPstPaid || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchase:{' '}
                      {formatCurrency(gstPaidReportData.purchasePstPaid || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      gutterBottom
                      variant="body2"
                    >
                      Total Tax Paid
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {formatCurrency(gstPaidReportData.totalTaxPaid || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      HST: {formatCurrency(gstPaidReportData.totalHstPaid || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Monthly Breakdown */}
            {gstPaidReportData.monthlyBreakdown?.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Tax Paid Breakdown
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Purchase</TableCell>
                        <TableCell align="right">Expense</TableCell>
                        <TableCell align="right">GST Paid</TableCell>
                        <TableCell align="right">PST Paid</TableCell>
                        <TableCell align="right">Total Tax</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gstPaidReportData.monthlyBreakdown.map((month: any) => (
                        <TableRow key={month.month}>
                          <TableCell>{month.month}</TableCell>
                          <TableCell align="right">
                            {month.purchaseCount}
                          </TableCell>
                          <TableCell align="right">
                            {month.expenseCount}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(month.totalGstPaid)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(month.totalPstPaid)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(month.totalTaxPaid)}
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
        {!loading &&
          !reportData &&
          !taxReportData &&
          !gstPaidReportData &&
          !salesReportData &&
          !error && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary',
              }}
            >
              {reportType === 'sales' ? (
                <>
                  <ListAlt sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="500">
                    No Invoice Sales Report Generated
                  </Typography>
                  <Typography variant="body2">
                    Select a date range and status, then click "Generate Report"
                    to list invoices with sub total, GST, PST and net total
                  </Typography>
                </>
              ) : reportType === 'purchase' ? (
                <>
                  <Receipt sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="500">
                    No Purchase Invoice Report Generated
                  </Typography>
                  <Typography variant="body2">
                    Select a date range and click "Generate Report" to view
                    purchase invoice analysis
                  </Typography>
                </>
              ) : reportType === 'expense' ? (
                <>
                  <Receipt sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="500">
                    No Expense Invoice Report Generated
                  </Typography>
                  <Typography variant="body2">
                    Select a date range and click "Generate Report" to view
                    expense invoice analysis
                  </Typography>
                </>
              ) : reportType === 'tax-collection' ? (
                <>
                  <AttachMoney sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="500">
                    No Tax Collection Report Generated
                  </Typography>
                  <Typography variant="body2">
                    Select a date range and click "Generate Report" to view
                    GST/PST tax collection from paid invoices
                  </Typography>
                </>
              ) : (
                <>
                  <AttachMoney sx={{ fontSize: 80, mb: 2, opacity: 0.2 }} />
                  <Typography variant="h6" gutterBottom fontWeight="500">
                    No GST Paid Report Generated
                  </Typography>
                  <Typography variant="body2">
                    Select a date range and click "Generate Report" to view
                    GST/PST paid on purchase and expense invoices
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
