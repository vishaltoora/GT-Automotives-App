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
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Assessment as ReportIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { invoiceService, Invoice } from '../../services/invoice.service';
import { companyService, Company } from '../../services/company.service';
import { useAuth } from '../../hooks/useAuth';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import { ActionsMenu, ActionItem } from '../../components/common';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useErrorHelpers } from '../../contexts/ErrorContext';


const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { confirm } = useConfirmation();
  const { showApiError } = useErrorHelpers();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    customerName: '',
    invoiceNumber: '',
    status: '',
    companyId: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (error) {
      showApiError(error, 'Failed to load companies');
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices();
      setInvoices(data);
    } catch (error) {
      showApiError(error, 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const hasFilters = searchParams.status || searchParams.customerName || searchParams.invoiceNumber || searchParams.companyId;

      const filtered = hasFilters
        ? await invoiceService.searchInvoices({
            customerName: searchParams.customerName || undefined,
            invoiceNumber: searchParams.invoiceNumber || undefined,
            status: searchParams.status as any || undefined,
            companyId: searchParams.companyId || undefined,
          })
        : await invoiceService.getInvoices();

      setInvoices(filtered);
    } catch (error) {
      showApiError(error, 'Failed to search invoices');
    }
  };

  const handlePrint = (invoice: Invoice) => {
    invoiceService.printInvoice(invoice);
  };


  const handleDelete = async (invoice: Invoice) => {
    const confirmed = await confirm({
      title: 'Delete Invoice',
      message: `Are you sure you want to permanently delete invoice ${invoice.invoiceNumber}? This action cannot be undone and will restore tire inventory.`,
      confirmText: 'Delete Invoice',
      cancelText: 'Keep Invoice',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      try {
        await invoiceService.deleteInvoice(invoice.id);
        loadInvoices();
      } catch (error) {
        showApiError(error, 'Failed to delete invoice');
      }
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setDialogOpen(true);
  };


  const handleInvoiceSuccess = (invoice: any) => {
    // Refresh the invoice list to show the new/updated invoice
    loadInvoices();
    // Reset editing state
    setEditingInvoice(null);
    // Optionally navigate to the invoice details (only for new invoices)
    if (!editingInvoice) {
      const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
      navigate(`${basePath}/invoices/${invoice.id}`);
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

  const getCompanyColor = (companyName: string) => {
    switch (companyName) {
      case 'GT Automotives':
        return 'primary';
      case 'GT Car Detailing':
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

  const canCreateInvoice = role === 'staff' || role === 'admin';
  const canManageInvoice = role === 'staff' || role === 'admin';
  const canViewReports = role === 'staff' || role === 'admin';
  const canDeleteInvoice = role === 'admin';

  const getInvoiceActions = (invoice: Invoice): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'View Details',
        icon: <ViewIcon />,
        onClick: () => {
          const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
          navigate(`${basePath}/invoices/${invoice.id}`);
        },
        show: true,
      },
      {
        id: 'print',
        label: 'Print Invoice',
        icon: <PrintIcon />,
        onClick: () => handlePrint(invoice),
        show: true,
      },
      {
        id: 'edit',
        label: 'Edit Invoice',
        icon: <EditIcon />,
        onClick: () => handleEdit(invoice),
        show: canManageInvoice,
        color: 'primary',
      },
      {
        id: 'delete',
        label: 'Delete Invoice',
        icon: <DeleteIcon />,
        onClick: () => handleDelete(invoice),
        show: canDeleteInvoice && invoice.status !== 'PAID',
        color: 'error',
        dividerAfter: true,
      },
    ];

    return actions;
  };

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
              onClick={() => {
                const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
                navigate(`${basePath}/invoices/cash-report`);
              }}
            >
              Cash Report
            </Button>
          )}
          {canCreateInvoice && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
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
          <Grid size={{ xs: 12, sm: 2 }}>
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
          <Grid size={{ xs: 12, sm: 2 }}>
            <TextField
              fullWidth
              select
              label="Company"
              value={searchParams.companyId}
              onChange={(e) => setSearchParams({ ...searchParams, companyId: e.target.value })}
            >
              <MenuItem value="">All Companies</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
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
              <TableCell>Company</TableCell>
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
                  {(() => {
                    const customer = invoice.customer;
                    if (customer?.firstName || customer?.lastName) {
                      const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                      if (customer.businessName) {
                        return `${fullName} (${customer.businessName})`;
                      }
                      return fullName || 'Customer';
                    }
                    return 'Customer';
                  })()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={invoice.company?.name || 'Unknown'}
                    size="small"
                    color={getCompanyColor(invoice.company?.name || 'Unknown')}
                    variant="filled"
                  />
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
                  <ActionsMenu 
                    actions={getInvoiceActions(invoice)}
                    tooltip={`Actions for Invoice ${invoice.invoiceNumber}`}
                    id={`invoice-${invoice.id}`}
                  />
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

      {/* Invoice Dialog - Used for both create and edit */}
      <InvoiceDialog
        open={dialogOpen}
        invoice={editingInvoice}
        onClose={() => {
          setDialogOpen(false);
          setEditingInvoice(null);
        }}
        onSuccess={handleInvoiceSuccess}
      />
    </Box>
  );
};

export default InvoiceList;