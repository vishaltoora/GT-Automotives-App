import React from 'react';
import { Container, Typography, Grid, Paper, Stack } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BuildIcon from '@mui/icons-material/Build';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const pricingColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  accent: '#4caf50',
  text: {
    primary: '#212121',
  },
  gradient: {
    secondary: 'linear-gradient(135deg, #ff6b35 0%, #ff8f65 100%)',
  },
};

const promotions = [
  {
    icon: LocalOfferIcon,
    title: 'Buy 3 Tires, Get 1 Free',
    description: 'On select tire brands. Installation included.',
    background: pricingColors.gradient.secondary,
  },
  {
    icon: BuildIcon,
    title: 'Free Winter Check-Up',
    description: 'With any service over $100. Limited time offer.',
    background: pricingColors.primary,
  },
  {
    icon: DirectionsCarIcon,
    title: '15% Off First Service',
    description: 'New customers only. Cannot combine with other offers.',
    background: pricingColors.accent,
  },
];

export const PromotionsSection: React.FC = () => {
  return (
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
        {promotions.map((promo, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: promo.background,
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              <promo.icon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" fontWeight={700} mb={1}>
                {promo.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {promo.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};