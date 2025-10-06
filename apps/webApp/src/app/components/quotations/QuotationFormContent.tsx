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
  Card,
  CardContent,
  Tooltip,
  InputAdornment,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Extension as ExtensionIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
// Define QuotationItem type locally to avoid import issues
type QuotationItem = {
  id?: string;
  itemType: 'TIRE' | 'SERVICE' | 'PART' | 'OTHER' | 'LEVY';
  description: string;
  quantity: number;
  unitPrice: number;
  tireId?: string;
  serviceId?: string;
  total?: number;
};
import { colors } from '../../theme/colors';
import { ServiceDto } from '@gt-automotive/data';
import ServiceSelect from '../services/ServiceSelect';
import { PhoneInput } from '../common/PhoneInput';

interface QuotationFormContentProps {
  tires: any[];
  services: ServiceDto[];
  quotationForm: {
    customerName: string;
    businessName: string;
    address: string;
    phone: string;
    email: string;
  };
  setQuotationForm: (form: any) => void;
  formData: {
    gstRate: number;
    pstRate: number;
    notes: string;
    status: string;
    validUntil: string;
  };
  setFormData: (data: any) => void;
  items: QuotationItem[];
  setItems: (items: QuotationItem[]) => void;
  newItem: QuotationItem;
  setNewItem: (item: QuotationItem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onTireSelect: (tireId: string) => void;
  onServicesChange: () => void;
}

const QuotationFormContent: React.FC<QuotationFormContentProps> = ({
  tires,
  services,
  quotationForm,
  setQuotationForm,
  formData,
  setFormData,
  items,
  setItems,
  newItem,
  setNewItem,
  onAddItem,
  onRemoveItem,
  onTireSelect,
  onServicesChange,
}) => {

  const handleServiceChange = (serviceId: string, serviceName: string, unitPrice: number) => {
    setNewItem({
      ...newItem,
      itemType: 'SERVICE',
      description: serviceName,
      unitPrice: unitPrice,
      serviceId,
    });
  };


  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * Number(item.unitPrice)), 0);
    const gstAmount = subtotal * (formData.gstRate || 0.05);
    const pstAmount = subtotal * (formData.pstRate || 0.07);
    const total = subtotal + gstAmount + pstAmount;
    return { subtotal, gstAmount, pstAmount, total };
  };

  const totals = calculateTotals();

  const getTireEmoji = (type: string) => {
    switch (type) {
      case 'ALL_SEASON':
        return '🌤️';
      case 'WINTER':
        return '❄️';
      case 'SUMMER':
        return '☀️';
      case 'PERFORMANCE':
        return '🏎️';
      case 'OFF_ROAD':
        return '🏔️';
      case 'RUN_FLAT':
        return '🛡️';
      default:
        return '🚗';
    }
  };

  // Set default valid until date (30 days from now) if not set
  React.useEffect(() => {
    if (!formData.validUntil) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      setFormData({
        ...formData,
        validUntil: thirtyDaysFromNow.toISOString().split('T')[0],
      });
    }
  }, []);

  return (
    <>
      {/* Customer Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: colors.primary }} />
            <Typography variant="h6">Customer Information</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={quotationForm.customerName}
                onChange={(e) => setQuotationForm({ ...quotationForm, customerName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Business Name (Optional)"
                value={quotationForm.businessName}
                onChange={(e) => setQuotationForm({ ...quotationForm, businessName: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PhoneInput
                fullWidth
                value={quotationForm.phone}
                onChange={(value) => setQuotationForm({ ...quotationForm, phone: value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={quotationForm.email}
                onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={quotationForm.address}
                onChange={(e) => setQuotationForm({ ...quotationForm, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      {/* Add Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCartIcon sx={{ mr: 1, color: colors.primary }} />
            <Typography variant="h6">Items</Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
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
                </Select>
              </FormControl>
            </Grid>

            {newItem.itemType === 'TIRE' ? (
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  options={tires}
                  value={tires.find(t => t.id === newItem.tireId) || null}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      onTireSelect(newValue.id);
                    }
                  }}
                  getOptionLabel={(tire) => {
                    const name = tire.name || '';
                    const details = `${tire.brand} - ${tire.size}`;
                    return name ? `${name} - ${details}` : details;
                  }}
                  renderOption={(props, tire) => (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getTireEmoji(tire.type)}</span>
                        <Box>
                          {tire.name && (
                            <Typography variant="body2" fontWeight="medium">
                              {tire.name}
                            </Typography>
                          )}
                          <Typography variant="body2" color={tire.name ? "text.secondary" : "inherit"}>
                            {tire.brand} - {tire.size}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Tire"
                      placeholder="Type to search..."
                    />
                  )}
                  fullWidth
                />
              </Grid>
            ) : newItem.itemType === 'SERVICE' ? (
              <Grid size={{ xs: 12, md: 3 }}>
                <ServiceSelect
                  services={services}
                  value={(newItem as any).serviceId}
                  onChange={handleServiceChange}
                  onServicesChange={onServicesChange}
                />
              </Grid>
            ) : (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Unit Price"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={onAddItem}
                startIcon={<AddIcon />}
                disabled={!newItem.description || !newItem.quantity || !newItem.unitPrice}
                sx={{ 
                  height: '56px', // Match TextField height
                  color: 'white',
                  '&:hover': {
                    color: 'white',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                Add Item
              </Button>
            </Grid>
          </Grid>

          {items.length > 0 && (
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.itemType === 'TIRE' && <InventoryIcon fontSize="small" sx={{ mr: 0.5 }} />}
                        {item.itemType === 'SERVICE' && <BuildIcon fontSize="small" sx={{ mr: 0.5 }} />}
                        {item.itemType.replace('_', ' ')}
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
                      <TableCell align="right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                      <TableCell align="right">${(item.quantity * Number(item.unitPrice)).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove Item">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onRemoveItem(index)}
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
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionIcon sx={{ mr: 1, color: colors.primary }} />
            <Typography variant="h6">Additional Information</Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="GST Rate (%)"
                value={Math.round((formData.gstRate || 0.05) * 100 * 100) / 100}
                onChange={(e) => setFormData({ ...formData, gstRate: parseFloat(e.target.value) / 100 || 0.05 })}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="PST Rate (%)"
                value={Math.round((formData.pstRate || 0.07) * 100 * 100) / 100}
                onChange={(e) => setFormData({ ...formData, pstRate: parseFloat(e.target.value) / 100 || 0.07 })}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'DRAFT'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SENT">Sent</MenuItem>
                  <MenuItem value="ACCEPTED">Accepted</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="EXPIRED">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Valid Until"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AttachMoneyIcon sx={{ mr: 1, color: colors.primary }} />
            <Typography variant="h6">Totals</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              GST ({((formData.gstRate || 0.05) * 100).toFixed(0)}%): ${totals.gstAmount.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              PST ({((formData.pstRate || 0.07) * 100).toFixed(0)}%): ${totals.pstAmount.toFixed(2)}
            </Typography>
            <Divider sx={{ width: 150, my: 1 }} />
            <Typography variant="h6" color="primary">
              Total: ${totals.total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
};

export default QuotationFormContent;