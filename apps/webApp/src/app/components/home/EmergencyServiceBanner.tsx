import {
  CheckCircle as CheckIcon,
  Phone as PhoneIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface EmergencyServiceBannerProps {
  onBookNow?: () => void;
}

export function EmergencyServiceBanner({ onBookNow }: EmergencyServiceBannerProps) {
  const navigate = useNavigate();

  const handleBookMobileService = () => {
    navigate('/book-appointment?type=mobile');
  };

  const features = [
    'Tire installation & mounting',
    'Tire rotation & balancing',
    'Flat tire repair',
    'Seasonal tire changeover',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: colors.text.primary,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Convenience At Your Doorstep
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: colors.text.secondary,
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 400,
          }}
        >
          Professional tire services delivered to your location - home, office, or roadside
        </Typography>
      </Box>

      <Card
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' stroke='white' stroke-width='2' fill='none'/%3E%3Ccircle cx='30' cy='30' r='10' stroke='white' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 3, md: 5 },
            }}
          >
            {/* Left Side - Mechanic Image */}
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: '100%', md: '35%' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="https://www.hunter.com/globalassets/hunter/sema2022/theme-pages/equipmentgroup-mobile.png"
                alt="Mobile tire service mechanic"
                sx={{
                  maxWidth: { xs: 280, sm: 350, md: 400 },
                  height: 'auto',
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                }}
              />
            </Box>

            {/* Right Side - Content */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              {/* Badge */}
              <Chip
                label="WE COME TO YOU"
                sx={{
                  backgroundColor: colors.secondary.main,
                  color: 'white',
                  fontWeight: 700,
                  mb: 2,
                  px: 2,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                }}
              />

              {/* Title with animated truck */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  gap: 2,
                  flexWrap: 'wrap',
                  mb: 1.5,
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  Mobile Tire Service
                </Typography>
                <TruckIcon
                  sx={{
                    color: 'white',
                    fontSize: { xs: 32, sm: 40, md: 48 },
                    animation: 'driveRight 3s ease-in-out infinite',
                    '@keyframes driveRight': {
                      '0%': { transform: 'translateX(-15px)' },
                      '50%': { transform: 'translateX(15px)' },
                      '100%': { transform: 'translateX(-15px)' },
                    },
                  }}
                />
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.6,
                }}
              >
                Schedule a convenient time and we'll come to your home, office, or anywhere you need us.
                Professional tire service at your location.
              </Typography>

              {/* Features */}
              <Stack
                direction="column"
                spacing={1.5}
                sx={{ mb: 3 }}
              >
                {features.map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                    <CheckIcon sx={{ color: 'white', fontSize: 24 }} />
                    <Typography variant="body1" sx={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* CTA Buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
              >
                <Button
                  onClick={handleBookMobileService}
                  variant="contained"
                  size="large"
                  startIcon={
                    <TruckIcon
                      sx={{
                        animation: 'driveRight 2s ease-in-out infinite',
                        '@keyframes driveRight': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '50%': { transform: 'translateX(5px)' },
                        },
                      }}
                    />
                  }
                  sx={{
                    backgroundColor: colors.secondary.main,
                    color: 'white',
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    fontSize: '0.95rem',
                    borderRadius: 50,
                    '&:hover': {
                      backgroundColor: colors.secondary.dark,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Book Mobile Service
                </Button>
                <Button
                  component="a"
                  href="tel:2509869191"
                  variant="outlined"
                  size="large"
                  startIcon={
                    <PhoneIcon
                      sx={{
                        animation: 'ring 1.5s ease-in-out infinite',
                        '@keyframes ring': {
                          '0%, 100%': { transform: 'rotate(0deg)' },
                          '10%': { transform: 'rotate(15deg)' },
                          '20%': { transform: 'rotate(-10deg)' },
                          '30%': { transform: 'rotate(15deg)' },
                          '40%': { transform: 'rotate(-10deg)' },
                          '50%': { transform: 'rotate(0deg)' },
                        },
                      }}
                    />
                  }
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    borderWidth: 2,
                    borderRadius: 50,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderWidth: 2,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Call Us
                </Button>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
