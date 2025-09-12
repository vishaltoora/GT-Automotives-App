import {
  WorkspacePremium as CertifiedIcon,
  Handshake as HandshakeIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Container,
  Fade,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { colors } from '../../theme/colors';

interface TrustFeature {
  icon: React.ReactElement;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

export function TrustSection() {
  const features: TrustFeature[] = [
    {
      icon: <CertifiedIcon />,
      title: 'ASE Certified',
      description: 'All our technicians are ASE certified with continuous training',
      stat: '100%',
      statLabel: 'Certified',
    },
    {
      icon: <HandshakeIcon />,
      title: '10+ Years Experience',
      description: 'Serving the community with excellence since 2014',
      stat: '10+',
      statLabel: 'Years',
    },
    {
      icon: <StarIcon />,
      title: '4.9 Star Rating',
      description: 'Consistently rated as the best auto service in the region',
      stat: '4.9★',
      statLabel: 'Rating',
    },
    {
      icon: <ShieldIcon />,
      title: 'Warranty Guaranteed',
      description: 'All our work comes with comprehensive warranty protection',
      stat: '100%',
      statLabel: 'Coverage',
    },
  ];

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <BackgroundPattern />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <SectionHeader />
        <TrustFeatures features={features} />
        <AwardsSection />
      </Container>
    </Box>
  );
}

function BackgroundPattern() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)
        `,
      }}
    />
  );
}

function SectionHeader() {
  return (
    <Box sx={{ textAlign: 'center', mb: 8 }}>
      <Chip
        label="WHY CHOOSE US"
        sx={{
          backgroundColor: colors.secondary.main,
          color: 'white',
          fontWeight: 700,
          mb: 3,
          px: 2,
        }}
      />
      <Typography
        variant="h2"
        sx={{
          fontWeight: 800,
          color: 'white',
          mb: 2,
          fontSize: { xs: '2rem', md: '3rem' },
        }}
      >
        Trusted by Hundreds
      </Typography>
      <Typography
        variant="h5"
        sx={{
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 700,
          mx: 'auto',
          fontWeight: 400,
        }}
      >
        Join over 1,000 satisfied customers who trust us with their vehicles
      </Typography>
    </Box>
  );
}

function TrustFeatures({ features }: { features: TrustFeature[] }) {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: 2,
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      {features.map((feature, index) => (
        <Box 
          key={index}
          sx={{ 
            flex: { xs: '0 0 calc(50% - 8px)', sm: '0 0 calc(50% - 8px)', md: '1' },
            minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(50% - 8px)', md: '200px' },
            maxWidth: { xs: 'calc(50% - 8px)', sm: 'calc(50% - 8px)', md: '280px' },
          }}
        >
          <Fade in timeout={1000 + index * 200}>
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.98)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <TrustFeatureCard feature={feature} />
            </Paper>
          </Fade>
        </Box>
      ))}
    </Box>
  );
}

function TrustFeatureCard({ feature }: { feature: TrustFeature }) {
  return (
    <>
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: colors.gradients.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: 'white',
        }}
      >
        {feature.icon}
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: colors.secondary.main,
          mb: 0.5,
          fontSize: { xs: '1.5rem', md: '2rem' },
        }}
      >
        {feature.stat}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: colors.text.secondary,
          mb: 1,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: '0.7rem',
        }}
      >
        {feature.statLabel}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
          color: colors.text.primary,
          mb: 0.5,
          fontSize: { xs: '0.85rem', md: '1rem' },
        }}
      >
        {feature.title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: colors.text.secondary,
          lineHeight: 1.4,
          fontSize: { xs: '0.7rem', md: '0.75rem' },
        }}
      >
        {feature.description}
      </Typography>
    </>
  );
}

function AwardsSection() {
  const awards = ['ASE Certified', 'BBB A+ Rating', 'Best of 2023', 'Top Rated Service'];

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          mb: 3,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        Awards & Certifications
      </Typography>
      <Stack
        direction="row"
        spacing={4}
        justifyContent="center"
        flexWrap="wrap"
        sx={{ gap: 3 }}
      >
        {awards.map((award) => (
          <Chip
            key={award}
            label={award}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              py: 3,
              height: 'auto',
              fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}