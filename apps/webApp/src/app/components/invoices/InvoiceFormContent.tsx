import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Alert,
  Tooltip,
  InputAdornment,
  Typography,
  useTheme,
  useMediaQuery,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  Build as BuildIcon,
  Extension as ExtensionIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { InvoiceItem } from '../../services/invoice.service';
import { Company } from '../../services/company.service';
import { ServiceDto } from '@gt-automotive/data';
import { InvoiceItemType } from '../../../enums';
import { colors } from '../../theme/colors';
import ServiceSelect from '../services/ServiceSelect';
import { PhoneInput } from '../common/PhoneInput';

interface InvoiceFormContentProps {
  customers: any[];
  vehicles: any[];
  tires: any[];
  services: ServiceDto[];
  companies: Company[];
  isNewCustomer: boolean;
  customerForm: {
    firstName: string;
    lastName: string;
    businessName: string;
    address: string;
    phone: string;
    email: string;
  };
  setCustomerForm: (form: any) => void;
  formData: {
    customerId: string;
    vehicleId: string;
    companyId: string;
    gstRate: number;
    pstRate: number;
    paymentMethod: string;
    notes: string;
    status: string;
    invoiceDate: string;
  };
  setFormData: (data: any) => void;
  items: InvoiceItem[];
  setItems: (items: InvoiceItem[]) => void;
  newItem: InvoiceItem;
  setNewItem: (item: InvoiceItem) => void;
  onCustomerSelect: (customer: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onTireSelect: (tireId: string) => void;
  onServicesChange: () => void;
  isEditMode?: boolean;
}

const InvoiceFormContent: React.FC<InvoiceFormContentProps> = ({
  customers,
  vehicles,
  tires,
  services,
  companies,
  isNewCustomer,
  customerForm,
  setCustomerForm,
  formData,
  setFormData,
  items,
  setItems,
  newItem,
  setNewItem,
  onCustomerSelect,
  onAddItem,
  onRemoveItem,
  onTireSelect,
  onServicesChange,
  isEditMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemIndex, setMenuItemIndex] = useState<number | null>(null);

  const formatTireType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuItemIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuItemIndex(null);
  };

  const handleMenuDelete = () => {
    if (menuItemIndex !== null) {
      onRemoveItem(menuItemIndex);
      handleMenuClose();
    }
  };

  const handleServiceChange = (serviceId: string, serviceName: string, unitPrice: number) => {
    setNewItem({
      ...newItem,
      itemType: InvoiceItemType.SERVICE,
      description: serviceName,
      unitPrice: unitPrice,
      serviceId,
    });
  };

  const calculateTotals = () => {
    // Calculate subtotal including discount items (which have negative values)
    const subtotal = items.reduce((sum, item) => {
      let itemTotal = item.quantity * item.unitPrice;

      // For DISCOUNT_PERCENTAGE items, calculate based on other items
      if (item.itemType === 'DISCOUNT_PERCENTAGE' && item.unitPrice) {
        const otherItemsSubtotal = items
          .filter(i => i.itemType !== 'DISCOUNT' && i.itemType !== 'DISCOUNT_PERCENTAGE')
          .reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
        itemTotal = -(otherItemsSubtotal * item.unitPrice) / 100;
      }

      return sum + itemTotal;
    }, 0);

    const gstAmount = subtotal * formData.gstRate;
    const pstAmount = subtotal * formData.pstRate;
    const totalTax = gstAmount + pstAmount;
    const total = subtotal + totalTax;
    return { subtotal, gstAmount, pstAmount, totalTax, total };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const { subtotal, gstAmount, pstAmount, totalTax, total } = calculateTotals();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* COMPANY SELECTION */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Card sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.neutral[200]}`,
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {!isMobile && <BuildIcon sx={{ color: colors.primary.main }} />}
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                Company / Business Unit
              </Typography>
            </Box>
            <FormControl fullWidth size="small">
              <InputLabel>Select Company</InputLabel>
              <Select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                label="Select Company"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary.light },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary.main }
                }}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    <Box>
                      <Typography variant="body1">{company.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {company.registrationNumber} {company.businessType && `• ${company.businessType}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Box>

      {/* TOP ROW: Customer Information & Payment/Notes */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
              minHeight: isMobile ? 'auto' : 280
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
                  {!isMobile && <PersonIcon sx={{ color: colors.primary.main }} />}
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    Customer Information
                  </Typography>
                </Box>
                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Customer Search */}
                  <Autocomplete
                    freeSolo
                    disabled={isEditMode}
                    options={customers}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return `${option.firstName} ${option.lastName}`;
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        <Box>
                          <Typography variant="body1">
                            {option.firstName} {option.lastName}
                          </Typography>
                          {(option.phone || option.email) && (
                            <Typography variant="caption" color="text.secondary">
                              {option.phone} {option.email && `• ${option.email}`}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase().trim();

                      if (!inputValue) {
                        return options;
                      }

                      return options.filter((option) => {
                        const fullName = `${option.firstName} ${option.lastName}`.toLowerCase();
                        const phone = (option.phone || '').toLowerCase();
                        const email = (option.email || '').toLowerCase();
                        return fullName.includes(inputValue) ||
                               phone.includes(inputValue) ||
                               email.includes(inputValue);
                      });
                    }}
                    value={customers.find(c => c.id === formData.customerId) || null}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        const searchTerm = newValue.trim().toLowerCase();

                        const matchingCustomer = customers.find(c => {
                          const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
                          const firstName = c.firstName.toLowerCase();
                          const lastName = c.lastName.toLowerCase();
                          const phone = (c.phone || '').toLowerCase();
                          const email = (c.email || '').toLowerCase();

                          return fullName === searchTerm ||
                                 firstName === searchTerm ||
                                 lastName === searchTerm ||
                                 phone === searchTerm ||
                                 email === searchTerm ||
                                 (searchTerm.includes(' ') && fullName.includes(searchTerm));
                        });

                        if (matchingCustomer) {
                          onCustomerSelect(matchingCustomer);
                        } else {
                          const nameParts = newValue.trim().split(' ');
                          const firstName = nameParts[0] || '';
                          const lastName = nameParts.slice(1).join(' ') || '';
                          setCustomerForm({ ...customerForm, firstName, lastName });
                          setFormData({ ...formData, customerId: '' });
                          onCustomerSelect(null);
                        }
                      } else {
                        onCustomerSelect(newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Search or Add Customer" 
                        placeholder="Search by name, phone, or email"
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: colors.primary.light },
                            '&.Mui-focused fieldset': { borderColor: colors.primary.main }
                          }
                        }}
                      />
                    )}
                  />

                  {/* Customer Form Fields */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="First Name"
                        value={customerForm.firstName}
                        disabled={isEditMode}
                        onChange={(e) => {
                          setCustomerForm({ ...customerForm, firstName: e.target.value });
                          // If user types in the name field and there's no customer selected, mark as new customer
                          if (!formData.customerId) {
                            onCustomerSelect(null);
                          }
                        }}
                        required
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ color: colors.text.secondary, mr: 1, fontSize: 20 }} />,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Last Name"
                        value={customerForm.lastName}
                        disabled={isEditMode}
                        onChange={(e) => {
                          setCustomerForm({ ...customerForm, lastName: e.target.value });
                          // If user types in the name field and there's no customer selected, mark as new customer
                          if (!formData.customerId) {
                            onCustomerSelect(null);
                          }
                        }}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Business Name"
                        value={customerForm.businessName}
                        disabled={isEditMode}
                        onChange={(e) => setCustomerForm({ ...customerForm, businessName: e.target.value })}
                        placeholder="Optional"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Address"
                        value={customerForm.address}
                        disabled={isEditMode}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                        placeholder="Street address, city, province, postal code"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <PhoneInput
                        fullWidth
                        size="small"
                        value={customerForm.phone}
                        disabled={isEditMode}
                        onChange={(value) => setCustomerForm({ ...customerForm, phone: value })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        type="email"
                        value={customerForm.email}
                        disabled={isEditMode}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        placeholder="customer@email.com"
                      />
                    </Grid>
                  </Grid>

                  {/* Vehicle Selection */}
                  {formData.customerId && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Vehicle (Optional)</InputLabel>
                      <Select
                        value={formData.vehicleId}
                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                        label="Vehicle (Optional)"
                        startAdornment={<CarIcon sx={{ color: colors.text.secondary, ml: 1, mr: 1 }} />}
                      >
                        <MenuItem value="">No Vehicle</MenuItem>
                        {vehicles.map(vehicle => (
                          <MenuItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate || vehicle.vin}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {isNewCustomer && (
                    <Alert severity="info" icon={<PersonIcon />}>
                      This customer will be created when you save the invoice.
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment & Notes - Top Row Right */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
              minHeight: isMobile ? 'auto' : 280
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
                  {!isMobile && <PaymentIcon sx={{ color: colors.primary.main }} />}
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    Payment & Notes
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          label="Status"
                        >
                          <MenuItem value="DRAFT">📝 Draft</MenuItem>
                          <MenuItem value="PENDING">⏳ Pending</MenuItem>
                          <MenuItem value="PAID">✅ Paid</MenuItem>
                          <MenuItem value="CANCELLED">❌ Cancelled</MenuItem>
                          <MenuItem value="REFUNDED">↩️ Refunded</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Invoice Date"
                        value={formData.invoiceDate}
                        onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: colors.primary.light }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => {
                        const paymentMethod = e.target.value;
                        // Automatically set GST and PST to 0% when Cash is selected
                        // Restore default rates (5% GST, 7% PST) when switching from Cash to other methods
                        if (paymentMethod === 'CASH') {
                          setFormData({
                            ...formData,
                            paymentMethod,
                            gstRate: 0,
                            pstRate: 0
                          });
                        } else if (formData.paymentMethod === 'CASH') {
                          // Switching from Cash to another method - restore default rates
                          setFormData({
                            ...formData,
                            paymentMethod,
                            gstRate: 0.05,
                            pstRate: 0.07
                          });
                        } else {
                          setFormData({ ...formData, paymentMethod });
                        }
                      }}
                      label="Payment Method"
                    >
                      <MenuItem value="">Pending Payment</MenuItem>
                      <MenuItem value="CASH">💵 Cash</MenuItem>
                      <MenuItem value="CREDIT_CARD">💳 Credit Card</MenuItem>
                      <MenuItem value="DEBIT_CARD">💳 Debit Card</MenuItem>
                      <MenuItem value="CHECK">📝 Check</MenuItem>
                      <MenuItem value="E_TRANSFER">📱 E-Transfer</MenuItem>
                      <MenuItem value="FINANCING">🏦 Financing</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Invoice Notes (Optional)"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any special instructions or notes for this invoice..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: colors.primary.light }
                      }
                    }}
                  />

                  {formData.paymentMethod && (
                    <Alert severity="info" sx={{ mt: 'auto' }}>
                      Payment Method: <strong>{formData.paymentMethod.replace(/_/g, ' ')}</strong>
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* SECOND ROW: Add Items Section - Full Width */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Card sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.neutral[200]}`
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
              {!isMobile && <ShoppingCartIcon sx={{ color: colors.primary.main }} />}
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                Invoice Items
              </Typography>
            </Box>

            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: colors.neutral[50],
              border: `1px solid ${colors.neutral[200]}`,
              mb: 3
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newItem.itemType}
                      onChange={(e) => {
                        const selectedType = e.target.value as any;
                        // Auto-fill for LEVY
                        if (selectedType === 'LEVY') {
                          setNewItem({
                            ...newItem,
                            itemType: selectedType,
                            description: 'ECO Fee',
                            unitPrice: 6.5
                          });
                        } else {
                          setNewItem({ ...newItem, itemType: selectedType });
                        }
                      }}
                      label="Type"
                    >
                      <MenuItem value="TIRE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '18px' }}>🛞</span>
                          Tire
                        </Box>
                      </MenuItem>
                      <MenuItem value="SERVICE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BuildIcon fontSize="small" />
                          Service
                        </Box>
                      </MenuItem>
                      <MenuItem value="PART">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ExtensionIcon fontSize="small" />
                          Part
                        </Box>
                      </MenuItem>
                      <MenuItem value="OTHER">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon fontSize="small" />
                          Other
                        </Box>
                      </MenuItem>
                      <MenuItem value="LEVY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon fontSize="small" />
                          Levy
                        </Box>
                      </MenuItem>
                      <MenuItem value="DISCOUNT">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" sx={{ color: 'red' }} />
                          $ Discount
                        </Box>
                      </MenuItem>
                      <MenuItem value="DISCOUNT_PERCENTAGE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" sx={{ color: 'red' }} />
                          % Discount
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {newItem.itemType === 'TIRE' ? (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      options={tires.filter(t => t.quantity > 0)}
                      value={tires.find(t => t.id === newItem.tireId) || null}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          onTireSelect(newValue.id);
                        }
                      }}
                      getOptionLabel={(tire) => {
                        const name = tire.name || '';
                        const details = `${tire.brand} ${formatTireType(tire.type)} - ${tire.size}`;
                        return name ? `${name} - ${details}` : details;
                      }}
                      renderOption={(props, tire) => (
                        <Box component="li" {...props}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box>
                              {tire.name && (
                                <Typography variant="body2" fontWeight="medium">
                                  {tire.name}
                                </Typography>
                              )}
                              <Typography variant="body2" color={tire.name ? "text.secondary" : "inherit"}>
                                {tire.brand} {formatTireType(tire.type)} - {tire.size}
                              </Typography>
                            </Box>
                            <Chip
                              label={`Stock: ${tire.quantity}`}
                              size="small"
                              color={tire.quantity < 5 ? 'warning' : 'success'}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Tire"
                          placeholder="Type to search..."
                          size="small"
                        />
                      )}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                ) : newItem.itemType === 'SERVICE' ? (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <ServiceSelect
                      services={services}
                      value={(newItem as any).serviceId}
                      onChange={handleServiceChange}
                      onServicesChange={onServicesChange}
                    />
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder={
                        newItem.itemType === 'DISCOUNT' || newItem.itemType === 'DISCOUNT_PERCENTAGE'
                          ? 'e.g., Holiday discount, Loyalty discount...'
                          : 'Enter item description'
                      }
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={newItem.itemType === 'DISCOUNT' ? 'Discount Amount' : newItem.itemType === 'DISCOUNT_PERCENTAGE' ? 'Discount Percentage' : 'Unit Price'}
                    value={newItem.itemType === 'DISCOUNT' ? Math.abs(newItem.unitPrice) : newItem.unitPrice}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      // For discount amount items, automatically make the value negative
                      // For percentage items, keep it positive (we'll handle the negative in calculation)
                      let finalValue = value;
                      if (newItem.itemType === 'DISCOUNT' && value > 0) {
                        finalValue = -value;
                      }
                      setNewItem({ ...newItem, unitPrice: finalValue });
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">
                        {newItem.itemType === 'DISCOUNT' ? '-$' : newItem.itemType === 'DISCOUNT_PERCENTAGE' ? '' : '$'}
                      </InputAdornment>,
                      endAdornment: newItem.itemType === 'DISCOUNT_PERCENTAGE' ? <InputAdornment position="end">%</InputAdornment> : undefined,
                    }}
                    inputProps={{
                      min: newItem.itemType === 'DISCOUNT' ? undefined : 0,
                      max: newItem.itemType === 'DISCOUNT_PERCENTAGE' ? 100 : undefined,
                      step: newItem.itemType === 'DISCOUNT_PERCENTAGE' ? 0.1 : 0.01
                    }}
                    placeholder={
                      newItem.itemType === 'DISCOUNT'
                        ? 'Enter positive amount'
                        : newItem.itemType === 'DISCOUNT_PERCENTAGE'
                          ? 'Enter percentage (0-100)'
                          : undefined
                    }
                  />
                </Grid>


                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAddItem}
                    disabled={!newItem.description || (
                      newItem.itemType === 'DISCOUNT' ? newItem.unitPrice === 0 :
                      newItem.itemType === 'DISCOUNT_PERCENTAGE' ? newItem.unitPrice <= 0 || newItem.unitPrice > 100 :
                      newItem.unitPrice <= 0
                    )}
                    sx={{
                      background: colors.primary.main,
                      color: 'white',
                      '&:hover': { 
                        background: colors.primary.dark,
                      },
                      '&:disabled': {
                        background: colors.neutral[300],
                        color: colors.neutral[500]
                      }
                    }}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Items List */}
            {items.length > 0 && (
              isMobile ? (
                // Mobile Card View - Compact Design
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {items.map((item, index) => (
                    <Card key={index} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
                      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        {/* Header Row: Type + Description + Action */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                          <Chip
                            label={item.itemType}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.688rem',
                              background: item.itemType === 'TIRE'
                                ? colors.tire?.new || colors.primary.main
                                : item.itemType === 'DISCOUNT' || item.itemType === 'DISCOUNT_PERCENTAGE'
                                  ? '#f44336'
                                  : colors.service?.maintenance || colors.secondary.main,
                              color: 'white',
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {(item as any).tireName && (
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.813rem', lineHeight: 1.3, mb: 0.25 }}>
                                {(item as any).tireName}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '0.813rem',
                                lineHeight: 1.3,
                                color: (item as any).tireName ? 'text.secondary' : 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, index)}
                            sx={{ p: 0.5, flexShrink: 0 }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Compact Info Row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                                Qty
                              </Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.813rem' }}>
                                {item.quantity}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                                Price
                              </Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.813rem' }}>
                                {item.itemType === 'DISCOUNT_PERCENTAGE'
                                  ? `${item.unitPrice}%`
                                  : formatCurrency(item.unitPrice)}
                              </Typography>
                            </Box>
                            {item.discountValue && item.discountValue > 0 && item.discountAmount && item.discountAmount > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                                  Disc
                                </Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.813rem', color: '#f44336' }}>
                                  {item.discountType === 'percentage'
                                    ? `${item.discountValue}%`
                                    : formatCurrency(item.discountAmount)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.688rem' }}>
                              Total
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                fontSize: '0.938rem',
                                color: item.itemType === 'DISCOUNT' || item.itemType === 'DISCOUNT_PERCENTAGE' ? '#f44336' : colors.primary.main
                              }}
                            >
                              {formatCurrency(item.total || (item.quantity * item.unitPrice))}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                // Desktop Table View
                <TableContainer sx={{
                  borderRadius: 2,
                  border: `1px solid ${colors.neutral[200]}`,
                  overflow: 'hidden'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: colors.neutral[100] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Discount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { background: colors.neutral[50] },
                            '&:last-child td': { border: 0 }
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={item.itemType}
                              size="small"
                              sx={{
                                background: item.itemType === 'TIRE'
                                  ? colors.tire?.new || colors.primary.main
                                  : item.itemType === 'DISCOUNT' || item.itemType === 'DISCOUNT_PERCENTAGE'
                                    ? '#f44336'
                                    : colors.service?.maintenance || colors.secondary.main,
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {(item as any).tireName && (
                              <Typography variant="body2" fontWeight="medium">
                                {(item as any).tireName}
                              </Typography>
                            )}
                            <Typography variant="body2" color={(item as any).tireName ? "text.secondary" : "inherit"}>
                              {item.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {item.itemType === 'DISCOUNT_PERCENTAGE'
                              ? `${item.unitPrice}%`
                              : formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {item.discountValue && item.discountValue > 0 ? (
                              item.discountType === 'percentage'
                                ? `${item.discountValue}% (${formatCurrency(item.discountAmount || 0)})`
                                : formatCurrency(item.discountAmount || 0)
                            ) : '-'}
                          </TableCell>
                          <TableCell align="right" sx={{
                            fontWeight: 600,
                            color: item.itemType === 'DISCOUNT' || item.itemType === 'DISCOUNT_PERCENTAGE' ? '#f44336' : 'inherit'
                          }}>
                            {formatCurrency(item.total || (item.quantity * item.unitPrice))}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Remove item">
                              <IconButton
                                size="small"
                                onClick={() => onRemoveItem(index)}
                                sx={{
                                  color: colors.semantic?.error || 'red',
                                  '&:hover': { background: 'rgba(255,0,0,0.1)' }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            )}

            {items.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No items added yet. Add items to create the invoice.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* THIRD ROW: Invoice Summary */}
      <Card sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.neutral[200]}`,
        background: `linear-gradient(135deg, ${colors.primary.main}05 0%, ${colors.primary.light}10 100%)`
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
            {!isMobile && <AttachMoneyIcon sx={{ color: colors.primary.main }} />}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600, color: colors.text.primary }}
            >
              Invoice Summary
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: isMobile ? '100%' : 400 }}>
            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Subtotal:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {formatCurrency(subtotal)}
              </Typography>
            </Box>
            
            {/* GST */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  GST:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={(formData.gstRate * 100).toFixed(1)}
                  onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) / 100 || 0 })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  sx={{ width: 100 }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {formatCurrency(gstAmount)}
              </Typography>
            </Box>
            
            {/* PST */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  PST:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={(formData.pstRate * 100).toFixed(1)}
                  onChange={(e) => setFormData({ ...formData, pstRate: parseFloat(e.target.value) / 100 || 0 })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                  sx={{ width: 100 }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {formatCurrency(pstAmount)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Total Tax */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Total Tax:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {formatCurrency(totalTax)}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Grand Total */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderRadius: 2,
              background: colors.primary.main + '10'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: colors.primary.main }}>
                Invoice Total:
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
                {formatCurrency(total)}
              </Typography>
            </Box>
          </Box>

          {items.length > 0 && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {items.length} item{items.length > 1 ? 's' : ''} added
            </Alert>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove Item</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InvoiceFormContent;