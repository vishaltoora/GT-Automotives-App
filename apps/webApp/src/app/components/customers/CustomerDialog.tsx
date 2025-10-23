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
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Sms as SmsIcon,
} from '@mui/icons-material';
import { TransitionProps} from '@mui/material/transitions';
import { customerService, Customer, CreateCustomerDto, UpdateCustomerDto } from '../../services/customer.service';
import { colors } from '../../theme/colors';
import { PhoneInput } from '../common/PhoneInput';
import { AddressAutocomplete } from '../common/AddressAutocomplete';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    smsOptedIn: true,
    smsAppointmentReminders: true,
    smsServiceUpdates: true,
    smsPromotional: false,
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
          smsOptedIn: initialCustomer.smsPreference?.optedIn ?? true,
          smsAppointmentReminders: initialCustomer.smsPreference?.appointmentReminders ?? true,
          smsServiceUpdates: initialCustomer.smsPreference?.serviceUpdates ?? true,
          smsPromotional: initialCustomer.smsPreference?.promotional ?? false,
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
          smsOptedIn: true,
          smsAppointmentReminders: true,
          smsServiceUpdates: true,
          smsPromotional: false,
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
        smsOptedIn: customer.smsPreference?.optedIn ?? true,
        smsAppointmentReminders: customer.smsPreference?.appointmentReminders ?? true,
        smsServiceUpdates: customer.smsPreference?.serviceUpdates ?? true,
        smsPromotional: customer.smsPreference?.promotional ?? false,
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

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      phone: value,
    }));
  };

  const handleSmsToggle = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
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
          py: { xs: 1.5, sm: 1.5 },
          px: { xs: 2, sm: 2.5 },
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          {!isMobile && (isEdit ? <EditIcon sx={{ fontSize: 24 }} /> : <PersonAddIcon sx={{ fontSize: 24 }} />)}
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
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
          p: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
          overflow: 'auto',
          flex: '1 1 auto',
          minHeight: 0,
          '&:first-of-type': {
            paddingTop: { xs: 2, sm: 3 }
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

            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 0 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
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
                  size={isMobile ? 'small' : 'medium'}
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
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PhoneInput
                  fullWidth
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
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
                  size={isMobile ? 'small' : 'medium'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={(address) => setFormData({ ...formData, address })}
                  disabled={saving}
                  label="Address"
                  helperText="Start typing to search addresses"
                />
              </Grid>

              {/* SMS Preferences Section */}
              {formData.phone && (
                <Grid size={{ xs: 12 }}>
                  <Accordion defaultExpanded sx={{ mt: 1 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: colors.neutral[50],
                        '&:hover': {
                          backgroundColor: colors.neutral[100],
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SmsIcon sx={{ color: colors.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          SMS Preferences
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configure SMS notifications for this customer
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.smsOptedIn}
                              onChange={handleSmsToggle('smsOptedIn')}
                              disabled={saving}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Enable SMS Notifications
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Master switch for all SMS notifications
                              </Typography>
                            </Box>
                          }
                        />

                        <Divider sx={{ my: 0.5 }} />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.smsAppointmentReminders}
                              onChange={handleSmsToggle('smsAppointmentReminders')}
                              disabled={saving || !formData.smsOptedIn}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">
                                Appointment Reminders
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Send reminders for upcoming appointments
                              </Typography>
                            </Box>
                          }
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.smsServiceUpdates}
                              onChange={handleSmsToggle('smsServiceUpdates')}
                              disabled={saving || !formData.smsOptedIn}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">
                                Service Updates
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Notifications about service progress and completion
                              </Typography>
                            </Box>
                          }
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.smsPromotional}
                              onChange={handleSmsToggle('smsPromotional')}
                              disabled={saving || !formData.smsOptedIn}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">
                                Promotional Messages
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Special offers and marketing messages
                              </Typography>
                            </Box>
                          }
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{
        p: { xs: 2, sm: 2.5 },
        borderTop: `1px solid ${colors.neutral[200]}`,
        flexShrink: 0,
        gap: { xs: 1, sm: 0 },
        flexDirection: isMobile ? 'column-reverse' : 'row'
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={!isMobile && <CancelIcon />}
          disabled={saving}
          fullWidth={isMobile}
          sx={{ mr: isMobile ? 0 : 1 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="customer-form"
          variant="contained"
          startIcon={!isMobile && <SaveIcon />}
          disabled={saving || loading}
          fullWidth={isMobile}
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
