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
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { invoiceService, InvoiceItem } from '../../services/invoice.service';
import { InvoiceItemType } from '../../../enums';
import { customerService } from '../../services/customer.service';
import { vehicleService } from '../../services/vehicle.service';
import TireService from '../../services/tire.service';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import InvoiceFormContent from './InvoiceFormContent';
import companyService, { Company } from '../../services/company.service';

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
}

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  open,
  onClose,
  onSuccess,
  invoice = null,
}) => {
  const { } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tires, setTires] = useState<any[]>([]);
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
      loadData();
      if (isEditMode && invoice) {
        populateFormForEdit(invoice);
      } else {
        // Reset form when dialog opens for create mode
        resetForm();
      }
    }
  }, [open, isEditMode, invoice]);

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
      const [customersData, tiresResult, companiesData] = await Promise.all([
        customerService.getCustomers(),
        TireService.getTires({ page: 1, limit: 100 }),
        companyService.getCompanies(),
      ]);
      setCustomers(customersData);
      setTires(tiresResult.items || []);
      setCompanies(companiesData);

      // Set default company if not in edit mode
      if (!isEditMode && companiesData.length > 0) {
        const defaultCompany = companiesData.find(c => c.isDefault) || companiesData[0];
        setFormData(prev => ({ ...prev, companyId: defaultCompany.id }));
      }
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
      setVehicles([]);
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

    try {
      setLoading(true);
      
      // Calculate totals - separate regular items from discount items
      const subtotal = items.reduce((sum, item) => {
        const itemCalc = calculateItemTotal(item);
        return sum + itemCalc.total; // Use calculated total (includes negative discounts)
      }, 0);
      const gstAmount = (subtotal * formData.gstRate) / 100;
      const pstAmount = (subtotal * formData.pstRate) / 100;
      const taxAmount = gstAmount + pstAmount;
      const total = subtotal + taxAmount;

      const invoiceData: any = {
        items: items.map((item) => {
          const { itemType, description, quantity, unitPrice, tireId } = item;
          const itemData: any = {
            itemType,
            description,
            quantity,
            unitPrice,
          };
          if (tireId) {
            itemData.tireId = tireId;
          }
          return itemData;
        }),
        subtotal,
        taxRate: formData.gstRate + formData.pstRate,
        taxAmount,
        total,
        gstRate: formData.gstRate,
        gstAmount,
        pstRate: formData.pstRate,
        pstAmount,
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
      if (import.meta.env.DEV) {
        console.error('Error creating invoice:', error);
      }
      
      if (error.response?.data) {
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
      setNewItem({
        ...newItem,
        tireId: tire.id,
        itemType: InvoiceItemType.TIRE,
        description: `${tire.brand} ${formatTireType(tire.type)} - ${tire.size}`,
        unitPrice: parseFloat(tire.price),
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
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
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReceiptIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEditMode ? 'Update invoice details and items' : 'Generate professional invoices for your customers'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <InvoiceFormContent
          customers={customers}
          vehicles={vehicles}
          tires={tires}
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
          isEditMode={isEditMode}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          background: colors.background.light,
          borderTop: `1px solid ${colors.neutral[200]}`,
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
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
          {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Invoice' : 'Create Invoice')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDialog;