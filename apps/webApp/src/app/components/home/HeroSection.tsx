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
  Zoom,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';
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
        minHeight: { xs: '450px', sm: '400px', md: '420px', lg: '450px' },
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

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 5 }, width: '100%' }}>
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          {/* Logo Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <HeroLogo />
          </Grid>

          {/* Content Section */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Fade in timeout={800}>
              <Stack spacing={2} sx={{ maxWidth: { md: '100%', lg: '900px' } }}>
                {/* Badge */}
                <Box>
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
                  sx={{ pt: 3, mt: 1 }}
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

function HeroLogo() {
  return (
    <Zoom in timeout={1000}>
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '100%',
          minHeight: 320,
          pr: { md: 3, lg: 4 },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { md: 250, lg: 300, xl: 340 },
            height: { md: 250, lg: 300, xl: 340 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated Circles */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.1)',
              animation: 'pulse 3s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.05)', opacity: 0.6 },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '85%',
              height: '85%',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.15)',
              animation: 'pulse 3s ease-in-out infinite 0.5s',
            }}
          />
          
          {/* Central Logo */}
          <Box
            sx={{
              width: { md: 170, lg: 210, xl: 250 },
              height: { md: 170, lg: 210, xl: 250 },
              borderRadius: '50%',
              background: 'white',
              padding: { md: 2, lg: 2.5, xl: 3 },
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <img
              src={gtLogo}
              alt="GT Automotive"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* Floating Icons */}
          <FloatingServiceIcons />
        </Box>
      </Box>
    </Zoom>
  );
}

function FloatingServiceIcons() {
  const icons = [
    { Icon: TireIcon, top: 0, right: 0, bg: colors.secondary.main, delay: 0 },
    { Icon: BuildIcon, bottom: 20, left: 0, bg: 'rgba(255,255,255,0.15)', delay: 1 },
    { Icon: CarIcon, top: '50%', right: -10, bg: 'rgba(255,255,255,0.1)', delay: 2 },
  ];

  return (
    <>
      {icons.map((item, index) => {
        const { Icon, delay, ...position } = item;
        return (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              ...position,
              width: index === 0 ? 50 : 45,
              height: index === 0 ? 50 : 45,
              borderRadius: '50%',
              backgroundColor: item.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: index === 0 ? '0 4px 12px rgba(255,107,53,0.4)' : 'none',
              animation: 'float 4s ease-in-out infinite',
              animationDelay: `${delay}s`,
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          >
            <Icon sx={{ color: 'white', fontSize: '1.2rem' }} />
          </Box>
        );
      })}
    </>
  );
}

import { Build as BuildIcon, DirectionsCar as CarIcon } from '@mui/icons-material';

function HeroCTAButtons() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
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

      <Button
        component={Link}
        to="/services"
        variant="text"
        size="large"
        endIcon={<Box sx={{ transform: 'rotate(-45deg)' }}>→</Box>}
        sx={{
          color: 'white',
          px: 3,
          py: 1.5,
          fontSize: '0.95rem',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.08)',
            transform: 'translateX(4px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        View All Services
      </Button>
    </Stack>
  );
}