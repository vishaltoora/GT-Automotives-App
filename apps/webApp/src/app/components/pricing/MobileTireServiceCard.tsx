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
        p: 0,
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: `2px solid transparent`,
        backgroundClip: 'padding-box',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px rgba(36, 60, 85, 0.15), 0 0 0 2px ${pricingColors.secondary}20`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${iconColor}, ${pricingColors.secondary})`,
        },
      }}
    >
      <Stack spacing={0} sx={{ height: '100%' }}>
        {/* Header Section */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${iconColor}15, ${iconColor}25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${iconColor}20`,
              }}
            >
              <Box sx={{ color: iconColor, fontSize: '1.5rem' }}>{icon}</Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: pricingColors.primary,
                  mb: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: pricingColors.text.secondary,
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Pricing Section */}
        <Box sx={{
          flex: 1,
          backgroundColor: `${pricingColors.primary}05`,
          p: 3,
          pt: 2,
        }}>
          <Stack spacing={2}>
            {services.map((service, index) => (
              <Box key={index}>
                <Typography
                  variant="body2"
                  sx={{
                    color: pricingColors.text.secondary,
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  {service.name}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: pricingColors.secondary,
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    lineHeight: 1,
                    textShadow: `0 2px 4px ${pricingColors.secondary}20`,
                  }}
                >
                  {service.price}
                </Typography>
                {index < services.length - 1 && (
                  <Divider sx={{ mt: 2, borderColor: `${pricingColors.primary}15` }} />
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};