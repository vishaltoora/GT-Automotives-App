import React from 'react';
import { Container, Typography, Stack, Box, Grid } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import BuildIcon from '@mui/icons-material/Build';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SettingsIcon from '@mui/icons-material/Settings';
import LoopIcon from '@mui/icons-material/Loop';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import { MobileTireServiceCard } from './MobileTireServiceCard';
import { EmergencyServiceBanner } from './EmergencyServiceBanner';
import { ServiceAreasMap } from './ServiceAreasMap';

const pricingColors = {
  secondary: '#ff6b35',
  accent: '#4caf50',
  primary: '#243c55',
  text: {
    primary: '#212121',
    secondary: '#616161',
  },
};

const workHoursServices = [
  {
    title: 'Small Cars & Sedans',
    subtitle: 'SUVs up to 18" tires',
    icon: <DirectionsCarIcon />,
    services: [
      { name: 'Mount & Balance', price: '$139 + tax' },
      { name: 'Double Mount & Balance', price: '$199 + tax' },
    ],
  },
  {
    title: 'Mid-Size SUVs',
    subtitle: '19" tires and above',
    icon: <DirectionsCarIcon />,
    services: [
      { name: 'Mount & Balance', price: '$149 + tax' },
      { name: 'Double Mount & Balance', price: '$229 + tax' },
    ],
  },
  {
    title: 'Pickup Trucks',
    subtitle: 'All sizes',
    icon: <LocalShippingIcon />,
    services: [
      { name: 'Mount & Balance', price: '$169 + tax' },
      { name: 'Double Mount & Balance', price: '$239 + tax' },
    ],
  },
  {
    title: 'Pickup Truck Mud Tires',
    subtitle: 'Heavy-duty off-road tires',
    icon: <LocalShippingIcon />,
    services: [
      { name: 'Mount & Balance', price: '$199 + tax' },
      { name: 'Double Mount & Balance', price: '$299 + tax' },
    ],
  },
  {
    title: 'Low Profile Tires',
    subtitle: 'Special handling required',
    icon: <TireRepairIcon />,
    services: [
      { name: 'Mount & Balance', price: '$149 + tax' },
      { name: 'Double Mount & Balance', price: '$229 + tax' },
    ],
  },
  {
    title: 'Flat Tire Repair',
    subtitle: 'Includes home visit in Bowl area. $2/km outside Bowl area.',
    icon: <BuildIcon />,
    services: [
      { name: 'Service Fee', price: '$110 + tax' },
    ],
    iconColor: pricingColors.accent,
  },
  {
    title: 'Tire Swap',
    subtitle: 'Seasonal tire changeover',
    icon: <AutorenewIcon />,
    services: [
      { name: 'Small Car Tire Swap', price: '$69 + tax' },
      { name: 'Pickup Truck Tire Swap', price: '$89 + tax' },
    ],
  },
  {
    title: 'Tire Rotation',
    subtitle: 'Extend tire life',
    icon: <LoopIcon />,
    services: [
      { name: 'Small Car Tire Rotation', price: '$69 + tax' },
      { name: 'Pickup Truck Tire Rotation', price: '$89 + tax' },
    ],
  },
  {
    title: '4 Tires Balance',
    subtitle: 'Smooth ride guaranteed',
    icon: <SettingsIcon />,
    services: [
      { name: 'Service Fee', price: '$69' },
    ],
  },
  {
    title: '4 Tire Balance & Swap',
    subtitle: 'Balance and seasonal changeover',
    icon: <SettingsIcon />,
    services: [
      { name: 'Small Car', price: '$99 + tax' },
      { name: 'Pickup Truck', price: '$110 + tax' },
    ],
  },
  {
    title: 'Battery Boost',
    subtitle: 'In Bowl area. $2/km outside Bowl area.',
    icon: <BatteryChargingFullIcon />,
    services: [
      { name: 'Service Fee', price: '$69 + tax' },
    ],
  },
  {
    title: 'Battery Replacement',
    subtitle: 'In Bowl area. $2/km outside Bowl area.',
    icon: <BatteryChargingFullIcon />,
    services: [
      { name: 'Service Fee', price: '$69 + tax' },
    ],
  },
];

export const MobileTireServiceSection: React.FC = () => {
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
          MOBILE SERVICE
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#1a1a1a',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          Mobile Tire Service
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: pricingColors.text.secondary,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          Professional tire service at your location - home, office, or roadside
        </Typography>
      </Stack>

      {/* Work Hours Pricing */}
      <Box sx={{ mb: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <AccessTimeIcon sx={{ color: pricingColors.primary }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: pricingColors.text.primary,
            }}
          >
            Work Hours (9 AM - 5 PM)
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {workHoursServices.map((service, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <MobileTireServiceCard
                title={service.title}
                subtitle={service.subtitle}
                icon={service.icon}
                services={service.services}
                iconColor={service.iconColor}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* After Hours / Emergency Service */}
      <EmergencyServiceBanner />

      {/* Service Area & Distance Pricing */}
      <ServiceAreasMap />
    </Container>
  );
};