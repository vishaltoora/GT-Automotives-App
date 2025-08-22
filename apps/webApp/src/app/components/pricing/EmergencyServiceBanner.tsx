import React from 'react';
import { Paper, Grid, Stack, Typography, Button, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import PhoneIcon from '@mui/icons-material/Phone';

const pricingColors = {
  secondary: '#ff6b35',
  text: {
    primary: '#212121',
    secondary: '#616161',
    light: '#9e9e9e',
  },
};

const emergencyRates = [
  { label: 'Out Call Fee', value: '$99' },
  { label: 'Service Rate', value: '$99/hour' },
  { label: 'Distance', value: 'Rates Apply' },
];

export const EmergencyServiceBanner: React.FC = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <WarningIcon sx={{ color: pricingColors.secondary }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: pricingColors.text.primary,
          }}
        >
          After Hours & Emergency Service
        </Typography>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          backgroundColor: pricingColors.secondary + '08',
          border: `2px solid ${pricingColors.secondary}30`,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: pricingColors.text.primary }}>
                24/7 Emergency Mobile Service
              </Typography>
              <Typography variant="body1" sx={{ color: pricingColors.text.secondary }}>
                Available outside regular business hours for urgent tire emergencies
              </Typography>
              <Grid container spacing={2}>
                {emergencyRates.map((rate, index) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={index}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ color: pricingColors.text.light }}>
                        {rate.label}
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: rate.label === 'Distance' ? pricingColors.text.primary : pricingColors.secondary 
                      }}>
                        {rate.value}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<PhoneIcon />}
                component="a"
                href="tel:2505702333"
                sx={{
                  backgroundColor: pricingColors.secondary,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#e55a2b',
                  },
                }}
              >
                Call Emergency Service
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};