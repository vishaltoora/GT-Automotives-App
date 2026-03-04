import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  Paper,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  TireRepair as TireIcon,
  AttachMoney as MoneyIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TireService from '../../requests/tire.requests';
import { customerService } from '../../requests/customer.requests';
import { TireSaleService, CreateTireSaleRequest, TireSaleItemRequest } from '../../requests/tire-sale.requests';
import { userService, User } from '../../requests/user.requests';
import { PaymentMethod } from '../../../enums';
import { TireDialog } from '../inventory/TireDialog';
import { useAuth } from '../../hooks/useAuth';

interface SelectedTire {
  tireId: string;
  tireBrand: string;
  tireSize: string;
  tireType: string;
  quantity: number;
  unitPrice: number;
  availableStock: number;
}

interface QuickTireSaleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.E_TRANSFER]: 'E-Transfer',
  [PaymentMethod.CHECK]: 'Check',
  [PaymentMethod.FINANCING]: 'Financing',
  [PaymentMethod.BANK_DEPOSIT]: 'Bank Deposit',
};

export const QuickTireSaleDialog: React.FC<QuickTireSaleDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Tire selection
  const [selectedTires, setSelectedTires] = useState<SelectedTire[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTireDialog, setShowAddTireDialog] = useState(false);

  // Salesperson selection (defaults to current user)
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string>('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  // Customer (for non-cash)
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tires
  const { data: tiresData, isLoading: tiresLoading } = useQuery({
    queryKey: ['tires', 'quick-sale', searchQuery],
    queryFn: () => TireService.getTires({ search: searchQuery, inStock: true, limit: 50 }),
    enabled: open,
    staleTime: 30000,
  });

  // Fetch customers (optional for cash, required for non-cash)
  const { data: customersData } = useQuery({
    queryKey: ['customers', 'quick-sale', customerSearch],
    queryFn: () => customerService.searchCustomers(customerSearch || ''),
    enabled: open,
    staleTime: 30000,
  });

  // Fetch employees (staff, supervisors, admins) for salesperson dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['users', 'employees'],
    queryFn: () => userService.getUsers(),
    enabled: open,
    staleTime: 60000,
  });

  const tires = tiresData?.items || [];
  const customers = customersData || [];
  // Filter to only staff, supervisor, and admin roles
  const employees = (employeesData || []).filter((u: User) =>
    u.role?.name && ['STAFF', 'SUPERVISOR', 'ADMIN'].includes(u.role.name.toUpperCase())
  );

  // Calculate totals
  const subtotal = useMemo(() => {
    return selectedTires.reduce((sum, tire) => sum + tire.quantity * tire.unitPrice, 0);
  }, [selectedTires]);

  const isCashSale = paymentMethod === PaymentMethod.CASH;
  const taxRate = isCashSale ? 0 : 0.12; // 12% for non-cash (5% GST + 7% PST)
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // Calculate commission preview
  const totalTires = selectedTires.reduce((sum, t) => sum + t.quantity, 0);
  const commissionRate = totalTires <= 30 ? 3 : totalTires <= 50 ? 4 : totalTires <= 70 ? 5 : 7;
  const commissionAmount = totalTires * commissionRate;

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedTires([]);
      setSearchQuery('');
      setPaymentMethod(PaymentMethod.CASH);
      setCustomerMode('existing');
      setSelectedCustomerId('');
      setCustomerSearch('');
      setNewCustomer({ firstName: '', lastName: '', phone: '', email: '' });
      setSelectedSalespersonId(user?.id || '');
      setError(null);
    }
  }, [open, user?.id]);

  // Handle tire selection
  const handleAddTire = (tire: any) => {
    const existing = selectedTires.find((t) => t.tireId === tire.id);
    if (existing) {
      // Increase quantity if already selected
      if (existing.quantity < existing.availableStock) {
        setSelectedTires((prev) =>
          prev.map((t) => (t.tireId === tire.id ? { ...t, quantity: t.quantity + 1 } : t))
        );
      }
    } else {
      // Add new tire - handle both nested objects and flat strings from API
      const brandName = typeof tire.brand === 'string' ? tire.brand : (tire.brand?.name || tire.brandName || 'Unknown');
      const sizeName = typeof tire.size === 'string' ? tire.size : (tire.size?.size || tire.sizeName || 'Unknown');

      setSelectedTires((prev) => [
        ...prev,
        {
          tireId: tire.id,
          tireBrand: brandName,
          tireSize: sizeName,
          tireType: tire.type,
          quantity: 1,
          unitPrice: parseFloat(tire.price),
          availableStock: tire.quantity,
        },
      ]);
    }
    setSearchQuery('');
  };

  const handleRemoveTire = (tireId: string) => {
    setSelectedTires((prev) => prev.filter((t) => t.tireId !== tireId));
  };

  const handleQuantityChange = (tireId: string, newQuantity: number) => {
    const tire = selectedTires.find((t) => t.tireId === tireId);
    if (!tire) return;

    const qty = Math.max(1, Math.min(newQuantity, tire.availableStock));
    setSelectedTires((prev) => prev.map((t) => (t.tireId === tireId ? { ...t, quantity: qty } : t)));
  };

  // Submit sale
  const handleSubmit = async () => {
    setError(null);

    // Validate
    if (selectedTires.length === 0) {
      setError('Please select at least one tire');
      return;
    }

    if (!isCashSale) {
      if (customerMode === 'existing' && !selectedCustomerId) {
        setError('Please select a customer');
        return;
      }
      if (customerMode === 'new' && (!newCustomer.firstName || !newCustomer.lastName)) {
        setError('Please enter customer name');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const items: TireSaleItemRequest[] = selectedTires.map((t) => ({
        tireId: t.tireId,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
      }));

      const request: CreateTireSaleRequest = {
        items,
        paymentMethod,
        soldById: selectedSalespersonId || undefined,
      };

      // Add customer info for non-cash sales
      if (!isCashSale) {
        if (customerMode === 'existing') {
          request.customerId = selectedCustomerId;
        } else {
          request.customerData = {
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            phone: newCustomer.phone || undefined,
            email: newCustomer.email || undefined,
          };
        }
      }

      await TireSaleService.create(request);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to create tire sale:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create tire sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: isMobile ? '100%' : 400,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TireIcon color="primary" />
          <Typography variant="h6">Quick Tire Sale</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Salesperson & Payment Method Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Salesperson</InputLabel>
              <Select
                value={selectedSalespersonId}
                onChange={(e) => setSelectedSalespersonId(e.target.value)}
                label="Salesperson"
              >
                {employees.map((emp: User) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName || ''} {emp.lastName || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                label="Payment Method"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                  <MenuItem key={method} value={method}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Tire Search */}
        <Autocomplete
          options={tires}
          getOptionLabel={(option: any) => {
            const size = typeof option.size === 'string' ? option.size : (option.size?.size || option.sizeName || '');
            const brand = typeof option.brand === 'string' ? option.brand : (option.brand?.name || option.brandName || '');
            return `${size} - ${brand} ${option.type} (${option.quantity} in stock)`;
          }}
          inputValue={searchQuery}
          onInputChange={(_, value) => setSearchQuery(value)}
          onChange={(_, value) => value && handleAddTire(value)}
          loading={tiresLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Tires"
              placeholder="Search by brand or size..."
              variant="outlined"
              fullWidth
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {tiresLoading && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option: any) => {
            const { key, ...otherProps } = props;
            const size = typeof option.size === 'string' ? option.size : (option.size?.size || option.sizeName || '');
            const brand = typeof option.brand === 'string' ? option.brand : (option.brand?.name || option.brandName || '');
            return (
              <li key={key} {...otherProps}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Box>
                    <Typography variant="body2">
                      <strong>{size}</strong> - {brand}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.type} • {option.condition}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="bold">
                      ${parseFloat(option.price).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={option.quantity < 5 ? 'warning.main' : 'success.main'}
                    >
                      {option.quantity} in stock
                    </Typography>
                  </Box>
                </Box>
              </li>
            );
          }}
          value={null}
          blurOnSelect
          clearOnBlur
          noOptionsText={
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No tires found
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setShowAddTireDialog(true)}
              >
                Add New Tire
              </Button>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        {/* Selected Tires */}
        {selectedTires.length > 0 && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            {selectedTires.map((tire) => (
              <Box
                key={tire.tireId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {tire.tireBrand} - {tire.tireSize}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ${tire.unitPrice.toFixed(2)} each
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TextField
                    type="number"
                    value={tire.quantity}
                    onChange={(e) => handleQuantityChange(tire.tireId, parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: tire.availableStock }}
                    size="small"
                    sx={{ width: 60 }}
                  />
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 60, textAlign: 'right' }}>
                    ${(tire.quantity * tire.unitPrice).toFixed(2)}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleRemoveTire(tire.tireId)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" fontWeight="bold">${subtotal.toFixed(2)}</Typography>
            </Box>
            {!isCashSale && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Tax (12%):</Typography>
                <Typography variant="caption" color="text.secondary">${taxAmount.toFixed(2)}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight="bold">Total:</Typography>
              <Typography variant="body1" fontWeight="bold">${total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        )}

        {selectedTires.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
            <TireIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">Search and add tires</Typography>
          </Box>
        )}

        {/* Customer Section */}
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Customer Information {isCashSale && <Typography component="span" variant="caption" color="text.secondary">(Optional)</Typography>}
          </Typography>

            <RadioGroup
              value={customerMode}
              onChange={(e) => setCustomerMode(e.target.value as 'existing' | 'new')}
              row
              sx={{ mb: 1 }}
            >
              <FormControlLabel value="existing" control={<Radio size="small" />} label="Existing" />
              <FormControlLabel value="new" control={<Radio size="small" />} label="New" />
            </RadioGroup>

            {customerMode === 'existing' ? (
              <Autocomplete
                options={customers}
                getOptionLabel={(option: any) =>
                  `${option.firstName} ${option.lastName}${option.businessName ? ` (${option.businessName})` : ''}`
                }
                inputValue={customerSearch}
                onInputChange={(_, value) => setCustomerSearch(value)}
                onChange={(_, value: any) => setSelectedCustomerId(value?.id || '')}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="Search Customer" placeholder="Name or phone..." fullWidth />
                )}
                renderOption={(props, option: any) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <Box>
                        <Typography variant="body2">
                          {option.firstName} {option.lastName}
                        </Typography>
                        {option.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {option.phone}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  );
                }}
              />
            ) : (
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="First Name"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, firstName: e.target.value }))}
                    fullWidth
                    size="small"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Last Name"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, lastName: e.target.value }))}
                    fullWidth
                    size="small"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
          </Paper>

        {/* Commission Preview */}
        {selectedTires.length > 0 && (
          <Alert severity="success" icon={<MoneyIcon />} sx={{ mt: 2 }}>
            <Typography variant="body2">
              Commission: <strong>${commissionAmount.toFixed(2)}</strong> ({totalTires} tires × ${commissionRate}/tire)
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || selectedTires.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckIcon />}
        >
          {isSubmitting ? 'Processing...' : 'Complete Sale'}
        </Button>
      </DialogActions>

      {/* Add New Tire Dialog */}
      <TireDialog
        open={showAddTireDialog}
        onClose={() => setShowAddTireDialog(false)}
        onSuccess={() => {
          setShowAddTireDialog(false);
          // Refresh the tires list
          queryClient.invalidateQueries({ queryKey: ['tires'] });
        }}
      />
    </Dialog>
  );
};

export default QuickTireSaleDialog;
