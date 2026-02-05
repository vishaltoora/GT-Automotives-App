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
  ArrowBack as PrevIcon,
  ArrowForward as NextIcon,
  Circle as DotIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon?: React.ComponentType<{ sx?: object }>;
}

interface PageHeroProps {
  slides: SlideData[];
  primaryAction?: {
    label: string;
    path: string;
  };
  secondaryAction?: {
    label: string;
    path: string;
  };
  autoPlay?: boolean;
  slideDuration?: number;
}

const SLIDE_DURATION = 6000; // 6 seconds per slide

export const PageHero: React.FC<PageHeroProps> = ({
  slides,
  primaryAction,
  secondaryAction,
  autoPlay = true,
  slideDuration = SLIDE_DURATION,
}) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentSlide = slides[currentIndex];
  const IconComponent = currentSlide?.icon;

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [isPaused, autoPlay, slides.length, slideDuration]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }, [currentIndex, slides.length, goToSlide]);

  const goToPrev = useCallback(() => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }, [currentIndex, slides.length, goToSlide]);

  // Helper function to check if a path is external
  const isExternalPath = (path: string) => {
    return path.startsWith('http') || path.startsWith('tel:') || path.startsWith('mailto:') || path.startsWith('#');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '35vh', md: '30vh' },
        minHeight: { xs: 300, md: 350 },
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Transition */}
      {slides.map((slide, index) => (
        <Box
          key={slide.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${slide.image})`,
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
          py: { xs: 4, md: 6 },
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

            {/* Service Icon */}
            {IconComponent && (
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                <IconComponent sx={{ fontSize: 30, color: 'white' }} />
              </Box>
            )}

            {/* Subtitle */}
            <Typography
              variant="overline"
              sx={{
                color: colors.secondary.main,
                fontWeight: 700,
                letterSpacing: 3,
                fontSize: { xs: '0.75rem', md: '0.85rem' },
                mb: 1,
                display: 'block',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              {currentSlide?.subtitle}
            </Typography>

            {/* Title */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                color: 'white',
                lineHeight: 1.1,
                mb: 2,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              {currentSlide?.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                lineHeight: 1.6,
                mb: 3,
                maxWidth: 600,
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              {currentSlide?.description}
            </Typography>

            {/* CTA Buttons */}
            {(primaryAction || secondaryAction) && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                {primaryAction && (
                  <Button
                    {...(isExternalPath(primaryAction.path)
                      ? { component: 'a', href: primaryAction.path }
                      : { component: Link, to: primaryAction.path })}
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: colors.secondary.main,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: colors.secondary.dark,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(255,107,53,0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    {...(isExternalPath(secondaryAction.path)
                      ? { component: 'a', href: secondaryAction.path }
                      : { component: Link, to: secondaryAction.path })}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
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
                    {secondaryAction.label}
                  </Button>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>

      {/* Navigation Controls - Only show if multiple slides */}
      {slides.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 15, md: 25 },
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
                {slides.map((_, index) => (
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
      )}
    </Box>
  );
};

export default PageHero;
