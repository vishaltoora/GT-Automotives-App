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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Image as ImageIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import purchaseInvoiceService, {
  PurchaseInvoice,
  PurchaseCategory,
} from '../../services/purchase-invoice.service';
import expenseInvoiceService, {
  ExpenseInvoice,
  ExpenseCategory,
} from '../../services/expense-invoice.service';
import PurchaseInvoiceDialog from '../../components/purchase-invoices/PurchaseInvoiceDialog';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useError } from '../../contexts/ErrorContext';
import { useAuth } from '../../hooks/useAuth';

const purchaseCategories: PurchaseCategory[] = ['TIRES', 'PARTS', 'TOOLS', 'SUPPLIES', 'OTHER'];
const expenseCategories: ExpenseCategory[] = ['RENT', 'UTILITIES', 'INSURANCE', 'MARKETING', 'OFFICE_SUPPLIES', 'MAINTENANCE', 'OTHER'];
const allCategories = [...purchaseCategories, ...expenseCategories];

const PurchaseInvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<(PurchaseInvoice | ExpenseInvoice)[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | ExpenseInvoice | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: '',
    startDate: '',
    endDate: '',
  });

  const { confirm } = useConfirmation();
  const { showError } = useError();
  const { user } = useAuth();

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      if (filters.category) filterParams.category = filters.category;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      let allInvoices: (PurchaseInvoice | ExpenseInvoice)[] = [];

      if (filters.type === 'all' || filters.type === 'purchase') {
        const purchaseResponse = await purchaseInvoiceService.getAll(filterParams);
        allInvoices = [...allInvoices, ...purchaseResponse.data];
      }

      if (filters.type === 'all' || filters.type === 'expense') {
        const expenseResponse = await expenseInvoiceService.getAll(filterParams);
        allInvoices = [...allInvoices, ...expenseResponse.data];
      }

      // Sort by invoice date descending
      allInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

      setInvoices(allInvoices);
    } catch (error) {
      showError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: PurchaseInvoice | ExpenseInvoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleViewInvoice = async (invoice: PurchaseInvoice | ExpenseInvoice) => {
    try {
      const isPurchase = purchaseCategories.includes(invoice.category as PurchaseCategory);
      const imageUrl = isPurchase
        ? await purchaseInvoiceService.getImageUrl(invoice.id)
        : await expenseInvoiceService.getImageUrl(invoice.id);

      setViewerUrl(imageUrl);
      setViewerOpen(true);
    } catch (error) {
      showError('Failed to load invoice image');
    }
  };

  const handleDelete = async (invoice: PurchaseInvoice | ExpenseInvoice) => {
    const invoiceType = purchaseCategories.includes(invoice.category as PurchaseCategory) ? 'purchase' : 'expense';

    const confirmed = await confirm({
      title: `Delete ${invoiceType === 'purchase' ? 'Purchase' : 'Expense'} Invoice`,
      message: `Are you sure you want to delete this ${invoiceType} invoice? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      try {
        if (invoiceType === 'purchase') {
          await purchaseInvoiceService.delete(invoice.id);
        } else {
          await expenseInvoiceService.delete(invoice.id);
        }
        loadInvoices();
      } catch (error) {
        showError(`Failed to delete ${invoiceType} invoice`);
      }
    }
  };

  const handleSave = async (data: any, file: File | null, invoiceType: 'purchase' | 'expense') => {
    try {
      const saveData = {
        ...data,
        createdBy: user?.id || '',
      };

      let savedInvoice;
      const service = invoiceType === 'purchase' ? purchaseInvoiceService : expenseInvoiceService;

      if (selectedInvoice) {
        savedInvoice = await service.update(selectedInvoice.id, saveData);
      } else {
        savedInvoice = await service.create(saveData);
      }

      // Upload image if file is provided
      if (file && savedInvoice) {
        await service.uploadImage(savedInvoice.id, file);
      }

      setDialogOpen(false);
      loadInvoices();
    } catch (error) {
      showError(`Failed to ${selectedInvoice ? 'update' : 'create'} invoice`);
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">Invoices</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Invoice
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterIcon />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              select
              label="Invoice Type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value, category: '' })}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="purchase">Purchase Invoices</MenuItem>
              <MenuItem value="expense">Expense Invoices</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <MenuItem value="">All Categories</MenuItem>
              {allCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
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
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

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
              <TableCell>Image</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const isPurchase = purchaseCategories.includes(invoice.category as PurchaseCategory);
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
                      <Chip label={invoice.category.replace(/_/g, ' ')} size="small" />
                    </TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    {invoice.imageUrl ? (
                      <Tooltip title="View invoice">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <ImageIcon />
                        </IconButton>
                      </Tooltip>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PurchaseInvoiceDialog
        open={dialogOpen}
        invoice={selectedInvoice}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {/* Invoice Viewer Dialog */}
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Invoice Preview</Typography>
            <IconButton onClick={() => setViewerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewerUrl.toLowerCase().endsWith('.pdf') ? (
            <Box sx={{ height: '70vh', width: '100%' }}>
              <iframe
                src={viewerUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Invoice PDF"
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <img
                src={viewerUrl}
                alt="Invoice"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => window.open(viewerUrl, '_blank')}
          >
            Open in New Tab
          </Button>
          <Button onClick={() => setViewerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseInvoiceManagement;
