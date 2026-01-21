import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Menu,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Collapse,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  // Category icons
  TireRepair as TiresIcon,
  AllInclusive as RimsIcon,
  Build as PartsIcon,
  Construction as ToolsIcon,
  Inventory as SuppliesIcon,
  Home as RentIcon,
  ElectricBolt as UtilitiesIcon,
  Security as InsuranceIcon,
  Campaign as AdvertisingIcon,
  Print as OfficeSuppliesIcon,
  Gavel as ProfessionalFeesIcon,
  Handyman as MaintenanceIcon,
  DirectionsCar as VehicleIcon,
  Flight as TravelIcon,
  School as TrainingIcon,
  Groups as TeamMeetingIcon,
  Code as SoftwareIcon,
  MoreHoriz as OtherIcon,
} from '@mui/icons-material';
import purchaseExpenseInvoiceService, {
  PurchaseExpenseInvoice,
  PurchaseExpenseType,
  PurchaseExpenseCategory,
  CATEGORY_LABELS,
} from '../../requests/purchase-expense-invoice.requests';

// Category configuration with icons and colors
const CATEGORY_CONFIG: Record<
  PurchaseExpenseCategory,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  TIRES: { icon: <TiresIcon fontSize="small" />, color: '#1565c0', bgColor: '#e3f2fd' },
  RIMS: { icon: <RimsIcon fontSize="small" />, color: '#5c6bc0', bgColor: '#e8eaf6' },
  PARTS: { icon: <PartsIcon fontSize="small" />, color: '#7b1fa2', bgColor: '#f3e5f5' },
  TOOLS: { icon: <ToolsIcon fontSize="small" />, color: '#ef6c00', bgColor: '#fff3e0' },
  SUPPLIES: { icon: <SuppliesIcon fontSize="small" />, color: '#2e7d32', bgColor: '#e8f5e9' },
  RENT: { icon: <RentIcon fontSize="small" />, color: '#c62828', bgColor: '#ffebee' },
  UTILITIES: { icon: <UtilitiesIcon fontSize="small" />, color: '#f9a825', bgColor: '#fffde7' },
  INSURANCE: { icon: <InsuranceIcon fontSize="small" />, color: '#00838f', bgColor: '#e0f7fa' },
  ADVERTISING: { icon: <AdvertisingIcon fontSize="small" />, color: '#ad1457', bgColor: '#fce4ec' },
  OFFICE_SUPPLIES: { icon: <OfficeSuppliesIcon fontSize="small" />, color: '#5d4037', bgColor: '#efebe9' },
  PROFESSIONAL_FEES: { icon: <ProfessionalFeesIcon fontSize="small" />, color: '#37474f', bgColor: '#eceff1' },
  MAINTENANCE: { icon: <MaintenanceIcon fontSize="small" />, color: '#ff8f00', bgColor: '#fff8e1' },
  VEHICLE: { icon: <VehicleIcon fontSize="small" />, color: '#0277bd', bgColor: '#e1f5fe' },
  TRAVEL: { icon: <TravelIcon fontSize="small" />, color: '#6a1b9a', bgColor: '#f3e5f5' },
  TRAINING: { icon: <TrainingIcon fontSize="small" />, color: '#00695c', bgColor: '#e0f2f1' },
  TEAM_MEETING: { icon: <TeamMeetingIcon fontSize="small" />, color: '#d84315', bgColor: '#fbe9e7' },
  SOFTWARE: { icon: <SoftwareIcon fontSize="small" />, color: '#283593', bgColor: '#e8eaf6' },
  OTHER: { icon: <OtherIcon fontSize="small" />, color: '#616161', bgColor: '#f5f5f5' },
};
import PurchaseExpenseInvoiceDialog from '../../components/purchase-expense-invoices/PurchaseExpenseInvoiceDialog';
import FileViewerDialog from '../../components/common/FileViewerDialog';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useError } from '../../contexts/ErrorContext';

const PurchaseExpenseInvoiceManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [invoices, setInvoices] = useState<PurchaseExpenseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<PurchaseExpenseInvoice | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [viewerFileName, setViewerFileName] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuInvoice, setMenuInvoice] =
    useState<PurchaseExpenseInvoice | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // Immediate input value
  const [filters, setFilters] = useState({
    type: '' as PurchaseExpenseType | '',
    search: '',
    startDate: '',
    endDate: '',
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const { confirm } = useConfirmation();
  const { showError } = useError();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange({ ...filters, search: searchInput });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadInvoices();
  }, [filters, page, rowsPerPage]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const filterParams: any = {
        page: page + 1, // Backend uses 1-indexed pages
        limit: rowsPerPage,
      };
      if (filters.type) filterParams.type = filters.type;
      if (filters.search) filterParams.search = filters.search;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      const response = await purchaseExpenseInvoiceService.getAll(filterParams);
      setInvoices(response.data);
      setTotal(response.total);
    } catch (error) {
      showError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    invoice: PurchaseExpenseInvoice
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuInvoice(invoice);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuInvoice(null);
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: PurchaseExpenseInvoice) => {
    handleCloseMenu();
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleViewInvoice = async (invoice: PurchaseExpenseInvoice) => {
    handleCloseMenu();
    try {
      const imageUrl = await purchaseExpenseInvoiceService.getImageUrl(
        invoice.id
      );
      setViewerUrl(imageUrl);
      setViewerFileName(invoice.imageName || 'invoice');
      setViewerOpen(true);
    } catch (error) {
      showError('Failed to load invoice image');
    }
  };

  const handleDelete = async (invoice: PurchaseExpenseInvoice) => {
    handleCloseMenu();
    const invoiceType =
      invoice.type === 'PURCHASE' ? 'Purchase' : 'Expense';

    const confirmed = await confirm({
      title: `Delete ${invoiceType} Invoice`,
      message: `Are you sure you want to delete this ${invoiceType.toLowerCase()} invoice? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      try {
        await purchaseExpenseInvoiceService.delete(invoice.id);
        loadInvoices();
      } catch (error) {
        showError(`Failed to delete ${invoiceType.toLowerCase()} invoice`);
      }
    }
  };

  const handleDialogSave = () => {
    setDialogOpen(false);
    loadInvoices();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    // Handle YYYY-MM-DD strings directly to avoid timezone conversion issues
    // new Date('2026-01-15') interprets as UTC midnight, which becomes previous day in PST
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date; // Already in YYYY-MM-DD format (en-CA locale format)
    }
    // For ISO datetime strings, extract just the date part
    if (date.includes('T')) {
      return date.split('T')[0];
    }
    return new Date(date).toLocaleDateString('en-CA');
  };

  return (
    <Box
      sx={{
        p: {
          xs: theme.custom.spacing.pagePadding.mobile,
          sm: theme.custom.spacing.pagePadding.tablet,
          md: theme.custom.spacing.pagePadding.desktop,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon
            sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }}
          />
          <Typography variant={isMobile ? 'h5' : 'h4'}>Invoices</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
          onClick={handleCreate}
        >
          Add Invoice
        </Button>
      </Box>

      <Paper sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 } }}>
        {isMobile && (
          <Button
            fullWidth
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            endIcon={
              filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            sx={{
              mb: filtersExpanded ? 2 : 0,
              justifyContent: 'space-between',
            }}
          >
            Filters
          </Button>
        )}
        <Collapse in={!isMobile || filtersExpanded}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon />
            <Typography variant={isMobile ? 'subtitle1' : 'h6'}>
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                label="Search Vendor"
                placeholder="Type to search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size={isMobile ? 'small' : 'medium'}
                label="Invoice Type"
                value={filters.type}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    type: e.target.value as PurchaseExpenseType | '',
                  })
                }
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="PURCHASE">Purchase Invoices</MenuItem>
                <MenuItem value="EXPENSE">Expense Invoices</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange({ ...filters, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) =>
                  handleFilterChange({ ...filters, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {isMobile ? (
        // Mobile: Card-based layout
        <Box>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading invoices...</Typography>
            </Paper>
          ) : invoices.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No invoices found</Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {invoices.map((invoice) => {
                const isPurchase = invoice.type === 'PURCHASE';
                return (
                  <Card key={invoice.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={isPurchase ? 'Purchase' : 'Expense'}
                              size="small"
                              color={isPurchase ? 'primary' : 'secondary'}
                            />
                            <Chip
                              icon={CATEGORY_CONFIG[invoice.category]?.icon}
                              label={CATEGORY_LABELS[invoice.category]}
                              size="small"
                              sx={{
                                backgroundColor: CATEGORY_CONFIG[invoice.category]?.bgColor,
                                color: CATEGORY_CONFIG[invoice.category]?.color,
                                '& .MuiChip-icon': {
                                  color: CATEGORY_CONFIG[invoice.category]?.color,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="h6" fontWeight="bold">
                            {invoice.vendorName}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, invoice)}
                          sx={{ mt: -1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {invoice.description}
                      </Typography>

                      <Box
                        sx={{
                          mt: 1.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(invoice.invoiceDate)}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {formatCurrency(invoice.totalAmount)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      ) : (
        // Desktop: Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const isPurchase = invoice.type === 'PURCHASE';
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Chip
                          label={isPurchase ? 'Purchase' : 'Expense'}
                          size="small"
                          color={isPurchase ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {invoice.vendorName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {invoice.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={CATEGORY_CONFIG[invoice.category]?.icon}
                          label={CATEGORY_LABELS[invoice.category]}
                          size="small"
                          sx={{
                            backgroundColor: CATEGORY_CONFIG[invoice.category]?.bgColor,
                            color: CATEGORY_CONFIG[invoice.category]?.color,
                            '& .MuiChip-icon': {
                              color: CATEGORY_CONFIG[invoice.category]?.color,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, invoice)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </TableContainer>
      )}

      {/* Mobile Pagination */}
      {isMobile && invoices.length > 0 && (
        <Paper sx={{ mt: 2 }}>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Per page:"
          />
        </Paper>
      )}

      <PurchaseExpenseInvoiceDialog
        open={dialogOpen}
        invoice={selectedInvoice}
        onClose={() => setDialogOpen(false)}
        onSave={handleDialogSave}
      />

      {/* Invoice Viewer Dialog */}
      <FileViewerDialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        url={viewerUrl}
        fileName={viewerFileName}
        title="Invoice Preview"
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => menuInvoice && handleViewInvoice(menuInvoice)}
          disabled={!menuInvoice?.imageUrl}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => menuInvoice && handleEdit(menuInvoice)}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => menuInvoice && handleDelete(menuInvoice)}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PurchaseExpenseInvoiceManagement;
