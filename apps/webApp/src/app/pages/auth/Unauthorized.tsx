import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Block } from '@mui/icons-material';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Block sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom>
          403 - Unauthorized
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}