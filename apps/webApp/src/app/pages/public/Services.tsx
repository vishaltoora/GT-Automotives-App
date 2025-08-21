import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Zoom,
  Fade,
} from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EngineeringIcon from '@mui/icons-material/Engineering';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

// Define colors directly to avoid import issues
const serviceColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  accent: '#4caf50',
  text: {
    primary: '#212121',
    secondary: '#616161',
    light: '#9e9e9e',
  },
  background: {
    light: '#f8f9fa',
    card: '#ffffff',
    accent: '#fff3e0',
  },
  service: {
    tires: '#ff6b35',
    maintenance: '#2196f3',
    repair: '#f44336',
    emergency: '#ff9800',
  },
  gradient: {
    primary: 'linear-gradient(135deg, #243c55 0%, #3a5270 100%)',
    secondary: 'linear-gradient(135deg, #ff6b35 0%, #ff8f65 100%)',
  },
};

export const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const services = [
    {
      title: 'Tire Installation & Balancing',
      description: 'Professional tire mounting, balancing, and pressure adjustment. Includes free rotation check.',
      icon: 'tire',
      category: 'tires',
      popular: true,
      features: ['Computer balancing', 'Pressure check', 'TPMS reset', 'Disposal of old tires'],
    },
    {
      title: 'Mobile Tire Service',
      description: '24/7 emergency tire replacement at your location. We bring the shop to you!',
      icon: 'truck',
      category: 'tires',
      emergency: true,
      features: ['24/7 availability', 'On-site service', 'Emergency repair', 'Jump starts included'],
    },
    {
      title: 'Wheel Alignment',
      description: 'Precision 3D wheel alignment to improve handling and extend tire life.',
      icon: 'tune',
      category: 'tires',
      features: ['3D alignment', 'Printout report', 'Steering adjustment', 'Suspension check'],
    },
    {
      title: 'Oil Change Service',
      description: 'Full synthetic or conventional oil change with comprehensive 21-point inspection.',
      icon: 'build',
      category: 'maintenance',
      popular: true,
      features: ['Quality oil brands', 'Filter replacement', '21-point inspection', 'Fluid top-up'],
    },
    {
      title: 'Brake Service',
      description: 'Complete brake system inspection, pad replacement, and rotor service.',
      icon: 'speed',
      category: 'repair',
      features: ['Free inspection', 'Quality parts', 'Warranty included', 'Brake fluid check'],
    },
    {
      title: 'Battery Service',
      description: 'Battery testing, replacement, and complete electrical system diagnostics.',
      icon: 'battery',
      category: 'repair',
      features: ['Free testing', 'Top brands', '2-year warranty', 'Charging system test'],
    },
    {
      title: 'AC & Heating Service',
      description: 'Climate control system diagnostics, refrigerant recharge, and repairs.',
      icon: 'ac',
      category: 'maintenance',
      features: ['Leak detection', 'Refrigerant recharge', 'Component testing', 'Cabin filter check'],
    },
    {
      title: 'Engine Diagnostics',
      description: 'Advanced computer diagnostics to identify and resolve engine issues.',
      icon: 'engineering',
      category: 'repair',
      features: ['Computer scan', 'Error code analysis', 'Performance testing', 'Written report'],
    },
    {
      title: 'Transmission Service',
      description: 'Fluid change, filter replacement, and transmission system inspection.',
      icon: 'car',
      category: 'maintenance',
      features: ['Fluid exchange', 'Filter replacement', 'Pan cleaning', 'Seal inspection'],
    },
    {
      title: 'Emergency Roadside',
      description: '24/7 emergency assistance including towing, jump starts, and lockout service.',
      icon: 'warning',
      category: 'emergency',
      emergency: true,
      features: ['24/7 availability', 'Fast response', 'Towing available', 'Mobile repairs'],
    },
    {
      title: 'Suspension & Steering',
      description: 'Complete suspension system service including shocks, struts, and steering components.',
      icon: 'repair',
      category: 'repair',
      features: ['Free inspection', 'Quality parts', 'Alignment included', 'Road test'],
    },
    {
      title: 'Pre-Purchase Inspection',
      description: 'Comprehensive vehicle inspection before you buy. Know what you\'re getting into.',
      icon: 'check',
      category: 'maintenance',
      features: ['150+ point check', 'Written report', 'Photos included', 'Expert advice'],
    },
  ];

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'tires', label: 'Tire Services' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repairs' },
    { value: 'emergency', label: 'Emergency' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'tire': return <TireRepairIcon sx={{ fontSize: 24 }} />;
      case 'truck': return <LocalShippingIcon sx={{ fontSize: 24 }} />;
      case 'tune': return <TuneIcon sx={{ fontSize: 24 }} />;
      case 'build': return <BuildIcon sx={{ fontSize: 24 }} />;
      case 'speed': return <SpeedIcon sx={{ fontSize: 24 }} />;
      case 'battery': return <BatteryChargingFullIcon sx={{ fontSize: 24 }} />;
      case 'ac': return <AcUnitIcon sx={{ fontSize: 24 }} />;
      case 'engineering': return <EngineeringIcon sx={{ fontSize: 24 }} />;
      case 'car': return <DirectionsCarIcon sx={{ fontSize: 24 }} />;
      case 'warning': return <WarningIcon sx={{ fontSize: 24 }} />;
      case 'repair': return <CarRepairIcon sx={{ fontSize: 24 }} />;
      case 'check': return <CheckCircleIcon sx={{ fontSize: 24 }} />;
      case 'filter': return <FilterListIcon sx={{ fontSize: 20 }} />;
      default: return <BuildIcon sx={{ fontSize: 24 }} />;
    }
  };

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory || (selectedCategory === 'emergency' && s.emergency));

  return (
    <>
      {/* Animated Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '450px', sm: '400px', md: '420px', lg: '450px' },
          display: 'flex',
          alignItems: 'center',
          background: serviceColors.gradient.primary,
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
                        backgroundColor: serviceColors.secondary,
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
                      <ScheduleIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <TireRepairIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
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
                      icon={<CheckCircleIcon sx={{ fontSize: '1rem' }} />}
                      label="Certified Auto Services • Prince George • Est. 2010"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        px: 1,
                        '& .MuiChip-icon': {
                          color: serviceColors.secondary,
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
                    Expert Auto Care You
                    <Box
                      component="span"
                      sx={{
                        color: serviceColors.secondary,
                        display: 'inline',
                        ml: 1,
                      }}
                    >
                      Can Trust
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
                    From routine maintenance to complex repairs, our certified technicians deliver quality service at competitive prices
                  </Typography>

                  {/* CTA Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                    <Button
                      component={Link}
                      to="/contact"
                      variant="contained"
                      size="large"
                      startIcon={<ScheduleIcon />}
                      sx={{
                        backgroundColor: serviceColors.secondary,
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
                        '&:hover': {
                          backgroundColor: '#e55a2b',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(255,107,53,0.5)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Book Service
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
                      Call Now
                    </Button>

                    <Button
                      component={Link}
                      to="/pricing"
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
                      View Pricing
                    </Button>
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section with Categories */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="xl">
          <Stack spacing={1} alignItems="center" sx={{ mb: 5 }}>
            <Typography
              variant="overline"
              sx={{
                color: serviceColors.secondary,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              COMPREHENSIVE SERVICES
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: serviceColors.text.primary,
                textAlign: 'center',
              }}
            >
              All Services
            </Typography>
          </Stack>

          {/* Category Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, newValue) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 48,
                  color: serviceColors.text.secondary,
                  '&.Mui-selected': {
                    color: serviceColors.secondary,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: serviceColors.secondary,
                  height: 3,
                },
              }}
            >
              {categories.map((cat) => (
                <Tab
                  key={cat.value}
                  value={cat.value}
                  label={cat.label}
                />
              ))}
            </Tabs>
          </Box>

          {/* Service Cards - 3 per row */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}>
            {filteredServices.map((service, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {service.popular && (
                  <Chip
                    label="POPULAR"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      backgroundColor: serviceColors.secondary,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                )}
                {service.emergency && (
                  <Chip
                    label="24/7"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      backgroundColor: serviceColors.service.emergency,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                )}
                
                <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Icon and Title Section */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: serviceColors.gradient.secondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        mx: 'auto',
                        mb: 1.5,
                      }}
                    >
                      {getIcon(service.icon)}
                    </Box>
                    
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: serviceColors.text.primary,
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        minHeight: '2.6em',
                      }}
                    >
                      {service.title}
                    </Typography>
                  </Box>
                  
                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: serviceColors.text.secondary,
                      mb: 1.5,
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      minHeight: '2.8em',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                    }}
                  >
                    {service.description}
                  </Typography>
                  
                  {/* Features - smaller display */}
                  {service.features && (
                    <Box sx={{ mb: 2, flex: 1 }}>
                      <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {service.features.slice(0, 2).map((feature, idx) => (
                          <Chip
                            key={idx}
                            label={feature}
                            size="small"
                            sx={{
                              backgroundColor: serviceColors.background.light,
                              color: serviceColors.text.secondary,
                              fontSize: '0.7rem',
                              height: '20px',
                            }}
                          />
                        ))}
                        {service.features.length > 2 && (
                          <Chip
                            label={`+${service.features.length - 2}`}
                            size="small"
                            sx={{
                              backgroundColor: serviceColors.background.light,
                              color: serviceColors.text.secondary,
                              fontSize: '0.7rem',
                              height: '20px',
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  )}
                  
                  {/* Action button - at bottom */}
                  <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                    <Divider sx={{ mb: 2 }} />
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: serviceColors.primary,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        py: 1,
                        '&:hover': {
                          backgroundColor: '#1a2b3e',
                        },
                      }}
                    >
                      Get Quote
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: serviceColors.primary, color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  15+
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Years Experience
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  5000+
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Happy Customers
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  24/7
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Emergency Service
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  100%
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Satisfaction
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            background: serviceColors.gradient.secondary,
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Need Service Today?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.95,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Get professional service from certified technicians. Book online or call us now!
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
              startIcon={<ScheduleIcon />}
              sx={{
                backgroundColor: 'white',
                color: serviceColors.secondary,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
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
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              📞 (250) 986-9191
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};