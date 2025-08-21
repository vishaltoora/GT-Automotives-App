import {
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  WorkspacePremium as CertifiedIcon,
  CheckCircle as CheckIcon,
  AccessTime as ClockIcon,
  Email as EmailIcon,
  Emergency as EmergencyIcon,
  Handshake as HandshakeIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as OfferIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  AutoAwesome as SparkleIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  TireRepair as TireIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  IconButton,
  Paper,
  Rating,
  Stack,
  Typography,
  useScrollTrigger,
  Zoom,
  Grid,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { CTASection } from '../../components/public';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';
import { colors } from '../../theme/colors';

export function Home() {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 100 });

  const featuredServices = [
    {
      title: 'Mobile Tire Service',
      description:
        'We come to you! Professional tire installation at your location. Available 24/7 for emergency assistance.',
      icon: <TruckIcon sx={{ fontSize: 32 }} />,
      price: 'Call for Quote',
      features: [
        'On-site installation',
        '24/7 emergency service',
        'All tire brands',
        'Roadside assistance',
      ],
      category: 'tire' as const,
      actionPath: '/services',
      highlighted: true,
    },
    {
      title: 'Professional Oil Change',
      description:
        'Full-service oil change with multi-point inspection. Keep your engine running smoothly.',
      icon: <BuildIcon sx={{ fontSize: 32 }} />,
      price: 'From $39.99',
      duration: '30 minutes',
      features: [
        'Quality oil',
        '21-point inspection',
        'Filter replacement',
        'Fluid top-off',
      ],
      category: 'maintenance' as const,
      actionPath: '/services',
    },
    {
      title: 'Complete Brake Service',
      description:
        'Expert brake inspection and repair. Your safety is our priority.',
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      price: 'From $149',
      features: [
        'Free inspection',
        'Quality parts',
        'Warranty included',
        'Same-day service',
      ],
      category: 'repair' as const,
      actionPath: '/services',
    },
  ];

  const whyChooseUsFeatures = [
    {
      icon: <CertifiedIcon sx={{ fontSize: 32 }} />,
      title: 'Certified Technicians',
      description: 'ASE certified mechanics with years of experience',
    },
    {
      icon: <EmergencyIcon sx={{ fontSize: 32 }} />,
      title: '24/7 Emergency Service',
      description: 'Available round the clock for roadside assistance',
    },
    {
      icon: <TruckIcon sx={{ fontSize: 32 }} />,
      title: 'Mobile Service',
      description: 'We come to your location for tire installation',
    },
    {
      icon: <CheckIcon sx={{ fontSize: 32 }} />,
      title: '100% Satisfaction',
      description: 'Guaranteed quality work and customer service',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      content:
        'GT Automotives saved my day! Their mobile tire service is incredibly convenient. Professional, quick, and reliable. Highly recommend!',
      rating: 5,
      date: '1 week ago',
    },
    {
      name: 'Mike Thompson',
      role: 'Fleet Manager',
      content:
        'We rely on GT for all our fleet maintenance. Their 24/7 service and professional team keep our vehicles running smoothly.',
      rating: 5,
      date: '2 weeks ago',
    },
    {
      name: 'Emily Davis',
      role: 'Local Resident',
      content:
        "Best auto shop in town! Fair prices, honest service, and they really know their stuff. Won't go anywhere else.",
      rating: 5,
      date: '1 month ago',
    },
  ];

  const stats = [
    { value: '1,000+', label: 'Happy Customers' },
    { value: '24/7', label: 'Emergency Service' },
    { value: '10+', label: 'Years Experience' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const allServices = [
    'Tire Installation',
    'Mobile Tire Services',
    'Emergency Roadside Assistance',
    'Oil Changes',
    'Engine Repair',
    'Electrical Diagnostics',
    'Brake Service',
    'AC & Heating',
    'Battery Service',
    'Performance Tuning',
  ];

  const tireBrands = [
    'Michelin',
    'Bridgestone',
    'Goodyear',
    'Continental',
    'BF Goodrich',
    'Pirelli',
    'Firestone',
    'Yokohama',
  ];

  return (
    <>
      {/* Full-Width Hero Section with Optimized Layout */}
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

                    {/* Floating Service Icons */}
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
                      <TireIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <BuildIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <CarIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
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
                      icon={<CertifiedIcon sx={{ fontSize: '1rem' }} />}
                      label="Certified Auto Service • Prince George • Est. 2010"
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
                    Professional Tire &
                    <Box
                      component="span"
                      sx={{
                        color: colors.secondary.main,
                        display: 'inline',
                        ml: 1,
                      }}
                    >
                      Auto Services
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
                    Expert tire installation, mobile services, and mechanical repairs by certified
                    technicians at competitive prices
                  </Typography>

                  {/* CTA Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                    <Button
                      component={Link}
                      to="/inventory"
                      variant="contained"
                      size="large"
                      startIcon={<TireIcon />}
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
                      Browse Tires
                    </Button>

                    <Button
                      component={Link}
                      to="/contact"
                      variant="outlined"
                      size="large"
                      startIcon={<PhoneIcon />}
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
                      Contact Us
                    </Button>

                    <Button
                      component={Link}
                      to="/services"
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
                      View All Services
                    </Button>
                  </Stack>

                  {/* Trust Indicators */}
                  <Stack 
                    direction="row" 
                    spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }} 
                    divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />}
                    sx={{ pt: 3, mt: 1 }}
                  >
                    {[
                      { value: '10+', label: 'Years Experience' },
                      { value: '1,000+', label: 'Happy Customers' },
                      { value: '24/7', label: 'Emergency Service' },
                      { value: '100%', label: 'Satisfaction' },
                    ].map((stat, index) => (
                      <Box key={index}>
                        <Typography
                          sx={{
                            fontSize: { xs: '1.5rem', md: '1.8rem' },
                            fontWeight: 700,
                            color: colors.secondary.main,
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: '0.7rem', md: '0.8rem' },
                            color: 'rgba(255,255,255,0.8)',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
          </Grid>
        </Container>

      </Box>

      {/* Quick Actions Bar */}
      <Box
        sx={{
          backgroundColor: 'white',
          py: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<ScheduleIcon />}
                sx={{
                  backgroundColor: colors.primary.main,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: colors.primary.dark,
                  },
                }}
                component={Link}
                to="/contact"
              >
                Book Appointment
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CarIcon />}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: colors.primary.light + '10',
                  },
                }}
                component={Link}
                to="/services"
              >
                Browse Services
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TireIcon />}
                sx={{
                  borderColor: colors.tire.new,
                  color: colors.tire.new,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: colors.tire.new + '10',
                  },
                }}
                component={Link}
                to="/inventory"
              >
                Browse Tires
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<PhoneIcon />}
                sx={{
                  backgroundColor: colors.secondary.main,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: colors.secondary.dark,
                  },
                }}
                component={Link}
                to="/contact"
              >
                Contact Us
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mobile Tire Emergency Service Banner */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.semantic.error} 0%, ${colors.secondary.main} 100%)`,
          py: { xs: 4, md: 3 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 35px,
                rgba(255,255,255,.1) 35px,
                rgba(255,255,255,.1) 70px
              )
            `,
            animation: 'moveStripes 2s linear infinite',
            '@keyframes moveStripes': {
              '0%': { transform: 'translateX(0)' },
              '100%': { transform: 'translateX(70px)' },
            },
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { 
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(255,255,255,0.4)',
                      },
                      '70%': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 0 0 20px rgba(255,255,255,0)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                      },
                    },
                  }}
                >
                  <TruckIcon sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    Mobile Tire Emergency Service
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <EmergencyIcon sx={{ fontSize: 18 }} />
                      Available 24/7
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 18 }} />
                      Fast Response Time
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 18 }} />
                      We Come To You
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack 
                direction={{ xs: 'row', sm: 'row' }} 
                spacing={2}
                justifyContent={{ xs: 'center', md: 'flex-end' }}
              >
                <Button
                  component={Link}
                  to="/contact"
                  variant="contained"
                  size="large"
                  startIcon={<TruckIcon />}
                  sx={{
                    backgroundColor: 'white',
                    color: colors.secondary.main,
                    fontWeight: 700,
                    px: { xs: 3, sm: 4 },
                    py: 1.5,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    borderRadius: 50,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 30px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Request Service
                </Button>
                <Button
                  component="a"
                  href="tel:2509869191"
                  variant="outlined"
                  size="large"
                  startIcon={<PhoneIcon />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    px: { xs: 3, sm: 4 },
                    py: 1.5,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    borderRadius: 50,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                      borderWidth: 2,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Call Now
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured Services - Modern Cards */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="OUR SERVICES"
              sx={{
                backgroundColor: colors.secondary.light + '20',
                color: colors.secondary.main,
                fontWeight: 700,
                mb: 2,
                px: 2,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: colors.text.primary,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              What We Do Best
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: colors.text.secondary,
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              From quick maintenance to complex repairs, our certified
              technicians handle it all
            </Typography>
          </Box>
        </Fade>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
          {[
            {
              title: 'Mobile Tire Service',
              description:
                'Professional tire installation at your location, available 24/7',
              icon: <TruckIcon sx={{ fontSize: 48 }} />,
              color: colors.secondary.main,
              features: [
                'On-site installation',
                '24/7 service',
                'All tire brands',
              ],
              image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
            {
              title: 'Complete Auto Repair',
              description:
                'From engine diagnostics to brake service, we fix it all',
              icon: <BuildIcon sx={{ fontSize: 48 }} />,
              color: colors.primary.main,
              features: ['Engine repair', 'Brake service', 'Electrical work'],
              image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            },
            {
              title: 'Preventive Maintenance',
              description:
                'Keep your vehicle running smoothly with regular service',
              icon: <SettingsIcon sx={{ fontSize: 48 }} />,
              color: colors.semantic.success,
              features: [
                'Oil changes',
                'Tire rotation',
                'Multi-point inspection',
              ],
              image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            },
          ].map((service, index) => (
            <Box key={index} sx={{ 
              width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
              minWidth: { xs: '100%', sm: '280px', md: '320px' },
              maxWidth: { xs: '100%', sm: '400px', md: '380px' }
            }}>
              <Zoom in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      '& .service-overlay': {
                        opacity: 1,
                      },
                      '& .service-icon': {
                        transform: 'rotate(10deg) scale(1.1)',
                      },
                    },
                  }}
                >
                  {/* Card Background */}
                  <Box
                    sx={{
                      height: 200,
                      background: service.image,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      className="service-icon"
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        p: 3,
                        color: service.color,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      {service.icon}
                    </Box>

                    {/* Hover Overlay */}
                    <Box
                      className="service-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Button
                        variant="contained"
                        component={Link}
                        to="/services"
                        sx={{
                          backgroundColor: 'white',
                          color: service.color,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          },
                        }}
                      >
                        Learn More
                      </Button>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: colors.text.primary,
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: colors.text.secondary,
                        mb: 3,
                        lineHeight: 1.6,
                      }}
                    >
                      {service.description}
                    </Typography>
                    <Stack spacing={1}>
                      {service.features.map((feature, i) => (
                        <Box
                          key={i}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <CheckIcon
                            sx={{
                              color: service.color,
                              fontSize: 20,
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          ))}
        </Box>

        {/* Service Categories Grid */}
        <Box sx={{ mt: 10 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 5,
              textAlign: 'center',
            }}
          >
            All Our Services
          </Typography>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {[
              {
                icon: <CarIcon />,
                name: 'Tire Installation',
                color: colors.tire.new,
              },
              {
                icon: <TruckIcon />,
                name: 'Mobile Services',
                color: colors.secondary.main,
              },
              {
                icon: <EmergencyIcon />,
                name: 'Emergency Assistance',
                color: colors.semantic.error,
              },
              {
                icon: <BuildIcon />,
                name: 'Oil Changes',
                color: colors.service.maintenance,
              },
              {
                icon: <SettingsIcon />,
                name: 'Engine Repair',
                color: colors.primary.main,
              },
              {
                icon: <SpeedIcon />,
                name: 'Brake Service',
                color: colors.service.repair,
              },
              {
                icon: <ClockIcon />,
                name: 'AC & Heating',
                color: colors.semantic.info,
              },
              {
                icon: <ShieldIcon />,
                name: 'Diagnostics',
                color: colors.service.inspection,
              },
            ].map((service, index) => (
              <Box key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: colors.neutral[200],
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: service.color,
                      backgroundColor: service.color + '08',
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${service.color}20`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
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
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600,
                      minHeight: '2em',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {service.name}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/services"
            variant="outlined"
            size="large"
            sx={{
              borderColor: colors.primary.main,
              color: colors.primary.main,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderColor: colors.primary.dark,
                backgroundColor: colors.primary.main,
                color: 'white',
                borderWidth: 2,
              },
              transition: 'all 0.3s ease',
            }}
          >
            View All Services
          </Button>
        </Box>
      </Container>

      {/* Tire Brands Section */}
      <Box
        sx={{ backgroundColor: colors.background.light, py: { xs: 6, md: 8 } }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Tire Brands We Carry
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {tireBrands.map((brand, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={index}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    p: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    border: `1px solid ${colors.neutral[200]}`,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: colors.primary.main,
                      '& .tire-icon': {
                        transform: 'rotate(360deg)',
                        color: colors.primary.main,
                      },
                    },
                  }}
                >
                  <Box
                    className="tire-icon"
                    sx={{ 
                      fontSize: 24, 
                      transition: 'all 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                    }} 
                  >
                    🛞
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {brand}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Trust & Social Proof Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)
            `,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              label="WHY CHOOSE US"
              sx={{
                backgroundColor: colors.secondary.main,
                color: 'white',
                fontWeight: 700,
                mb: 3,
                px: 2,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'white',
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Trusted by Hundreds
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 400,
              }}
            >
              Join over 1,000 satisfied customers who trust us with their
              vehicles
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex',
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: 2,
              justifyContent: 'center',
              alignItems: 'stretch',
            }}
          >
            {[
              {
                icon: <CertifiedIcon />,
                title: 'ASE Certified',
                description:
                  'All our technicians are ASE certified with continuous training',
                stat: '100%',
                statLabel: 'Certified',
              },
              {
                icon: <HandshakeIcon />,
                title: '10+ Years Experience',
                description: 'Serving the community with excellence since 2014',
                stat: '10+',
                statLabel: 'Years',
              },
              {
                icon: <StarIcon />,
                title: '4.9 Star Rating',
                description:
                  'Consistently rated as the best auto service in the region',
                stat: '4.9★',
                statLabel: 'Rating',
              },
              {
                icon: <ShieldIcon />,
                title: 'Warranty Guaranteed',
                description:
                  'All our work comes with comprehensive warranty protection',
                stat: '100%',
                statLabel: 'Coverage',
              },
            ].map((feature, index) => (
              <Box 
                key={index}
                sx={{ 
                  flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(50% - 8px)', md: '1' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(50% - 8px)', md: '200px' },
                  maxWidth: { xs: 'calc(50% - 8px)', sm: 'calc(50% - 8px)', md: '280px' },
                }}
              >
                <Fade in timeout={1000 + index * 200}>
                  <Paper
                    sx={{
                      p: 2.5,
                      height: '100%',
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.98)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: colors.gradients.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'white',
                      }}
                    >
                      {React.cloneElement(feature.icon, {
                        sx: { fontSize: 24 },
                      })}
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: colors.secondary.main,
                        mb: 0.5,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {feature.stat}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        mb: 1,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        fontSize: '0.7rem',
                      }}
                    >
                      {feature.statLabel}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: colors.text.primary,
                        mb: 0.5,
                        fontSize: { xs: '0.85rem', md: '1rem' },
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.secondary,
                        lineHeight: 1.4,
                        fontSize: { xs: '0.7rem', md: '0.75rem' },
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Paper>
                </Fade>
              </Box>
            ))}
          </Box>

          {/* Awards & Certifications */}
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 3,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Awards & Certifications
            </Typography>
            <Stack
              direction="row"
              spacing={4}
              justifyContent="center"
              flexWrap="wrap"
              sx={{ gap: 3 }}
            >
              {[
                'ASE Certified',
                'BBB A+ Rating',
                'Best of 2023',
                'Top Rated Service',
              ].map((award) => (
                <Chip
                  key={award}
                  label={award}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 3,
                    height: 'auto',
                    fontSize: '1rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>



      {/* Contact Information Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: colors.text.secondary,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            We're here to help with all your automotive needs
          </Typography>
        </Box>

        {/* Contact Cards Row */}
        <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center" alignItems="stretch">
          {/* Call Us Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <Card
              sx={{
                p: 4,
                height: '100%',
                textAlign: 'center',
                borderRadius: 3,
                border: `2px solid ${colors.neutral[200]}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary.main,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
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
                  mb: 3,
                  color: colors.primary.main,
                }}
              >
                <PhoneIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Call Us
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  Johny:{' '}
                  <a
                    href="tel:2509869191"
                    style={{
                      color: colors.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    (250) 986-9191
                  </a>
                </Typography>
                <Typography variant="body1">
                  Harjinder:{' '}
                  <a
                    href="tel:2505651571"
                    style={{
                      color: colors.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    (250) 565-1571
                  </a>
                </Typography>
              </Stack>
            </Card>
          </Grid>

          {/* Email Us Card */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
            <Card
              sx={{
                p: 4,
                height: '100%',
                textAlign: 'center',
                borderRadius: 3,
                border: `2px solid ${colors.neutral[200]}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary.main,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
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
                  mb: 3,
                  color: colors.primary.main,
                }}
              >
                <EmailIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Email Us
              </Typography>
              <Typography variant="body1">
                <a
                  href="mailto:gt-automotives@outlook.com"
                  style={{
                    color: colors.primary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    wordBreak: 'break-word',
                  }}
                >
                  gt-automotives@outlook.com
                </a>
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.text.secondary, mt: 2 }}
              >
                We'll respond within 24 hours
              </Typography>
            </Card>
          </Grid>

          {/* Business Hours Card */}
          <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
            <Card
              sx={{
                p: 4,
                height: '100%',
                textAlign: 'center',
                borderRadius: 3,
                border: `2px solid ${colors.neutral[200]}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: colors.primary.main,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)',
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
                  mb: 3,
                  color: colors.primary.main,
                }}
              >
                <ScheduleIcon sx={{ fontSize: 30 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Business Hours
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Monday - Friday
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  8:00 AM - 6:00 PM
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Saturday - Sunday
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  9:00 AM - 5:00 PM
                </Typography>
                <Chip
                  label="24/7 Emergency"
                  sx={{
                    backgroundColor: colors.secondary.light + '20',
                    color: colors.secondary.main,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Why GT Automotives Card - Full Width Below */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
            borderRadius: 3,
            p: { xs: 4, md: 6 },
            color: 'white',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Why GT Automotives?
          </Typography>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {[
              { icon: <CertifiedIcon />, text: "Certified ASE Technicians" },
              { icon: <EmergencyIcon />, text: "24/7 Emergency Service" },
              { icon: <TruckIcon />, text: "Mobile Tire Installation" },
              { icon: <CheckIcon />, text: "100% Satisfaction Guarantee" },
              { icon: <MoneyIcon />, text: "Competitive Pricing" },
              { icon: <StarIcon />, text: "Top Rated Service" },
            ].map((item, index) => (
              <Box key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transform: 'translateX(8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      color: colors.secondary.main,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'white',
                      fontWeight: 500,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <CTASection
          title="Need Emergency Service?"
          description="We're available 24/7 for roadside assistance and emergency repairs"
          primaryAction={{
            label: 'Call Now: (250) 986-9191',
            path: 'tel:2509869191',
          }}
          secondaryAction={{
            label: 'Schedule Service',
            path: '/contact',
            icon: <ScheduleIcon />,
          }}
          variant="gradient"
        />
      </Container>

      {/* Service Areas - Redesigned */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)
            `,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TruckIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Service Coverage Area
              </Typography>
            </Stack>
            
            <Typography
              variant="h5"
              sx={{
                color: colors.secondary.main,
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
              }}
            >
              Prince George & 100km Radius
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
              }}
            >
              Our mobile tire emergency service reaches you wherever you are within 100 kilometers of Prince George
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}
