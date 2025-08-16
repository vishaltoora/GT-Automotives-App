import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  BatteryChargingFull as BatteryIcon,
  AcUnit as AcIcon,
  LocalShipping as TruckIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

// Define colors directly to avoid import issues
const serviceColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  text: {
    primary: '#212121',
    secondary: '#616161',
  },
  background: {
    light: '#f8f9fa',
  },
  service: {
    tires: '#ff6b35',
    maintenance: '#2196f3',
    repair: '#ff5722',
  },
};

export const Services: React.FC = () => {
  const services = [
    {
      title: 'Tire Installation',
      description: 'Professional tire installation service with balancing and alignment check.',
      icon: <CarIcon />,
      price: 'From $25',
      category: 'Tires',
      color: serviceColors.service.tires,
    },
    {
      title: 'Mobile Tire Service',
      description: 'We come to you! 24/7 emergency tire service at your location.',
      icon: <TruckIcon />,
      price: 'Call for Quote',
      category: 'Tires',
      color: serviceColors.service.tires,
    },
    {
      title: 'Oil Change',
      description: 'Full synthetic oil change with 21-point inspection.',
      icon: <BuildIcon />,
      price: 'From $39.99',
      category: 'Maintenance',
      color: serviceColors.service.maintenance,
    },
    {
      title: 'Brake Service',
      description: 'Complete brake inspection and repair service.',
      icon: <SpeedIcon />,
      price: 'From $149',
      category: 'Repair',
      color: serviceColors.service.repair,
    },
    {
      title: 'Battery Service',
      description: 'Battery testing, replacement, and electrical system check.',
      icon: <BatteryIcon />,
      price: 'From $129',
      category: 'Repair',
      color: serviceColors.service.repair,
    },
    {
      title: 'AC & Heating',
      description: 'Air conditioning and heating system service and repair.',
      icon: <AcIcon />,
      price: 'From $89',
      category: 'Maintenance',
      color: serviceColors.service.maintenance,
    },
    {
      title: 'Engine Repair',
      description: 'Complete engine diagnostics and repair services.',
      icon: <BuildIcon />,
      price: 'From $299',
      category: 'Repair',
      color: serviceColors.service.repair,
    },
    {
      title: 'Emergency Service',
      description: '24/7 roadside assistance and emergency repairs.',
      icon: <ScheduleIcon />,
      price: 'Available 24/7',
      category: 'Emergency',
      color: serviceColors.secondary,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${serviceColors.primary} 0%, #3a5270 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Professional Auto Services
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Quality service with certified technicians and competitive pricing
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: serviceColors.primary,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Schedule Service
            </Button>
            <Button
              component="a"
              href="tel:2509869191"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Call: (250) 986-9191
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: serviceColors.secondary,
              fontWeight: 600,
              letterSpacing: 1,
              display: 'block',
              mb: 1,
            }}
          >
            What We Offer
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: serviceColors.text.primary,
              mb: 2,
            }}
          >
            Our Services
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: serviceColors.text.secondary,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            From tire installation to complete auto repair, we've got you covered
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      backgroundColor: service.color + '15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: service.color,
                    }}
                  >
                    {React.cloneElement(service.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: serviceColors.text.primary,
                    }}
                  >
                    {service.title}
                  </Typography>
                  
                  <Chip
                    label={service.category}
                    size="small"
                    sx={{
                      backgroundColor: service.color + '20',
                      color: service.color,
                      fontWeight: 500,
                      mb: 2,
                    }}
                  />
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: serviceColors.text.secondary,
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {service.description}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: service.color,
                      fontWeight: 700,
                    }}
                  >
                    {service.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ backgroundColor: serviceColors.background.light, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: serviceColors.text.primary,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Why Choose GT Automotives?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon sx={{ fontSize: 48, color: serviceColors.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Certified Technicians
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ASE certified mechanics with years of experience
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: serviceColors.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  24/7 Emergency Service
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available round the clock for roadside assistance
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <TruckIcon sx={{ fontSize: 48, color: serviceColors.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Mobile Service
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We come to your location for tire installation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckIcon sx={{ fontSize: 48, color: serviceColors.primary, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  100% Satisfaction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Guaranteed quality work and customer service
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${serviceColors.primary} 0%, #3a5270 100%)`,
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Ready to Schedule Your Service?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
            }}
          >
            Our expert technicians are ready to help
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: serviceColors.secondary,
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#e55a2b',
                },
              }}
            >
              Book Appointment
            </Button>
            <Button
              component="a"
              href="tel:2509869191"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: serviceColors.primary,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Call Now
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
};