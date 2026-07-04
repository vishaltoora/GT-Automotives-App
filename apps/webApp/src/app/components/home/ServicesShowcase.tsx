import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { colors } from '../../theme/colors';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

// Balanced service data — equal focus across everything we offer (shop + mobile).
const services = [
  {
    id: 'mechanical',
    title: 'Complete Auto Repair & Maintenance',
    subtitle: 'Mechanical & Oil Change',
    description:
      'Oil changes, brakes, diagnostics, tune-ups and full mechanical repairs — done right at our 473 3rd Ave shop.',
    image:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1920&q=80',
    features: ['Oil Changes', 'Brakes', 'Diagnostics'],
    mobileFeatures: ['Oil', 'Brakes', 'Diagnostics'],
  },
  {
    id: 'tire-sales',
    title: 'Tires for Every Vehicle & Budget',
    subtitle: 'New & Used Tire Sales',
    description:
      'Top brands like Michelin, Bridgestone and Goodyear, plus quality used options — all in stock at the shop.',
    image:
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=1920&q=80',
    features: ['All Major Brands', 'New & Used', 'Great Prices'],
    mobileFeatures: ['All Brands', 'New/Used', 'Best Price'],
  },
  {
    id: 'tire-service',
    title: 'Mounting, Balancing & Rotation',
    subtitle: 'Tire Service',
    description:
      'Expert tire installation, balancing, rotation and seasonal changeovers to keep you rolling safely all year.',
    image:
      'https://images.unsplash.com/photo-1444947295498-07f60c19a4ff?w=1920&q=80',
    features: ['Mount & Balance', 'Rotation', 'Seasonal Swap'],
    mobileFeatures: ['Mount', 'Rotation', 'Seasonal'],
  },
  {
    id: 'mobile-service',
    title: 'We Come To You',
    subtitle: 'Mobile Service',
    description:
      'Our fully-equipped mobile unit brings tire and roadside service to your home, office or roadside across Prince George.',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    features: ['Home & Office', 'Roadside', 'Same Day'],
    mobileFeatures: ['Home/Office', 'Roadside', 'Same Day'],
  },
  {
    id: 'detailing',
    title: 'Interior & Exterior Detailing',
    subtitle: 'Car Detailing',
    description:
      'Hand wash, polish, buffing and deep interior cleaning to keep your vehicle looking and feeling its best.',
    image:
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1920&q=80',
    features: ['Wash & Polish', 'Interior Clean', 'Wax & Buff'],
    mobileFeatures: ['Wash', 'Interior', 'Wax'],
  },
  {
    id: 'inspections',
    title: 'Certified Vehicle Inspections',
    subtitle: 'Inspections',
    description:
      'Thorough multi-point and safety inspections by certified technicians so you know your vehicle is road-ready.',
    image:
      'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=1920&q=80',
    features: ['Multi-Point', 'Safety Check', 'Certified Techs'],
    mobileFeatures: ['Multi-Point', 'Safety', 'Certified'],
  },
];

const SLIDE_DURATION = 2500; // 2.5 seconds per slide

export const ServicesShowcase: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentService = services[currentIndex];

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % services.length);
        setIsTransitioning(false);
      }, 300);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: { md: '62vh' },
        minHeight: { xs: 560, md: 480 },
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Transition */}
      {services.map((service, index) => (
        <Box
          key={service.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${service.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            transform: index === currentIndex ? 'scale(1)' : 'scale(1.1)',
            transition: 'opacity 1s ease-in-out, transform 6s ease-out',
            zIndex: 0,
          }}
        />
      ))}

      {/* Gradient Overlay - Using main brand color with reduced opacity */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg,
            rgba(30, 58, 95, 0.6) 0%,
            rgba(30, 58, 95, 0.7) 100%)`,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 8, md: 12 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 8 }}
          alignItems="center"
          sx={{ width: '100%' }}
        >
          {/* Animated Logo Section - Left Side */}
          {!isTablet && (
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: { md: 220, lg: 280 },
                height: { md: 220, lg: 280 },
              }}
            >
              {/* Animated Pulsing Circles */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.2)',
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.1)', opacity: 0.5 },
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  width: '85%',
                  height: '85%',
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  animation: 'pulse 3s ease-in-out infinite 0.5s',
                }}
              />

              {/* Central Logo */}
              <Box
                sx={{
                  width: { md: 160, lg: 200 },
                  height: { md: 160, lg: 200 },
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  padding: 2,
                  boxShadow: '0 12px 50px rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <img
                  src={gtLogo}
                  alt="GT Automotives Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Text Content */}
          <Box sx={{ flex: 1 }}>
            {/* Persistent full-service tagline (does not fade with slides) */}
            <Typography
              variant="overline"
              sx={{
                color: 'white',
                letterSpacing: 2,
                fontWeight: 700,
                fontSize: { xs: '0.7rem', md: '0.8rem' },
                display: 'block',
                mb: 1.5,
                opacity: 0.9,
              }}
            >
              Prince George's Full-Service Auto Shop + Mobile
            </Typography>

            <Box
              sx={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning
                  ? 'translateY(20px)'
                  : 'translateY(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              {/* Subtitle */}
              <Typography
                variant="overline"
                sx={{
                  color: colors.secondary.main,
                  letterSpacing: 3,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  mb: 1,
                  display: 'block',
                }}
              >
                {currentService.subtitle}
              </Typography>

              {/* Title */}
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  mb: 3,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  lineHeight: 1.2,
                }}
              >
                {currentService.title}
              </Typography>

              {/* Description */}
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  mb: 4,
                  lineHeight: 1.7,
                  maxWidth: 500,
                }}
              >
                {currentService.description}
              </Typography>

              {/* Features */}
              <Stack
                direction="row"
                spacing={{ xs: 0, md: 2 }}
                flexWrap="wrap"
                sx={{
                  mb: 3,
                  gap: { xs: 1, md: 1 },
                  justifyContent: { xs: 'flex-start', md: 'flex-start' },
                }}
              >
                {(isMobile
                  ? currentService.mobileFeatures
                  : currentService.features
                ).map((feature, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      px: { xs: 2, md: 2 },
                      py: { xs: 0.75, md: 0.75 },
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'white',
                        fontWeight: 500,
                        fontSize: { xs: '0.85rem', md: '0.875rem' },
                      }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Persistent dual CTAs — full-service (shop) + mobile */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: { xs: 7, md: 5 } }}
            >
              <Button
                component={Link}
                to="/book-appointment"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: colors.secondary.main,
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.3,
                  '&:hover': {
                    backgroundColor: colors.secondary.dark,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Book a Service
              </Button>
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  borderWidth: 2,
                  fontWeight: 700,
                  px: 4,
                  py: 1.3,
                  '&:hover': {
                    borderColor: 'white',
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Shop Tires
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ServicesShowcase;
