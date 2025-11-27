import React from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateMessageProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  icon,
  title,
  message,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        color: 'text.secondary',
      }}
    >
      <Box sx={{ fontSize: 64, mb: 2, opacity: 0.3 }}>{icon}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
};
