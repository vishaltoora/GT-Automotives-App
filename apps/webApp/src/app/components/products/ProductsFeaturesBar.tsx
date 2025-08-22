import React from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

const productColors = {
  accent: '#4caf50',
  background: {
    light: '#f8f9fa',
  },
};

const features = [
  {
    icon: VerifiedIcon,
    title: 'Quality Guaranteed',
    subtitle: 'All tires inspected',
  },
  {
    icon: LocalShippingIcon,
    title: 'Free Installation',
    subtitle: 'On sets of 4',
  },
  {
    icon: LocalOfferIcon,
    title: 'Best Prices',
    subtitle: 'Price match guarantee',
  },
  {
    icon: NewReleasesIcon,
    title: 'Latest Models',
    subtitle: '2024 inventory',
  },
];

export const ProductsFeaturesBar: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: productColors.background.light, py: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                <feature.icon sx={{ color: productColors.accent, fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.subtitle}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};