import React from 'react';
import { Paper, Stack, Box, Typography, Grid } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const pricingColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  accent: '#4caf50',
  text: {
    primary: '#212121',
    secondary: '#616161',
  },
  background: {
    light: '#f8f9fa',
  },
};

const serviceAreas = [
  {
    title: 'North & Northeast',
    areas: [
      'Hart Highway (to Austin Road)',
      'North Nechako',
      'Cranbrook Hill',
      'College Heights',
    ],
  },
  {
    title: 'South & Southwest',
    areas: [
      'Pineview',
      'Airport Area',
      'Industrial Area',
      'Spruceland',
    ],
  },
  {
    title: 'East & Southeast',
    areas: [
      'Blackburn',
      'Heritage',
      'Charella Gardens',
      'Downtown Core',
    ],
  },
  {
    title: 'West & Northwest',
    areas: [
      'Westwood',
      'Foothills',
      'Crescents',
      'Lakewood',
    ],
  },
];

export const ServiceAreasMap: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: pricingColors.background.light,
        border: `1px solid ${pricingColors.primary}20`,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <LocationOnIcon sx={{ color: pricingColors.primary }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Service Area & Distance Pricing
        </Typography>
      </Stack>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: pricingColors.accent, fontSize: 20 }} />
              <Typography variant="body1">
                <strong>Free service</strong> within 10km radius of city center
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: pricingColors.accent, fontSize: 20 }} />
              <Typography variant="body1">
                <strong>$2 per km</strong> for distances beyond 10km
              </Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'white',
              borderRadius: 1,
              border: `1px solid ${pricingColors.primary}10`,
            }}
          >
            <Typography variant="body2" sx={{ color: pricingColors.text.secondary }}>
              <strong>Note:</strong> All prices are subject to applicable taxes. Emergency service rates apply outside regular business hours. Distance is calculated from Prince George city center.
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Areas Covered Within 10km */}
      <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${pricingColors.primary}20` }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: pricingColors.text.primary }}>
          Areas Covered Within 10km (Free Service Zone)
        </Typography>
        <Grid container spacing={2}>
          {serviceAreas.map((area, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: pricingColors.primary, mb: 1 }}>
                {area.title}
              </Typography>
              <Stack spacing={0.5}>
                {area.areas.map((location, locationIndex) => (
                  <Typography key={locationIndex} variant="body2" sx={{ color: pricingColors.text.secondary }}>
                    • {location}
                  </Typography>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, p: 2, backgroundColor: pricingColors.accent + '10', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: pricingColors.text.primary, fontStyle: 'italic' }}>
            <strong>City Areas:</strong> Downtown, College Heights, VLA, Heritage, Spruceland, Foothills, Crescents, Lakewood, Charella Gardens, and all neighborhoods within Prince George city limits.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};