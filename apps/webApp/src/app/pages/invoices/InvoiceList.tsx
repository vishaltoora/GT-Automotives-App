import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  IconButton,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { invoiceService, Invoice } from '../../services/invoice.service';
import { useAuth } from '../../hooks/useAuth';

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    customerName: '',
    invoiceNumber: '',
    status: '',
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const filtered = searchParams.status || searchParams.customerName || searchParams.invoiceNumber
        ? await invoiceService.searchInvoices({
            customerName: searchParams.customerName || undefined,
            invoiceNumber: searchParams.invoiceNumber || undefined,
            status: searchParams.status as any || undefined,
          })
        : await invoiceService.getInvoices();
      setInvoices(filtered);
    } catch (error) {
      console.error('Error searching invoices:', error);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    invoiceService.printInvoice(invoice);
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      const paymentMethod = prompt('Enter payment method (CASH, CREDIT_CARD, DEBIT_CARD, CHECK, E_TRANSFER, FINANCING):');
      if (paymentMethod) {
        await invoiceService.markInvoiceAsPaid(invoice.id, paymentMethod as any);
        loadInvoices();
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleCancel = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`)) {
      try {
        await invoiceService.cancelInvoice(invoice.id);
        loadInvoices();
      } catch (error) {
        console.error('Error cancelling invoice:', error);
      }
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'DRAFT':
        return 'default';
      case 'REFUNDED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const canCreateInvoice = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const canManageInvoice = user?.role === 'STAFF' || user?.role === 'ADMIN';
  const canViewReports = user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Invoices
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {canViewReports && (
            <Button
              variant="outlined"
              startIcon={<ReportIcon />}
              onClick={() => navigate('/invoices/cash-report')}
            >
              Cash Report
            </Button>
          )}
          {canCreateInvoice && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/invoices/new')}
            >
              New Invoice
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              label="Invoice Number"
              value={searchParams.invoiceNumber}
              onChange={(e) => setSearchParams({ ...searchParams, invoiceNumber: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              label="Customer Name"
              value={searchParams.customerName}
              onChange={(e) => setSearchParams({ ...searchParams, customerName: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              select
              label="Status"
              value={searchParams.status}
              onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PAID">Paid</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="REFUNDED">Refunded</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                <TableCell>
                  {invoice.customer?.user?.firstName} {invoice.customer?.user?.lastName}
                </TableCell>
                <TableCell>
                  {invoice.vehicle
                    ? `${invoice.vehicle.year} ${invoice.vehicle.make} ${invoice.vehicle.model}`
                    : '-'}
                </TableCell>
                <TableCell>{formatCurrency(invoice.total)}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {invoice.paymentMethod ? invoice.paymentMethod.replace(/_/g, ' ') : '-'}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print">
                      <IconButton
                        size="small"
                        onClick={() => handlePrint(invoice)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    {canManageInvoice && invoice.status === 'PENDING' && (
                      <Tooltip title="Mark as Paid">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleMarkAsPaid(invoice)}
                        >
                          <PaymentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canManageInvoice && invoice.status === 'PENDING' && (
                      <Tooltip title="Cancel">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancel(invoice)}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {loading ? 'Loading...' : 'No invoices found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InvoiceList;