import React, { useState, useEffect, useMemo } from 'react';
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
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Pagination,
  IconButton,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { invoiceService, Invoice } from '../../requests/invoice.requests';
import { companyService, Company } from '../../requests/company.requests';
import { useAuth } from '../../hooks/useAuth';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import PaymentMethodDialog from '../../components/invoices/PaymentMethodDialog';
import EmailPromptDialog from '../../components/common/EmailPromptDialog';
import { ActionsMenu, ActionItem } from '../../components/common';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { PaymentMethod } from '../../../enums';


const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { role } = useAuth();
  const { confirm } = useConfirmation();
  const { showApiError } = useErrorHelpers();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  // Immediate input value for responsive typing (combined search)
  const [searchInput, setSearchInput] = useState('');
  // Debounced search params that trigger API calls
  const [searchParams, setSearchParams] = useState({
    search: '', // Combined search for invoice number and customer name
    status: '',
    companyId: '',
    startDate: '',
    endDate: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<Invoice | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [invoiceForEmail, setInvoiceForEmail] = useState<Invoice | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(isMobile ? 10 : 20);

  // Calculate paginated data
  const paginatedInvoices = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return invoices.slice(startIndex, endIndex);
  }, [invoices, page, rowsPerPage]);

  const totalPages = Math.ceil(invoices.length / rowsPerPage);

  useEffect(() => {
    loadInvoices();
    loadCompanies();
  }, []);

  // Debounce text input searches (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParams.search) {
        setSearchParams((prev) => ({
          ...prev,
          search: searchInput,
        }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Trigger search when searchParams change
  useEffect(() => {
    handleSearch();
  }, [searchParams]);

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
      const hasFilters = searchParams.status || searchParams.search || searchParams.companyId || searchParams.startDate || searchParams.endDate;

      const filtered = hasFilters
        ? await invoiceService.searchInvoices({
            // Pass combined search to both customerName and invoiceNumber
            customerName: searchParams.search || undefined,
            invoiceNumber: searchParams.search || undefined,
            status: searchParams.status as any || undefined,
            companyId: searchParams.companyId || undefined,
            startDate: searchParams.startDate || undefined,
            endDate: searchParams.endDate || undefined,
          })
        : await invoiceService.getInvoices();

      setInvoices(filtered);
      setPage(1); // Reset to first page after search
    } catch (error) {
      showApiError(error, 'Failed to search invoices');
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleMarkAsPaid = (invoice: Invoice) => {
    setInvoiceToMarkPaid(invoice);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = async (paymentMethod: PaymentMethod) => {
    if (!invoiceToMarkPaid) return;

    try {
      await invoiceService.markInvoiceAsPaid(invoiceToMarkPaid.id, paymentMethod);
      loadInvoices(); // Refresh the list
      setInvoiceToMarkPaid(null);
    } catch (error) {
      showApiError(error, 'Failed to mark invoice as paid');
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    // If customer has no email, open the email prompt dialog
    if (!invoice.customer?.email) {
      setInvoiceForEmail(invoice);
      setEmailDialogOpen(true);
      return;
    }

    // Customer has email, confirm and send directly
    const confirmed = await confirm({
      title: 'Send Invoice Email',
      message: `Send invoice ${invoice.invoiceNumber} to ${invoice.customer.email}?\n\nThis will generate a PDF and send it via email to the customer.`,
      confirmText: 'Send Email',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      try {
        await invoiceService.sendInvoiceEmail(invoice.id);
        await confirm({
          title: 'Invoice Sent Successfully!',
          message: `Invoice ${invoice.invoiceNumber} has been emailed to ${invoice.customer.email}`,
          confirmText: 'OK',
          showCancelButton: false,
        });
      } catch (error) {
        showApiError(error, 'Failed to send invoice email');
      }
    }
  };

  const handleEmailPromptSubmit = async (email: string, saveToCustomer: boolean) => {
    if (!invoiceForEmail) return;

    try {
      const result = await invoiceService.sendInvoiceEmail(invoiceForEmail.id, email, saveToCustomer);
      await confirm({
        title: 'Invoice Sent Successfully!',
        message: `Invoice ${invoiceForEmail.invoiceNumber} has been emailed to ${result.emailUsed || email}${saveToCustomer ? '\n\nEmail has been saved to customer profile.' : ''}`,
        confirmText: 'OK',
        showCancelButton: false,
      });
      // Refresh invoices to show updated customer email if saved
      if (saveToCustomer) {
        loadInvoices();
      }
    } catch (error) {
      showApiError(error, 'Failed to send invoice email');
      throw error; // Re-throw to keep dialog open
    }
  };

  const handleInvoiceSuccess = (invoice: any) => {
    // Refresh the invoice list to show the new/updated invoice
    loadInvoices();
    // Reset editing state
    setEditingInvoice(null);
    // Optionally navigate to the invoice details (only for new invoices)
    if (!editingInvoice) {
      const basePath = role === 'admin' ? '/admin' : role === 'supervisor' ? '/supervisor' : role === 'staff' ? '/staff' : role === 'accountant' ? '/accountant' : '/customer';
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
    // Parse as UTC and format to avoid timezone shift
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { timeZone: 'UTC' });
  };

  const canCreateInvoice = role === 'staff' || role === 'supervisor' || role === 'admin';
  const canManageInvoice = role === 'staff' || role === 'supervisor' || role === 'admin';
  const canDeleteInvoice = role === 'admin';

  const getInvoiceActions = (invoice: Invoice): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'View Details',
        icon: <ViewIcon />,
        onClick: () => {
          const basePath = role === 'admin' ? '/admin' : role === 'supervisor' ? '/supervisor' : role === 'staff' ? '/staff' : role === 'accountant' ? '/accountant' : '/customer';
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
        id: 'markPaid',
        label: 'Mark as Paid',
        icon: <PaymentIcon />,
        onClick: () => handleMarkAsPaid(invoice),
        show: canManageInvoice && invoice.status === 'PENDING',
        color: 'success',
      },
      {
        id: 'sendEmail',
        label: 'Send Email',
        icon: <EmailIcon />,
        onClick: () => handleSendEmail(invoice),
        show: canManageInvoice,
        color: 'info',
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
    <Box sx={{ p: { xs: 1, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: { xs: 2, sm: 3 },
        flexDirection: isMobile ? 'column' : 'row',
        gap: { xs: 2, sm: 0 },
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1">
          Invoices
        </Typography>
        {canCreateInvoice && (
          <Button
            variant="contained"
            startIcon={!isMobile && <AddIcon />}
            onClick={() => setDialogOpen(true)}
            fullWidth={isMobile}
            size={isMobile ? 'medium' : 'medium'}
          >
            New Invoice
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: isMobile && !filtersExpanded ? 0 : 2,
            cursor: isMobile ? 'pointer' : 'default',
          }}
          onClick={() => isMobile && setFiltersExpanded(!filtersExpanded)}
        >
          <FilterListIcon sx={{ color: theme.palette.primary.main, fontSize: isMobile ? 20 : 24 }} />
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
            Filters {isMobile && `(${[searchParams.status, searchParams.search, searchParams.companyId, searchParams.startDate, searchParams.endDate].filter(Boolean).length})`}
          </Typography>
          {isMobile && (
            <IconButton size="small" sx={{ ml: 'auto' }}>
              {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {(!isMobile || filtersExpanded) && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Invoice # or Customer Name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={searchParams.status}
                onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                size={isMobile ? 'small' : 'medium'}
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
                size={isMobile ? 'small' : 'medium'}
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
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                size={isMobile ? 'small' : 'medium'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                size={isMobile ? 'small' : 'medium'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {isMobile ? (
        /* Mobile Card Layout */
        <Stack spacing={1.5}>
          {paginatedInvoices.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {loading ? 'Loading...' : 'No invoices found'}
              </Typography>
            </Paper>
          ) : (
            paginatedInvoices.map((invoice) => (
              <Paper
                key={invoice.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `4px solid ${
                    invoice.status === 'PAID' ? theme.palette.success.main :
                    invoice.status === 'PENDING' ? theme.palette.warning.main :
                    invoice.status === 'CANCELLED' ? theme.palette.error.main :
                    theme.palette.grey[400]
                  }`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
                  <Box sx={{ flex: 1 }}>
                    <Link
                      onClick={() => {
                        const basePath = role === 'admin' ? '/admin' : role === 'supervisor' ? '/supervisor' : role === 'staff' ? '/staff' : role === 'accountant' ? '/accountant' : '/customer';
                        navigate(`${basePath}/invoices/${invoice.id}`);
                      }}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25, fontSize: '0.875rem' }}>
                        {invoice.invoiceNumber}
                      </Typography>
                    </Link>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {formatDate(invoice.invoiceDate || invoice.createdAt)}
                    </Typography>
                  </Box>
                  <ActionsMenu
                    actions={getInvoiceActions(invoice)}
                    tooltip={`Actions for Invoice ${invoice.invoiceNumber}`}
                    id={`invoice-${invoice.id}`}
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 0.75, fontSize: '0.8rem' }}>
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
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                    sx={{ fontSize: '0.65rem', height: '20px' }}
                  />
                  <Chip
                    label={invoice.company?.name || 'Unknown'}
                    size="small"
                    color={getCompanyColor(invoice.company?.name || 'Unknown')}
                    variant="filled"
                    sx={{ fontSize: '0.65rem', height: '20px' }}
                  />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Stack spacing={0.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      Total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main, fontSize: '0.875rem' }}>
                      {formatCurrency(invoice.total)}
                    </Typography>
                  </Box>
                  {invoice.paymentMethod && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Payment
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        {invoice.paymentMethod.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      ) : (
        /* Desktop Table Layout */
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
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link
                      onClick={() => {
                        const basePath = role === 'admin' ? '/admin' : role === 'supervisor' ? '/supervisor' : role === 'staff' ? '/staff' : role === 'accountant' ? '/accountant' : '/customer';
                        navigate(`${basePath}/invoices/${invoice.id}`);
                      }}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate || invoice.createdAt)}</TableCell>
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
              {paginatedInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {loading ? 'Loading...' : 'No invoices found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 }, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'medium' : 'large'}
            showFirstButton
            showLastButton
          />
        </Box>
      )}

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

      {/* Payment Method Dialog - For marking invoice as paid */}
      <PaymentMethodDialog
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setInvoiceToMarkPaid(null);
        }}
        onConfirm={handlePaymentConfirm}
        invoiceNumber={invoiceToMarkPaid?.invoiceNumber || ''}
      />

      {/* Email Prompt Dialog - For sending email when customer has no email */}
      <EmailPromptDialog
        open={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
          setInvoiceForEmail(null);
        }}
        onSubmit={handleEmailPromptSubmit}
        customerName={(() => {
          const customer = invoiceForEmail?.customer;
          if (customer?.firstName || customer?.lastName) {
            return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
          }
          return 'Customer';
        })()}
        customerId={invoiceForEmail?.customerId}
        documentType="invoice"
        documentNumber={invoiceForEmail?.invoiceNumber || ''}
      />
    </Box>
  );
};

export default InvoiceList;