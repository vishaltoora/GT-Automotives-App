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
import PurchaseInvoiceDialog from '../../components/purchase-invoices/PurchaseInvoiceDialog';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useError } from '../../contexts/ErrorContext';
import { useAuth } from '../../hooks/useAuth';

const categories: PurchaseCategory[] = ['TIRES', 'PARTS', 'TOOLS', 'SUPPLIES', 'OTHER'];

const PurchaseInvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [filters, setFilters] = useState({
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

      const response = await purchaseInvoiceService.getAll(filterParams);
      setInvoices(response.data);
    } catch (error) {
      showError('Failed to load purchase invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setDialogOpen(true);
  };

  const handleEdit = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleViewInvoice = (imageUrl: string) => {
    setViewerUrl(imageUrl);
    setViewerOpen(true);
  };

  const handleDelete = async (invoice: PurchaseInvoice) => {
    const confirmed = await confirm({
      title: 'Delete Purchase Invoice',
      message: `Are you sure you want to delete this purchase invoice? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      try {
        await purchaseInvoiceService.delete(invoice.id);
        loadInvoices();
      } catch (error) {
        showError('Failed to delete purchase invoice');
      }
    }
  };

  const handleSave = async (data: any, file: File | null) => {
    try {
      const saveData = {
        ...data,
        createdBy: user?.id || '',
      };

      let savedInvoice;
      if (selectedInvoice) {
        savedInvoice = await purchaseInvoiceService.update(selectedInvoice.id, saveData);
      } else {
        savedInvoice = await purchaseInvoiceService.create(saveData);
      }

      // Upload image if file is provided
      if (file && savedInvoice) {
        await purchaseInvoiceService.uploadImage(savedInvoice.id, file);
      }

      setDialogOpen(false);
      loadInvoices();
    } catch (error) {
      showError(`Failed to ${selectedInvoice ? 'update' : 'create'} purchase invoice`);
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
          <Typography variant="h4">Purchase Invoices</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add Purchase Invoice
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
                <TableCell colSpan={7} align="center">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No purchase invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
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
                    {invoice.imageUrl ? (
                      <Tooltip title={invoice.imageUrl?.includes('localhost') ? 'View invoice (dev mode - mock data)' : 'View invoice'}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => invoice.imageUrl && handleViewInvoice(invoice.imageUrl)}
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
              ))
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
          {viewerUrl.includes('localhost') ? (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'grey.100',
                borderRadius: 1,
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <ImageIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Development Mode
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoice file upload is enabled but preview is not available in development mode.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                In production, the actual PDF/image will be displayed here.
              </Typography>
            </Box>
          ) : viewerUrl.toLowerCase().endsWith('.pdf') ? (
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
          {!viewerUrl.includes('localhost') && (
            <Button
              variant="outlined"
              onClick={() => window.open(viewerUrl, '_blank')}
            >
              Open in New Tab
            </Button>
          )}
          <Button onClick={() => setViewerOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseInvoiceManagement;
