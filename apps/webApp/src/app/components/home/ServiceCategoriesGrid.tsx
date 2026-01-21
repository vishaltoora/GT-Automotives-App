import {
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  AccessTime as ClockIcon,
  Emergency as EmergencyIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  LocalShipping as TruckIcon,
  AutoAwesome as DetailIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface ServiceCategory {
  icon: React.ReactElement;
  name: string;
  color: string;
}

export function ServiceCategoriesGrid() {
  const serviceCategories: ServiceCategory[] = [
    { icon: <CarIcon />, name: 'Tire Installation', color: colors.tire.new },
    { icon: <TruckIcon />, name: 'Mobile Services', color: colors.secondary.main },
    { icon: <EmergencyIcon />, name: 'Emergency Assistance', color: colors.semantic.error },
    { icon: <BuildIcon />, name: 'Oil Changes', color: colors.service.maintenance },
    { icon: <SettingsIcon />, name: 'Engine Repair', color: colors.primary.main },
    { icon: <SpeedIcon />, name: 'Brake Service', color: colors.service.repair },
    { icon: <ClockIcon />, name: 'AC & Heating', color: colors.semantic.info },
    { icon: <ShieldIcon />, name: 'Diagnostics', color: colors.service.inspection },
    { icon: <DetailIcon />, name: 'Car Detailing', color: colors.secondary.dark },
  ];

  return (
    <Box sx={{ mt: 10 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colors.text.primary,
          mb: 5,
          textAlign: 'center',
        }}
      >
        All Our Services
      </Typography>
      
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        {serviceCategories.map((service, index) => (
          <ServiceCategoryCard key={index} service={service} />
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 6, mb: 8 }}>
        <Button
          component={Link}
          to="/services"
          variant="outlined"
          size="large"
          sx={{
            borderColor: colors.primary.main,
            color: colors.primary.main,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderWidth: 2,
            '&:hover': {
              borderColor: colors.primary.dark,
              backgroundColor: colors.primary.main,
              color: 'white',
              borderWidth: 2,
            },
            transition: 'all 0.3s ease',
          }}
        >
          View All Services
        </Button>
      </Box>
    </Box>
  );
}

function ServiceCategoryCard({ service }: { service: ServiceCategory }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: 3,
        border: '2px solid',
        borderColor: colors.neutral[200],
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          borderColor: service.color,
          backgroundColor: service.color + '08',
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${service.color}20`,
        },
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: service.color + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: service.color,
        }}
      >
        {service.icon}
      </Box>
      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: 600,
          minHeight: '2em',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {service.name}
      </Typography>
    </Paper>
  );
}