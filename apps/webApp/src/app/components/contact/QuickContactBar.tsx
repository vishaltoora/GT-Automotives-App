import React from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { colors } from '../../theme/colors';

export const QuickContactBar: React.FC = () => {
  return (
    <Box sx={{ 
      backgroundColor: colors.primary.main,
      py: 2,
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PhoneIcon sx={{ color: 'white' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Call Us
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                  (250) 570-2333
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <EmailIcon sx={{ color: 'white' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Email Us
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                  gt-automotives@outlook.com
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <AccessTimeIcon sx={{ color: 'white' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Hours Today
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                  8:00 AM - 6:00 PM
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};