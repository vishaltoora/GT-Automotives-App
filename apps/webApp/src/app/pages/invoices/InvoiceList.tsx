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
  CircularProgress,
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
import {
  getInvoiceBalanceDue,
  isInvoicePartiallyPaid,
} from '@gt-automotive/data';
import { colors } from '../../theme/colors';
import { usePersistedState } from '../../hooks/usePersistedState';

type InvoiceSearchParams = {
  /** Combined search for invoice number and customer name. */
  search: string;
  status: string;
  companyId: string;
  startDate: string;
  endDate: string;
};

const SEARCH_STORAGE_KEY = 'invoiceListSearchParams';
const PAGE_STORAGE_KEY = 'invoiceListPage';

const DEFAULT_SEARCH_PARAMS: InvoiceSearchParams = {
  search: '',
  status: '',
  companyId: '',
  startDate: '',
  endDate: '',
};

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
  // The row currently being mutated, so the user gets feedback on that row
  // instead of the whole list going blank.
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(
    null
  );
  // Debounced search params that trigger API calls. Persisted so they survive
  // navigating to an invoice and back.
  const [searchParams, setSearchParams] =
    usePersistedState<InvoiceSearchParams>(
      SEARCH_STORAGE_KEY,
      DEFAULT_SEARCH_PARAMS
    );
  // Immediate input value for responsive typing (combined search)
  const [searchInput, setSearchInput] = useState(() => searchParams.search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<Invoice | null>(
    null
  );
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [invoiceForEmail, setInvoiceForEmail] = useState<Invoice | null>(null);

  // Pagination state. Persisted alongside the filters: returning from an
  // invoice should land on the page it was opened from, not back at page 1.
  const [page, setPage] = usePersistedState(PAGE_STORAGE_KEY, 1);
  const [rowsPerPage] = useState(isMobile ? 10 : 20);

  // Calculate paginated data
  const paginatedInvoices = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return invoices.slice(startIndex, endIndex);
  }, [invoices, page, rowsPerPage]);

  const totalPages = Math.ceil(invoices.length / rowsPerPage);

  useEffect(() => {
    // Invoices are loaded by the searchParams effect below (handleSearch),
    // which also applies any restored search/filters on mount.
    loadCompanies();
  }, []);

  // Debounce text input searches (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParams.search) {
        updateFilters({ search: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Trigger search when searchParams change
  useEffect(() => {
    handleSearch();
  }, [searchParams]);

  // A restored page can outrun the result set — invoices may have been paid or
  // deleted elsewhere since, or a narrower filter was restored with it.
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (error) {
      showApiError(error, 'Failed to load companies');
    }
  };

  const handleSearch = async () => {
    try {
      const hasFilters =
        searchParams.status ||
        searchParams.search ||
        searchParams.companyId ||
        searchParams.startDate ||
        searchParams.endDate;

      const filtered = hasFilters
        ? await invoiceService.searchInvoices({
            // Pass combined search to both customerName and invoiceNumber
            customerName: searchParams.search || undefined,
            invoiceNumber: searchParams.search || undefined,
            status: (searchParams.status as any) || undefined,
            companyId: searchParams.companyId || undefined,
            startDate: searchParams.startDate || undefined,
            endDate: searchParams.endDate || undefined,
          })
        : await invoiceService.getInvoices();

      setInvoices(filtered);
    } catch (error) {
      showApiError(error, 'Failed to search invoices');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change a filter and return to the first page.
   *
   * The page reset belongs here rather than in `handleSearch`: the search runs
   * again on mount with the restored filters, and resetting there would throw
   * away the page the user came back to.
   */
  const updateFilters = (patch: Partial<InvoiceSearchParams>) => {
    setSearchParams((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  /**
   * Fold an updated invoice back into the list.
   *
   * Mutating one invoice must not refetch the list: a reload discards the page
   * the user is on and costs a round trip to redisplay rows that have not
   * changed. Merging over the existing row rather than replacing it keeps any
   * list-only field the single-invoice response happens not to carry.
   *
   * A row that no longer matches the active filter — marked paid while
   * filtering on Pending — deliberately stays put with its new status. Making
   * it vanish mid-interaction reads as the action having failed.
   */
  const patchInvoiceRow = (updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updated.id ? { ...inv, ...updated } : inv))
    );
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
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
        setUpdatingInvoiceId(invoice.id);
        await invoiceService.deleteInvoice(invoice.id);
        // Drop the row locally. The rest of the list is unaffected, so there is
        // nothing for a refetch to correct.
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
      } catch (error) {
        showApiError(error, 'Failed to delete invoice');
      } finally {
        setUpdatingInvoiceId(null);
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

  const handlePaymentConfirm = async (
    entries: { paymentMethod: PaymentMethod; amount?: number }[]
  ) => {
    if (!invoiceToMarkPaid) return;

    try {
      setUpdatingInvoiceId(invoiceToMarkPaid.id);
      const updated = await invoiceService.recordInvoicePayments(
        invoiceToMarkPaid.id,
        entries
      );
      // Patch first, so the row the user acted on settles immediately.
      patchInvoiceRow(updated);
      setInvoiceToMarkPaid(null);
      // Then re-read the list. Paying a combined invoice also settles the
      // child invoices rolled into it (settleConsolidatedChildren), and those
      // are rows of their own — patching only the parent would leave them
      // reading PENDING against money already collected. Re-running the search
      // rather than reloading keeps the filters and the current page.
      await handleSearch();
    } catch (error) {
      showApiError(error, 'Failed to record payment');
    } finally {
      setUpdatingInvoiceId(null);
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    // Always open the dialog so the user can pick which email(s) to send to
    setInvoiceForEmail(invoice);
    setEmailDialogOpen(true);
  };

  const handleEmailPromptSubmit = async (
    emails: string[],
    saveToCustomer: boolean
  ) => {
    if (!invoiceForEmail) return;
    const invoice = invoiceForEmail;

    try {
      const result = await invoiceService.sendInvoiceEmail(
        invoice.id,
        emails,
        saveToCustomer
      );

      // Close the email dialog first so its loading spinner doesn't linger
      // behind the success confirmation dialog.
      setEmailDialogOpen(false);
      setInvoiceForEmail(null);

      // A saved address belongs to the customer, not to the invoice it was
      // typed on, so every row for that customer is now stale — including the
      // addresses the email dialog would offer next time. Re-run the search;
      // it keeps the filters and the current page.
      if (saveToCustomer) {
        await handleSearch();
      }

      await confirm({
        title: 'Invoice Sent Successfully!',
        message: `Invoice ${invoice.invoiceNumber} has been emailed to ${
          result.emailUsed || emails.join(', ')
        }${
          saveToCustomer
            ? '\n\nNew emails have been saved to the customer profile.'
            : ''
        }`,
        confirmText: 'OK',
        showCancelButton: false,
      });
    } catch (error) {
      showApiError(error, 'Failed to send invoice email');
      throw error; // Re-throw to keep dialog open on failure
    }
  };

  const handleInvoiceSuccess = (invoice: any) => {
    // An edit changes one row; fold it in and leave the filters and page as
    // they are. A new invoice needs no refresh here: the block below navigates
    // straight to it, and the list re-runs its search when it is next mounted.
    if (editingInvoice) {
      patchInvoiceRow(invoice);
    }
    // Reset editing state
    setEditingInvoice(null);
    // Optionally navigate to the invoice details (only for new invoices)
    if (!editingInvoice) {
      const basePath =
        role === 'admin'
          ? '/admin'
          : role === 'supervisor'
          ? '/supervisor'
          : role === 'staff'
          ? '/staff'
          : role === 'accountant'
          ? '/accountant'
          : role === 'foreman'
          ? '/foreman'
          : '/customer';
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

  // Retained for when the Company column is re-enabled
  // const getCompanyColor = (companyName: string) => {
  //   switch (companyName) {
  //     case 'GT Automotives':
  //       return 'primary';
  //     case 'GT Car Detailing':
  //       return 'secondary';
  //     default:
  //       return 'default';
  //   }
  // };

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

  const getVehicleInfo = (invoice: Invoice) => {
    const vehicle = invoice.vehicle;
    if (!vehicle) return '';
    return [vehicle.year, vehicle.make, vehicle.model]
      .filter(Boolean)
      .join(' ');
  };

  const canCreateInvoice =
    role === 'staff' ||
    role === 'supervisor' ||
    role === 'admin' ||
    role === 'foreman';
  const canManageInvoice =
    role === 'staff' ||
    role === 'supervisor' ||
    role === 'admin' ||
    role === 'foreman';
  const canDeleteInvoice = role === 'admin';

  const getInvoiceActions = (invoice: Invoice): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        id: 'view',
        label: 'View Details',
        icon: <ViewIcon />,
        onClick: () => {
          const basePath =
            role === 'admin'
              ? '/admin'
              : role === 'supervisor'
              ? '/supervisor'
              : role === 'staff'
              ? '/staff'
              : role === 'accountant'
              ? '/accountant'
              : role === 'foreman'
              ? '/foreman'
              : '/customer';
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: { xs: 2, sm: 3 },
          flexDirection: isMobile ? 'column' : 'row',
          gap: { xs: 2, sm: 0 },
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
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
          <FilterListIcon
            sx={{
              color: theme.palette.primary.main,
              fontSize: isMobile ? 20 : 24,
            }}
          />
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            sx={{ fontWeight: 600 }}
          >
            Filters{' '}
            {isMobile &&
              `(${
                [
                  searchParams.status,
                  searchParams.search,
                  searchParams.companyId,
                  searchParams.startDate,
                  searchParams.endDate,
                ].filter(Boolean).length
              })`}
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
                placeholder="Invoice #, Customer, Phone, Vehicle or VIN..."
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
                onChange={(e) => updateFilters({ status: e.target.value })}
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
                onChange={(e) => updateFilters({ companyId: e.target.value })}
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
                onChange={(e) => updateFilters({ startDate: e.target.value })}
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
                onChange={(e) => updateFilters({ endDate: e.target.value })}
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
                  opacity: updatingInvoiceId === invoice.id ? 0.5 : 1,
                  transition: 'opacity 150ms',
                  border: `1px solid ${theme.palette.divider}`,
                  borderLeft: `4px solid ${
                    invoice.status === 'PAID'
                      ? theme.palette.success.main
                      : invoice.status === 'PENDING'
                      ? theme.palette.warning.main
                      : invoice.status === 'CANCELLED'
                      ? theme.palette.error.main
                      : theme.palette.grey[400]
                  }`,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 0.75,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Link
                      onClick={() => {
                        const basePath =
                          role === 'admin'
                            ? '/admin'
                            : role === 'supervisor'
                            ? '/supervisor'
                            : role === 'staff'
                            ? '/staff'
                            : role === 'accountant'
                            ? '/accountant'
                            : role === 'foreman'
                            ? '/foreman'
                            : '/customer';
                        navigate(`${basePath}/invoices/${invoice.id}`);
                      }}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, mb: 0.25, fontSize: '0.875rem' }}
                      >
                        {invoice.invoiceNumber}
                      </Typography>
                    </Link>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {formatDate(invoice.invoiceDate || invoice.createdAt)}
                    </Typography>
                  </Box>
                  {updatingInvoiceId === invoice.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <ActionsMenu
                      actions={getInvoiceActions(invoice)}
                      tooltip={`Actions for Invoice ${invoice.invoiceNumber}`}
                      id={`invoice-${invoice.id}`}
                    />
                  )}
                </Box>

                <Typography
                  variant="body2"
                  sx={{ mb: 0.75, fontSize: '0.8rem' }}
                >
                  {(() => {
                    const customer = invoice.customer;
                    if (customer?.firstName || customer?.lastName) {
                      const fullName = `${customer.firstName || ''} ${
                        customer.lastName || ''
                      }`.trim();
                      if (customer.businessName) {
                        return `${fullName} (${customer.businessName})`;
                      }
                      return fullName || 'Customer';
                    }
                    return 'Customer';
                  })()}
                </Typography>

                {(() => {
                  const vehicleInfo = getVehicleInfo(invoice);
                  const plate = invoice.vehicle?.licensePlate;
                  const vin = invoice.vehicle?.vin;
                  if (!vehicleInfo && !plate && !vin) return null;
                  return (
                    <Box sx={{ mb: 0.75 }}>
                      {(vehicleInfo || plate) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', fontSize: '0.7rem' }}
                        >
                          {[vehicleInfo, plate].filter(Boolean).join(' · ')}
                        </Typography>
                      )}
                      {vin && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', fontSize: '0.7rem' }}
                        >
                          VIN: {vin}
                        </Typography>
                      )}
                    </Box>
                  );
                })()}

                <Box
                  sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}
                >
                  <Chip
                    label={invoice.status}
                    color={getStatusColor(invoice.status)}
                    size="small"
                    sx={{ fontSize: '0.65rem', height: '20px' }}
                  />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Stack spacing={0.5}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.success.main,
                        fontSize: '0.875rem',
                      }}
                    >
                      {formatCurrency(invoice.total)}
                    </Typography>
                  </Box>
                  {isInvoicePartiallyPaid(invoice) && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        Balance ({formatCurrency(invoice.amountPaid ?? 0)} paid)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: colors.semantic.error,
                          fontSize: '0.875rem',
                        }}
                      >
                        {formatCurrency(getInvoiceBalanceDue(invoice))}
                      </Typography>
                    </Box>
                  )}
                  {invoice.paymentMethod && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
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
                <TableCell>Vehicle</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  sx={{
                    // Feedback stays on the row being changed — the rest of
                    // the list is still valid and still readable.
                    opacity: updatingInvoiceId === invoice.id ? 0.5 : 1,
                    transition: 'opacity 150ms',
                  }}
                >
                  <TableCell>
                    <Link
                      onClick={() => {
                        const basePath =
                          role === 'admin'
                            ? '/admin'
                            : role === 'supervisor'
                            ? '/supervisor'
                            : role === 'staff'
                            ? '/staff'
                            : role === 'accountant'
                            ? '/accountant'
                            : role === 'foreman'
                            ? '/foreman'
                            : '/customer';
                        navigate(`${basePath}/invoices/${invoice.id}`);
                      }}
                      sx={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatDate(invoice.invoiceDate || invoice.createdAt)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const customer = invoice.customer;
                      if (customer?.firstName || customer?.lastName) {
                        const fullName = `${customer.firstName || ''} ${
                          customer.lastName || ''
                        }`.trim();
                        if (customer.businessName) {
                          return `${fullName} (${customer.businessName})`;
                        }
                        return fullName || 'Customer';
                      }
                      return 'Customer';
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const vehicleInfo = getVehicleInfo(invoice);
                      const plate = invoice.vehicle?.licensePlate;
                      const vin = invoice.vehicle?.vin;
                      if (!vehicleInfo && !plate && !vin) return '-';
                      return (
                        <Box>
                          {vehicleInfo && (
                            <Typography variant="body2">
                              {vehicleInfo}
                            </Typography>
                          )}
                          {vin && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              VIN: {vin}
                            </Typography>
                          )}
                          {plate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {plate}
                            </Typography>
                          )}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    {/* A part-paid invoice is otherwise indistinguishable from
                        an unpaid one at a glance. */}
                    {isInvoicePartiallyPaid(invoice) ? (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: colors.semantic.error }}
                        >
                          {formatCurrency(getInvoiceBalanceDue(invoice))}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          {formatCurrency(invoice.amountPaid ?? 0)} paid
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(getInvoiceBalanceDue(invoice))}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.status}
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {invoice.paymentMethod
                      ? invoice.paymentMethod.replace(/_/g, ' ')
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {updatingInvoiceId === invoice.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <ActionsMenu
                        actions={getInvoiceActions(invoice)}
                        tooltip={`Actions for Invoice ${invoice.invoiceNumber}`}
                        id={`invoice-${invoice.id}`}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 2, sm: 3 },
            mb: 2,
          }}
        >
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
        invoiceId={invoiceToMarkPaid?.id}
        defaultPaymentMethod={invoiceToMarkPaid?.paymentMethod}
        total={invoiceToMarkPaid ? Number(invoiceToMarkPaid.total) : undefined}
        amountPaid={
          invoiceToMarkPaid
            ? Number((invoiceToMarkPaid as any).amountPaid ?? 0)
            : 0
        }
        hasTax={
          invoiceToMarkPaid ? Number(invoiceToMarkPaid.taxAmount) > 0 : false
        }
        subtotal={
          invoiceToMarkPaid ? Number(invoiceToMarkPaid.subtotal) : undefined
        }
        gstRate={invoiceToMarkPaid ? Number(invoiceToMarkPaid.gstRate ?? 0) : 0}
        pstRate={invoiceToMarkPaid ? Number(invoiceToMarkPaid.pstRate ?? 0) : 0}
      />

      {/* Email Prompt Dialog - Select one or more recipient emails */}
      <EmailPromptDialog
        open={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
          setInvoiceForEmail(null);
        }}
        multiple
        onSubmit={async () => undefined}
        onSubmitMultiple={handleEmailPromptSubmit}
        availableEmails={(() => {
          const customer = invoiceForEmail?.customer;
          return [
            ...(customer?.email ? [customer.email] : []),
            ...(customer?.additionalEmails ?? []),
          ];
        })()}
        customerName={(() => {
          const customer = invoiceForEmail?.customer;
          if (customer?.firstName || customer?.lastName) {
            return `${customer.firstName || ''} ${
              customer.lastName || ''
            }`.trim();
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
