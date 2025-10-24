import React from 'react';
import { Box, Typography } from '@mui/material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark';
  onClick?: () => void;
}

// Define colors directly to avoid import issues
const logoColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  text: {
    primary: '#212121',
    secondary: '#616161',
  }
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'light',
  onClick 
}) => {
  const dimensions = {
    small: { circle: 40, fontSize: '1rem', border: 2 },
    medium: { circle: 60, fontSize: '1.5rem', border: 3 },
    large: { circle: 100, fontSize: '2.5rem', border: 4 },
  };

  const { circle, fontSize, border } = dimensions[size];
  const isLight = variant === 'light';

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          opacity: 0.9,
        } : {},
      }}
    >
      {/* Circular Logo */}
      <Box
        sx={{
          width: circle,
          height: circle,
          borderRadius: '50%',
          backgroundColor: isLight ? logoColors.primary : 'white',
          border: `${border}px solid ${isLight ? logoColors.secondary : logoColors.primary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Typography
          sx={{
            fontSize,
            fontWeight: 800,
            color: isLight ? 'white' : logoColors.primary,
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          GT
        </Typography>
      </Box>
      
      {/* Text Logo */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontSize: size === 'small' ? '1.1rem' : size === 'medium' ? '1.5rem' : '2rem',
            fontWeight: 700,
            color: isLight ? logoColors.text.primary : 'white',
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}
        >
          GT Automotivess
        </Typography>
        {size !== 'small' && (
          <Typography
            sx={{
              fontSize: size === 'medium' ? '0.75rem' : '1rem',
              color: isLight ? logoColors.text.secondary : 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              letterSpacing: '0.5px',
              mt: 0.25,
            }}
          >
            Professional Tire & Auto Services
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Circular logo only variant for icons/favicon
export const LogoIcon: React.FC<{ size?: number; variant?: 'light' | 'dark' }> = ({ 
  size = 40, 
  variant = 'light' 
}) => {
  const isLight = variant === 'light';
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isLight ? logoColors.primary : 'white',
        border: `3px solid ${isLight ? logoColors.secondary : logoColors.primary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Typography
        sx={{
          fontSize: size * 0.4,
          fontWeight: 800,
          color: isLight ? 'white' : logoColors.primary,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          letterSpacing: '-1px',
        }}
      >
        GT
      </Typography>
    </Box>
  );
};