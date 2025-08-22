import React from 'react';
import { Paper, Stack, Box, Typography, Divider } from '@mui/material';

const pricingColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  accent: '#4caf50',
  text: {
    secondary: '#616161',
  },
};

interface ServicePrice {
  name: string;
  price: string;
}

interface MobileTireServiceCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  services: ServicePrice[];
  iconColor?: string;
}

export const MobileTireServiceCard: React.FC<MobileTireServiceCardProps> = ({
  title,
  subtitle,
  icon,
  services,
  iconColor = pricingColors.primary,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: `1px solid ${pricingColors.primary}20`,
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: iconColor + '10',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { color: iconColor } })}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: pricingColors.text.secondary }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Stack spacing={1}>
          {services.map((service, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{service.name}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: pricingColors.secondary }}>
                {service.price}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};