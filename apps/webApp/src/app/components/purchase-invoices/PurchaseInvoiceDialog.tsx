import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  MenuItem,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import { CloudUpload as UploadIcon, Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  PurchaseInvoice,
  PurchaseCategory,
} from '../../requests/purchase-invoice.requests';
import {
  ExpenseInvoice,
  ExpenseCategory,
} from '../../requests/expense-invoice.requests';
import vendorService, { Vendor } from '../../requests/vendor.requests';
import VendorSelect from '../vendors/VendorSelect';

interface PurchaseInvoiceDialogProps {
  open: boolean;
  invoice: PurchaseInvoice | ExpenseInvoice | null;
  onClose: () => void;
  onSave: (data: any, file: File | null, invoiceType: 'purchase' | 'expense') => void;
}

const purchaseCategories: PurchaseCategory[] = ['TIRES', 'PARTS', 'TOOLS', 'SUPPLIES', 'OTHER'];
const expenseCategories: ExpenseCategory[] = ['RENT', 'UTILITIES', 'INSURANCE', 'MARKETING', 'OFFICE_SUPPLIES', 'MAINTENANCE', 'OTHER'];

const PurchaseInvoiceDialog: React.FC<PurchaseInvoiceDialogProps> = ({
  open,
  invoice,
  onClose,
  onSave,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [invoiceType, setInvoiceType] = useState<'purchase' | 'expense'>('purchase');
  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    description: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    category: 'PARTS' as PurchaseCategory | ExpenseCategory,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadVendors();
    }
  }, [open]);

  useEffect(() => {
    if (invoice) {
      // Detect invoice type based on category
      const isPurchase = purchaseCategories.includes(invoice.category as PurchaseCategory);
      setInvoiceType(isPurchase ? 'purchase' : 'expense');

      setFormData({
        vendorId: invoice.vendorId || '',
        vendorName: invoice.vendorName || '',
        description: invoice.description || '',
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        totalAmount: invoice.totalAmount || 0,
        category: invoice.category,
        notes: invoice.notes || '',
      });
    } else {
      setInvoiceType('purchase');
      setFormData({
        vendorId: '',
        vendorName: '',
        description: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        category: 'PARTS',
        notes: '',
      });
      setSelectedFile(null);
    }
  }, [invoice, open]);

  const loadVendors = async () => {
    try {
      const activeVendors = await vendorService.getActive();
      setVendors(activeVendors);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleVendorChange = (vendorId: string, vendorName: string) => {
    setFormData({
      ...formData,
      vendorId,
      vendorName,
    });
  };

  const handleVendorFreeTextChange = (vendorName: string) => {
    setFormData({
      ...formData,
      vendorId: '',
      vendorName,
    });
  };

  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): boolean => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return false;
    }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF, JPG, PNG, and WEBP files are allowed');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleInvoiceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as 'purchase' | 'expense';
    setInvoiceType(newType);
    // Reset category to first option of new type
    setFormData({
      ...formData,
      category: newType === 'purchase' ? 'PARTS' : 'RENT',
    });
  };

  const handleSubmit = async () => {
    const submitData: any = {
      ...formData,
      amount: parseFloat(formData.totalAmount.toString()),
      totalAmount: parseFloat(formData.totalAmount.toString()),
    };

    // Pass form data, file, and invoice type to parent
    onSave(submitData, selectedFile, invoiceType);
  };

  const currentCategories = invoiceType === 'purchase' ? purchaseCategories : expenseCategories;

  const isValid =
    formData.vendorName.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.totalAmount > 0;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {invoice ? 'Edit Invoice' : 'Add Invoice'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            {/* Invoice Type */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                required
                label="Invoice Type"
                value={invoiceType}
                onChange={handleInvoiceTypeChange}
                disabled={!!invoice}
              >
                <MenuItem value="purchase">Purchase Invoice</MenuItem>
                <MenuItem value="expense">Expense Invoice</MenuItem>
              </TextField>
            </Grid>

            {/* Vendor */}
            <Grid size={{ xs: 12 }}>
              <VendorSelect
                vendors={vendors}
                value={formData.vendorId}
                onChange={handleVendorChange}
                onVendorsChange={loadVendors}
                allowFreeSolo={true}
                onFreeTextChange={handleVendorFreeTextChange}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={2}
                placeholder="What was purchased?"
              />
            </Grid>

            {/* Category and Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                required
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
              >
                {currentCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Invoice Date"
                value={formData.invoiceDate}
                onChange={handleChange('invoiceDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Total Amount */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Total Amount"
                value={formData.totalAmount}
                onChange={handleChange('totalAmount')}
                inputProps={{ step: '0.01', min: '0' }}
                helperText="Total amount including taxes"
              />
            </Grid>

            {/* Invoice Image - Compact */}
            <Grid size={{ xs: 12 }}>
              {invoice?.imageUrl && (
                <Alert severity="info" sx={{ mb: 1, py: 0.5 }}>
                  <Typography variant="caption">Current: {invoice.imageName}</Typography>
                </Alert>
              )}

              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: dragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: dragActive ? 'action.hover' : 'background.paper',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {selectedFile ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <UploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" gutterBottom>
                      Drag & drop invoice here
                    </Typography>
                    <Button variant="outlined" component="label" size="small" startIcon={<UploadIcon />}>
                      Choose File
                      <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      PDF, JPG, PNG, WEBP (Max 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Notes - Optional */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={formData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={2}
                placeholder="Additional information..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>
          {invoice ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseInvoiceDialog;
