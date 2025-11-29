import {
  CheckCircle as CheckIcon,
  Emergency as EmergencyIcon,
  Phone as PhoneIcon,
  Speed as SpeedIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { colors } from '../../theme/colors';

interface EmergencyServiceBannerProps {
  onBookNow?: () => void;
}

export function EmergencyServiceBanner({ onBookNow }: EmergencyServiceBannerProps) {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${colors.semantic.error} 0%, ${colors.secondary.main} 100%)`,
        py: { xs: 4, md: 3 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(255,255,255,.1) 35px,
              rgba(255,255,255,.1) 70px
            )
          `,
          animation: 'moveStripes 2s linear infinite',
          '@keyframes moveStripes': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(70px)' },
          },
        }}
      />
      
      <Container maxWidth="lg">
        <Grid container alignItems="center" spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { 
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(255,255,255,0.4)',
                    },
                    '70%': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 0 0 20px rgba(255,255,255,0)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 0 0 0 rgba(255,255,255,0)',
                    },
                  },
                }}
              >
                <TruckIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    lineHeight: 1.2,
                    mb: 0.5,
                  }}
                >
                  Mobile Tire Emergency Service
                </Typography>
                <ServiceFeatures />
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ActionButtons onBookNow={onBookNow} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function ServiceFeatures() {
  const features = [
    { icon: <EmergencyIcon sx={{ fontSize: 18 }} />, text: 'Available 24/7' },
    { icon: <SpeedIcon sx={{ fontSize: 18 }} />, text: 'Fast Response Time' },
    { icon: <CheckIcon sx={{ fontSize: 18 }} />, text: 'We Come To You' },
  ];

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 2 }}>
      {features.map((feature, index) => (
        <Typography
          key={index}
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.95)',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {feature.icon}
          {feature.text}
        </Typography>
      ))}
    </Stack>
  );
}

interface ActionButtonsProps {
  onBookNow?: () => void;
}

function ActionButtons({ onBookNow }: ActionButtonsProps) {
  return (
    <Stack
      direction={{ xs: 'row', sm: 'row' }}
      spacing={2}
      justifyContent={{ xs: 'center', md: 'flex-end' }}
    >
      <Button
        onClick={onBookNow}
        variant="contained"
        size="large"
        startIcon={<TruckIcon />}
        sx={{
          backgroundColor: 'white',
          color: colors.secondary.main,
          fontWeight: 700,
          px: { xs: 3, sm: 4 },
          py: 1.5,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          borderRadius: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.95)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 30px rgba(0,0,0,0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Book Now
      </Button>
      <Button
        component="a"
        href="tel:2509869191"
        variant="outlined"
        size="large"
        startIcon={<PhoneIcon />}
        sx={{
          borderColor: 'white',
          color: 'white',
          fontWeight: 700,
          px: { xs: 3, sm: 4 },
          py: 1.5,
          fontSize: { xs: '1rem', sm: '1.1rem' },
          borderRadius: 50,
          borderWidth: 2,
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            transform: 'translateY(-2px)',
            borderWidth: 2,
          },
          transition: 'all 0.3s ease',
        }}
      >
        Call Us
      </Button>
    </Stack>
  );
}