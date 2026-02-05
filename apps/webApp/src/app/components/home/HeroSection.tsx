import {
  WorkspacePremium as CertifiedIcon,
  Phone as PhoneIcon,
  TireRepair as TireIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Fade,
  Stack,
  Typography,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface HeroStatistic {
  value: string;
  label: string;
}

export function HeroSection() {
  const statistics: HeroStatistic[] = [
    { value: '10+', label: 'Years Experience' },
    { value: '1,000+', label: 'Happy Customers' },
    { value: '24/7', label: 'Emergency Service' },
    { value: '100%', label: 'Satisfaction' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', sm: '80vh', md: '420px', lg: '450px' },
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
        overflow: 'hidden',
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
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: { xs: 6, sm: 5, md: 5 }, width: '100%' }}>
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">

          {/* Content Section - Full width */}
          <Grid size={12}>
            <Fade in timeout={800}>
              <Stack spacing={{ xs: 3, sm: 2 }} sx={{ maxWidth: { md: '100%', lg: '900px' }, textAlign: { xs: 'center', md: 'left' } }}>
                {/* Badge */}
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Chip
                    icon={<CertifiedIcon sx={{ fontSize: '1rem' }} />}
                    label="Certified Auto Service • Prince George • Est. 2010"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)',
                      px: 1,
                      '& .MuiChip-icon': {
                        color: colors.secondary.main,
                      },
                    }}
                  />
                </Box>

                {/* Main Title */}
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem', xl: '4rem' },
                    color: 'white',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Professional Tire &
                  <Box
                    component="span"
                    sx={{
                      color: colors.secondary.main,
                      display: 'inline',
                      ml: 1,
                    }}
                  >
                    Auto Services
                  </Box>
                </Typography>

                {/* Subtitle */}
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 400,
                    lineHeight: 1.5,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem', lg: '1.3rem' },
                    maxWidth: { md: 600, lg: 700 },
                  }}
                >
                  Expert tire installation, mobile services, and mechanical repairs delivered by certified
                  technicians at competitive prices in Prince George
                </Typography>

                {/* CTA Buttons */}
                <HeroCTAButtons />

                {/* Trust Indicators */}
                <Stack
                  direction="row"
                  spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }}
                  divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />}
                  sx={{ pt: 3, mt: 1, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}
                >
                  {statistics.map((stat, index) => (
                    <Box key={index}>
                      <Typography
                        sx={{
                          fontSize: { xs: '1.5rem', md: '1.8rem' },
                          fontWeight: 700,
                          color: colors.secondary.main,
                          lineHeight: 1,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.7rem', md: '0.8rem' },
                          color: 'rgba(255,255,255,0.8)',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function HeroCTAButtons() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2, alignItems: { xs: 'center', md: 'flex-start' } }}>
      <Button
        component={Link}
        to="/inventory"
        variant="contained"
        size="large"
        startIcon={<TireIcon />}
        sx={{
          backgroundColor: colors.secondary.main,
          color: 'white',
          px: 4,
          py: 1.5,
          fontSize: '0.95rem',
          fontWeight: 600,
          borderRadius: 2,
          boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: 280, sm: 'none' },
          '&:hover': {
            backgroundColor: colors.secondary.dark,
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(255,107,53,0.5)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Browse Tires
      </Button>

      <Button
        component={Link}
        to="/contact"
        variant="outlined"
        size="large"
        startIcon={<PhoneIcon />}
        sx={{
          borderColor: 'white',
          color: 'white',
          px: 4,
          py: 1.5,
          fontSize: '0.95rem',
          fontWeight: 600,
          borderRadius: 2,
          borderWidth: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: 280, sm: 'none' },
          '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
            transform: 'translateY(-2px)',
            borderWidth: 2,
          },
          transition: 'all 0.3s ease',
        }}
      >
        Contact Us
      </Button>

    </Stack>
  );
}