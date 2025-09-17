import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { invoiceService, InvoiceItem } from '../../services/invoice.service';
import { customerService } from '../../services/customer.service';
import { vehicleService } from '../../services/vehicle.service';
import TireService from '../../services/tire.service';
import { colors } from '../../theme/colors';
import { useAuth } from '../../hooks/useAuth';
import { InvoiceItemType } from '@gt-automotive/shared-dto';

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tires, setTires] = useState<any[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    businessName: '',
    address: '',
    phone: '',
    email: '',
  });
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    gstRate: 0.05, // 5% GST
    pstRate: 0.07, // 7% PST
    paymentMethod: '',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<InvoiceItem>({
    itemType: InvoiceItemType.SERVICE,
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.customerId) {
      loadCustomerVehicles(formData.customerId);
    }
  }, [formData.customerId]);

  const loadData = async () => {
    try {
      const [customersData, tiresResult] = await Promise.all([
        customerService.getCustomers(),
        TireService.getTires({ page: 1, limit: 100 }),
      ]);
      setCustomers(customersData);
      setTires(tiresResult.items || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadCustomerVehicles = async (customerId: string) => {
    try {
      const vehiclesData = await vehicleService.getCustomerVehicles(customerId);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]); // Set empty array on error
    }
  };

  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      setFormData({ ...formData, customerId: customer.id, vehicleId: '' });
      setCustomerForm({
        name: `${customer.user?.firstName || ''} ${customer.user?.lastName || ''}`.trim(),
        businessName: customer.businessName || '',
        address: customer.address || '',
        phone: customer.phone || '',
        email: customer.email || customer.user?.email || '',
      });
      setIsNewCustomer(false);
    } else {
      // Clear form for new customer
      setFormData({ ...formData, customerId: '', vehicleId: '' });
      setCustomerForm({
        name: '',
        businessName: '',
        address: '',
        phone: '',
        email: '',
      });
      setIsNewCustomer(true);
    }
  };

  const handleAddItem = () => {
    if (newItem.description && newItem.unitPrice > 0) {
      setItems([...items, { ...newItem, total: newItem.quantity * newItem.unitPrice }]);
      setNewItem({
        itemType: InvoiceItemType.SERVICE,
        description: '',
        quantity: 1,
        unitPrice: 0,
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleTireSelect = (tireId: string) => {
    const tire = tires.find(t => t.id === tireId);
    if (tire) {
      setNewItem({
        ...newItem,
        tireId: tire.id,
        itemType: InvoiceItemType.TIRE,
        description: `${tire.brand} - ${tire.size}`,
        unitPrice: parseFloat(tire.price),
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const gstAmount = subtotal * formData.gstRate;
    const pstAmount = subtotal * formData.pstRate;
    const totalTax = gstAmount + pstAmount;
    const total = subtotal + totalTax;
    return { subtotal, gstAmount, pstAmount, totalTax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerId = formData.customerId;

    // Validate customer information
    if (!customerId && (!customerForm.name || !customerForm.phone)) {
      alert('Please provide customer information (name and phone are required)');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item to the invoice');
      return;
    }

    try {
      const invoiceData: any = {
        items: items.map(({ itemType, description, quantity, unitPrice, tireId }) => {
          const item: any = {
            itemType,
            description,
            quantity,
            unitPrice,
          };
          // Only add tireId if it exists
          if (tireId) {
            item.tireId = tireId;
          }
          return item;
        }),
        taxRate: formData.gstRate + formData.pstRate, // Combined tax rate for backend
      };
      
      // Only add optional fields if they have values
      if (formData.paymentMethod) {
        invoiceData.paymentMethod = formData.paymentMethod;
      }
      if (formData.notes) {
        invoiceData.notes = formData.notes;
      }

      // Add customerId if we have an existing customer
      if (customerId) {
        invoiceData.customerId = customerId;
      } else if (customerForm.name && customerForm.phone) {
        // Send customer data for customer creation (regardless of isNewCustomer flag)
        invoiceData.customerData = {
          name: customerForm.name,
          phone: customerForm.phone,
        };
        // Only add optional fields if they have values
        if (customerForm.businessName) {
          invoiceData.customerData.businessName = customerForm.businessName;
        }
        if (customerForm.address) {
          invoiceData.customerData.address = customerForm.address;
        }
        if (customerForm.email) {
          invoiceData.customerData.email = customerForm.email;
        }
      }

      // Only add vehicleId if it exists
      if (formData.vehicleId) {
        invoiceData.vehicleId = formData.vehicleId;
      }


      // Validate that we have customer information
      if (!invoiceData.customerId && !invoiceData.customerData) {
        alert('Error: No customer information provided. Please select an existing customer or enter new customer details.');
        return;
      }

      const invoice = await invoiceService.createInvoice(invoiceData);
      const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
      navigate(`${basePath}/invoices/${invoice.id}`);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error creating invoice:', error);
        if (error.response?.data) {
          console.error('Error details:', error.response.data);
          console.error('Error message array:', error.response.data.message);
        }
      }
      if (error.response?.data) {
        const errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message || 'Unknown error';
        alert(`Error creating invoice: ${errorMessage}`);
      } else {
        alert('Error creating invoice');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const { subtotal, gstAmount, pstAmount, totalTax, total } = calculateTotals();

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
      background: colors.background.light,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: colors.gradients.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ReceiptIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: colors.primary.main }}>
              Create New Invoice
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 0.5 }}>
              Generate professional invoices for your customers
            </Typography>
          </Box>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
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
                          // User typed a new value
                          setIsNewCustomer(true);
                          setFormData({ ...formData, customerId: '', vehicleId: '' });
                          setCustomerForm({ ...customerForm, name: newValue });
                        } else {
                          handleCustomerSelect(newValue);
                        }
                      }}
                      onInputChange={(_, value) => {
                        if (!customers.some(c => 
                          `${c.user?.firstName} ${c.user?.lastName} - ${c.phone}` === value
                        )) {
                          setIsNewCustomer(true);
                          setFormData({ ...formData, customerId: '' });
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
                            // If editing manually and no customerId, mark as new customer
                            if (!formData.customerId) {
                              setIsNewCustomer(true);
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
                      <Grid size={12}>
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
                          onChange={(e) => {
                            setCustomerForm({ ...customerForm, phone: e.target.value });
                            // If editing manually and no customerId, mark as new customer
                            if (!formData.customerId) {
                              setIsNewCustomer(true);
                            }
                          }}
                          required
                          placeholder="(250) 555-0123"
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
                      rows={5}
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
          <Grid container>
            <Grid size={{ xs: 12 }}>
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
                            onChange={(e) => handleTireSelect(e.target.value)}
                            label="Select Tire"
                          >
                            {tires.filter(t => t.quantity > 0).map(tire => (
                              <MenuItem key={tire.id} value={tire.id}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                  <span>{tire.brand} - {tire.size}</span>
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
                        onClick={handleAddItem}
                        disabled={!newItem.description || newItem.unitPrice <= 0}
                        sx={{
                          background: colors.primary.main,
                          color: 'white',
                          '&:hover': { 
                            background: colors.primary.dark,
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                                  background: item.itemType === 'TIRE' ? colors.tire.new : colors.service.maintenance,
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
                                  onClick={() => handleRemoveItem(index)}
                                  sx={{ 
                                    color: colors.semantic.error,
                                    '&:hover': { background: colors.semantic.errorLight + '20' }
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
            </Grid>
          </Grid>
        </Box>

        {/* THIRD ROW: Invoice Summary - Full Width */}
        <Box>
          <Grid container>
            <Grid size={{ xs: 12 }}>
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

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        disabled={(!formData.customerId && (!customerForm.name || !customerForm.phone)) || items.length === 0}
                        sx={{
                          py: 1.5,
                          background: colors.primary.main,
                          color: 'white',
                          '&:hover': { 
                            background: colors.primary.dark,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                          },
                          '&:disabled': {
                            background: colors.neutral[300],
                            color: colors.neutral[500]
                          }
                        }}
                      >
                        Create Invoice
                      </Button>
                      
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
                          navigate(`${basePath}/invoices`);
                        }}
                        sx={{
                          borderColor: colors.neutral[400],
                          color: colors.text.secondary,
                          '&:hover': { 
                            borderColor: colors.neutral[600],
                            background: colors.neutral[50]
                          }
                        }}
                      >
                        Cancel
                      </Button>

                      {items.length > 0 && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          {items.length} item{items.length > 1 ? 's' : ''} added
                        </Alert>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Box>
  );
};

export default InvoiceForm;