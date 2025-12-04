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
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import purchaseExpenseInvoiceService, {
  PurchaseExpenseInvoice,
  PurchaseExpenseType,
  PurchaseExpenseCategory,
  CreatePurchaseExpenseInvoiceDto,
  PURCHASE_CATEGORIES,
  EXPENSE_CATEGORIES,
  CATEGORY_LABELS,
} from '../../requests/purchase-expense-invoice.requests';
import vendorService, { Vendor } from '../../requests/vendor.requests';
import VendorSelect from '../vendors/VendorSelect';

interface PurchaseExpenseInvoiceDialogProps {
  open: boolean;
  invoice: PurchaseExpenseInvoice | null;
  onClose: () => void;
  onSave: () => void;
}

const PurchaseExpenseInvoiceDialog: React.FC<PurchaseExpenseInvoiceDialogProps> = ({
  open,
  invoice,
  onClose,
  onSave,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'PURCHASE' as PurchaseExpenseType,
    vendorId: '',
    vendorName: '',
    description: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    totalAmount: '' as string | number,
    category: 'PARTS' as PurchaseExpenseCategory,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadVendors();
    }
  }, [open]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        type: invoice.type,
        vendorId: invoice.vendorId || '',
        vendorName: invoice.vendorName || '',
        description: invoice.description || '',
        invoiceDate: invoice.invoiceDate
          ? invoice.invoiceDate.split('T')[0]
          : '',
        totalAmount: invoice.totalAmount || 0,
        category: invoice.category,
        notes: invoice.notes || '',
      });
    } else {
      setFormData({
        type: 'PURCHASE',
        vendorId: '',
        vendorName: '',
        description: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        totalAmount: '',
        category: 'PARTS',
        notes: '',
      });
      setSelectedFile(null);
    }
    setError(null);
  }, [invoice, open]);

  const loadVendors = async () => {
    try {
      const activeVendors = await vendorService.getActive();
      setVendors(activeVendors);
    } catch (error) {
      console.error('Failed to load vendors:', error);
    }
  };

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setError('File size must be less than 10MB');
      return false;
    }
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (!validTypes.includes(file.type)) {
      setError('Only PDF, JPG, PNG, and WEBP files are allowed');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setError(null);
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
        setError(null);
      }
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as PurchaseExpenseType;
    setFormData({
      ...formData,
      type: newType,
      // Reset category to first option of new type
      category: newType === 'PURCHASE' ? 'PARTS' : 'RENT',
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const submitData: CreatePurchaseExpenseInvoiceDto = {
        type: formData.type,
        vendorId: formData.vendorId || undefined,
        vendorName: formData.vendorName,
        description: formData.description,
        invoiceDate: formData.invoiceDate,
        totalAmount: parseFloat(formData.totalAmount.toString()),
        category: formData.category,
        notes: formData.notes || undefined,
      };

      let savedInvoice;
      if (invoice) {
        savedInvoice = await purchaseExpenseInvoiceService.update(
          invoice.id,
          submitData
        );
      } else {
        savedInvoice = await purchaseExpenseInvoiceService.create(submitData);
      }

      // Upload image if file is provided
      if (selectedFile && savedInvoice) {
        await purchaseExpenseInvoiceService.uploadImage(
          savedInvoice.id,
          selectedFile
        );
      }

      onSave();
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      setError(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const currentCategories =
    formData.type === 'PURCHASE'
      ? [...PURCHASE_CATEGORIES, 'OTHER' as PurchaseExpenseCategory]
      : [...EXPENSE_CATEGORIES, 'OTHER' as PurchaseExpenseCategory];

  const isValid =
    formData.vendorName.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.totalAmount !== '' &&
    Number(formData.totalAmount) > 0;

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {invoice ? 'Edit Invoice' : 'Add Invoice'}
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Invoice Type */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                required
                label="Invoice Type"
                value={formData.type}
                onChange={handleTypeChange}
              >
                <MenuItem value="PURCHASE">Purchase Invoice</MenuItem>
                <MenuItem value="EXPENSE">Expense Invoice</MenuItem>
              </TextField>
            </Grid>

            {/* Vendor */}
            <Grid size={{ xs: 12 }}>
              <VendorSelect
                vendors={vendors}
                value={formData.vendorId}
                onChange={handleVendorChange}
                onVendorsChange={loadVendors}
                required
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
                placeholder={
                  formData.type === 'PURCHASE'
                    ? 'What was purchased?'
                    : 'What was the expense for?'
                }
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
                    {CATEGORY_LABELS[cat]}
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
                autoComplete="off"
              />
            </Grid>

            {/* Invoice Image - Compact */}
            <Grid size={{ xs: 12 }}>
              {invoice?.imageUrl && (
                <Alert severity="info" sx={{ mb: 1, py: 0.5 }}>
                  <Typography variant="caption">
                    Current: {invoice.imageName}
                  </Typography>
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
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
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
                    <UploadIcon
                      sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }}
                    />
                    <Typography variant="body2" gutterBottom>
                      Drag & drop invoice here
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      startIcon={<UploadIcon />}
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </Button>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1, color: 'text.secondary' }}
                    >
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
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant={!isValid || loading ? 'outlined' : 'contained'}
          disabled={!isValid || loading}
          sx={{
            '&.Mui-disabled': {
              borderColor: 'grey.400',
              color: 'grey.500',
            },
          }}
        >
          {loading ? 'Saving...' : invoice ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseExpenseInvoiceDialog;
