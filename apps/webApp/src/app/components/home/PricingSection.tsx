import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Fade,
} from '@mui/material';
import {
  LocalShipping as MobileIcon,
  Build as ServiceIcon,
  Speed as QuickIcon,
  TireRepair as TireIcon,
  AcUnit as WinterIcon,
  CarRepair as BalanceIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface PricingTier {
  title: string;
  subtitle: string;
  price: string;
  priceNote: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export function PricingSection() {
  const pricingTiers: PricingTier[] = [
    {
      title: 'Distance & After Hours',
      subtitle: 'Additional Rates',
      price: '$2/km',
      priceNote: 'beyond 10km radius',
      features: [
        'Free within 10km of city center',
        '$2 per km beyond 10km',
        'After hours call: $99',
        'After hours rate: $99/hr',
        '24/7 emergency available',
      ],
      icon: <ServiceIcon sx={{ fontSize: 28 }} />,
      color: colors.primary.main,
    },
    {
      title: 'Mobile Service',
      subtitle: 'We Come To You',
      price: '$139',
      priceNote: 'starting from + tax',
      features: [
        'Cars & SUVs: $139 + tax',
        'Pickup trucks: $149 + tax',
        'Double swap: $199-229 + tax',
        'Work hours: 9AM - 5PM',
        'Same-day available',
      ],
      popular: true,
      icon: <MobileIcon sx={{ fontSize: 28 }} />,
      color: colors.secondary.main,
    },
    {
      title: 'Other Services',
      subtitle: 'Quick & Affordable',
      price: '$29',
      priceNote: 'flat tire repair + tax',
      features: [
        'Flat tire repair: $29 + supplies',
        'Tire rotation: $69 + tax',
        '4 tires balance: $69',
        'Low profile: $149 + tax',
        'Professional service',
      ],
      icon: <QuickIcon sx={{ fontSize: 28 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Tire Installation',
      subtitle: 'At Our Shop',
      price: '$99',
      priceNote: 'mount & balance + tax',
      features: [
        'Standard tires: $99 + tax',
        'Low profile: $129 + tax',
        'TPMS service included',
        'Valve stems replaced',
        'Free tire inspection',
      ],
      icon: <TireIcon sx={{ fontSize: 28 }} />,
      color: '#1565c0',
    },
    {
      title: 'Seasonal Changeover',
      subtitle: 'Winter & Summer',
      price: '$69',
      priceNote: 'swap on rims + tax',
      features: [
        'Tires on rims: $69 + tax',
        'Off rims: $139 + tax',
        'Includes balance check',
        'TPMS reset included',
        'Storage available',
      ],
      icon: <WinterIcon sx={{ fontSize: 28 }} />,
      color: '#0288d1',
    },
    {
      title: 'Wheel Balancing',
      subtitle: 'Smooth Ride',
      price: '$69',
      priceNote: 'all 4 wheels + tax',
      features: [
        'Computer balancing',
        'Weight adjustment',
        'Vibration diagnosis',
        'Tire inspection',
        'Quick turnaround',
      ],
      icon: <BalanceIcon sx={{ fontSize: 28 }} />,
      color: '#455a64',
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${colors.neutral[50]} 0%, white 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.4,
          backgroundImage: `radial-gradient(${colors.neutral[200]} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SectionHeader />
      </Container>

      {/* Animated Slider */}
      <PricingSlider pricingTiers={pricingTiers} />

    </Box>
  );
}

function SectionHeader() {
  return (
    <Fade in timeout={1000}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Chip
          label="TRANSPARENT PRICING"
          sx={{
            backgroundColor: colors.secondary.main,
            color: 'white',
            fontWeight: 700,
            mb: 2,
            px: 2,
            fontSize: '0.75rem',
            letterSpacing: 1,
          }}
        />
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: colors.text.primary,
            mb: 2,
            fontSize: { xs: '2rem', md: '2.75rem' },
          }}
        >
          Simple, Honest Pricing
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: colors.text.secondary,
            maxWidth: 600,
            mx: 'auto',
            fontWeight: 400,
            fontSize: { xs: '1rem', md: '1.1rem' },
          }}
        >
          No hidden fees, no surprises. Quality service at fair prices.
        </Typography>
      </Box>
    </Fade>
  );
}

function PricingSlider({ pricingTiers }: { pricingTiers: PricingTier[] }) {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate tiers for seamless infinite loop
  const duplicatedTiers = [...pricingTiers, ...pricingTiers];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        py: 2,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          animation: 'scrollPricing 45s linear infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
          width: 'fit-content',
          '@keyframes scrollPricing': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: `translateX(-${pricingTiers.length * 320}px)`,
            },
          },
        }}
      >
        {duplicatedTiers.map((tier, index) => (
          <PricingCard key={index} tier={tier} />
        ))}
      </Box>
    </Box>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <Paper
      elevation={tier.popular ? 8 : 0}
      sx={{
        width: 300,
        minWidth: 300,
        position: 'relative',
        p: 3,
        borderRadius: 4,
        border: tier.popular
          ? `2px solid ${colors.secondary.main}`
          : `1px solid ${colors.neutral[200]}`,
        backgroundColor: 'white',
        transition: 'all 0.3s ease',
        flexShrink: 0,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <Chip
          label="MOST POPULAR"
          size="small"
          sx={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: colors.secondary.main,
            color: 'white',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: 0.5,
          }}
        />
      )}

      {/* Icon */}
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          backgroundColor: tier.color + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: tier.color,
        }}
      >
        {tier.icon}
      </Box>

      {/* Title & Subtitle */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: colors.text.primary,
          mb: 0.5,
          fontSize: '1.1rem',
        }}
      >
        {tier.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: colors.text.secondary,
          mb: 2,
          fontSize: '0.85rem',
        }}
      >
        {tier.subtitle}
      </Typography>

      {/* Price */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: tier.color,
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {tier.price}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
            fontSize: '0.7rem',
          }}
        >
          {tier.priceNote}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Features */}
      <Stack spacing={1}>
        {tier.features.map((feature, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: tier.color,
                mr: 1,
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${idx * 0.2}s`,
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.5)', opacity: 0.7 },
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: colors.text.primary,
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {feature}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default PricingSection;
