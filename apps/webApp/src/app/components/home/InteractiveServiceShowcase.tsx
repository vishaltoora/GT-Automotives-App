import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { colors } from '../../theme/colors';

/**
 * GA-37 — Interactive service showcase (image slideshow).
 *
 * Auto-advancing slideshow of the core offerings. Each slide shows a
 * faceless close-up image (no identifiable people), heading, description, and
 * a relevant CTA. The pills below double as slide indicators / manual controls.
 * Auto-advance pauses on hover and respects `prefers-reduced-motion`.
 */

interface Slide {
  id: string;
  label: string;
  icon: React.ComponentType<{ sx?: object }>;
  title: string;
  description: string;
  image: string;
  cta: { label: string; path: string; external?: boolean };
}

const SLIDES: Slide[] = [
  {
    id: 'mechanical',
    label: 'Mechanical & Oil',
    icon: BuildIcon,
    title: 'Complete Auto Repair & Maintenance',
    description:
      'Oil changes, brakes, diagnostics, tune-ups and full mechanical repairs — done right at our 473 3rd Ave shop.',
    image:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1400&q=80',
    cta: { label: 'Book Service', path: '/book-appointment' },
  },
  {
    id: 'tire-sales',
    label: 'Tire Sales',
    icon: StorefrontIcon,
    title: 'New & Used Tire Sales',
    description:
      'Quality new and used tires from top brands like Michelin, Bridgestone, and Goodyear — with options for every budget.',
    image:
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=1400&q=80',
    cta: { label: 'Shop Now', path: '/products' },
  },
  {
    id: 'tire-service',
    label: 'Tire Service',
    icon: TireRepairIcon,
    title: 'Mounting, Balancing & Rotation',
    description:
      'Expert tire installation, balancing, rotation and seasonal changeovers to keep you rolling safely all year.',
    image:
      'https://images.unsplash.com/photo-1444947295498-07f60c19a4ff?w=1400&q=80',
    cta: { label: 'Book Service', path: '/book-appointment' },
  },
  {
    id: 'mobile-service',
    label: 'Mobile Service',
    icon: LocalShippingIcon,
    title: 'Mobile Service — We Come To You',
    description:
      'Our fully-equipped mobile unit brings tire and roadside service to your home, office or roadside across Prince George.',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1400&q=80',
    cta: {
      label: 'Book Mobile Service',
      path: '/book-appointment?type=mobile',
    },
  },
  {
    id: 'detailing',
    label: 'Car Detailing',
    icon: AutoAwesomeIcon,
    title: 'Professional Car Detailing',
    description:
      'Interior and exterior detailing — hand wash, polish, buffing, and deep cleaning to keep your vehicle looking its best.',
    image:
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1400&q=80',
    cta: { label: 'Book Detailing', path: '/book-appointment' },
  },
  {
    id: 'inspections',
    label: 'Inspections',
    icon: FactCheckIcon,
    title: 'Certified Vehicle Inspections',
    description:
      'Thorough multi-point and safety inspections by certified technicians so you know your vehicle is road-ready.',
    image:
      'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=1400&q=80',
    cta: { label: 'Book Inspection', path: '/book-appointment' },
  },
];

const AUTO_ADVANCE_MS = 5000;

export const InteractiveServiceShowcase: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + SLIDES.length) % SLIDES.length);
  }, []);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Auto-advance (paused on hover / reduced-motion).
  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduce) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, activeIndex]);

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: colors.neutral[50] }}>
      <Container maxWidth="lg">
        {/* Heading */}
        <Stack
          spacing={1}
          alignItems="center"
          sx={{ mb: 4, textAlign: 'center' }}
        >
          <Chip
            label="See Us In Action"
            sx={{
              backgroundColor: colors.secondary.main + '1A',
              color: colors.secondary.dark,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Everything We Do, Under One Roof
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: colors.text.secondary, maxWidth: 640 }}
          >
            Mechanical &amp; oil changes, tire sales &amp; service, mobile
            service, detailing, and inspections — explore each below.
          </Typography>
        </Stack>

        {/* Slideshow */}
        <Box
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: `0 12px 40px ${colors.shadows.light}`,
            height: { xs: 460, sm: 420, md: 440 },
          }}
        >
          {/* Slides (cross-fade) */}
          {SLIDES.map((slide, index) => (
            <Box
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${SLIDES.length}: ${slide.label}`}
              aria-hidden={index !== activeIndex}
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: index === activeIndex ? 1 : 0,
                transition: 'opacity 0.7s ease-in-out',
                pointerEvents: index === activeIndex ? 'auto' : 'none',
              }}
            >
              {/* Background image */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: index === activeIndex ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 6s ease-out',
                }}
              />
              {/* Gradient overlay for text contrast */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(90deg, ${colors.primary.dark}E6 0%, ${colors.primary.dark}99 45%, ${colors.primary.dark}22 100%)`,
                }}
              />
              {/* Content */}
              <Container
                maxWidth="md"
                sx={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  px: { xs: 3, md: 6 },
                }}
              >
                <Box sx={{ maxWidth: 560 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: colors.secondary.main,
                      fontWeight: 700,
                      letterSpacing: 2,
                    }}
                  >
                    {slide.label}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'h4' : 'h3'}
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      lineHeight: 1.15,
                      mb: 2,
                    }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      mb: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {slide.description}
                  </Typography>
                  <Button
                    {...(slide.cta.external || slide.cta.path.startsWith('tel:')
                      ? { component: 'a' as const, href: slide.cta.path }
                      : { component: Link, to: slide.cta.path })}
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
                    {slide.cta.label}
                  </Button>
                </Box>
              </Container>
            </Box>
          ))}

          {/* Prev / Next arrows */}
          <IconButton
            aria-label="Previous slide"
            onClick={prev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 12,
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="Next slide"
            onClick={next}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 12,
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(6px)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tab pills (indicators + manual controls) */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 1.5,
            mt: 3,
          }}
        >
          {SLIDES.map((slide, index) => {
            const selected = index === activeIndex;
            const SegIcon = slide.icon;
            return (
              <Button
                key={slide.id}
                onClick={() => goTo(index)}
                aria-label={`Show ${slide.label}`}
                aria-current={selected}
                startIcon={<SegIcon />}
                variant={selected ? 'contained' : 'outlined'}
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 1,
                  fontWeight: 600,
                  borderRadius: 999,
                  ...(selected
                    ? {
                        backgroundColor: colors.primary.main,
                        color: 'white',
                        '&:hover': { backgroundColor: colors.primary.dark },
                      }
                    : {
                        borderColor: colors.neutral[300],
                        color: colors.text.primary,
                        '&:hover': {
                          borderColor: colors.primary.main,
                          backgroundColor: colors.primary.light + '10',
                        },
                      }),
                }}
              >
                {slide.label}
              </Button>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default InteractiveServiceShowcase;
