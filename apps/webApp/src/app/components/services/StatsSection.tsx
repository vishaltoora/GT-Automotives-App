import React from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';

const serviceColors = {
  primary: '#243c55',
};

const stats = [
  { value: '15+', label: 'Years Experience' },
  { value: '5000+', label: 'Happy Customers' },
  { value: '24/7', label: 'Emergency Service' },
  { value: '100%', label: 'Satisfaction' },
];

export const StatsSection: React.FC = () => {
  return (
    <Box sx={{ backgroundColor: serviceColors.primary, color: 'white', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};