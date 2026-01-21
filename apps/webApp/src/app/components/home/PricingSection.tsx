import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  LocalShipping as MobileIcon,
  Build as ServiceIcon,
  Speed as QuickIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface PricingTier {
  title: string;
  subtitle: string;
  price: string;
  priceNote: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
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
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${colors.neutral[50]} 0%, white 100%)`,
        position: 'relative',
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
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Chip
            label="TRANSPARENT PRICING"
            sx={{
              backgroundColor: colors.secondary.main,
              color: 'white',
              fontWeight: 700,
              mb: 3,
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

        {/* Pricing Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
            mb: { xs: 6, md: 8 },
          }}
        >
          {pricingTiers.map((tier, index) => (
            <PricingCard key={index} tier={tier} />
          ))}
        </Box>

        {/* Bottom Note */}
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 3, md: 4 },
            backgroundColor: colors.primary.main + '08',
            borderRadius: 3,
            border: `1px solid ${colors.primary.main}15`,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
              mb: 2,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            *Within Prince George city limits. Prices may vary based on tire size and vehicle type.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/pricing"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: colors.secondary.main,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: colors.secondary.dark,
                },
              }}
            >
              View All Prices
            </Button>
            <Button
              component="a"
              href="tel:2509869191"
              variant="outlined"
              size="large"
              sx={{
                borderColor: colors.primary.main,
                color: colors.primary.main,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: colors.primary.main + '08',
                },
              }}
            >
              Call (250) 986-9191
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <Paper
      elevation={tier.popular ? 8 : 0}
      sx={{
        position: 'relative',
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        border: tier.popular
          ? `2px solid ${colors.secondary.main}`
          : `1px solid ${colors.neutral[200]}`,
        backgroundColor: 'white',
        transition: 'all 0.3s ease',
        transform: tier.popular ? { md: 'scale(1.05)' } : 'none',
        '&:hover': {
          transform: tier.popular
            ? { xs: 'translateY(-8px)', md: 'scale(1.05) translateY(-8px)' }
            : 'translateY(-8px)',
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
            fontSize: '0.7rem',
            letterSpacing: 0.5,
          }}
        />
      )}

      {/* Icon */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          backgroundColor: tier.popular
            ? colors.secondary.main + '15'
            : colors.primary.main + '10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: tier.popular ? colors.secondary.main : colors.primary.main,
        }}
      >
        {tier.icon}
      </Box>

      {/* Title & Subtitle */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: colors.text.primary,
          mb: 0.5,
        }}
      >
        {tier.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: colors.text.secondary,
          mb: 3,
        }}
      >
        {tier.subtitle}
      </Typography>

      {/* Price */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
            display: 'block',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.7rem',
          }}
        >
          {tier.priceNote}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: tier.popular ? colors.secondary.main : colors.primary.main,
            lineHeight: 1,
          }}
        >
          {tier.price}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Features */}
      <Stack spacing={1.5}>
        {tier.features.map((feature, idx) => (
          <Stack
            key={idx}
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <CheckIcon
              sx={{
                fontSize: 18,
                color: tier.popular
                  ? colors.secondary.main
                  : colors.semantic.success,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: colors.text.secondary,
                fontSize: '0.9rem',
              }}
            >
              {feature}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export default PricingSection;
