import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Zoom,
  Fade,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import PhoneIcon from '@mui/icons-material/Phone';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

// Define colors directly to avoid import issues
const productColors = {
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

export const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: 'Michelin Defender T+H',
      category: 'all-season',
      brand: 'Michelin',
      size: '225/65R17',
      features: ['80,000 mile warranty', 'All-season performance', 'Fuel efficient'],
      image: '🛞',
      popular: true,
      inStock: true,
    },
    {
      id: 2,
      name: 'Bridgestone Blizzak WS90',
      category: 'winter',
      brand: 'Bridgestone',
      size: '215/55R17',
      features: ['Winter performance', 'Ice traction', 'Snow grip'],
      image: '🛞',
      inStock: true,
    },
    {
      id: 3,
      name: 'Goodyear Eagle F1',
      category: 'performance',
      brand: 'Goodyear',
      size: '245/40R18',
      features: ['High performance', 'Superior handling', 'Sport driving'],
      image: '🛞',
      new: true,
      inStock: true,
    },
    {
      id: 4,
      name: 'Continental TerrainContact',
      category: 'all-terrain',
      brand: 'Continental',
      size: '275/65R18',
      features: ['Off-road capable', 'All-terrain', 'Durable construction'],
      image: '🛞',
      inStock: true,
    },
    {
      id: 5,
      name: 'BF Goodrich All-Terrain T/A KO2',
      category: 'all-terrain',
      brand: 'BF Goodrich',
      size: '285/75R16',
      features: ['Extreme durability', 'Off-road traction', 'Sidewall protection'],
      image: '🛞',
      popular: true,
      inStock: true,
    },
    {
      id: 6,
      name: 'Pirelli P Zero',
      category: 'performance',
      brand: 'Pirelli',
      size: '255/35R19',
      features: ['Ultra high performance', 'Track capable', 'Premium quality'],
      image: '🛞',
      inStock: false,
    },
    {
      id: 7,
      name: 'Yokohama Geolandar',
      category: 'all-terrain',
      brand: 'Yokohama',
      size: '265/70R17',
      features: ['All-terrain', 'Quiet ride', 'Long lasting'],
      image: '🛞',
      inStock: true,
    },
    {
      id: 8,
      name: 'Toyo Open Country',
      category: 'all-terrain',
      brand: 'Toyo',
      size: '275/55R20',
      features: ['Truck/SUV', 'All-weather', 'Heavy duty'],
      image: '🛞',
      new: true,
      inStock: true,
    },
    {
      id: 9,
      name: 'Firestone Winterforce',
      category: 'winter',
      brand: 'Firestone',
      size: '205/60R16',
      features: ['Budget winter', 'Snow traction', 'Value option'],
      image: '🛞',
      inStock: true,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Tires' },
    { value: 'all-season', label: 'All-Season' },
    { value: 'winter', label: 'Winter' },
    { value: 'performance', label: 'Performance' },
    { value: 'all-terrain', label: 'All-Terrain' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Animated Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '450px', sm: '400px', md: '420px', lg: '450px' },
          display: 'flex',
          alignItems: 'center',
          background: productColors.gradient.primary,
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

                    {/* Floating Product Icons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: productColors.secondary,
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
                      <TireRepairIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <ShoppingCartIcon sx={{ color: 'white', fontSize: '1.3rem' }} />
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
                      <VerifiedIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
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
                      icon={<VerifiedIcon sx={{ fontSize: '1rem' }} />}
                      label="Premium Tire Selection • New & Used • All Brands"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        px: 1,
                        '& .MuiChip-icon': {
                          color: productColors.secondary,
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
                    Quality Tires for
                    <Box
                      component="span"
                      sx={{
                        color: productColors.secondary,
                        display: 'inline',
                        ml: 1,
                      }}
                    >
                      Every Vehicle
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
                      mb: 2,
                    }}
                  >
                    Browse our extensive inventory of new and quality used tires from trusted brands
                  </Typography>

                  {/* Search Bar */}
                  <Box sx={{ width: '100%', maxWidth: 600, mb: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search by brand, model, or size..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            border: 'none',
                          },
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: productColors.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* CTA Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                    <Button
                      component={Link}
                      to="/inventory"
                      variant="contained"
                      size="large"
                      startIcon={<TireRepairIcon />}
                      sx={{
                        backgroundColor: productColors.secondary,
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
                      Shop Tires
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
                      Get Quote
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
                      Installation Services
                    </Button>
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Bar */}
      <Box sx={{ backgroundColor: productColors.background.light, py: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <VerifiedIcon sx={{ color: productColors.accent, fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Quality Guaranteed
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    All tires inspected
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <LocalShippingIcon sx={{ color: productColors.accent, fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Free Installation
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    On sets of 4
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <LocalOfferIcon sx={{ color: productColors.accent, fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Best Prices
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Price match guarantee
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <NewReleasesIcon sx={{ color: productColors.accent, fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Latest Models
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    2024 inventory
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Products Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
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
                color: productColors.text.secondary,
                '&.Mui-selected': {
                  color: productColors.secondary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: productColors.secondary,
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

        {/* Products Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                {product.popular && (
                  <Chip
                    label="POPULAR"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      backgroundColor: productColors.secondary,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
                {product.new && (
                  <Chip
                    label="NEW"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      zIndex: 1,
                      backgroundColor: productColors.accent,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                )}
                
                <CardMedia
                  sx={{
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: productColors.background.light,
                    fontSize: '5rem',
                  }}
                >
                  {product.image}
                </CardMedia>
                
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: productColors.text.secondary,
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    {product.brand}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: productColors.text.primary,
                      mb: 1,
                      minHeight: '3em',
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: productColors.primary,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    Size: {product.size}
                  </Typography>
                  
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2, flex: 1 }}>
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        sx={{
                          backgroundColor: productColors.background.light,
                          fontSize: '0.7rem',
                        }}
                      />
                    ))}
                  </Stack>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Chip
                      label={product.inStock ? 'In Stock' : 'Out of Stock'}
                      size="small"
                      sx={{
                        backgroundColor: product.inStock ? productColors.accent + '20' : '#f44336' + '20',
                        color: product.inStock ? productColors.accent : '#f44336',
                        fontWeight: 600,
                        mb: 2,
                      }}
                    />
                    
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={!product.inStock}
                      sx={{
                        backgroundColor: productColors.primary,
                        '&:hover': {
                          backgroundColor: '#1a2b3e',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found matching your criteria
            </Typography>
          </Box>
        )}
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: productColors.background.accent, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight={700}>
              Can't Find What You're Looking For?
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={600}>
              We have access to thousands of tire models. Contact us for special orders and custom sizes.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                to="/contact"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: productColors.secondary,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#e55a2b',
                  },
                }}
              >
                Contact Us
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: productColors.primary,
                  color: productColors.primary,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: productColors.primary,
                    backgroundColor: productColors.primary + '10',
                  },
                }}
              >
                Call: (250) 986-9191
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};