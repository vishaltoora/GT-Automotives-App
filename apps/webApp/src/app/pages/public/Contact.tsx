import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  Snackbar,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as ClockIcon,
  Send as SendIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Help as HelpIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { Hero } from '../../components/public';
import { colors } from '../../theme/colors';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export const Contact: React.FC = () => {
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

  const businessHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <>
      {/* Hero Section */}
      <Hero
        title="Get In Touch"
        subtitle="Contact Us"
        description="Schedule your service appointment or reach out with any questions. We're here to help!"
        primaryAction={{
          label: 'Call Now',
          path: 'tel:5551234567',
        }}
        height="40vh"
      />

      {/* Contact Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: colors.text.primary,
                    mb: 1,
                  }}
                >
                  Send Us a Message
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.text.secondary,
                    mb: 4,
                  }}
                >
                  Fill out the form below and we'll get back to you within 24 hours.
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={isSubmitting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        disabled={isSubmitting}
                        placeholder="(555) 123-4567"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Service Needed"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        error={!!errors.service}
                        helperText={errors.service}
                        disabled={isSubmitting}
                      >
                        {services.map((service) => (
                          <MenuItem key={service} value={service}>
                            {service}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Your Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        error={!!errors.message}
                        helperText={errors.message}
                        disabled={isSubmitting}
                        placeholder="Tell us about your vehicle and what service you need..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        disabled={isSubmitting}
                        sx={{
                          backgroundColor: colors.secondary.main,
                          '&:hover': {
                            backgroundColor: colors.secondary.dark,
                          },
                          px: 4,
                        }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              {/* Contact Info Card */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      mb: 3,
                    }}
                  >
                    Contact Information
                  </Typography>

                  <Stack spacing={2.5}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          backgroundColor: colors.primary.light + '15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary.main,
                          flexShrink: 0,
                        }}
                      >
                        <PhoneIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                          Phone
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          (555) 123-4567
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          backgroundColor: colors.primary.light + '15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary.main,
                          flexShrink: 0,
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          info@gtautomotive.com
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          backgroundColor: colors.primary.light + '15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: colors.primary.main,
                          flexShrink: 0,
                        }}
                      >
                        <LocationIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: colors.text.secondary }}>
                          Address
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          123 Main Street
                          <br />
                          City, State 12345
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Business Hours Card */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      mb: 3,
                    }}
                  >
                    Business Hours
                  </Typography>

                  <Stack spacing={2}>
                    {businessHours.map((schedule, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          borderBottom: index < businessHours.length - 1 ? `1px solid ${colors.neutral[200]}` : 'none',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {schedule.day}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: schedule.hours === 'Closed' ? colors.semantic.error : colors.semantic.success,
                            fontWeight: 600,
                          }}
                        >
                          {schedule.hours}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: colors.semantic.warning + '15',
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ClockIcon sx={{ color: colors.semantic.warning }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Emergency Service Available
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                          Call for after-hours assistance
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      mb: 3,
                    }}
                  >
                    Quick Actions
                  </Typography>

                  <Stack spacing={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        '&:hover': {
                          backgroundColor: colors.primary.light + '10',
                          borderColor: colors.primary.dark,
                        },
                      }}
                    >
                      Schedule Appointment
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CarIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        '&:hover': {
                          backgroundColor: colors.primary.light + '10',
                          borderColor: colors.primary.dark,
                        },
                      }}
                    >
                      Get Tire Quote
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HelpIcon />}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderColor: colors.primary.main,
                        color: colors.primary.main,
                        '&:hover': {
                          backgroundColor: colors.primary.light + '10',
                          borderColor: colors.primary.dark,
                        },
                      }}
                    >
                      FAQs
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Map Section */}
        <Box sx={{ mt: 6 }}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  backgroundColor: colors.neutral[200],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <LocationIcon sx={{ fontSize: 48, color: colors.primary.main }} />
                  <Typography variant="h6" sx={{ color: colors.text.secondary }}>
                    Interactive Map
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary, textAlign: 'center', maxWidth: 300 }}>
                    Google Maps integration would go here. Visit us at 123 Main Street, City, State 12345
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<LocationIcon />}
                    href="https://maps.google.com"
                    target="_blank"
                    sx={{
                      backgroundColor: colors.primary.main,
                      '&:hover': {
                        backgroundColor: colors.primary.dark,
                      },
                    }}
                  >
                    Get Directions
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

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