import {
  Close as CloseIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import purchaseExpenseInvoiceService, {
  CATEGORY_LABELS,
  CreatePurchaseExpenseInvoiceDto,
  EXPENSE_CATEGORIES,
  PURCHASE_CATEGORIES,
  PurchaseExpenseCategory,
  PurchaseExpenseInvoice,
  PurchaseExpenseType,
} from '../../requests/purchase-expense-invoice.requests';
import vendorService, { Vendor } from '../../requests/vendor.requests';
import VendorSelect from '../vendors/VendorSelect';

interface PurchaseExpenseInvoiceDialogProps {
  open: boolean;
  invoice: PurchaseExpenseInvoice | null;
  onClose: () => void;
  onSave: () => void;
}

// Default tax rates for BC, Canada
const DEFAULT_GST_RATE = 5;
const DEFAULT_PST_RATE = 7;
const DEFAULT_HST_RATE = 0;

const PurchaseExpenseInvoiceDialog: React.FC<
  PurchaseExpenseInvoiceDialogProps
> = ({ open, invoice, onClose, onSave }) => {
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
    amount: '' as string | number, // Subtotal
    gstRate: DEFAULT_GST_RATE as number,
    gstAmount: '' as string | number,
    pstRate: DEFAULT_PST_RATE as number,
    pstAmount: '' as string | number,
    hstRate: DEFAULT_HST_RATE as number,
    hstAmount: '' as string | number,
    totalAmount: '' as string | number,
    category: 'PARTS' as PurchaseExpenseCategory,
    notes: '',
  });

  // Track which field was last edited for bi-directional calculation
  const [lastEditedField, setLastEditedField] = useState<'amount' | 'total'>(
    'amount'
  );

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
        amount: invoice.amount || 0,
        gstRate: invoice.gstRate ?? DEFAULT_GST_RATE,
        gstAmount: invoice.gstAmount || '',
        pstRate: invoice.pstRate ?? DEFAULT_PST_RATE,
        pstAmount: invoice.pstAmount || '',
        hstRate: invoice.hstRate ?? DEFAULT_HST_RATE,
        hstAmount: invoice.hstAmount || '',
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
        amount: '',
        gstRate: DEFAULT_GST_RATE,
        gstAmount: '',
        pstRate: DEFAULT_PST_RATE,
        pstAmount: '',
        hstRate: DEFAULT_HST_RATE,
        hstAmount: '',
        totalAmount: '',
        category: 'PARTS',
        notes: '',
      });
      setSelectedFile(null);
    }
    setError(null);
  }, [invoice, open]);

  // Calculate taxes from subtotal (forward calculation)
  const calculateFromSubtotal = (
    subtotal: number,
    gstRate: number,
    pstRate: number,
    hstRate: number
  ) => {
    const gstAmount = subtotal * (gstRate / 100);
    const pstAmount = subtotal * (pstRate / 100);
    const hstAmount = subtotal * (hstRate / 100);
    const taxAmount = gstAmount + pstAmount + hstAmount;
    const total = subtotal + taxAmount;
    return { gstAmount, pstAmount, hstAmount, taxAmount, total };
  };

  // Calculate subtotal and taxes from total (reverse calculation)
  const calculateFromTotal = (
    total: number,
    gstRate: number,
    pstRate: number,
    hstRate: number
  ) => {
    const totalTaxRate = (gstRate + pstRate + hstRate) / 100;
    const subtotal = total / (1 + totalTaxRate);
    const gstAmount = subtotal * (gstRate / 100);
    const pstAmount = subtotal * (pstRate / 100);
    const hstAmount = subtotal * (hstRate / 100);
    const taxAmount = gstAmount + pstAmount + hstAmount;
    return { subtotal, gstAmount, pstAmount, hstAmount, taxAmount };
  };

  // Handle amount (subtotal) change - forward calculation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const subtotal = parseFloat(value) || 0;
    const { gstAmount, pstAmount, hstAmount, total } = calculateFromSubtotal(
      subtotal,
      Number(formData.gstRate),
      Number(formData.pstRate),
      Number(formData.hstRate)
    );

    setFormData((prev) => ({
      ...prev,
      amount: value,
      gstAmount: gstAmount > 0 ? Math.round(gstAmount * 100) / 100 : '',
      pstAmount: pstAmount > 0 ? Math.round(pstAmount * 100) / 100 : '',
      hstAmount: hstAmount > 0 ? Math.round(hstAmount * 100) / 100 : '',
      totalAmount: subtotal > 0 ? Math.round(total * 100) / 100 : '',
    }));
    setLastEditedField('amount');
  };

  // Handle total change - reverse calculation
  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const total = parseFloat(value) || 0;
    const { subtotal, gstAmount, pstAmount, hstAmount } = calculateFromTotal(
      total,
      Number(formData.gstRate),
      Number(formData.pstRate),
      Number(formData.hstRate)
    );

    setFormData((prev) => ({
      ...prev,
      amount: total > 0 ? Math.round(subtotal * 100) / 100 : '',
      gstAmount: gstAmount > 0 ? Math.round(gstAmount * 100) / 100 : '',
      pstAmount: pstAmount > 0 ? Math.round(pstAmount * 100) / 100 : '',
      hstAmount: hstAmount > 0 ? Math.round(hstAmount * 100) / 100 : '',
      totalAmount: value,
    }));
    setLastEditedField('total');
  };

  // Handle tax rate changes - recalculate based on last edited field
  const handleTaxRateChange =
    (field: 'gstRate' | 'pstRate' | 'hstRate') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      const newRates = {
        gstRate: field === 'gstRate' ? value : Number(formData.gstRate),
        pstRate: field === 'pstRate' ? value : Number(formData.pstRate),
        hstRate: field === 'hstRate' ? value : Number(formData.hstRate),
      };

      if (lastEditedField === 'total' && formData.totalAmount) {
        // Recalculate from total
        const total = parseFloat(String(formData.totalAmount)) || 0;
        const { subtotal, gstAmount, pstAmount, hstAmount } =
          calculateFromTotal(
            total,
            newRates.gstRate,
            newRates.pstRate,
            newRates.hstRate
          );
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          amount: total > 0 ? Math.round(subtotal * 100) / 100 : '',
          gstAmount: gstAmount > 0 ? Math.round(gstAmount * 100) / 100 : '',
          pstAmount: pstAmount > 0 ? Math.round(pstAmount * 100) / 100 : '',
          hstAmount: hstAmount > 0 ? Math.round(hstAmount * 100) / 100 : '',
        }));
      } else if (formData.amount) {
        // Recalculate from subtotal
        const subtotal = parseFloat(String(formData.amount)) || 0;
        const { gstAmount, pstAmount, hstAmount, total } =
          calculateFromSubtotal(
            subtotal,
            newRates.gstRate,
            newRates.pstRate,
            newRates.hstRate
          );
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          gstAmount: gstAmount > 0 ? Math.round(gstAmount * 100) / 100 : '',
          pstAmount: pstAmount > 0 ? Math.round(pstAmount * 100) / 100 : '',
          hstAmount: hstAmount > 0 ? Math.round(hstAmount * 100) / 100 : '',
          totalAmount: subtotal > 0 ? Math.round(total * 100) / 100 : '',
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    };

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

      const amount = parseFloat(String(formData.amount)) || 0;
      const gstAmount = parseFloat(String(formData.gstAmount)) || 0;
      const pstAmount = parseFloat(String(formData.pstAmount)) || 0;
      const hstAmount = parseFloat(String(formData.hstAmount)) || 0;
      const taxAmount = gstAmount + pstAmount + hstAmount;

      const submitData: CreatePurchaseExpenseInvoiceDto = {
        type: formData.type,
        vendorId: formData.vendorId || undefined,
        vendorName: formData.vendorName,
        description: formData.description,
        invoiceDate: formData.invoiceDate,
        amount: amount,
        gstRate: Number(formData.gstRate),
        gstAmount: gstAmount || undefined,
        pstRate: Number(formData.pstRate),
        pstAmount: pstAmount || undefined,
        hstRate: Number(formData.hstRate),
        hstAmount: hstAmount || undefined,
        taxAmount: taxAmount || undefined,
        totalAmount: parseFloat(String(formData.totalAmount)) || 0,
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

  // Section header component for visual organization
  const SectionHeader = ({ title }: { title: string }) => (
    <Grid size={{ xs: 12 }}>
      <Typography
        variant="subtitle2"
        sx={{
          color: 'primary.main',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          fontSize: '16px',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Divider />
    </Grid>
  );

  return (
    <Dialog open={open} maxWidth="md" fullWidth disableEscapeKeyDown>
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="span">
            {invoice ? 'Edit Invoice' : 'New Purchase/Expense Invoice'}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1: INVOICE DETAILS
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader title="Invoice Details" />

          {/* Invoice Type Radio Buttons */}
          <Grid size={{ xs: 12 }}>
            <RadioGroup
              row
              value={formData.type}
              onChange={(e) =>
                handleTypeChange(e as React.ChangeEvent<HTMLInputElement>)
              }
              sx={{ gap: 2 }}
            >
              <FormControlLabel
                value="PURCHASE"
                control={<Radio size="small" />}
                label={
                  <Typography
                    variant="body2"
                    fontWeight={formData.type === 'PURCHASE' ? 600 : 400}
                  >
                    Purchase Invoice
                  </Typography>
                }
                sx={{
                  border: '1px solid',
                  borderColor:
                    formData.type === 'PURCHASE' ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  m: 0,
                  bgcolor:
                    formData.type === 'PURCHASE' ? 'primary.50' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              />
              <FormControlLabel
                value="EXPENSE"
                control={<Radio size="small" />}
                label={
                  <Typography
                    variant="body2"
                    fontWeight={formData.type === 'EXPENSE' ? 600 : 400}
                  >
                    Expense Invoice
                  </Typography>
                }
                sx={{
                  border: '1px solid',
                  borderColor:
                    formData.type === 'EXPENSE' ? 'primary.main' : 'grey.300',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  m: 0,
                  bgcolor:
                    formData.type === 'EXPENSE' ? 'primary.50' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              />
            </RadioGroup>
          </Grid>

          {/* Category and Date - same row */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              required
              label="Category"
              value={formData.category}
              onChange={handleChange('category')}
              size="small"
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
              size="small"
            />
          </Grid>

          {/* Vendor - full width */}
          <Grid size={{ xs: 12 }}>
            <VendorSelect
              vendors={vendors}
              value={formData.vendorId}
              onChange={handleVendorChange}
              onVendorsChange={loadVendors}
              required
              allowFreeSolo={true}
              onFreeTextChange={handleVendorFreeTextChange}
              size="medium"
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
              placeholder={
                formData.type === 'PURCHASE'
                  ? 'What was purchased? (e.g., Oil filters, brake pads)'
                  : 'What was the expense for? (e.g., Monthly rent, electricity)'
              }
            />
          </Grid>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2: AMOUNTS & TAXES
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader title="Amounts & Taxes" />

          {/* Amount Summary Box - Invoice-style layout */}
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
              }}
            >
              {/* Subtotal Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                }}
              >
                <Typography variant="body1">Subtotal</Typography>
                <TextField
                  type="number"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  inputProps={{ step: '0.01', min: '0' }}
                  autoComplete="off"
                  size="small"
                  sx={{ width: 150 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* GST Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 32 }}
                  >
                    GST
                  </Typography>
                  <TextField
                    type="number"
                    value={formData.gstRate}
                    onChange={handleTaxRateChange('gstRate')}
                    inputProps={{ step: '0.5', min: '0', max: '15' }}
                    autoComplete="off"
                    size="small"
                    sx={{ width: 60, '& .MuiInputBase-input': { py: 0.5 } }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    %
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  $
                  {formData.gstAmount
                    ? Number(formData.gstAmount).toFixed(2)
                    : '0.00'}
                </Typography>
              </Box>

              {/* PST Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 32 }}
                  >
                    PST
                  </Typography>
                  <TextField
                    type="number"
                    value={formData.pstRate}
                    onChange={handleTaxRateChange('pstRate')}
                    inputProps={{ step: '0.5', min: '0', max: '15' }}
                    autoComplete="off"
                    size="small"
                    sx={{ width: 60, '& .MuiInputBase-input': { py: 0.5 } }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    %
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  $
                  {formData.pstAmount
                    ? Number(formData.pstAmount).toFixed(2)
                    : '0.00'}
                </Typography>
              </Box>

              {/* HST Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 32 }}
                  >
                    HST
                  </Typography>
                  <TextField
                    type="number"
                    value={formData.hstRate}
                    onChange={handleTaxRateChange('hstRate')}
                    inputProps={{ step: '0.5', min: '0', max: '15' }}
                    autoComplete="off"
                    size="small"
                    sx={{ width: 60, '& .MuiInputBase-input': { py: 0.5 } }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    %
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  $
                  {formData.hstAmount
                    ? Number(formData.hstAmount).toFixed(2)
                    : '0.00'}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Total Row */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                }}
              >
                <Typography variant="body1" fontWeight={600}>
                  Total
                </Typography>
                <TextField
                  type="number"
                  value={formData.totalAmount}
                  onChange={handleTotalChange}
                  inputProps={{ step: '0.01', min: '0' }}
                  autoComplete="off"
                  size="small"
                  sx={{ width: 150 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    sx: {
                      fontWeight: 700,
                    },
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1 }}
              >
                Enter subtotal to calculate taxes, or enter total to
                reverse-calculate
              </Typography>
            </Paper>
          </Grid>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 3: ATTACHMENTS & NOTES
          ═══════════════════════════════════════════════════════════════ */}
          <SectionHeader title="Attachments & Notes" />

          {/* Invoice Image Upload */}
          <Grid size={{ xs: 12 }}>
            {invoice?.imageUrl && (
              <Alert
                severity="info"
                sx={{ mb: 1, py: 0.5 }}
                icon={<ImageIcon />}
              >
                <Typography variant="caption">
                  Current attachment: <strong>{invoice.imageName}</strong>
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
                borderRadius: 2,
                p: 1.5,
                textAlign: 'center',
                bgcolor: dragActive ? 'primary.50' : 'background.paper',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
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
                    <ImageIcon sx={{ fontSize: 28, color: 'primary.main' }} />
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <UploadIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">
                      Drag & drop invoice image or{' '}
                      <Button
                        component="label"
                        size="small"
                        sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                      >
                        browse
                        <input
                          type="file"
                          hidden
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                        />
                      </Button>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF, JPG, PNG, WEBP (Max 10MB)
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={formData.notes}
              onChange={handleChange('notes')}
              multiline
              rows={2}
              placeholder="Additional information, reference numbers, etc."
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? 'Saving...' : invoice ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseExpenseInvoiceDialog;
