import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { invoiceService, InvoiceItem } from '../../requests/invoice.requests';
import { InvoiceItemType } from '../../../enums';
import { customerService } from '../../requests/customer.requests';
import { vehicleService } from '../../requests/vehicle.requests';
import TireService from '../../requests/tire.requests';
import { serviceService } from '../../requests/service.requests';
import { quotationService } from '../../requests/quotation.requests';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import InvoiceFormContent from './InvoiceFormContent';
import companyService, { Company } from '../../requests/company.requests';
import { ServiceDto } from '@gt-automotive/data';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (invoice: any) => void;
  invoice?: any; // For edit mode
  quotationId?: string; // For converting from quotation
}

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  open,
  onClose,
  onSuccess,
  invoice = null,
  quotationId,
}) => {
  const { } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tires, setTires] = useState<any[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const isEditMode = Boolean(invoice);
  
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    address: 'Prince George, BC',
    phone: '',
    email: '',
  });
  
  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    companyId: '',
    gstRate: 0.05,
    pstRate: 0.07,
    paymentMethod: '',
    notes: '',
    status: 'PENDING',
    invoiceDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<InvoiceItem>({
    itemType: InvoiceItemType.SERVICE,
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountType: 'amount',
    discountValue: 0,
    discountAmount: 0,
  });

  const formatTireType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const baseTotal = item.quantity * item.unitPrice;

    // For DISCOUNT items (fixed amount), use the negative unitPrice directly
    if (item.itemType === InvoiceItemType.DISCOUNT) {
      return {
        subtotal: baseTotal,
        discountAmount: 0,
        total: baseTotal // baseTotal is already negative for DISCOUNT items
      };
    }

    // For DISCOUNT_PERCENTAGE items, calculate based on other items
    if (item.itemType === InvoiceItemType.DISCOUNT_PERCENTAGE) {
      const otherItemsSubtotal = items
        .filter(i => i.itemType !== InvoiceItemType.DISCOUNT && i.itemType !== InvoiceItemType.DISCOUNT_PERCENTAGE)
        .reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
      const percentageDiscount = (otherItemsSubtotal * item.unitPrice) / 100;
      return {
        subtotal: baseTotal,
        discountAmount: 0,
        total: -percentageDiscount // Negative value for discount
      };
    }

    // For regular items, use the old discount logic (per-item discounts)
    let discountAmount = 0;
    if (item.discountValue && item.discountValue > 0) {
      if (item.discountType === 'percentage') {
        discountAmount = (baseTotal * item.discountValue) / 100;
      } else {
        discountAmount = item.discountValue;
      }
    }

    return {
      subtotal: baseTotal,
      discountAmount,
      total: baseTotal - discountAmount
    };
  };

  useEffect(() => {
    if (open) {
      const initializeDialog = async () => {
        // Always load data first (customers, tires, services, companies)
        const loadedData = await loadData();

        // Then populate the form based on mode
        if (isEditMode && invoice) {
          populateFormForEdit(invoice);
        } else if (quotationId && loadedData) {
          // Load quotation data to pre-fill the invoice
          await loadQuotationData(quotationId, loadedData.companies);
        } else {
          // Reset form when dialog opens for create mode
          resetForm();
        }
      };

      initializeDialog();
    }
  }, [open, isEditMode, invoice, quotationId]);

  useEffect(() => {
    if (formData.customerId) {
      loadCustomerVehicles(formData.customerId);
    }
  }, [formData.customerId]);

  const resetForm = () => {
    setCustomerForm({
      firstName: '',
      lastName: '',
      businessName: '',
      address: 'Prince George, BC',
      phone: '',
      email: '',
    });
    const defaultCompany = companies.find(c => c.isDefault) || companies[0];
    setFormData({
      customerId: '',
      vehicleId: '',
      companyId: defaultCompany?.id || '',
      gstRate: 0.05,
      pstRate: 0.07,
      paymentMethod: '',
      notes: '',
      status: 'PENDING',
      invoiceDate: new Date().toISOString().split('T')[0],
    });
    setItems([]);
    setNewItem({
      itemType: InvoiceItemType.SERVICE,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
    });
    // Start with new customer mode since no customer is selected
    setIsNewCustomer(true);
  };

  const populateFormForEdit = (invoiceData: any) => {
    // Populate customer form (read-only in edit mode)
    if (invoiceData.customer) {
      setCustomerForm({
        firstName: invoiceData.customer.firstName || '',
        lastName: invoiceData.customer.lastName || '',
        businessName: invoiceData.customer.businessName || '',
        address: invoiceData.customer.address || 'Prince George, BC',
        phone: invoiceData.customer.phone || '',
        email: invoiceData.customer.email || '',
      });
      setIsNewCustomer(false);
    }

    // Populate form data
    setFormData({
      customerId: invoiceData.customer?.id || '',
      vehicleId: invoiceData.vehicle?.id || '',
      companyId: invoiceData.company?.id || invoiceData.companyId || '',
      gstRate: invoiceData.gstRate || 0.05,
      pstRate: invoiceData.pstRate || 0.07,
      paymentMethod: invoiceData.paymentMethod || '',
      notes: invoiceData.notes || '',
      status: invoiceData.status || 'PENDING',
      invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });

    // Populate items
    if (invoiceData.items && invoiceData.items.length > 0) {
      const populatedItems = invoiceData.items.map((item: any) => ({
        itemType: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tireId: item.tireId || undefined,
        discountType: item.discountType || 'amount',
        discountValue: item.discountValue || 0,
        discountAmount: item.discountAmount || 0,
      }));
      setItems(populatedItems);
    }

    // Load customer vehicles for vehicle selection
    if (invoiceData.customer?.id) {
      loadCustomerVehicles(invoiceData.customer.id);
    }
  };

  const loadData = async () => {
    try {
      const [customersData, tiresResult, servicesData, companiesData] = await Promise.all([
        customerService.getCustomers(),
        TireService.getTires({ page: 1, limit: 100 }),
        serviceService.getAll(),
        companyService.getCompanies(),
      ]);
      setCustomers(customersData);
      setTires(tiresResult.items || []);
      setServices(servicesData);
      setCompanies(companiesData);

      // Set default company if not in edit mode
      if (!isEditMode && companiesData.length > 0) {
        const defaultCompany = companiesData.find(c => c.isDefault) || companiesData[0];
        setFormData(prev => ({ ...prev, companyId: defaultCompany.id }));
      }

      // Return loaded data for use in initialization
      return {
        customers: customersData,
        tires: tiresResult.items || [],
        services: servicesData,
        companies: companiesData,
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  };

  const loadCustomerVehicles = async (customerId: string) => {
    try {
      const vehiclesData = await vehicleService.getCustomerVehicles(customerId);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    }
  };

  const loadQuotationData = async (quoteId: string, companiesList: Company[]) => {
    try {
      const quotation = await quotationService.getQuote(quoteId);

      // Pre-fill customer form with quotation data
      setCustomerForm({
        firstName: quotation.customerName?.split(' ')[0] || '',
        lastName: quotation.customerName?.split(' ').slice(1).join(' ') || '',
        businessName: quotation.businessName || '',
        address: quotation.address || 'Prince George, BC',
        phone: quotation.phone || '',
        email: quotation.email || '',
      });

      // Set to new customer mode since quotations don't have customerId
      setIsNewCustomer(true);

      // Set form data with companies passed as parameter
      const defaultCompany = companiesList.find(c => c.isDefault) || companiesList[0];
      setFormData(prev => ({
        ...prev,
        customerId: '', // Explicitly clear customerId for new customer
        vehicleId: '', // Clear vehicle selection
        companyId: defaultCompany?.id || '', // Use passed companies list
        gstRate: quotation.gstRate ?? 0.05, // Use nullish coalescing to handle 0 values
        pstRate: quotation.pstRate ?? 0.07,
        notes: quotation.notes || '',
        status: 'PENDING', // Ensure status is set
      }));

      // Convert quotation items to invoice items
      const invoiceItems: InvoiceItem[] = quotation.items.map(item => ({
        itemType: item.itemType as InvoiceItemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tireId: item.tireId,
        tireName: item.tireName,
        discountType: 'amount',
        discountValue: 0,
        discountAmount: 0,
        total: item.total,
      }));

      setItems(invoiceItems);
    } catch (error) {
      console.error('Error loading quotation:', error);
      // Fall back to empty form
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const customerId = formData.customerId;

    if (!customerId && (!customerForm.firstName || !customerForm.lastName)) {
      alert('Please provide customer first and last name');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one item to the invoice');
      return;
    }

    let invoiceData: any; // Declare outside try block for error logging

    try {
      setLoading(true);

      // Calculate totals - separate regular items from discount items
      const subtotal = items.reduce((sum, item) => {
        const itemCalc = calculateItemTotal(item);
        return sum + itemCalc.total; // Use calculated total (includes negative discounts)
      }, 0);

      // GST and PST rates are already decimals (0.05, 0.07), so no need to divide by 100
      // Convert to numbers in case they're strings from form inputs
      const gstRate = Number(formData.gstRate ?? 0.05);
      const pstRate = Number(formData.pstRate ?? 0.07);

      const gstAmount = subtotal * gstRate;
      const pstAmount = subtotal * pstRate;
      const taxAmount = gstAmount + pstAmount;
      const total = subtotal + taxAmount;

      invoiceData = {
        items: items.map((item) => {
          const { itemType, description, quantity, unitPrice, tireId, tireName } = item;
          const itemData: any = {
            itemType,
            description,
            quantity: Number(quantity),
            unitPrice: Number(unitPrice),
          };
          if (tireId) {
            itemData.tireId = tireId;
          }
          if (tireName) {
            itemData.tireName = tireName;
          }
          return itemData;
        }),
        subtotal: Number(subtotal),
        taxRate: Number(gstRate + pstRate), // Use local variables instead of formData
        taxAmount: Number(taxAmount),
        total: Number(total),
        gstRate: Number(gstRate),
        gstAmount: Number(gstAmount),
        pstRate: Number(pstRate),
        pstAmount: Number(pstAmount),
      };

      if (formData.paymentMethod) {
        invoiceData.paymentMethod = formData.paymentMethod;
      }
      if (formData.notes) {
        invoiceData.notes = formData.notes;
      }
      if (formData.status) {
        invoiceData.status = formData.status;
      }
      if (formData.invoiceDate) {
        invoiceData.invoiceDate = formData.invoiceDate;
      }

      // In edit mode, don't send customer data (customer cannot be changed)
      if (!isEditMode) {
        if (customerId) {
          // When using existing customer, only send customerId
          invoiceData.customerId = customerId;
        } else if (isNewCustomer && customerForm.firstName && customerForm.lastName) {
          // When creating new customer, send customerData
          invoiceData.customerData = {
            firstName: customerForm.firstName,
            lastName: customerForm.lastName,
          };
          if (customerForm.phone && customerForm.phone.trim() !== '') {
            invoiceData.customerData.phone = customerForm.phone.trim();
          }
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
      }

      if (formData.vehicleId) {
        invoiceData.vehicleId = formData.vehicleId;
      }

      if (formData.companyId) {
        invoiceData.companyId = formData.companyId;
      }

      let result;
      if (isEditMode && invoice) {
        result = await invoiceService.updateInvoice(invoice.id, invoiceData);
      } else {
        result = await invoiceService.createInvoice(invoiceData);
      }
      onSuccess(result);
      onClose();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      console.error('Invoice data that failed:', invoiceData);

      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message || 'Unknown error';
        alert(`Error creating invoice: ${errorMessage}`);
      } else {
        alert(`Error ${isEditMode ? 'updating' : 'creating'} invoice: ` + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      setFormData({ ...formData, customerId: customer.id, vehicleId: '' });
      setCustomerForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        businessName: customer.businessName || '',
        address: customer.address || '',
        phone: customer.phone || '',
        email: customer.email || '',
      });
      setIsNewCustomer(false);
    } else {
      // When null is passed, it means we're switching to new customer mode
      // Don't clear the form - the name might have already been typed
      setFormData({ ...formData, customerId: '', vehicleId: '' });
      setIsNewCustomer(true);
      // Only reset address if it's empty
      if (!customerForm.address) {
        setCustomerForm({ ...customerForm, address: 'Prince George, BC' });
      }
    }
  };

  const handleAddItem = () => {
    if (newItem.description && (
      newItem.itemType === InvoiceItemType.DISCOUNT ? newItem.unitPrice < 0 :
      newItem.itemType === InvoiceItemType.DISCOUNT_PERCENTAGE ? newItem.unitPrice > 0 && newItem.unitPrice <= 100 :
      newItem.unitPrice > 0
    )) {
      const calculation = calculateItemTotal(newItem);
      const itemWithCalculations = {
        ...newItem,
        discountAmount: calculation.discountAmount,
        total: calculation.total
      };
      console.log('Adding item to invoice:', itemWithCalculations);

      // For DISCOUNT items, set the correct properties
      if (newItem.itemType === InvoiceItemType.DISCOUNT) {
        itemWithCalculations.discountType = 'amount';
        itemWithCalculations.discountValue = Math.abs(newItem.unitPrice); // Store positive value
        itemWithCalculations.discountAmount = Math.abs(newItem.unitPrice); // Store positive value for display
      }

      // For DISCOUNT_PERCENTAGE items, store the percentage value for calculation
      if (newItem.itemType === InvoiceItemType.DISCOUNT_PERCENTAGE) {
        itemWithCalculations.discountValue = newItem.unitPrice; // Store percentage value
        itemWithCalculations.discountAmount = Math.abs(calculation.total); // Store positive value for display
        itemWithCalculations.discountType = 'percentage';
      }
      setItems([...items, itemWithCalculations]);
      setNewItem({
        itemType: InvoiceItemType.SERVICE,
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountType: 'amount',
        discountValue: 0,
        discountAmount: 0,
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleTireSelect = (tireId: string) => {
    const tire = tires.find(t => t.id === tireId);
    if (tire) {
      console.log('Selected tire:', tire);
      console.log('Tire name:', tire.name);
      const newItemData = {
        ...newItem,
        tireId: tire.id,
        itemType: InvoiceItemType.TIRE,
        description: `${tire.brand} ${formatTireType(tire.type)} - ${tire.size}`,
        unitPrice: parseFloat(tire.price),
        tireName: tire.name || undefined,
      };
      console.log('New item data:', newItemData);
      setNewItem(newItemData);
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? '100vh' : '90vh',
          ...(isMobile && {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          })
        }
      }}
    >
      <DialogTitle
        sx={{
          background: colors.gradients.primary,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          ...(isMobile && {
            flexShrink: 0,
          })
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <ReceiptIcon sx={{ fontSize: { xs: 24, sm: 28 }, display: { xs: 'none', sm: 'block' } }} />
          <Box>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{ fontWeight: 600 }}
            >
              {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
            </Typography>
            {!isMobile && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isEditMode ? 'Update invoice details and items' : 'Generate professional invoices for your customers'}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          ...(isMobile && {
            flex: '1 1 auto',
            overflowY: 'auto',
            minHeight: 0,
          })
        }}
      >
        <InvoiceFormContent
          customers={customers}
          vehicles={vehicles}
          tires={tires}
          services={services}
          companies={companies}
          isNewCustomer={isNewCustomer}
          customerForm={customerForm}
          setCustomerForm={setCustomerForm}
          formData={formData}
          setFormData={setFormData}
          items={items}
          setItems={setItems}
          newItem={newItem}
          setNewItem={setNewItem}
          onCustomerSelect={handleCustomerSelect}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onTireSelect={handleTireSelect}
          onServicesChange={() => loadData()}
          isEditMode={isEditMode}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          background: colors.background.light,
          borderTop: `1px solid ${colors.neutral[200]}`,
          gap: 2,
          ...(isMobile && {
            flexShrink: 0,
            backgroundColor: 'white',
          })
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          fullWidth={isMobile}
          disabled={loading}
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          fullWidth={isMobile}
          disabled={loading || (!formData.customerId && (!customerForm.firstName || !customerForm.lastName)) || items.length === 0}
          sx={{
            background: colors.primary.main,
            color: 'white',
            minWidth: 140,
            '&:hover': { 
              background: colors.primary.dark,
            },
            '&:disabled': {
              background: colors.neutral[300],
              color: colors.neutral[500]
            }
          }}
        >
          {loading
            ? (isEditMode ? 'Updating...' : 'Creating...')
            : (isEditMode
                ? (isMobile ? 'Update' : 'Update Invoice')
                : (isMobile ? 'Create' : 'Create Invoice')
              )
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDialog;