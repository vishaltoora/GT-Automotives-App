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
  Card,
  CardContent,
  Tooltip,
  InputAdornment,
  Typography,
  Autocomplete,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
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
import { colors } from '../../theme/colors';
import { ServiceDto } from '@gt-automotive/data';
import type { QuoteItem as QuotationItem } from '../../requests/quotation.requests';
import ServiceSelect from '../services/ServiceSelect';
import { PhoneInput } from '../common/PhoneInput';
import { NumberInput } from '../common';

/** The item type as it is stored on a quotation line item. */
type ItemTypeValue = QuotationItem['itemType'];

/**
 * The line item types offered in the pickers, in the order they appear. Shared
 * by the entry row and the in-row editor so both offer exactly the same set.
 */
const ITEM_TYPE_OPTIONS: {
  value: ItemTypeValue;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'TIRE',
    label: 'Tire',
    icon: <span style={{ fontSize: '18px' }}>🛞</span>,
  },
  { value: 'SERVICE', label: 'Service', icon: <BuildIcon fontSize="small" /> },
  { value: 'PART', label: 'Part', icon: <ExtensionIcon fontSize="small" /> },
  { value: 'OTHER', label: 'Other', icon: <CategoryIcon fontSize="small" /> },
  {
    value: 'LEVY',
    label: 'Levy',
    icon: <AccountBalanceIcon fontSize="small" />,
  },
];

const renderItemTypeOptions = () =>
  ITEM_TYPE_OPTIONS.map((option) => (
    <MenuItem key={option.value} value={option.value}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {option.icon}
        {option.label}
      </Box>
    </MenuItem>
  ));

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
    quotationDate: string;
  };
  setFormData: (data: any) => void;
  items: QuotationItem[];
  setItems: (items: QuotationItem[]) => void;
  newItem: QuotationItem;
  setNewItem: (item: QuotationItem) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  /** Apply an in-row edit. Only the changed fields are passed. */
  onUpdateItem: (index: number, changes: Partial<QuotationItem>) => void;
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
  onUpdateItem,
  onTireSelect,
  onServicesChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // In-row editing: the row at `inlineEditIndex` swaps its type, description,
  // qty and price cells for inputs backed by `inlineDraft`. Nothing reaches the
  // quote — or its totals — until Save.
  const [inlineEditIndex, setInlineEditIndex] = useState<number | null>(null);
  const [inlineDraft, setInlineDraft] = useState<{
    itemType: ItemTypeValue;
    description: string;
    quantity: number | '';
    unitPrice: number | '';
  } | null>(null);

  const cancelInlineEdit = () => {
    setInlineEditIndex(null);
    setInlineDraft(null);
  };

  const startInlineEdit = (index: number) => {
    const item = items[index];
    if (!item) return;
    setInlineEditIndex(index);
    setInlineDraft({
      itemType: item.itemType,
      description: item.description ?? '',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice),
    });
  };

  const isInlineDraftValid = () =>
    Boolean(
      inlineDraft &&
        inlineDraft.description.trim() &&
        Number(inlineDraft.quantity) > 0 &&
        Number(inlineDraft.unitPrice) > 0
    );

  const saveInlineEdit = () => {
    if (inlineEditIndex === null || !inlineDraft || !isInlineDraftValid())
      return;
    const item = items[inlineEditIndex];
    if (!item) return;

    const typeChanged = inlineDraft.itemType !== item.itemType;

    onUpdateItem(inlineEditIndex, {
      itemType: inlineDraft.itemType,
      description: inlineDraft.description.trim(),
      quantity: Number(inlineDraft.quantity),
      unitPrice: Number(inlineDraft.unitPrice),
      // A line that is no longer a tire (or no longer that service) must not
      // keep pointing at one — a stale link would quote against the wrong
      // record.
      ...(typeChanged
        ? { tireId: undefined, tireName: undefined, serviceId: undefined }
        : {}),
    } as Partial<QuotationItem>);
    cancelInlineEdit();
  };

  const handleInlineKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveInlineEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelInlineEdit();
    }
  };

  /**
   * Removing a row shifts every later index, so an in-progress edit would
   * silently start pointing at a different item. Drop it.
   */
  const handleRemoveItem = (index: number) => {
    cancelInlineEdit();
    onRemoveItem(index);
  };

  const handleServiceChange = (
    serviceId: string,
    serviceName: string,
    unitPrice: number
  ) => {
    setNewItem({
      ...newItem,
      itemType: 'SERVICE',
      description: serviceName,
      unitPrice: unitPrice,
      serviceId,
    });
  };

  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    );
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
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {!isMobile && <PersonIcon sx={{ mr: 1, color: colors.primary }} />}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              Customer Information
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={quotationForm.customerName}
                onChange={(e) =>
                  setQuotationForm({
                    ...quotationForm,
                    customerName: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Business Name (Optional)"
                value={quotationForm.businessName}
                onChange={(e) =>
                  setQuotationForm({
                    ...quotationForm,
                    businessName: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PhoneInput
                fullWidth
                value={quotationForm.phone}
                onChange={(value) =>
                  setQuotationForm({ ...quotationForm, phone: value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={quotationForm.email}
                onChange={(e) =>
                  setQuotationForm({ ...quotationForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={quotationForm.address}
                onChange={(e) =>
                  setQuotationForm({
                    ...quotationForm,
                    address: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Items */}
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {!isMobile && (
              <ShoppingCartIcon sx={{ mr: 1, color: colors.primary }} />
            )}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              Items
            </Typography>
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
                        unitPrice: 6.5,
                        tireId: undefined,
                        serviceId: undefined,
                      });
                    } else {
                      // Reset description and unitPrice when changing type
                      setNewItem({
                        ...newItem,
                        itemType: selectedType,
                        description: '',
                        unitPrice: '' as unknown as number,
                        tireId: undefined,
                        serviceId: undefined,
                      });
                    }
                  }}
                  label="Type"
                >
                  {renderItemTypeOptions()}
                </Select>
              </FormControl>
            </Grid>

            {newItem.itemType === 'TIRE' ? (
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete
                  options={tires}
                  value={tires.find((t) => t.id === newItem.tireId) || null}
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
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <span>{getTireEmoji(tire.type)}</span>
                        <Box>
                          {tire.name && (
                            <Typography variant="body2" fontWeight="medium">
                              {tire.name}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            color={tire.name ? 'text.secondary' : 'inherit'}
                          >
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
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 2 }}>
              <NumberInput
                fullWidth
                allowDecimals
                decimalPlaces={2}
                label="Quantity"
                value={newItem.quantity}
                onChange={(v) =>
                  setNewItem({
                    ...newItem,
                    quantity: (v ?? '') as unknown as number,
                  })
                }
                min={0}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <NumberInput
                fullWidth
                allowDecimals
                label="Unit Price"
                value={newItem.unitPrice}
                onChange={(v) =>
                  setNewItem({
                    ...newItem,
                    unitPrice: (v ?? '') as unknown as number,
                  })
                }
                min={0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
                autoComplete="off"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={onAddItem}
                startIcon={<AddIcon />}
                disabled={
                  !newItem.description ||
                  !newItem.quantity ||
                  !newItem.unitPrice
                }
                sx={{
                  height: '56px', // Match TextField height
                  color: 'white',
                  '&:hover': {
                    color: 'white',
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
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
                  {items.map((item, index) => {
                    const isRowEditing = inlineEditIndex === index;
                    const canSaveRow = isRowEditing && isInlineDraftValid();

                    return (
                      <TableRow
                        key={index}
                        sx={
                          isRowEditing
                            ? { background: 'rgba(0, 0, 0, 0.03)' }
                            : undefined
                        }
                      >
                        <TableCell>
                          {isRowEditing && inlineDraft ? (
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                              <Select
                                value={inlineDraft.itemType}
                                onChange={(e) =>
                                  setInlineDraft({
                                    ...inlineDraft,
                                    itemType: e.target.value as ItemTypeValue,
                                  })
                                }
                              >
                                {renderItemTypeOptions()}
                              </Select>
                            </FormControl>
                          ) : (
                            <>
                              {item.itemType === 'TIRE' && (
                                <InventoryIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5 }}
                                />
                              )}
                              {item.itemType === 'SERVICE' && (
                                <BuildIcon fontSize="small" sx={{ mr: 0.5 }} />
                              )}
                              {item.itemType.replace('_', ' ')}
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          {(item as any).tireName && (
                            <Typography variant="body2" fontWeight="medium">
                              {(item as any).tireName}
                            </Typography>
                          )}
                          {isRowEditing && inlineDraft ? (
                            <TextField
                              fullWidth
                              size="small"
                              autoFocus
                              value={inlineDraft.description}
                              onChange={(e) =>
                                setInlineDraft({
                                  ...inlineDraft,
                                  description: e.target.value,
                                })
                              }
                              onKeyDown={handleInlineKeyDown}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              color={
                                (item as any).tireName
                                  ? 'text.secondary'
                                  : 'inherit'
                              }
                            >
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {isRowEditing && inlineDraft ? (
                            <NumberInput
                              size="small"
                              allowDecimals
                              decimalPlaces={2}
                              value={inlineDraft.quantity}
                              onChange={(v) =>
                                setInlineDraft({
                                  ...inlineDraft,
                                  quantity: v ?? '',
                                })
                              }
                              onKeyDown={handleInlineKeyDown}
                              min={0}
                              sx={{ width: 90 }}
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {isRowEditing && inlineDraft ? (
                            <NumberInput
                              size="small"
                              allowDecimals
                              value={inlineDraft.unitPrice}
                              onChange={(v) =>
                                setInlineDraft({
                                  ...inlineDraft,
                                  unitPrice: v ?? '',
                                })
                              }
                              onKeyDown={handleInlineKeyDown}
                              min={0}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    $
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ width: 140 }}
                            />
                          ) : (
                            `$${Number(item.unitPrice).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell align="right">
                          $
                          {(isRowEditing && inlineDraft
                            ? Number(inlineDraft.quantity || 0) *
                              Number(inlineDraft.unitPrice || 0)
                            : Number(item.quantity) * Number(item.unitPrice)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          {isRowEditing ? (
                            <>
                              {/* span keeps the tooltip alive while the button
                                  is disabled */}
                              <Tooltip title="Save changes">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={saveInlineEdit}
                                    disabled={!canSaveRow}
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  size="small"
                                  onClick={cancelInlineEdit}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Edit Item">
                                <IconButton
                                  size="small"
                                  onClick={() => startInlineEdit(index)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Remove Item">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {!isMobile && (
              <DescriptionIcon sx={{ mr: 1, color: colors.primary }} />
            )}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              Additional Information
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <NumberInput
                fullWidth
                allowDecimals
                label="GST Rate (%)"
                value={Math.round((formData.gstRate || 0.05) * 100 * 100) / 100}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    gstRate: v === undefined ? 0.05 : v / 100,
                  })
                }
                min={0}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <NumberInput
                fullWidth
                allowDecimals
                label="PST Rate (%)"
                value={Math.round((formData.pstRate || 0.07) * 100 * 100) / 100}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    pstRate: v === undefined ? 0.07 : v / 100,
                  })
                }
                min={0}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'DRAFT'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
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
                label="Quotation Date"
                value={formData.quotationDate}
                onChange={(e) =>
                  setFormData({ ...formData, quotationDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Valid Until"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {!isMobile && (
              <AttachMoneyIcon sx={{ mr: 1, color: colors.primary }} />
            )}
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{ fontWeight: 600 }}
            >
              Totals
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              GST ({((formData.gstRate || 0.05) * 100).toFixed(0)}%): $
              {totals.gstAmount.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              PST ({((formData.pstRate || 0.07) * 100).toFixed(0)}%): $
              {totals.pstAmount.toFixed(2)}
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
