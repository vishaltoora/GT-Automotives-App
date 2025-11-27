import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { customerService, CreateCustomerDto, UpdateCustomerDto } from '../../requests/customer.requests';
import { PhoneInput } from '../../components/common/PhoneInput';
import axios from 'axios';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getToken } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: 'Prince George, BC',
    businessName: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadCustomer(id);
    }
  }, [id, isEdit]);

  const loadCustomer = async (customerId: string) => {
    try {
      setLoading(true);
      const customer = await customerService.getCustomer(customerId);
      setFormData({
        email: customer.email || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        address: customer.address || '',
        businessName: customer.businessName || '',
      });

      // Load SMS preferences
      try {
        const token = await getToken();
        const prefsResponse = await axios.get(
          `${API_URL}/api/sms/preferences/customer?customerId=${customerId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            }
          }
        );
        setSmsEnabled(prefsResponse.data.optedIn || false);
      } catch (err) {
        // If preferences don't exist, default to false
        setSmsEnabled(false);
      }
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

      let customerId = id;

      if (isEdit && id) {
        const updateData: UpdateCustomerDto = { ...formData };
        await customerService.updateCustomer(id, updateData);
      } else {
        const createData: CreateCustomerDto = { ...formData };
        const newCustomer = await customerService.createCustomer(createData);
        customerId = newCustomer.id;
      }

      // Save SMS preferences - enable ALL preferences when SMS is enabled
      if (customerId) {
        const token = await getToken();
        await axios.post(
          `${API_URL}/api/sms/preferences/customer`,
          {
            customerId,
            optedIn: smsEnabled,
            appointmentReminders: smsEnabled,
            serviceUpdates: smsEnabled,
            promotional: smsEnabled,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            }
          }
        );
      }

      navigate('/customers');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        {isEdit ? 'Edit Customer' : 'Add New Customer'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
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
                <PhoneInput
                  fullWidth
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={smsEnabled}
                        onChange={(e) => setSmsEnabled(e.target.checked)}
                        disabled={saving || !formData.phone}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Enable SMS Notifications</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formData.phone
                            ? 'Receive appointment reminders, service updates, and promotional messages'
                            : 'Add a phone number to enable SMS'}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
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
                />
              </Grid>
              <Grid size={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/customers')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}