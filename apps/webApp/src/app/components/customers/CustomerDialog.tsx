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
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { customerService, Customer, CreateCustomerDto, UpdateCustomerDto } from '../../services/customer.service';
import { colors } from '../../theme/colors';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId?: string;
  customer?: Customer;
}

export const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  onClose,
  onSuccess,
  customerId,
  customer: initialCustomer,
}) => {
  const isEdit = !!customerId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: 'Prince George, BC',
    businessName: '',
  });

  useEffect(() => {
    if (open) {
      if (initialCustomer) {
        // If customer data is provided directly
        setFormData({
          email: initialCustomer.email || '',
          firstName: initialCustomer.firstName || '',
          lastName: initialCustomer.lastName || '',
          phone: initialCustomer.phone || '',
          address: initialCustomer.address || '',
          businessName: initialCustomer.businessName || '',
        });
      } else if (customerId) {
        // Load customer data if only ID is provided
        loadCustomer(customerId);
      } else {
        // Reset form for new customer
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
          address: 'Prince George, BC',
          businessName: '',
        });
      }
      setError(null);
    }
  }, [open, customerId, initialCustomer]);

  const loadCustomer = async (id: string) => {
    try {
      setLoading(true);
      const customer = await customerService.getCustomer(id);
      setFormData({
        email: customer.email || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        address: customer.address || '',
        businessName: customer.businessName || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      if (isEdit && customerId) {
        const updateData: UpdateCustomerDto = { ...formData };
        await customerService.updateCustomer(customerId, updateData);
      } else {
        const createData: CreateCustomerDto = { ...formData };
        await customerService.createCustomer(createData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
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
          py: 1.5,
          px: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isEdit ? <EditIcon sx={{ fontSize: 24 }} /> : <PersonAddIcon sx={{ fontSize: 24 }} />}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </Typography>
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

      <DialogContent 
        sx={{ 
          p: 3, 
          pt: 3,
          overflow: 'visible',
          '&:first-of-type': {
            paddingTop: 3
          }
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit} id="customer-form">
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email (Optional)"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  disabled={saving}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={formData.businessName}
                  onChange={handleChange('businessName')}
                  disabled={saving}
                  placeholder="Optional"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  disabled={saving}
                  multiline
                  rows={2}
                  placeholder="Street address, city, province"
                />
              </Grid>
            </Grid>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${colors.neutral[200]}` }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={saving}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="customer-form"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving || loading}
          sx={{
            background: colors.gradients.primary,
            '&:hover': {
              background: colors.gradients.primary,
            }
          }}
        >
          {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};