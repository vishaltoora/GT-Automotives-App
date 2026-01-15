import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

interface FooterProps {
  collapsed?: boolean;
}

const Footer: React.FC<FooterProps> = ({ collapsed = false }) => {
  const currentYear = new Date().getFullYear();

  if (collapsed) {
    return (
      <Box
        sx={{
          py: 1,
          px: 0.5,
          textAlign: 'center',
          borderTop: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.neutral[50],
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: colors.neutral[500],
            fontSize: '0.65rem',
          }}
        >
          VT
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        textAlign: 'center',
        borderTop: `1px solid ${colors.neutral[200]}`,
        backgroundColor: colors.neutral[50],
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: colors.neutral[500],
          fontSize: '0.75rem',
          display: 'block',
        }}
      >
        Created by Vishal Toora
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: colors.neutral[400],
          fontSize: '0.7rem',
        }}
      >
        {currentYear} GT Automotives
      </Typography>
    </Box>
  );
};

export default Footer;
