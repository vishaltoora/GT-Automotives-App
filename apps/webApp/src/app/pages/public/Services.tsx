import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ServicesGrid, StatsSection, ServiceData } from '../../components/services';
import { PageHero } from '../../components/shared';

// Services page slides
const servicesSlides = [
  {
    id: 'tire-services',
    title: 'Expert Auto Care You Can Trust',
    subtitle: 'Professional Services',
    description: 'From routine maintenance to complex repairs, our certified technicians deliver quality service at competitive prices.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    icon: TireRepairIcon,
  },
  {
    id: 'mobile-service',
    title: 'Mobile Tire Service',
    subtitle: 'We Come To You',
    description: "Don't wait at the shop! Our fully-equipped mobile unit comes to your home, office, or roadside.",
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80',
    icon: LocalShippingIcon,
  },
  {
    id: 'maintenance',
    title: 'Complete Maintenance',
    subtitle: 'Keep Your Car Running',
    description: 'Oil changes, brake service, battery replacement, and comprehensive vehicle inspections.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    icon: BuildIcon,
  },
];

export const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const services: ServiceData[] = [
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
      popular: true,
      features: ['24/7 availability', 'On-site service', 'Emergency repair', 'Jump starts included'],
    },
    {
      title: 'Wheel Balancing',
      description: 'Professional wheel balancing to eliminate vibrations and ensure smooth driving.',
      icon: 'tune',
      category: 'tires',
      features: ['Computer balancing', 'Weight adjustment', 'Vibration elimination', 'Tire wear prevention'],
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
      description: '24/7 emergency assistance including jump starts, flat tire repair, and lockout service.',
      icon: 'warning',
      category: 'emergency',
      emergency: true,
      features: ['24/7 availability', 'Fast response', 'Flat tire repair', 'Mobile repairs'],
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
    {
      title: 'Car Detailing',
      description: 'Professional interior and exterior detailing services to keep your vehicle looking pristine.',
      icon: 'detail',
      category: 'maintenance',
      popular: true,
      features: ['Interior shampooing', 'Exterior polishing', 'Paint protection', 'Ceramic coating'],
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
      case 'detail': return <AutoAwesomeIcon sx={{ fontSize: 24 }} />;
      default: return <BuildIcon sx={{ fontSize: 24 }} />;
    }
  };

  return (
    <>
      <PageHero
        slides={servicesSlides}
        primaryAction={{
          label: 'Book Service',
          path: '/contact',
        }}
        secondaryAction={{
          label: 'Call Now',
          path: 'tel:2509869191',
        }}
        height="50vh"
      />
      <ServicesGrid
        services={services}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        getIcon={getIcon}
      />
      <StatsSection />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #ff6b35 0%, #ff8f65 100%)',
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
                color: '#ff6b35',
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