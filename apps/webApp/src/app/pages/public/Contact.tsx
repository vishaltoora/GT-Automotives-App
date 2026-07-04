import React from 'react';
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import VehicleIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import ShippingIcon from '@mui/icons-material/LocalShipping';
import CarWashIcon from '@mui/icons-material/LocalCarWash';
import CheckIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {
  QuickContactBar,
  ContactForm,
  ContactTeam,
} from '../../components/contact';
import { PageHero } from '../../components/shared';
import { colors } from '../../theme/colors';
import {
  SHOP_ADDRESS,
  SHOP_ADDRESS_LINE1,
  SHOP_ADDRESS_LINE2,
  SHOP_MAP_EMBED_URL,
  SHOP_MAP_DIRECTIONS_URL,
  SHOP_HOURS,
} from '../../config/shop';

// Contact page slides
const contactSlides = [
  {
    id: 'contact-us',
    title: "We're Here to Help You",
    subtitle: 'Contact Us',
    description:
      'Get in touch for expert tire services, mechanical repairs, or emergency assistance. Your satisfaction is our priority.',
    image:
      'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80',
    icon: SupportAgentIcon,
  },
  {
    id: 'call-us',
    title: 'Call Us Anytime',
    subtitle: '24/7 Support',
    description:
      'Our friendly team is ready to assist you with any questions about our services or to schedule your appointment.',
    image:
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=80',
    icon: PhoneIcon,
  },
  {
    id: 'visit-us',
    title: 'Visit Our Shop',
    subtitle: SHOP_ADDRESS,
    description:
      'Come see us in person! Our full-service shop is conveniently located with easy access and ample parking — tires, mechanical repairs, and more under one roof.',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    icon: LocationOnIcon,
  },
];

export const Contact: React.FC = () => {
  return (
    <>
      <PageHero
        slides={contactSlides}
        primaryAction={{
          label: 'Call Now',
          path: 'tel:2509869191',
        }}
        secondaryAction={{
          label: 'Send Email',
          path: 'mailto:gt-automotives@outlook.com',
        }}
      />
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
                    <CheckIcon
                      sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }}
                    />
                    <Typography variant="body2">
                      Free estimates on all services
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon
                      sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }}
                    />
                    <Typography variant="body2">
                      Same-day service available
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon
                      sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }}
                    />
                    <Typography variant="body2">
                      Mobile tire service to your location
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon
                      sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }}
                    />
                    <Typography variant="body2">
                      24/7 emergency roadside assistance
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon
                      sx={{ color: colors.primary.main, fontSize: 20, mt: 0.2 }}
                    />
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
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary }}
                    >
                      Call for immediate assistance
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Visit Our Shop — Location & Map */}
      <Box sx={{ backgroundColor: colors.neutral[50], py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}
          >
            Visit Our Shop
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: 'center', color: colors.text.secondary, mb: 5 }}
          >
            Full-service mechanical repairs and tire sales — all under one roof.
          </Typography>

          <Grid container spacing={4} alignItems="stretch">
            {/* Map */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 300, md: '100%' },
                  minHeight: 300,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <Box
                  component="iframe"
                  title={`Map to GT Automotives at ${SHOP_ADDRESS}`}
                  src={SHOP_MAP_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sx={{
                    border: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>

            {/* Address & Hours */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ mb: 3 }}
                >
                  <LocationOnIcon
                    sx={{ color: colors.primary.main, mt: 0.3 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Our Location
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: colors.text.secondary }}
                    >
                      {SHOP_ADDRESS_LINE1}
                      <br />
                      {SHOP_ADDRESS_LINE2}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ mb: 3 }}
                >
                  <AccessTimeIcon
                    sx={{ color: colors.primary.main, mt: 0.3 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Shop Hours
                    </Typography>
                    {SHOP_HOURS.map((h) => (
                      <Typography
                        key={h.days}
                        variant="body2"
                        sx={{ color: colors.text.secondary }}
                      >
                        {h.days}: {h.time}
                      </Typography>
                    ))}
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text.secondary, mt: 0.5 }}
                    >
                      Walk-in or by appointment · Mobile service available
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  component="a"
                  href={SHOP_MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  fullWidth
                  startIcon={<DirectionsIcon />}
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: 'white',
                    fontWeight: 600,
                    py: 1.2,
                    '&:hover': { backgroundColor: colors.primary.dark },
                  }}
                >
                  Get Directions
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

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
                  <VehicleIcon
                    sx={{ fontSize: 30, color: colors.primary.main }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Tire Services
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
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
                  <BuildIcon
                    sx={{ fontSize: 30, color: colors.secondary.main }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Auto Repair
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
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
                  <ShippingIcon
                    sx={{ fontSize: 30, color: colors.semantic.warning }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Mobile Service
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
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
                  <CarWashIcon
                    sx={{ fontSize: 30, color: colors.semantic.info }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Car Detailing
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text.secondary }}
                >
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
