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
  Image as ImageIcon,
  FilterList as FilterIcon,
  AccountBalance as ExpenseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import expenseInvoiceService, {
  ExpenseInvoice,
  ExpenseCategory,
  ExpenseInvoiceStatus,
} from '../../requests/expense-invoice.requests';
import analyticsService, { AnalyticsData } from '../../requests/analytics.requests';
import ExpenseInvoiceDialog from '../../components/expense-invoices/ExpenseInvoiceDialog';
import { AnalyticsCards, AnalyticsCardData } from '../../components/common';
import PdfViewer from '../../components/common/PdfViewer';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useError } from '../../contexts/ErrorContext';
import { useAuth } from '../../hooks/useAuth';

const categories: ExpenseCategory[] = ['RENT', 'UTILITIES', 'INSURANCE', 'MARKETING', 'OFFICE_SUPPLIES', 'MAINTENANCE', 'OTHER'];
const statuses: ExpenseInvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

const ExpenseInvoiceManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [invoices, setInvoices] = useState<ExpenseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ExpenseInvoice | null>(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const { confirm } = useConfirmation();
  const { showError } = useError();
  const { user } = useAuth();

  useEffect(() => {
    loadInvoices();
    loadAnalytics();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.category) filterParams.category = filters.category;
      if (filters.status) filterParams.status = filters.status;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      const response = await expenseInvoiceService.getAll(filterParams);
      setInvoices(response.data);
    } catch (error) {
      showError('Failed to load expense invoices');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      showError('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: ExpenseInvoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleViewPdf = (invoice: ExpenseInvoice) => {
    if (invoice.imageUrl) {
      setSelectedPdfUrl(invoice.imageUrl);
      setSelectedPdfTitle(`Expense Invoice - ${invoice.vendorName} - ${invoice.invoiceNumber || 'N/A'}`);
      setPdfViewerOpen(true);
    }
  };

  const handleDelete = async (invoice: ExpenseInvoice) => {
    const confirmed = await confirm({
      title: 'Delete Expense Invoice',
      message: `Are you sure you want to delete this expense invoice? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      try {
        await expenseInvoiceService.delete(invoice.id);
        loadInvoices();
      } catch (error) {
        showError('Failed to delete expense invoice');
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      const saveData = {
        ...data,
        createdBy: user?.id || '',
      };

      if (selectedInvoice) {
        await expenseInvoiceService.update(selectedInvoice.id, saveData);
      } else {
        await expenseInvoiceService.create(saveData);
      }
      setDialogOpen(false);
      loadInvoices();
    } catch (error) {
      showError(`Failed to ${selectedInvoice ? 'update' : 'create'} expense invoice`);
    }
  };

  const handleImageUpload = async (invoiceId: string, file: File) => {
    try {
      await expenseInvoiceService.uploadImage(invoiceId, file);
      loadInvoices();
    } catch (error) {
      showError('Failed to upload image');
    }
  };

  const getStatusColor = (status: ExpenseInvoiceStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'OVERDUE':
        return 'error';
      default:
        return 'default';
    }
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

  const analyticsCards: AnalyticsCardData[] = analytics
    ? [
        {
          title: 'Expenses Only',
          mtdValue: analytics.mtd.expenses.total,
          ytdValue: analytics.ytd.expenses.total,
          mtdCount: analytics.mtd.expenses.count,
          ytdCount: analytics.ytd.expenses.count,
          icon: <ExpenseIcon />,
          color: '#d32f2f',
        },
      ]
    : [];

  return (
    <Box sx={{
      p: {
        xs: theme.custom.spacing.pagePadding.mobile,
        sm: theme.custom.spacing.pagePadding.tablet,
        md: theme.custom.spacing.pagePadding.desktop
      }
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
          <Typography variant={isMobile ? "h5" : "h4"}>Expense Invoices</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
          onClick={handleCreate}
        >
          Add Expense Invoice
        </Button>
      </Box>

      {/* Analytics Cards */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        {isMobile && (
          <Button
            fullWidth
            onClick={() => setStatsExpanded(!statsExpanded)}
            endIcon={statsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: statsExpanded ? 2 : 0, justifyContent: 'space-between' }}
          >
            Statistics
          </Button>
        )}
        <Collapse in={!isMobile || statsExpanded}>
          <AnalyticsCards cards={analyticsCards} loading={analyticsLoading} />
        </Collapse>
      </Box>

      <Paper sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 } }}>
        {isMobile && (
          <Button
            fullWidth
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: filtersExpanded ? 2 : 0, justifyContent: 'space-between' }}
          >
            Filters
          </Button>
        )}
        <Collapse in={!isMobile || filtersExpanded}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon />
            <Typography variant={isMobile ? "subtitle1" : "h6"}>Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size={isMobile ? "small" : "medium"}
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size={isMobile ? "small" : "medium"}
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size={isMobile ? "small" : "medium"}
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size={isMobile ? "small" : "medium"}
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
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
              <Typography>No expense invoices found</Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {invoices.map((invoice) => (
                <Card key={invoice.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={invoice.status}
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                          <Chip
                            label={invoice.category}
                            size="small"
                          />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                          {invoice.vendorName}
                        </Typography>
                        {invoice.invoiceNumber && (
                          <Typography variant="body2" color="text.secondary">
                            #{invoice.invoiceNumber}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {invoice.imageUrl && (
                          <IconButton size="small" color="primary" onClick={() => handleViewPdf(invoice)}>
                            <ImageIcon />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleEdit(invoice)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(invoice)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {invoice.description}
                    </Typography>

                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(invoice.invoiceDate)}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        // Desktop: Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No expense invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber || '-'}</TableCell>
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
                      <Chip label={invoice.category} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.imageUrl ? (
                        <IconButton size="small" color="primary" onClick={() => handleViewPdf(invoice)}>
                          <ImageIcon />
                        </IconButton>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(invoice)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(invoice)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ExpenseInvoiceDialog
        open={dialogOpen}
        invoice={selectedInvoice}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onImageUpload={handleImageUpload}
      />

      <PdfViewer
        open={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
        pdfUrl={selectedPdfUrl}
        title={selectedPdfTitle}
      />
    </Box>
  );
};

export default ExpenseInvoiceManagement;