import React from 'react';
import { Container, Grid, Box, Paper, Typography, Stack } from '@mui/material';
import VehicleIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import ShippingIcon from '@mui/icons-material/LocalShipping';
import CarWashIcon from '@mui/icons-material/LocalCarWash';
import CheckIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import { ContactHero, QuickContactBar, ContactForm, ContactTeam } from '../../components/contact';
import { colors } from '../../theme/colors';

export const Contact: React.FC = () => {

  return (
    <>
      <ContactHero />
      <QuickContactBar />

      {/* Main Contact Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <ContactForm />
          </Grid>

          {/* Contact Information Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Why Choose Us */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: colors.primary.light + '08',
                  border: `1px solid ${colors.primary.light}30`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: colors.text.primary,
                    mb: 2,
                  }}
                >
                  Why Contact Us?
                </Typography>
                
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Free estimates on all services
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Same-day service available
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Mobile tire service to your location
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      24/7 emergency roadside assistance
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2">
                      Certified technicians on staff
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Emergency Contact */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: colors.semantic.warning + '10',
                  border: `1px solid ${colors.semantic.warning}30`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: colors.semantic.warning + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneIcon sx={{ color: colors.semantic.warning }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      24/7 Emergency Service
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                      Call for immediate assistance
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Contact Team Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <ContactTeam />
        </Container>
      </Box>

      {/* Service Categories Section */}
      <Box sx={{ backgroundColor: colors.neutral[50], py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 1,
            }}
          >
            How Can We Help You?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: colors.text.secondary,
              mb: 5,
            }}
          >
            Select a service category to learn more
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.primary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <VehicleIcon sx={{ fontSize: 30, color: colors.primary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Tire Services
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  New & used tires, installation, rotation, balancing
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.secondary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <BuildIcon sx={{ fontSize: 30, color: colors.secondary.main }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Auto Repair
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  Brakes, oil changes, engine diagnostics, maintenance
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.semantic.warning + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <ShippingIcon sx={{ fontSize: 30, color: colors.semantic.warning }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Mobile Service
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  On-site tire service & emergency roadside assistance
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${colors.primary.main}15`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: colors.semantic.info + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <CarWashIcon sx={{ fontSize: 30, color: colors.semantic.info }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Car Detailing
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  Professional interior & exterior detailing services
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};