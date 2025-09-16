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
import { InvoiceItemType } from '@prisma/client';
import { customerService } from '../../services/customer.service';
import { vehicleService } from '../../services/vehicle.service';
import TireService from '../../services/tire.service';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import InvoiceFormContent from './InvoiceFormContent';

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
}

export const InvoiceDialog: React.FC<InvoiceDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [tires, setTires] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
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
    gstRate: 0.05,
    pstRate: 0.07,
    paymentMethod: '',
    notes: '',
    status: 'PENDING',
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<InvoiceItem>({
    itemType: InvoiceItemType.SERVICE,
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  const formatTireType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    if (open) {
      loadData();
      // Reset form when dialog opens
      resetForm();
    }
  }, [open]);

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
    setFormData({
      customerId: '',
      vehicleId: '',
      gstRate: 0.05,
      pstRate: 0.07,
      paymentMethod: '',
      notes: '',
      status: 'PENDING',
    });
    setItems([]);
    setNewItem({
      itemType: InvoiceItemType.SERVICE,
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
    // Start with new customer mode since no customer is selected
    setIsNewCustomer(true);
  };

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
      console.log('Creating invoice - customerId:', customerId, 'isNewCustomer:', isNewCustomer);
      
      const invoiceData: any = {
        items: items.map(({ itemType, description, quantity, unitPrice, tireId }) => {
          const item: any = {
            itemType,
            description,
            quantity,
            unitPrice,
          };
          if (tireId) {
            item.tireId = tireId;
          }
          return item;
        }),
        taxRate: formData.gstRate + formData.pstRate,
        gstRate: formData.gstRate,
        pstRate: formData.pstRate,
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

      if (formData.vehicleId) {
        invoiceData.vehicleId = formData.vehicleId;
      }


      console.log('Invoice data being sent:', invoiceData);
      const invoice = await invoiceService.createInvoice(invoiceData);
      onSuccess(invoice);
      onClose();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      
      if (error.response?.data) {
        const errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message || 'Unknown error';
        alert(`Error creating invoice: ${errorMessage}`);
      } else {
        alert('Error creating invoice: ' + error.message);
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
              Create New Invoice
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Generate professional invoices for your customers
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
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDialog;