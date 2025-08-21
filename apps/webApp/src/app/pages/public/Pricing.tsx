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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Zoom,
  Fade,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BuildIcon from '@mui/icons-material/Build';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhoneIcon from '@mui/icons-material/Phone';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

// Define colors directly to avoid import issues
const pricingColors = {
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
  gradient: {
    primary: 'linear-gradient(135deg, #243c55 0%, #3a5270 100%)',
    secondary: 'linear-gradient(135deg, #ff6b35 0%, #ff8f65 100%)',
  },
};

export const Pricing: React.FC = () => {
  const servicePricing = [
    { service: 'Tire Installation (per tire)', price: '$25-45', description: 'Includes mounting and balancing' },
    { service: 'Wheel Alignment', price: '$89-129', description: 'Four-wheel computerized alignment' },
    { service: 'Tire Rotation', price: '$39', description: 'Rotate and inspect all tires' },
    { service: 'Flat Repair', price: '$25-35', description: 'Patch and plug repair' },
    { service: 'Oil Change', price: '$39-79', description: 'Synthetic or conventional' },
    { service: 'Brake Inspection', price: 'FREE', description: 'Complete brake system check' },
    { service: 'Brake Service', price: '$149-299', description: 'Per axle, parts and labor' },
    { service: 'Battery Test', price: 'FREE', description: 'Complete electrical system test' },
    { service: 'Battery Replacement', price: '$129-189', description: 'Includes installation' },
    { service: 'AC Service', price: '$89-149', description: 'Inspection and recharge' },
    { service: 'Engine Diagnostic', price: '$99', description: 'Computer scan and analysis' },
    { service: 'Pre-Purchase Inspection', price: '$149', description: '150+ point inspection' },
  ];

  const packages = [
    {
      name: 'Basic Maintenance',
      price: '$199',
      period: '6 months',
      color: pricingColors.primary,
      features: [
        '2 Oil changes',
        '1 Tire rotation',
        'Multi-point inspection',
        'Fluid top-up',
        'Battery test',
        'Brake inspection',
      ],
      savings: 'Save $50',
    },
    {
      name: 'Premium Care',
      price: '$449',
      period: 'annual',
      color: pricingColors.secondary,
      features: [
        '4 Oil changes',
        '2 Tire rotations',
        '1 Wheel alignment',
        'AC service',
        'Engine diagnostic',
        'Priority scheduling',
        '10% off repairs',
      ],
      savings: 'Save $150',
      popular: true,
    },
    {
      name: 'Complete Protection',
      price: '$899',
      period: 'annual',
      color: pricingColors.accent,
      features: [
        'Unlimited oil changes',
        '4 Tire rotations',
        '2 Wheel alignments',
        'All maintenance services',
        'Free diagnostics',
        '20% off all repairs',
        'Emergency priority',
        'Loaner vehicle available',
      ],
      savings: 'Save $400+',
    },
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
          background: pricingColors.gradient.primary,
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

                    {/* Floating Pricing Icons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.secondary,
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
                      <AttachMoneyIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <LocalOfferIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <CheckCircleIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
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
                      label="Transparent Pricing • No Hidden Fees • Fair Rates"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        px: 1,
                        '& .MuiChip-icon': {
                          color: pricingColors.secondary,
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
                    Simple, Honest
                    <Box
                      component="span"
                      sx={{
                        color: pricingColors.secondary,
                        display: 'inline',
                        ml: 1,
                      }}
                    >
                      Pricing
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
                    No hidden fees, no surprises. Get quality service at competitive prices with our transparent pricing structure
                  </Typography>

                  {/* CTA Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                    <Button
                      component={Link}
                      to="/contact"
                      variant="contained"
                      size="large"
                      startIcon={<LocalOfferIcon />}
                      sx={{
                        backgroundColor: pricingColors.secondary,
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
                      Get Free Quote
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
                      Call for Pricing
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
                      View Services
                    </Button>
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mobile Tire Service Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: pricingColors.secondary,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            MOBILE SERVICE
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: pricingColors.text.primary,
              textAlign: 'center',
            }}
          >
            Mobile Tire Service
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: pricingColors.text.secondary,
              textAlign: 'center',
              maxWidth: 600,
            }}
          >
            Professional tire service at your location - home, office, or roadside
          </Typography>
        </Stack>

        {/* Work Hours Pricing */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <AccessTimeIcon sx={{ color: pricingColors.primary }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: pricingColors.text.primary,
              }}
            >
              Work Hours (9 AM - 5 PM)
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {/* Small Cars & Sedans */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${pricingColors.primary}20`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.primary + '10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DirectionsCarIcon sx={{ color: pricingColors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Small Cars & Sedans
                      </Typography>
                      <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
                        SUVs up to 18" tires
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Mount & Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $139 + tax
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Double Mount & Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $199 + tax
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Pickup Trucks */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${pricingColors.primary}20`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.primary + '10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LocalShippingIcon sx={{ color: pricingColors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Pickup Trucks
                      </Typography>
                      <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
                        All sizes
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Mount & Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $149 + tax
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Double Mount & Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $229 + tax
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Low Profile Tires */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${pricingColors.primary}20`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.primary + '10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TireRepairIcon sx={{ color: pricingColors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Low Profile Tires
                      </Typography>
                      <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
                        Special handling required
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Mount & Balance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $149 + tax
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Flat Tire Repair */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${pricingColors.primary}20`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.accent + '10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BuildIcon sx={{ color: pricingColors.accent }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Flat Tire Repair
                      </Typography>
                      <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
                        On-site repair service
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Service Fee</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $29 + supplies + tax
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Tire Rotation */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${pricingColors.primary}20`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.primary + '10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AutorenewIcon sx={{ color: pricingColors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Tire Rotation
                      </Typography>
                      <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
                        Extend tire life
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Service Fee</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $69 + tax
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* 4 Tires Balance */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: `1px solid ${pricingColors.primary}20`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: pricingColors.primary + '10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SettingsIcon sx={{ color: pricingColors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        4 Tires Balance
                      </Typography>
                      <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
                        Smooth ride guaranteed
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Service Fee</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                        $69
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* After Hours / Emergency Service */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <WarningIcon sx={{ color: pricingColors.secondary }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: pricingColors.text.primary,
              }}
            >
              After Hours & Emergency Service
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: pricingColors.secondary + '08',
              border: `2px solid ${pricingColors.secondary}30`,
              borderRadius: 2,
            }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: pricingColors.text.primary }}>
                    24/7 Emergency Mobile Service
                  </Typography>
                  <Typography variant="body1" sx={{ color: pricingColors.text.secondary }}>
                    Available outside regular business hours for urgent tire emergencies
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: pricingColors.text.light }}>
                          Out Call Fee
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: pricingColors.secondary }}>
                          $99
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: pricingColors.text.light }}>
                          Service Rate
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: pricingColors.secondary }}>
                          $99/hour
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: pricingColors.text.light }}>
                          Distance
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: pricingColors.text.primary }}>
                          Rates Apply
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PhoneIcon />}
                    component="a"
                    href="tel:2505702333"
                    sx={{
                      backgroundColor: pricingColors.secondary,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#e55a2b',
                      },
                    }}
                  >
                    Call Emergency Service
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Service Area & Distance Pricing */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: pricingColors.background.light,
            border: `1px solid ${pricingColors.primary}20`,
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LocationOnIcon sx={{ color: pricingColors.primary }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Service Area & Distance Pricing
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: pricingColors.accent, fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Free service</strong> within 20km radius of city center
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: pricingColors.accent, fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>$2 per km</strong> for distances beyond 20km
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  border: `1px solid ${pricingColors.primary}10`,
                }}
              >
                <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>
                  <strong>Note:</strong> All prices are subject to applicable taxes. Emergency service rates apply outside regular business hours. Distance is calculated from Prince George city center.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Areas Covered Within 20km */}
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${pricingColors.primary}20` }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: pricingColors.text.primary }}>
              Areas Covered Within 20km (Free Service Zone)
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: pricingColors.primary, mb: 1 }}>
                  North & Northeast
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Hart Highway (to Salmon Valley)</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Chief Lake Road Area</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• North Nechako</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Cranbrook Hill</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: pricingColors.primary, mb: 1 }}>
                  South & Southwest
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Pineview</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Buckhorn</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• West Lake</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Blackwater</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: pricingColors.primary, mb: 1 }}>
                  East & Southeast
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Upper Fraser</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Tabor Lake</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Red Rock</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Mud River</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: pricingColors.primary, mb: 1 }}>
                  West & Northwest
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Miworth</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• Beaverly</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• North Kelly</Typography>
                  <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>• West Austin</Typography>
                </Stack>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, p: 2, backgroundColor: pricingColors.accent + '10', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ color: pricingColors.text.primary, fontStyle: 'italic' }}>
                <strong>City Areas:</strong> Downtown, College Heights, VLA, Heritage, Spruceland, Foothills, Crescents, Lakewood, Charella Gardens, and all neighborhoods within Prince George city limits.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Special Offers */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: pricingColors.secondary,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            LIMITED TIME
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: pricingColors.text.primary,
              textAlign: 'center',
            }}
          >
            Current Promotions
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: pricingColors.gradient.secondary,
                color: 'white',
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={700} mb={1}>
                Buy 3 Tires, Get 1 Free
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                On select tire brands. Installation included.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: pricingColors.primary,
                color: 'white',
              }}
            >
              <BuildIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={700} mb={1}>
                Free Winter Check-Up
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                With any service over $100. Limited time offer.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: pricingColors.accent,
                color: 'white',
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={700} mb={1}>
                15% Off First Service
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                New customers only. Cannot combine with other offers.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: pricingColors.background.accent, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight={700}>
              Ready to Save on Your Auto Service?
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600}>
              Contact us today for a personalized quote or to learn more about our service packages.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                to="/contact"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: pricingColors.secondary,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#e55a2b',
                  },
                }}
              >
                Get Your Quote
              </Button>
              <Button
                component="a"
                href="tel:2509869191"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: pricingColors.primary,
                  color: pricingColors.primary,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: pricingColors.primary,
                    backgroundColor: pricingColors.primary + '10',
                  },
                }}
              >
                📞 (250) 986-9191
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};