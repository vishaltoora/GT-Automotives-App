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
  IconButton,
  Alert,
  Paper,
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  PurchaseInvoice,
  PurchaseCategory,
} from '../../services/purchase-invoice.service';
import vendorService, { Vendor } from '../../services/vendor.service';
import VendorSelect from '../vendors/VendorSelect';

interface PurchaseInvoiceDialogProps {
  open: boolean;
  invoice: PurchaseInvoice | null;
  onClose: () => void;
  onSave: (data: any, file: File | null) => void;
}

const categories: PurchaseCategory[] = ['TIRES', 'PARTS', 'TOOLS', 'SUPPLIES', 'OTHER'];

const PurchaseInvoiceDialog: React.FC<PurchaseInvoiceDialogProps> = ({
  open,
  invoice,
  onClose,
  onSave,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    description: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    category: 'PARTS' as PurchaseCategory,
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
        vendorId: invoice.vendorId || '',
        vendorName: invoice.vendorName || '',
        description: invoice.description || '',
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        amount: invoice.amount || 0,
        taxAmount: invoice.taxAmount || 0,
        totalAmount: invoice.totalAmount || 0,
        category: invoice.category,
        notes: invoice.notes || '',
      });
    } else {
      setFormData({
        vendorId: '',
        vendorName: '',
        description: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        amount: 0,
        taxAmount: 0,
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

    // Auto-calculate total if amount or tax changes
    if (field === 'amount' || field === 'taxAmount') {
      const amount = field === 'amount' ? parseFloat(value) || 0 : formData.amount;
      const tax = field === 'taxAmount' ? parseFloat(value) || 0 : formData.taxAmount;
      setFormData((prev) => ({ ...prev, totalAmount: amount + tax, [field]: parseFloat(value) || 0 }));
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    const submitData: any = {
      ...formData,
      amount: parseFloat(formData.amount.toString()),
      taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount.toString()) : undefined,
      totalAmount: parseFloat(formData.totalAmount.toString()),
    };

    // Pass both form data and file to parent
    onSave(submitData, selectedFile);
  };

  const isValid =
    formData.vendorName.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.amount > 0 &&
    formData.totalAmount > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{invoice ? 'Edit Purchase Invoice' : 'Add Purchase Invoice'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Section 1: Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
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

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      select
                      required
                      label="Category"
                      value={formData.category}
                      onChange={handleChange('category')}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
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
                </Grid>
              </Paper>
            </Grid>

            {/* Section 2: Financial Details */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Financial Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Amount"
                      value={formData.amount}
                      onChange={handleChange('amount')}
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tax Amount"
                      value={formData.taxAmount}
                      onChange={handleChange('taxAmount')}
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Total Amount"
                      value={formData.totalAmount}
                      onChange={handleChange('totalAmount')}
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Section 3: Invoice Image */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Invoice Image
                </Typography>
                {invoice?.imageUrl && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Current image: {invoice.imageName}
                  </Alert>
                )}
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                  {selectedFile ? selectedFile.name : 'Choose File'}
                  <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                </Button>
                {selectedFile && (
                  <IconButton
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Max 10MB - PDF, JPG, PNG, WEBP
                </Typography>
              </Paper>
            </Grid>

            {/* Section 4: Additional Notes */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.200' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  multiline
                  rows={3}
                  placeholder="Any additional information..."
                />
              </Paper>
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
