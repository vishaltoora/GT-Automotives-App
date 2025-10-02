import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { colors } from '../../theme/colors';
import { PhoneInput } from '../common/PhoneInput';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    'New Tire Purchase',
    'Used Tire Purchase',
    'Tire Installation',
    'Oil Change',
    'Brake Service',
    'General Maintenance',
    'Engine Diagnostics',
    'Other Service',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 },
          border: `1px solid ${colors.neutral[200]}`,
          borderRadius: 2,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 1,
              }}
            >
              Get a Free Quote
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
              }}
            >
              Tell us about your needs and we'll provide a detailed estimate.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={isSubmitting}
                  variant="outlined"
                  size="medium"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  disabled={isSubmitting}
                  variant="outlined"
                  size="medium"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <PhoneInput
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  disabled={isSubmitting}
                  placeholder="(250) 570-2333"
                  variant="outlined"
                  size="medium"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Service Type"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  error={!!errors.service}
                  helperText={errors.service}
                  disabled={isSubmitting}
                  variant="outlined"
                  size="medium"
                >
                  {services.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  error={!!errors.message}
                  helperText={errors.message}
                  disabled={isSubmitting}
                  placeholder="Please describe your vehicle (year, make, model) and the service you need..."
                  variant="outlined"
                  size="medium"
                />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: colors.primary.main,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: colors.primary.dark,
                      },
                    }}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                  </Button>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    Response within 2 hours
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Stack>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Message sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </>
  );
};