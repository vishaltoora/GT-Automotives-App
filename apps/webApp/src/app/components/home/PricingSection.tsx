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
  DirectionsCar as CarIcon,
  LocalShipping as TruckIcon,
  Terrain as MudIcon,
  TireRepair as TireIcon,
  Build as RepairIcon,
  Autorenew as SwapIcon,
  Loop as RotationIcon,
  Settings as BalanceIcon,
  NightsStay as AfterHoursIcon,
  BatteryChargingFull as BatteryIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface PricingTier {
  title: string;
  subtitle: string;
  services: { name: string; price: string }[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

export function PricingSection() {
  const pricingTiers: PricingTier[] = [
    {
      title: 'Small Cars & Sedans',
      subtitle: 'SUVs up to 18" tires',
      icon: <CarIcon sx={{ fontSize: 28 }} />,
      color: colors.primary.main,
      services: [
        { name: 'Mount & Balance', price: '$139 ' },
        { name: 'Double Mount & Balance', price: '$199 ' },
      ],
    },
    {
      title: 'Mid-Size SUVs',
      subtitle: '19" tires and above',
      icon: <CarIcon sx={{ fontSize: 28 }} />,
      color: '#1565c0',
      services: [
        { name: 'Mount & Balance', price: '$149 ' },
        { name: 'Double Mount & Balance', price: '$229 ' },
      ],
    },
    {
      title: 'Pickup Trucks',
      subtitle: 'All sizes',
      icon: <TruckIcon sx={{ fontSize: 28 }} />,
      color: colors.secondary.main,
      popular: true,
      services: [
        { name: 'Mount & Balance', price: '$169 ' },
        { name: 'Double Mount & Balance', price: '$239 ' },
      ],
    },
    {
      title: 'Pickup Truck Mud Tires',
      subtitle: 'Heavy-duty off-road tires',
      icon: <MudIcon sx={{ fontSize: 28 }} />,
      color: '#6d4c41',
      services: [
        { name: 'Mount & Balance', price: '$199 ' },
        { name: 'Double Mount & Balance', price: '$299 ' },
      ],
    },
    {
      title: 'Low Profile Tires',
      subtitle: 'Special handling required',
      icon: <TireIcon sx={{ fontSize: 28 }} />,
      color: '#7b1fa2',
      services: [
        { name: 'Mount & Balance', price: '$149 ' },
        { name: 'Double Mount & Balance', price: '$229 ' },
      ],
    },
    {
      title: 'Flat Tire Repair',
      subtitle: 'Includes home visit in Bowl area',
      icon: <RepairIcon sx={{ fontSize: 28 }} />,
      color: '#4caf50',
      services: [
        { name: 'Service Fee', price: '$110 ' },
      ],
    },
    {
      title: 'Tire Swap',
      subtitle: 'Seasonal tire changeover',
      icon: <SwapIcon sx={{ fontSize: 28 }} />,
      color: '#0288d1',
      services: [
        { name: 'Small Car', price: '$69 ' },
        { name: 'Pickup Truck', price: '$89 ' },
      ],
    },
    {
      title: 'Tire Rotation',
      subtitle: 'Extend tire life',
      icon: <RotationIcon sx={{ fontSize: 28 }} />,
      color: '#00897b',
      services: [
        { name: 'Small Car', price: '$69 ' },
        { name: 'Pickup Truck', price: '$89 ' },
      ],
    },
    {
      title: '4 Tires Balance',
      subtitle: 'Smooth ride guaranteed',
      icon: <BalanceIcon sx={{ fontSize: 28 }} />,
      color: '#455a64',
      services: [
        { name: 'Service Fee', price: '$69' },
      ],
    },
    {
      title: '4 Tire Balance & Swap',
      subtitle: 'Balance and seasonal changeover',
      icon: <BalanceIcon sx={{ fontSize: 28 }} />,
      color: '#5e35b1',
      services: [
        { name: 'Small Car', price: '$99 ' },
        { name: 'Pickup Truck', price: '$110 ' },
      ],
    },
    {
      title: 'Battery Boost',
      subtitle: 'In Bowl area. $2/km outside.',
      icon: <BatteryIcon sx={{ fontSize: 28 }} />,
      color: '#f9a825',
      services: [
        { name: 'Service Fee', price: '$69' },
      ],
    },
    {
      title: 'Battery Replacement',
      subtitle: 'In Bowl area. $2/km outside.',
      icon: <BatteryIcon sx={{ fontSize: 28 }} />,
      color: '#ff8f00',
      services: [
        { name: 'Service Fee', price: '$69' },
      ],
    },
    {
      title: 'Distance & After Hours',
      subtitle: 'Additional Rates',
      icon: <AfterHoursIcon sx={{ fontSize: 28 }} />,
      color: '#37474f',
      services: [
        { name: 'Beyond Bowl area', price: '$2/km' },
        { name: 'After hours call', price: '$99' },
        { name: 'After hours rate', price: '$99/hr' },
      ],
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
          animation: 'scrollPricing 60s linear infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
          width: 'fit-content',
          '@keyframes scrollPricing': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: `translateX(-${pricingTiers.length * 304}px)`,
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
        width: 280,
        minWidth: 280,
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

      <Divider sx={{ mb: 2 }} />

      {/* Services */}
      <Stack spacing={1.5}>
        {tier.services.map((service, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: colors.text.primary,
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {service.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: tier.color,
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {service.price}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export default PricingSection;
