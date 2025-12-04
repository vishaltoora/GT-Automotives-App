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
} from '@mui/icons-material';
import purchaseExpenseInvoiceService, {
  PurchaseExpenseInvoice,
  PurchaseExpenseType,
  PurchaseExpenseCategory,
  CATEGORY_LABELS,
  ALL_CATEGORIES,
} from '../../requests/purchase-expense-invoice.requests';
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
  const [filters, setFilters] = useState({
    type: '' as PurchaseExpenseType | '',
    category: '' as PurchaseExpenseCategory | '',
    startDate: '',
    endDate: '',
  });

  const { confirm } = useConfirmation();
  const { showError } = useError();

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.type) filterParams.type = filters.type;
      if (filters.category) filterParams.category = filters.category;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      const response = await purchaseExpenseInvoiceService.getAll(filterParams);
      setInvoices(response.data);
    } catch (error) {
      showError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
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
                select
                size={isMobile ? 'small' : 'medium'}
                label="Invoice Type"
                value={filters.type}
                onChange={(e) =>
                  setFilters({
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
                select
                size={isMobile ? 'small' : 'medium'}
                label="Category"
                value={filters.category}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value as PurchaseExpenseCategory | '',
                  })
                }
              >
                <MenuItem value="">All Categories</MenuItem>
                {ALL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </MenuItem>
                ))}
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
                  setFilters({ ...filters, startDate: e.target.value })
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
                  setFilters({ ...filters, endDate: e.target.value })
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
                          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Chip
                              label={isPurchase ? 'Purchase' : 'Expense'}
                              size="small"
                              color={isPurchase ? 'primary' : 'secondary'}
                            />
                            <Chip
                              label={CATEGORY_LABELS[invoice.category]}
                              size="small"
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
                          label={CATEGORY_LABELS[invoice.category]}
                          size="small"
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
        </TableContainer>
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
