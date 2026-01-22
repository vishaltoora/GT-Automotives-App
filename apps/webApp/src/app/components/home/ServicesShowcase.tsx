import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Build as TireServiceIcon,
  DirectionsCar as AlignmentIcon,
  Speed as BalancingIcon,
  LocalShipping as MobileServiceIcon,
  Brightness5 as AllSeasonIcon,
  AcUnit as WinterIcon,
  ArrowBack as PrevIcon,
  ArrowForward as NextIcon,
  Circle as DotIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

// Service data with background images
const services = [
  {
    id: 'tire-installation',
    title: 'Professional Tire Installation',
    subtitle: 'Expert Mounting & Balancing',
    description: 'Our certified technicians use state-of-the-art equipment to mount and balance your tires, ensuring a smooth ride and optimal performance.',
    icon: TireServiceIcon,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    color: '#1a237e',
    features: ['Precision Mounting', 'Computer Balancing', 'TPMS Service'],
  },
  {
    id: 'wheel-alignment',
    title: 'Precision Wheel Alignment',
    subtitle: 'Drive Straight, Save Money',
    description: 'Proper alignment extends tire life, improves fuel economy, and ensures your vehicle handles safely in all conditions.',
    icon: AlignmentIcon,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    color: '#0d47a1',
    features: ['4-Wheel Alignment', 'Steering Check', 'Suspension Inspection'],
  },
  {
    id: 'tire-rotation',
    title: 'Tire Rotation & Balancing',
    subtitle: 'Maximize Your Tire Life',
    description: 'Regular rotation ensures even wear, extending your tire life and maintaining consistent handling across all four wheels.',
    icon: BalancingIcon,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80',
    color: '#2e7d32',
    features: ['Even Wear Pattern', 'Extended Life', 'Better Handling'],
  },
  {
    id: 'mobile-service',
    title: 'Mobile Tire Service',
    subtitle: "We Come To You",
    description: "Don't wait at the shop! Our fully-equipped mobile unit comes to your home, office, or roadside. Get professional tire service wherever you are in Prince George.",
    icon: MobileServiceIcon,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    color: '#e65100',
    features: ['Home & Office Service', 'Convenient Scheduling', 'Same Day Available'],
  },
  {
    id: 'emergency-roadside',
    title: '24/7 Emergency Roadside',
    subtitle: "Help When You Need It",
    description: "Flat tire? Blowout? Don't panic! Our emergency roadside team is available 24/7 to get you back on the road safely. Fast response times across Prince George.",
    icon: MobileServiceIcon,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
    color: '#d32f2f',
    features: ['24/7 Emergency Service', 'Fast Response Time', 'Flat Tire Repair'],
  },
  {
    id: 'seasonal-tires',
    title: 'Seasonal Tire Changeover',
    subtitle: 'Winter & Summer Ready',
    description: 'Beat the rush with our seasonal tire swap service. We store your off-season tires and have you road-ready when the weather changes.',
    icon: AllSeasonIcon,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&q=80',
    color: '#c62828',
    features: ['Tire Storage', 'Quick Swap', 'Inspection Included'],
  },
  {
    id: 'winter-tires',
    title: 'Winter Tire Specialists',
    subtitle: 'Stay Safe This Winter',
    description: 'Prince George winters demand quality winter tires. We stock top brands and install them properly for maximum safety on icy roads.',
    icon: WinterIcon,
    image: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1920&q=80',
    color: '#1565c0',
    features: ['Top Brands', 'Expert Advice', 'Studded Options'],
  },
];

const SLIDE_DURATION = 6000; // 6 seconds per slide

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

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % services.length;
    goToSlide(nextIndex);
  }, [currentIndex, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + services.length) % services.length;
    goToSlide(prevIndex);
  }, [currentIndex, goToSlide]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '50vh',
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

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg,
            rgba(${currentService.color === '#1a237e' ? '26, 35, 126' :
                   currentService.color === '#0d47a1' ? '13, 71, 161' :
                   currentService.color === '#2e7d32' ? '46, 125, 50' :
                   currentService.color === '#e65100' ? '230, 81, 0' :
                   currentService.color === '#c62828' ? '198, 40, 40' :
                   '21, 101, 192'}, 0.85) 0%,
            rgba(30, 58, 95, 0.9) 100%)`,
          zIndex: 1,
          transition: 'background 0.5s ease-in-out',
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
          <Box
            sx={{
              flex: 1,
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
            }}
          >
            {/* Mobile Animated Logo */}
            {isTablet && (
              <Box
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  mb: 2,
                  mx: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Animated Pulsing Circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    animation: 'pulse 3s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.5 },
                    },
                  }}
                />
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    padding: 0.75,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 4, gap: 1 }}>
              {currentService.features.map((feature, idx) => (
                <Box
                  key={idx}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'white', fontWeight: 500 }}
                  >
                    {feature}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* CTA Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                to="/services"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: colors.secondary.main,
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: colors.secondary.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255,107,53,0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                View All Services
              </Button>
              <Button
                component={Link}
                to="/contact"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
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
                Book Now
              </Button>
            </Stack>
          </Box>

        </Stack>
      </Container>

      {/* Navigation Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 20, md: 40 },
          left: 0,
          right: 0,
          zIndex: 3,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Left Arrow */}
            <IconButton
              onClick={goToPrev}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <PrevIcon />
            </IconButton>

            {/* Centered Dot Navigation */}
            <Stack direction="row" spacing={1} alignItems="center">
              {services.map((_, index) => (
                <IconButton
                  key={index}
                  onClick={() => goToSlide(index)}
                  sx={{
                    p: 0.5,
                    color: index === currentIndex ? colors.secondary.main : 'rgba(255,255,255,0.5)',
                    transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <DotIcon sx={{ fontSize: index === currentIndex ? 16 : 12 }} />
                </IconButton>
              ))}
            </Stack>

            {/* Right Arrow */}
            <IconButton
              onClick={goToNext}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <NextIcon />
            </IconButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ServicesShowcase;
