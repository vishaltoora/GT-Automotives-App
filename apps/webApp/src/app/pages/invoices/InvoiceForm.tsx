import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { invoiceService, InvoiceItem } from '../../services/invoice.service';
import { customerService } from '../../services/customer.service';
import { vehicleService } from '../../services/vehicle.service';
import TireService from '../../services/tire.service';

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tires, setTires] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    taxRate: 0.0825,
    paymentMethod: '',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<InvoiceItem>({
    itemType: 'SERVICE',
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
        TireService.getTires(),
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

  const handleAddItem = () => {
    if (newItem.description && newItem.unitPrice > 0) {
      setItems([...items, { ...newItem, total: newItem.quantity * newItem.unitPrice }]);
      setNewItem({
        itemType: 'SERVICE',
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
        itemType: 'TIRE',
        description: `${tire.brand} ${tire.model} ${tire.size}`,
        unitPrice: parseFloat(tire.price),
      });
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * formData.taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || items.length === 0) {
      alert('Please select a customer and add at least one item');
      return;
    }

    try {
      const invoiceData = {
        customerId: formData.customerId,
        vehicleId: formData.vehicleId || undefined,
        items: items.map(({ itemType, description, quantity, unitPrice, tireId }) => ({
          itemType,
          description,
          quantity,
          unitPrice,
          tireId,
        })),
        taxRate: formData.taxRate,
        paymentMethod: formData.paymentMethod || undefined,
        notes: formData.notes || undefined,
      };

      const invoice = await invoiceService.createInvoice(invoiceData as any);
      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          New Invoice
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.user?.firstName} ${option.user?.lastName} - ${option.phone}`}
                value={customers.find(c => c.id === formData.customerId) || null}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, customerId: newValue?.id || '', vehicleId: '' });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Customer" required />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle (Optional)</InputLabel>
                <Select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  label="Vehicle (Optional)"
                  disabled={!formData.customerId}
                >
                  <MenuItem value="">None</MenuItem>
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate || vehicle.vin}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newItem.itemType}
                      onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value as any })}
                      label="Type"
                    >
                      <MenuItem value="TIRE">Tire</MenuItem>
                      <MenuItem value="SERVICE">Service</MenuItem>
                      <MenuItem value="PART">Part</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {newItem.itemType === 'TIRE' ? (
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Tire</InputLabel>
                      <Select
                        value={newItem.tireId || ''}
                        onChange={(e) => handleTireSelect(e.target.value)}
                        label="Select Tire"
                      >
                        {tires.filter(t => t.quantity > 0).map(tire => (
                          <MenuItem key={tire.id} value={tire.id}>
                            {tire.brand} {tire.model} {tire.size} (Stock: {tire.quantity})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ) : (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={2}>
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

                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Unit Price"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    disabled={!newItem.description || newItem.unitPrice <= 0}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemType}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No items added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1">Subtotal: {formatCurrency(subtotal)}</Typography>
                <Typography variant="body1">
                  Tax ({(formData.taxRate * 100).toFixed(2)}%): {formatCurrency(taxAmount)}
                </Typography>
                <Typography variant="h6">Total: {formatCurrency(total)}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method (Optional)</InputLabel>
                <Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  label="Payment Method (Optional)"
                >
                  <MenuItem value="">Pending</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                  <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                  <MenuItem value="CHECK">Check</MenuItem>
                  <MenuItem value="E_TRANSFER">E-Transfer</MenuItem>
                  <MenuItem value="FINANCING">Financing</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/invoices')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={!formData.customerId || items.length === 0}
                >
                  Create Invoice
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default InvoiceForm;