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
} from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { PaymentMethod } from '@gt-automotive/data';
import {
  ExpenseInvoice,
  ExpenseCategory,
  ExpenseInvoiceStatus,
} from '../../requests/expense-invoice.requests';
import vendorService, { Vendor } from '../../requests/vendor.requests';
import VendorSelect from '../vendors/VendorSelect';

interface ExpenseInvoiceDialogProps {
  open: boolean;
  invoice: ExpenseInvoice | null;
  onClose: () => void;
  onSave: (data: any) => void;
  onImageUpload?: (invoiceId: string, file: File) => void;
}

const categories: ExpenseCategory[] = ['RENT', 'UTILITIES', 'INSURANCE', 'MARKETING', 'OFFICE_SUPPLIES', 'MAINTENANCE', 'OTHER'];
const statuses: ExpenseInvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];
const paymentMethods = [
  PaymentMethod.CASH,
  PaymentMethod.CREDIT_CARD,
  PaymentMethod.DEBIT_CARD,
  PaymentMethod.CHECK,
  PaymentMethod.E_TRANSFER,
  PaymentMethod.FINANCING,
];

const ExpenseInvoiceDialog: React.FC<ExpenseInvoiceDialogProps> = ({
  open,
  invoice,
  onClose,
  onSave,
  onImageUpload,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    vendorId: '',
    vendorName: '',
    description: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    category: 'OFFICE_SUPPLIES' as ExpenseCategory,
    status: 'PENDING' as ExpenseInvoiceStatus,
    paymentDate: '',
    paymentMethod: '' as PaymentMethod | '',
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
        invoiceNumber: invoice.invoiceNumber || '',
        vendorId: invoice.vendorId || '',
        vendorName: invoice.vendorName || '',
        description: invoice.description || '',
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        amount: invoice.amount || 0,
        taxAmount: invoice.taxAmount || 0,
        totalAmount: invoice.totalAmount || 0,
        category: invoice.category,
        status: invoice.status,
        paymentDate: invoice.paymentDate ? invoice.paymentDate.split('T')[0] : '',
        paymentMethod: (invoice.paymentMethod as PaymentMethod) || '',
        notes: invoice.notes || '',
      });
    } else {
      setFormData({
        invoiceNumber: '',
        vendorId: '',
        vendorName: '',
        description: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        amount: 0,
        taxAmount: 0,
        totalAmount: 0,
        category: 'OFFICE_SUPPLIES',
        status: 'PENDING',
        paymentDate: '',
        paymentMethod: '',
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

    if (!submitData.paymentMethod) delete submitData.paymentMethod;
    if (!submitData.paymentDate) delete submitData.paymentDate;
    if (!submitData.dueDate) delete submitData.dueDate;

    onSave(submitData);

    // Upload image if selected and invoice exists
    if (selectedFile && invoice && onImageUpload) {
      onImageUpload(invoice.id, selectedFile);
    }
  };

  const isValid =
    formData.vendorName.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.amount > 0 &&
    formData.totalAmount > 0;

  return (
    <Dialog open={open} maxWidth="md" fullWidth disableEscapeKeyDown>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {invoice ? 'Edit Expense Invoice' : 'Add Expense Invoice'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={formData.invoiceNumber}
                onChange={handleChange('invoiceNumber')}
                placeholder="Optional"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
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

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                required
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={handleChange('paymentMethod')}
              >
                <MenuItem value="">None</MenuItem>
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {formData.status === 'PAID' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Payment Date"
                  value={formData.paymentDate}
                  onChange={handleChange('paymentDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={2}
              />
            </Grid>

            {invoice && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ border: '1px dashed', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Invoice Image
                  </Typography>
                  {invoice.imageUrl && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Current image: {invoice.imageName}
                    </Alert>
                  )}
                  <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                    {selectedFile ? selectedFile.name : 'Upload New Image'}
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
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Max 10MB - PDF, JPG, PNG, WEBP
                  </Typography>
                </Box>
              </Grid>
            )}
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

export default ExpenseInvoiceDialog;