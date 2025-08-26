import React from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { InvoiceItem } from '../../services/invoice.service';
import { colors } from '../../theme/colors';

interface InvoiceFormContentProps {
  customers: any[];
  vehicles: any[];
  tires: any[];
  isNewCustomer: boolean;
  customerForm: {
    name: string;
    businessName: string;
    address: string;
    phone: string;
    email: string;
  };
  setCustomerForm: (form: any) => void;
  formData: {
    customerId: string;
    vehicleId: string;
    gstRate: number;
    pstRate: number;
    paymentMethod: string;
    notes: string;
    status: string;
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
}

const InvoiceFormContent: React.FC<InvoiceFormContentProps> = ({
  customers,
  vehicles,
  tires,
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
}) => {

  const formatTireType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
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
    <Box sx={{ p: 3 }}>
      {/* TOP ROW: Customer Information & Payment/Notes */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
              minHeight: 280
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: colors.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                      Customer Information
                    </Typography>
                  </Box>
                  <Chip 
                    label={isNewCustomer ? "New Customer" : "Existing Customer"} 
                    color={isNewCustomer ? "success" : "primary"}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Customer Search */}
                  <Autocomplete
                    freeSolo
                    options={customers}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return `${option.user?.firstName} ${option.user?.lastName} - ${option.phone}`;
                    }}
                    value={customers.find(c => c.id === formData.customerId) || null}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        // User typed a new name directly
                        setCustomerForm({ ...customerForm, name: newValue });
                        setFormData({ ...formData, customerId: '' }); // Clear customerId
                        // Signal that this is a new customer
                        onCustomerSelect(null);
                      } else {
                        onCustomerSelect(newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Search or Add Customer" 
                        placeholder="Type to search or enter new customer name"
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
                        label="Customer Name"
                        value={customerForm.name}
                        onChange={(e) => {
                          setCustomerForm({ ...customerForm, name: e.target.value });
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
                        label="Business Name"
                        value={customerForm.businessName}
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
                        onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                        placeholder="Street address, city, province, postal code"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Phone Number"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        placeholder="(250) 555-0123 (Optional)"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email"
                        type="email"
                        value={customerForm.email}
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
              minHeight: 280
            }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PaymentIcon sx={{ color: colors.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                    Payment & Notes
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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

                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
      <Box sx={{ mb: 3 }}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${colors.neutral[200]}`
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ShoppingCartIcon sx={{ color: colors.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
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
                      onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value as any })}
                      label="Type"
                    >
                      <MenuItem value="TIRE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InventoryIcon fontSize="small" />
                          Tire
                        </Box>
                      </MenuItem>
                      <MenuItem value="SERVICE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BuildIcon fontSize="small" />
                          Service
                        </Box>
                      </MenuItem>
                      <MenuItem value="PART">Part</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {newItem.itemType === 'TIRE' ? (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Tire</InputLabel>
                      <Select
                        value={newItem.tireId || ''}
                        onChange={(e) => onTireSelect(e.target.value)}
                        label="Select Tire"
                      >
                        {tires.filter(t => t.quantity > 0).map(tire => (
                          <MenuItem key={tire.id} value={tire.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span>{tire.brand} {formatTireType(tire.type)} - {tire.size}</span>
                              <Chip 
                                label={`Stock: ${tire.quantity}`} 
                                size="small" 
                                color={tire.quantity < 5 ? 'warning' : 'success'}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Enter item description"
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
                    label="Unit Price"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAddItem}
                    disabled={!newItem.description || newItem.unitPrice <= 0}
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

            {/* Items Table */}
            {items.length > 0 && (
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
                              background: item.itemType === 'TIRE' ? colors.tire?.new || colors.primary.main : colors.service?.maintenance || colors.secondary.main,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(item.quantity * item.unitPrice)}
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AttachMoneyIcon sx={{ color: colors.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
              Invoice Summary
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
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
    </Box>
  );
};

export default InvoiceFormContent;