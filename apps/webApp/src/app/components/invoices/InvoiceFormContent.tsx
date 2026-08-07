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
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
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
  VolunteerActivism as TipsIcon,
} from '@mui/icons-material';
import { InvoiceItem } from '../../requests/invoice.requests';
import { Company } from '../../requests/company.requests';
import { ServiceDto } from '@gt-automotive/data';
import { InvoiceItemType } from '../../../enums';
import { PAYMENT_METHOD_SELECT_OPTIONS } from '../../constants/payment-methods';
import { colors } from '../../theme/colors';
import ServiceSelect from '../services/ServiceSelect';
import { PhoneInput } from '../common/PhoneInput';
import { NumberInput } from '../common';

/** The item type as it is stored on a line item. */
type ItemTypeValue = InvoiceItem['itemType'];

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
  {
    value: 'SERVICE',
    label: 'Service',
    icon: <BuildIcon fontSize="small" />,
  },
  {
    value: 'PART',
    label: 'Part',
    icon: <ExtensionIcon fontSize="small" />,
  },
  {
    value: 'OTHER',
    label: 'Other',
    icon: <CategoryIcon fontSize="small" />,
  },
  {
    value: 'LEVY',
    label: 'Levy',
    icon: <AccountBalanceIcon fontSize="small" />,
  },
  {
    value: 'DISCOUNT',
    label: '$ Discount',
    icon: <AttachMoneyIcon fontSize="small" sx={{ color: 'red' }} />,
  },
  {
    value: 'DISCOUNT_PERCENTAGE',
    label: '% Discount',
    icon: <AttachMoneyIcon fontSize="small" sx={{ color: 'red' }} />,
  },
  {
    value: 'TIPS',
    label: 'Tips',
    icon: <TipsIcon fontSize="small" sx={{ color: 'green' }} />,
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
    // Work the customer was offered and declined. Never billed and never part of
    // any total — kept as plain descriptions so it can't read like a charge.
    declinedItems: string[];
  };
  setFormData: (data: any) => void;
  items: InvoiceItem[];
  setItems: (items: InvoiceItem[]) => void;
  newItem: InvoiceItem;
  setNewItem: (item: InvoiceItem) => void;
  onCustomerSelect: (customer: any) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  /**
   * Apply an in-row edit. Only the changed fields are passed; the caller
   * re-derives totals and discount fields from the merged item.
   */
  onUpdateItem: (index: number, changes: Partial<InvoiceItem>) => void;
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
  onUpdateItem,
  onTireSelect,
  onServicesChange,
  isEditMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItemIndex, setMenuItemIndex] = useState<number | null>(null);

  // In-row editing: the row at `inlineEditIndex` swaps its description, qty and
  // price cells for inputs backed by `inlineDraft`. The draft is kept separate
  // from the item so a half-typed value never reaches the totals — nothing is
  // committed until Save.
  const [inlineEditIndex, setInlineEditIndex] = useState<number | null>(null);
  const [inlineDraft, setInlineDraft] = useState<{
    itemType: ItemTypeValue;
    description: string;
    quantity: number | '';
    unitPrice: number | '';
  } | null>(null);

  const formatTireType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuItemIndex(index);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuItemIndex(null);
  };

  const cancelInlineEdit = () => {
    setInlineEditIndex(null);
    setInlineDraft(null);
  };

  /**
   * A fixed discount is stored negative but is far easier to edit as a positive
   * amount, so the draft always holds the magnitude and the sign is restored on
   * save.
   */
  const startInlineEdit = (index: number) => {
    const item = items[index];
    if (!item) return;
    setInlineEditIndex(index);
    setInlineDraft({
      itemType: item.itemType,
      description: item.description ?? '',
      quantity: item.quantity ?? 1,
      unitPrice:
        item.itemType === 'DISCOUNT'
          ? Math.abs(item.unitPrice)
          : item.unitPrice,
    });
  };

  /**
   * Switching type in the editor keeps what has already been typed — the point
   * of an in-row type change is to re-file a line, not to retype it. Only the
   * values the new type cannot carry are adjusted: TIPS is always a single
   * unit.
   */
  const changeInlineType = (itemType: ItemTypeValue) => {
    if (!inlineDraft) return;
    setInlineDraft({
      ...inlineDraft,
      itemType,
      quantity: itemType === 'TIPS' ? 1 : inlineDraft.quantity,
    });
  };

  /** Same rules the entry row enforces, so a row cannot be edited into a state
   *  that would have been rejected when it was added. */
  const isInlineDraftValid = () => {
    if (!inlineDraft) return false;
    const price = Number(inlineDraft.unitPrice);
    const quantity = Number(inlineDraft.quantity);

    if (!inlineDraft.description.trim()) return false;
    if (inlineDraft.unitPrice === '' || Number.isNaN(price)) return false;
    if (inlineDraft.itemType !== 'TIPS' && quantity <= 0) return false;

    if (inlineDraft.itemType === 'DISCOUNT_PERCENTAGE') {
      return price > 0 && price <= 100;
    }
    return price > 0;
  };

  const saveInlineEdit = () => {
    if (inlineEditIndex === null || !inlineDraft) return;
    const item = items[inlineEditIndex];
    if (!item || !isInlineDraftValid()) return;

    const price = Number(inlineDraft.unitPrice);
    const typeChanged = inlineDraft.itemType !== item.itemType;

    onUpdateItem(inlineEditIndex, {
      itemType: inlineDraft.itemType,
      description: inlineDraft.description.trim(),
      quantity: Number(inlineDraft.quantity) || 1,
      unitPrice: inlineDraft.itemType === 'DISCOUNT' ? -Math.abs(price) : price,
      // A line that is no longer a tire (or no longer that service) must not
      // keep pointing at one — the link drives inventory and reporting, and a
      // stale one would bill against the wrong record.
      ...(typeChanged
        ? { tireId: undefined, tireName: undefined, serviceId: undefined }
        : {}),
    });
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

  const handleMenuDelete = () => {
    if (menuItemIndex !== null) {
      handleRemoveItem(menuItemIndex);
      handleMenuClose();
    }
  };

  const handleMenuEdit = () => {
    if (menuItemIndex !== null) {
      startInlineEdit(menuItemIndex);
      handleMenuClose();
    }
  };

  /** The line total a row would have if the in-progress edit were saved. */
  const getDraftLineTotal = (item: InvoiceItem): number => {
    if (!inlineDraft) return getLineTotal(item);
    const price = Number(inlineDraft.unitPrice) || 0;
    return getLineTotal({
      ...item,
      itemType: inlineDraft.itemType,
      quantity: Number(inlineDraft.quantity) || 0,
      unitPrice: inlineDraft.itemType === 'DISCOUNT' ? -Math.abs(price) : price,
    });
  };

  const handleServiceChange = (
    serviceId: string,
    serviceName: string,
    unitPrice: number
  ) => {
    setNewItem({
      ...newItem,
      itemType: InvoiceItemType.SERVICE,
      description: serviceName,
      unitPrice: unitPrice,
      serviceId,
    });
  };

  // Signed line total for an item. Discounts always reduce the invoice:
  //  - DISCOUNT: -abs(qty * unitPrice) (unitPrice may be stored negative for
  //    manual entries or positive for auto-applied ones).
  //  - DISCOUNT_PERCENTAGE: percentage applied to the non-discount, non-tip
  //    items (unitPrice holds the raw percentage, e.g. 10 for 10%).
  const getLineTotal = (item: InvoiceItem): number => {
    if (item.itemType === 'DISCOUNT') {
      return -Math.abs(Number(item.quantity) * item.unitPrice);
    }
    if (item.itemType === 'DISCOUNT_PERCENTAGE') {
      if (!item.unitPrice) return 0;
      const otherItemsSubtotal = items
        .filter(
          (i) =>
            i.itemType !== 'DISCOUNT' &&
            i.itemType !== 'DISCOUNT_PERCENTAGE' &&
            i.itemType !== 'TIPS'
        )
        .reduce((s, i) => s + Number(i.quantity) * i.unitPrice, 0);
      return -(otherItemsSubtotal * item.unitPrice) / 100;
    }
    return Number(item.quantity) * item.unitPrice;
  };

  const calculateTotals = () => {
    // Calculate subtotal including discount items (which have negative values)
    // TIPS are included in subtotal but NOT taxed
    let taxableSubtotal = 0;
    let tipsTotal = 0;

    const subtotal = items.reduce((sum, item) => {
      const itemTotal = getLineTotal(item);

      // Track tips separately (not taxed)
      if (item.itemType === 'TIPS') {
        tipsTotal += itemTotal;
      } else {
        taxableSubtotal += itemTotal;
      }

      return sum + itemTotal;
    }, 0);

    // Apply taxes only to taxable subtotal (excludes TIPS)
    const gstAmount = taxableSubtotal * formData.gstRate;
    const pstAmount = taxableSubtotal * formData.pstRate;
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

  const { subtotal, gstAmount, pstAmount, total } = calculateTotals();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* COMPANY SELECTION */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
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
                onChange={(e) =>
                  setFormData({ ...formData, companyId: e.target.value })
                }
                label="Select Company"
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.light,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary.main,
                  },
                }}
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    <Box>
                      <Typography variant="body1">
                        {company.name.replace(/[()]/g, '')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {company.registrationNumber}{' '}
                        {company.businessType && `• ${company.businessType}`}
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
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: `1px solid ${colors.neutral[200]}`,
                height: '100%',
                minHeight: isMobile ? 'auto' : 280,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  {!isMobile && (
                    <PersonIcon sx={{ color: colors.primary.main }} />
                  )}
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    Customer Information
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {option.phone}{' '}
                              {option.email && `• ${option.email}`}
                            </Typography>
                          )}
                        </Box>
                      </li>
                    )}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    filterOptions={(options, state) => {
                      const inputValue = state.inputValue.toLowerCase().trim();

                      if (!inputValue) {
                        return options;
                      }

                      return options.filter((option) => {
                        const fullName =
                          `${option.firstName} ${option.lastName}`.toLowerCase();
                        const phone = (option.phone || '').toLowerCase();
                        const email = (option.email || '').toLowerCase();
                        return (
                          fullName.includes(inputValue) ||
                          phone.includes(inputValue) ||
                          email.includes(inputValue)
                        );
                      });
                    }}
                    value={
                      customers.find((c) => c.id === formData.customerId) ||
                      null
                    }
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        const searchTerm = newValue.trim().toLowerCase();

                        const matchingCustomer = customers.find((c) => {
                          const fullName =
                            `${c.firstName} ${c.lastName}`.toLowerCase();
                          const firstName = c.firstName.toLowerCase();
                          const lastName = c.lastName.toLowerCase();
                          const phone = (c.phone || '').toLowerCase();
                          const email = (c.email || '').toLowerCase();

                          return (
                            fullName === searchTerm ||
                            firstName === searchTerm ||
                            lastName === searchTerm ||
                            phone === searchTerm ||
                            email === searchTerm ||
                            (searchTerm.includes(' ') &&
                              fullName.includes(searchTerm))
                          );
                        });

                        if (matchingCustomer) {
                          onCustomerSelect(matchingCustomer);
                        } else {
                          const nameParts = newValue.trim().split(' ');
                          const firstName = nameParts[0] || '';
                          const lastName = nameParts.slice(1).join(' ') || '';
                          setCustomerForm({
                            ...customerForm,
                            firstName,
                            lastName,
                          });
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
                            '&:hover fieldset': {
                              borderColor: colors.primary.light,
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: colors.primary.main,
                            },
                          },
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
                          setCustomerForm({
                            ...customerForm,
                            firstName: e.target.value,
                          });
                          // If user types in the name field and there's no customer selected, mark as new customer
                          if (!formData.customerId) {
                            onCustomerSelect(null);
                          }
                        }}
                        required
                        InputProps={{
                          startAdornment: (
                            <PersonIcon
                              sx={{
                                color: colors.text.secondary,
                                mr: 1,
                                fontSize: 20,
                              }}
                            />
                          ),
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
                          setCustomerForm({
                            ...customerForm,
                            lastName: e.target.value,
                          });
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
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            businessName: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            address: e.target.value,
                          })
                        }
                        placeholder="Street address, city, province, postal code"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <PhoneInput
                        fullWidth
                        size="small"
                        value={customerForm.phone}
                        disabled={isEditMode}
                        onChange={(value) =>
                          setCustomerForm({ ...customerForm, phone: value })
                        }
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
                        onChange={(e) =>
                          setCustomerForm({
                            ...customerForm,
                            email: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicleId: e.target.value,
                          })
                        }
                        label="Vehicle (Optional)"
                        startAdornment={
                          <CarIcon
                            sx={{ color: colors.text.secondary, ml: 1, mr: 1 }}
                          />
                        }
                      >
                        <MenuItem value="">No Vehicle</MenuItem>
                        {vehicles.map((vehicle) => (
                          <MenuItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.make} {vehicle.model} -{' '}
                            {vehicle.licensePlate || vehicle.vin}
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
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: `1px solid ${colors.neutral[200]}`,
                height: '100%',
                minHeight: isMobile ? 'auto' : 280,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  {!isMobile && (
                    <PaymentIcon sx={{ color: colors.primary.main }} />
                  )}
                  <Typography
                    variant={isMobile ? 'subtitle1' : 'h6'}
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    Payment & Notes
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value })
                          }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            invoiceDate: e.target.value,
                          })
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: colors.primary.light,
                            },
                          },
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
                        // "Cash (no Tax)" is an untaxed cash sale: zero GST/PST.
                        // "Cash (with Tax)" and every other method keep tax —
                        // restore default rates (5% GST, 7% PST) when switching
                        // away from the untaxed cash option.
                        if (paymentMethod === 'CASH_NO_TAX') {
                          setFormData({
                            ...formData,
                            paymentMethod,
                            gstRate: 0,
                            pstRate: 0,
                          });
                        } else if (formData.paymentMethod === 'CASH_NO_TAX') {
                          setFormData({
                            ...formData,
                            paymentMethod,
                            gstRate: 0.05,
                            pstRate: 0.07,
                          });
                        } else {
                          setFormData({ ...formData, paymentMethod });
                        }
                      }}
                      label="Payment Method"
                    >
                      <MenuItem value="">Pending Payment</MenuItem>
                      {PAYMENT_METHOD_SELECT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Invoice Notes (Optional)"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add any special instructions or notes for this invoice..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: colors.primary.light,
                        },
                      },
                    }}
                  />

                  {/* Declined work. Available on every invoice, not just those
                      generated from a repair order — a walk-in who turns down a
                      recommendation should be recorded the same way. */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Declined Services &amp; Parts (Optional)
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            declinedItems: [...formData.declinedItems, ''],
                          })
                        }
                      >
                        Add
                      </Button>
                    </Box>

                    {formData.declinedItems.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Anything the customer was offered and turned down.
                        Printed on the invoice, never charged.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {formData.declinedItems.map((description, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              gap: 1,
                              alignItems: 'center',
                            }}
                          >
                            <TextField
                              fullWidth
                              size="small"
                              value={description}
                              placeholder="e.g. Rear brake pads"
                              onChange={(e) => {
                                const next = [...formData.declinedItems];
                                next[index] = e.target.value;
                                setFormData({
                                  ...formData,
                                  declinedItems: next,
                                });
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  declinedItems: formData.declinedItems.filter(
                                    (_, i) => i !== index
                                  ),
                                })
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>

                  {formData.paymentMethod && (
                    <Alert severity="info" sx={{ mt: 'auto' }}>
                      Payment Method:{' '}
                      <strong>
                        {formData.paymentMethod.replace(/_/g, ' ')}
                      </strong>
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
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: { xs: 2, sm: 3 },
              }}
            >
              {!isMobile && (
                <ShoppingCartIcon sx={{ color: colors.primary.main }} />
              )}
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{ fontWeight: 600, color: colors.text.primary }}
              >
                Invoice Items
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: colors.neutral[50],
                border: `1px solid ${colors.neutral[200]}`,
                mb: 3,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid
                  size={{ xs: 12, md: newItem.itemType === 'TIPS' ? 4 : 2 }}
                >
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
                            unitPrice: 6.5,
                            tireId: undefined,
                            serviceId: undefined,
                          });
                        } else if (selectedType === 'TIPS') {
                          // Auto-fill for TIPS - set quantity to 1
                          setNewItem({
                            ...newItem,
                            itemType: selectedType,
                            description: 'Tips',
                            quantity: 1,
                            unitPrice: '' as unknown as number,
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

                {/* Description/Selection field - hidden for TIPS */}
                {newItem.itemType === 'TIPS' ? null : newItem.itemType ===
                  'TIRE' ? (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Autocomplete
                      options={tires.filter((t) => t.quantity > 0)}
                      value={tires.find((t) => t.id === newItem.tireId) || null}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          onTireSelect(newValue.id);
                        }
                      }}
                      getOptionLabel={(tire) => {
                        const name = tire.name || '';
                        const details = `${tire.brand} ${formatTireType(
                          tire.type
                        )} - ${tire.size}`;
                        return name ? `${name} - ${details}` : details;
                      }}
                      renderOption={(props, tire) => {
                        const { key, ...otherProps } = props;
                        return (
                          <Box component="li" key={key} {...otherProps}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                              <Box>
                                {tire.name && (
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                  >
                                    {tire.name}
                                  </Typography>
                                )}
                                <Typography
                                  variant="body2"
                                  color={
                                    tire.name ? 'text.secondary' : 'inherit'
                                  }
                                >
                                  {tire.brand} {formatTireType(tire.type)} -{' '}
                                  {tire.size}
                                </Typography>
                              </Box>
                              <Chip
                                label={`Stock: ${tire.quantity}`}
                                size="small"
                                color={
                                  tire.quantity < 5 ? 'warning' : 'success'
                                }
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          </Box>
                        );
                      }}
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
                      size="small"
                    />
                  </Grid>
                ) : (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      placeholder={
                        newItem.itemType === 'DISCOUNT' ||
                        newItem.itemType === 'DISCOUNT_PERCENTAGE'
                          ? 'e.g., Holiday discount, Loyalty discount...'
                          : 'Enter item description'
                      }
                    />
                  </Grid>
                )}

                {/* Quantity field - hidden for TIPS */}
                {newItem.itemType !== 'TIPS' && (
                  <Grid size={{ xs: 6, md: 2 }}>
                    <NumberInput
                      fullWidth
                      size="small"
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
                )}

                <Grid
                  size={{
                    xs: newItem.itemType === 'TIPS' ? 12 : 6,
                    md: newItem.itemType === 'TIPS' ? 6 : 2,
                  }}
                >
                  <NumberInput
                    fullWidth
                    size="small"
                    allowDecimals
                    label={
                      newItem.itemType === 'DISCOUNT'
                        ? 'Discount Amount'
                        : newItem.itemType === 'DISCOUNT_PERCENTAGE'
                        ? 'Discount Percentage'
                        : newItem.itemType === 'TIPS'
                        ? 'Tips Amount'
                        : 'Unit Price'
                    }
                    value={
                      newItem.itemType === 'DISCOUNT'
                        ? newItem.unitPrice
                          ? Math.abs(newItem.unitPrice)
                          : ''
                        : newItem.unitPrice
                    }
                    onChange={(v) => {
                      // Allow empty for clearing the field
                      if (v === undefined) {
                        setNewItem({
                          ...newItem,
                          unitPrice: '' as unknown as number,
                        });
                        return;
                      }
                      // For discount amount items, automatically make the value negative
                      // For percentage items, keep it positive (we'll handle the negative in calculation)
                      let finalValue = v;
                      if (newItem.itemType === 'DISCOUNT' && v > 0) {
                        finalValue = -v;
                      }
                      setNewItem({ ...newItem, unitPrice: finalValue });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {newItem.itemType === 'DISCOUNT'
                            ? '-$'
                            : newItem.itemType === 'DISCOUNT_PERCENTAGE'
                            ? ''
                            : '$'}
                        </InputAdornment>
                      ),
                      endAdornment:
                        newItem.itemType === 'DISCOUNT_PERCENTAGE' ? (
                          <InputAdornment position="end">%</InputAdornment>
                        ) : undefined,
                    }}
                    min={newItem.itemType === 'DISCOUNT' ? undefined : 0}
                    max={
                      newItem.itemType === 'DISCOUNT_PERCENTAGE'
                        ? 100
                        : undefined
                    }
                    placeholder={
                      newItem.itemType === 'DISCOUNT'
                        ? 'Enter positive amount'
                        : newItem.itemType === 'DISCOUNT_PERCENTAGE'
                        ? 'Enter percentage (0-100)'
                        : undefined
                    }
                    autoComplete="off"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAddItem}
                    disabled={
                      !newItem.description ||
                      (newItem.itemType === 'DISCOUNT'
                        ? newItem.unitPrice === 0
                        : newItem.itemType === 'DISCOUNT_PERCENTAGE'
                        ? newItem.unitPrice <= 0 || newItem.unitPrice > 100
                        : newItem.unitPrice <= 0)
                    }
                    sx={{
                      background: colors.primary.main,
                      color: 'white',
                      '&:hover': {
                        background: colors.primary.dark,
                      },
                      '&:disabled': {
                        background: colors.neutral[300],
                        color: colors.neutral[500],
                      },
                    }}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Items List */}
            {items.length > 0 &&
              (isMobile ? (
                // Mobile Card View - Compact Design
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {items.map((item, index) => {
                    const isRowEditing = inlineEditIndex === index;
                    const canSaveRow = isRowEditing && isInlineDraftValid();
                    // While a row is being edited its appearance follows the
                    // draft's type, so switching type re-labels the row and
                    // switches the price field's adornments immediately.
                    const rowType =
                      isRowEditing && inlineDraft
                        ? inlineDraft.itemType
                        : item.itemType;

                    return (
                      <Card
                        key={index}
                        sx={{
                          border: `1px solid ${
                            isRowEditing
                              ? colors.primary.main
                              : colors.neutral[200]
                          }`,
                        }}
                      >
                        <CardContent
                          sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}
                        >
                          {/* Header Row: Type + Description + Action. Editing
                            stacks the controls so the type picker and
                            description each get the full card width. */}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: isRowEditing ? 'column' : 'row',
                              alignItems: isRowEditing
                                ? 'stretch'
                                : 'flex-start',
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            {isRowEditing && inlineDraft ? (
                              <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                  value={inlineDraft.itemType}
                                  label="Type"
                                  onChange={(e) =>
                                    changeInlineType(
                                      e.target.value as ItemTypeValue
                                    )
                                  }
                                >
                                  {renderItemTypeOptions()}
                                </Select>
                              </FormControl>
                            ) : (
                              <Chip
                                label={item.itemType}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.688rem',
                                  background:
                                    item.itemType === 'TIRE'
                                      ? colors.tire?.new || colors.primary.main
                                      : item.itemType === 'DISCOUNT' ||
                                        item.itemType === 'DISCOUNT_PERCENTAGE'
                                      ? '#f44336'
                                      : colors.service?.maintenance ||
                                        colors.secondary.main,
                                  color: 'white',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              {(item as any).tireName && (
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: '0.813rem',
                                    lineHeight: 1.3,
                                    mb: 0.25,
                                  }}
                                >
                                  {(item as any).tireName}
                                </Typography>
                              )}
                              {isRowEditing && inlineDraft ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  autoFocus
                                  label="Description"
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
                                  sx={{
                                    fontSize: '0.813rem',
                                    lineHeight: 1.3,
                                    color: (item as any).tireName
                                      ? 'text.secondary'
                                      : 'text.primary',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              )}
                            </Box>
                            {isRowEditing ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexShrink: 0,
                                  alignSelf: 'flex-end',
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={saveInlineEdit}
                                  disabled={!canSaveRow}
                                  sx={{ p: 0.5, color: colors.primary.main }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={cancelInlineEdit}
                                  sx={{ p: 0.5, color: colors.neutral[600] }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, index)}
                                sx={{ p: 0.5, flexShrink: 0 }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>

                          {/* Compact Info Row */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.688rem' }}
                                >
                                  Qty
                                </Typography>
                                {isRowEditing &&
                                inlineDraft &&
                                rowType !== 'TIPS' ? (
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
                                    sx={{ width: 80 }}
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    sx={{ fontSize: '0.813rem' }}
                                  >
                                    {item.quantity}
                                  </Typography>
                                )}
                              </Box>
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.688rem' }}
                                >
                                  Price
                                </Typography>
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
                                    max={
                                      rowType === 'DISCOUNT_PERCENTAGE'
                                        ? 100
                                        : undefined
                                    }
                                    InputProps={{
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          {rowType === 'DISCOUNT'
                                            ? '-$'
                                            : rowType === 'DISCOUNT_PERCENTAGE'
                                            ? ''
                                            : '$'}
                                        </InputAdornment>
                                      ),
                                      endAdornment:
                                        rowType === 'DISCOUNT_PERCENTAGE' ? (
                                          <InputAdornment position="end">
                                            %
                                          </InputAdornment>
                                        ) : undefined,
                                    }}
                                    sx={{ width: 130 }}
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    fontWeight={500}
                                    sx={{ fontSize: '0.813rem' }}
                                  >
                                    {item.itemType === 'DISCOUNT_PERCENTAGE'
                                      ? `${item.unitPrice}%`
                                      : formatCurrency(item.unitPrice)}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: '0.688rem' }}
                              >
                                Total
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  fontSize: '0.938rem',
                                  color:
                                    rowType === 'DISCOUNT' ||
                                    rowType === 'DISCOUNT_PERCENTAGE'
                                      ? '#f44336'
                                      : colors.primary.main,
                                }}
                              >
                                {formatCurrency(
                                  isRowEditing
                                    ? getDraftLineTotal(item)
                                    : getLineTotal(item)
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                // Desktop Table View
                <TableContainer
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${colors.neutral[200]}`,
                    overflow: 'hidden',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: colors.neutral[100] }}>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Description
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Qty
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Unit Price
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Total
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => {
                        const isRowEditing = inlineEditIndex === index;
                        const canSaveRow = isRowEditing && isInlineDraftValid();
                        // While a row is being edited its appearance follows
                        // the draft's type, so switching type immediately
                        // re-labels the row and swaps the price adornments.
                        const rowType =
                          isRowEditing && inlineDraft
                            ? inlineDraft.itemType
                            : item.itemType;

                        return (
                          <TableRow
                            key={index}
                            sx={{
                              '&:hover': {
                                background: isRowEditing
                                  ? undefined
                                  : colors.neutral[50],
                              },
                              '&:last-child td': { border: 0 },
                              ...(isRowEditing && {
                                background: `${colors.primary.main}0d`,
                              }),
                            }}
                          >
                            <TableCell>
                              {isRowEditing && inlineDraft ? (
                                <FormControl
                                  size="small"
                                  sx={{ minWidth: 150 }}
                                >
                                  <Select
                                    value={inlineDraft.itemType}
                                    onChange={(e) =>
                                      changeInlineType(
                                        e.target.value as ItemTypeValue
                                      )
                                    }
                                  >
                                    {renderItemTypeOptions()}
                                  </Select>
                                </FormControl>
                              ) : (
                                <Chip
                                  label={item.itemType}
                                  size="small"
                                  sx={{
                                    background:
                                      item.itemType === 'TIRE'
                                        ? colors.tire?.new ||
                                          colors.primary.main
                                        : item.itemType === 'DISCOUNT' ||
                                          item.itemType ===
                                            'DISCOUNT_PERCENTAGE'
                                        ? '#f44336'
                                        : colors.service?.maintenance ||
                                          colors.secondary.main,
                                    color: 'white',
                                  }}
                                />
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
                              {isRowEditing &&
                              inlineDraft &&
                              rowType !== 'TIPS' ? (
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
                                  max={
                                    rowType === 'DISCOUNT_PERCENTAGE'
                                      ? 100
                                      : undefined
                                  }
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        {rowType === 'DISCOUNT'
                                          ? '-$'
                                          : rowType === 'DISCOUNT_PERCENTAGE'
                                          ? ''
                                          : '$'}
                                      </InputAdornment>
                                    ),
                                    endAdornment:
                                      rowType === 'DISCOUNT_PERCENTAGE' ? (
                                        <InputAdornment position="end">
                                          %
                                        </InputAdornment>
                                      ) : undefined,
                                  }}
                                  sx={{ width: 150 }}
                                />
                              ) : item.itemType === 'DISCOUNT_PERCENTAGE' ? (
                                `${item.unitPrice}%`
                              ) : (
                                formatCurrency(item.unitPrice)
                              )}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: 600,
                                color:
                                  rowType === 'DISCOUNT' ||
                                  rowType === 'DISCOUNT_PERCENTAGE'
                                    ? '#f44336'
                                    : 'inherit',
                              }}
                            >
                              {formatCurrency(
                                isRowEditing
                                  ? getDraftLineTotal(item)
                                  : getLineTotal(item)
                              )}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {isRowEditing ? (
                                <>
                                  {/* span keeps the tooltip alive while the
                                    button is disabled */}
                                  <Tooltip title="Save changes">
                                    <span>
                                      <IconButton
                                        size="small"
                                        onClick={saveInlineEdit}
                                        disabled={!canSaveRow}
                                        sx={{ color: colors.primary.main }}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title="Cancel">
                                    <IconButton
                                      size="small"
                                      onClick={cancelInlineEdit}
                                      sx={{ color: colors.neutral[600] }}
                                    >
                                      <CloseIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Edit item">
                                    <IconButton
                                      size="small"
                                      onClick={() => startInlineEdit(index)}
                                      sx={{ color: colors.primary.main }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Remove item">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveItem(index)}
                                      sx={{
                                        color: colors.semantic?.error || 'red',
                                        '&:hover': {
                                          background: 'rgba(255,0,0,0.1)',
                                        },
                                      }}
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
              ))}

            {items.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No items added yet. Add items to create the invoice.
              </Alert>
            )}

            {/* Invoice Summary Section */}
            {items.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      width: isMobile ? '100%' : 400,
                    }}
                  >
                    {/* Subtotal */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        Subtotal:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {formatCurrency(subtotal)}
                      </Typography>
                    </Box>

                    {/* GST */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          GST:
                        </Typography>
                        <NumberInput
                          size="small"
                          allowDecimals
                          value={(formData.gstRate * 100).toFixed(1)}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              gstRate: (v ?? 0) / 100,
                            })
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">%</InputAdornment>
                            ),
                          }}
                          min={0}
                          max={100}
                          sx={{ width: 100 }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {formatCurrency(gstAmount)}
                      </Typography>
                    </Box>

                    {/* PST */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          PST:
                        </Typography>
                        <NumberInput
                          size="small"
                          allowDecimals
                          value={(formData.pstRate * 100).toFixed(1)}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              pstRate: (v ?? 0) / 100,
                            })
                          }
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">%</InputAdornment>
                            ),
                          }}
                          min={0}
                          max={100}
                          sx={{ width: 100 }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {formatCurrency(pstAmount)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Grand Total */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        background: colors.primary.main + '10',
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, color: colors.primary.main }}
                      >
                        Invoice Total:
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: colors.primary.main }}
                      >
                        {formatCurrency(total)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {items.length > 0 && (
              <Alert severity="success" sx={{ mt: 3 }}>
                {items.length} item{items.length > 1 ? 's' : ''} added
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>

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
        <MenuItem onClick={handleMenuEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Item</ListItemText>
        </MenuItem>
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
