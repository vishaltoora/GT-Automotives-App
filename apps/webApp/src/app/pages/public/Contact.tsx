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
  Paper,
  Chip,
  Zoom,
  Fade,
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
  CheckCircle as CheckIcon,
  DirectionsCar as VehicleIcon,
  LocalShipping as ShippingIcon,
  SupportAgent as SupportIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Hero } from '../../components/public';
import { colors } from '../../theme/colors';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

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
      {/* Animated Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '450px', sm: '400px', md: '420px', lg: '450px' },
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* Subtle Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 5 }, width: '100%' }}>
          <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
            {/* Left Visual - Logo/Image */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Zoom in timeout={1000}>
                <Box
                  sx={{
                    position: 'relative',
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    height: '100%',
                    minHeight: 320,
                    pr: { md: 3, lg: 4 },
                  }}
                >
                  {/* Main Logo/Image Container */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: { md: 250, lg: 300, xl: 340 },
                      height: { md: 250, lg: 300, xl: 340 },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Animated Circles */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.1)',
                        animation: 'pulse 3s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.05)', opacity: 0.6 },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '85%',
                        height: '85%',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.15)',
                        animation: 'pulse 3s ease-in-out infinite 0.5s',
                      }}
                    />
                    
                    {/* Central Logo */}
                    <Box
                      sx={{
                        width: { md: 170, lg: 210, xl: 250 },
                        height: { md: 170, lg: 210, xl: 250 },
                        borderRadius: '50%',
                        background: 'white',
                        padding: { md: 2, lg: 2.5, xl: 3 },
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <img
                        src={gtLogo}
                        alt="GT Automotive"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>

                    {/* Floating Contact Icons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: colors.secondary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255,107,53,0.4)',
                        animation: 'float 4s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-10px)' },
                        },
                      }}
                    >
                      <PhoneIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 0,
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'float 4s ease-in-out infinite 1s',
                      }}
                    >
                      <EmailIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: -10,
                        width: 45,
                        height: 45,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'float 4s ease-in-out infinite 2s',
                      }}
                    >
                      <SupportIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                    </Box>
                  </Box>
                </Box>
              </Zoom>
            </Grid>

            {/* Right Content - Text */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Fade in timeout={800}>
                <Stack spacing={2} sx={{ maxWidth: { md: '100%', lg: '900px' } }}>
                  {/* Badge */}
                  <Box>
                    <Chip
                      icon={<SupportIcon sx={{ fontSize: '1rem' }} />}
                      label="Contact Us • Fast Response • Expert Support"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        px: 1,
                        '& .MuiChip-icon': {
                          color: colors.secondary.main,
                        },
                      }}
                    />
                  </Box>

                  {/* Main Title */}
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem', xl: '4rem' },
                      color: 'white',
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    We're Here to
                    <Box
                      component="span"
                      sx={{
                        color: colors.secondary.main,
                        display: 'inline',
                        ml: 1,
                      }}
                    >
                      Help You
                    </Box>
                  </Typography>

                  {/* Subtitle */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.3rem' },
                      maxWidth: { md: 600, lg: 700 },
                    }}
                  >
                    Get in touch for expert tire services, mechanical repairs, or emergency assistance. Your satisfaction is our priority
                  </Typography>

                  {/* CTA Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                    <Button
                      component="a"
                      href="tel:2505702333"
                      variant="contained"
                      size="large"
                      startIcon={<PhoneIcon />}
                      sx={{
                        backgroundColor: colors.secondary.main,
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
                        '&:hover': {
                          backgroundColor: colors.secondary.dark,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255,107,53,0.5)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Call Now
                    </Button>

                    <Button
                      component="a"
                      href="#location"
                      variant="outlined"
                      size="large"
                      startIcon={<LocationIcon />}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        borderWidth: 2,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          transform: 'translateY(-2px)',
                          borderWidth: 2,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Get Directions
                    </Button>

                    <Button
                      component="a"
                      href="mailto:gt-automotives@outlook.com"
                      variant="text"
                      size="large"
                      endIcon={<Box sx={{ transform: 'rotate(-45deg)' }}>→</Box>}
                      sx={{
                        color: 'white',
                        px: 3,
                        py: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Send Email
                    </Button>
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Quick Contact Bar */}
      <Box sx={{ 
        backgroundColor: colors.primary.main,
        py: 2,
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <PhoneIcon sx={{ color: 'white' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Call Us
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    (250) 570-2333
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <EmailIcon sx={{ color: 'white' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Email Us
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    gt-automotives@outlook.com
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <ClockIcon sx={{ color: 'white' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Hours Today
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    8:00 AM - 6:00 PM
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Contact Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 8 }}>
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
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
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
          </Grid>

          {/* Contact Information Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Why Choose Us */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: colors.primary.light + '08',
                  border: `1px solid ${colors.primary.light}30`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: colors.text.primary,
                    mb: 2,
                  }}
                >
                  Why Contact Us?
                </Typography>
                
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Free estimates on all services
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Same-day service available
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Mobile tire service to your location
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      24/7 emergency roadside assistance
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Certified technicians on staff
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Emergency Contact */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: colors.semantic.warning + '10',
                  border: `1px solid ${colors.semantic.warning}30`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: colors.semantic.warning + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneIcon sx={{ color: colors.semantic.warning }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      24/7 Emergency Service
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                      Call for immediate assistance
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

      </Container>

      {/* Service Categories Section */}
      <Box sx={{ backgroundColor: colors.neutral[50], py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
            }}
          >
            How Can We Help You?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: colors.text.secondary,
              mb: 5,
            }}
          >
            Select a service category to learn more
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.primary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <VehicleIcon sx={{ fontSize: 30, color: colors.primary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Tire Services
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  New & used tires, installation, rotation, balancing
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.secondary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <BuildIcon sx={{ fontSize: 30, color: colors.secondary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Auto Repair
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  Brakes, oil changes, engine diagnostics, maintenance
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.semantic.warning + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <ShippingIcon sx={{ fontSize: 30, color: colors.semantic.warning }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Mobile Service
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  On-site tire service & emergency roadside assistance
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.semantic.success + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 30, color: colors.semantic.success }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Appointments
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  Schedule service at your convenience
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Team Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
            }}
          >
            Our Team is Ready to Help
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: colors.text.secondary,
              mb: 5,
            }}
          >
            Connect directly with our automotive specialists
          </Typography>

          <Grid container spacing={3}>
            {/* Johny */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: colors.primary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40, color: colors.primary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Johny
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                  Mechanic/Tire Specialist
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  href="tel:2509869191"
                  sx={{
                    borderColor: colors.primary.main,
                    color: colors.primary.main,
                    '&:hover': {
                      borderColor: colors.primary.dark,
                      backgroundColor: colors.primary.light + '10',
                    },
                  }}
                >
                  (250) 986-9191
                </Button>
              </Paper>
            </Grid>

            {/* Harjinder Gill */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: colors.secondary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40, color: colors.secondary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Harjinder Gill
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                  Sales/Marketing
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  href="tel:2505651571"
                  sx={{
                    borderColor: colors.secondary.main,
                    color: colors.secondary.main,
                    '&:hover': {
                      borderColor: colors.secondary.dark,
                      backgroundColor: colors.secondary.light + '10',
                    },
                  }}
                >
                  (250) 565-1571
                </Button>
              </Paper>
            </Grid>

            {/* Vishal */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: colors.semantic.success + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40, color: colors.semantic.success }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Vishal
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                  Sales/Marketing
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  href="tel:2506499699"
                  sx={{
                    borderColor: colors.semantic.success,
                    color: colors.semantic.success,
                    '&:hover': {
                      borderColor: colors.semantic.success,
                      backgroundColor: colors.semantic.success + '10',
                    },
                  }}
                >
                  (250) 649-9699
                </Button>
              </Paper>
            </Grid>

            {/* Karan */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: colors.semantic.warning + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40, color: colors.semantic.warning }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Karan
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary, mb: 2 }}>
                  Tire Specialist
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  href="tel:2509869794"
                  sx={{
                    borderColor: colors.semantic.warning,
                    color: colors.semantic.warning,
                    '&:hover': {
                      borderColor: colors.semantic.warning,
                      backgroundColor: colors.semantic.warning + '10',
                    },
                  }}
                >
                  (250) 986-9794
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

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