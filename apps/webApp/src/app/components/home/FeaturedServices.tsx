import {
  Build as BuildIcon,
  CheckCircle as CheckIcon,
  Settings as SettingsIcon,
  LocalShipping as TruckIcon,
  AutoAwesome as DetailIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Stack,
  Typography,
  Zoom,
} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface Service {
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  features: string[];
  image: string;
}

export function FeaturedServices() {
  const services: Service[] = [
    {
      title: 'Mobile Tire Service',
      description: 'Professional tire installation at your location, available 24/7',
      icon: <TruckIcon sx={{ fontSize: 48 }} />,
      color: colors.secondary.main,
      features: ['On-site installation', '24/7 service', 'All tire brands'],
      image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Complete Auto Repair',
      description: 'From engine diagnostics to brake service, we fix it all',
      icon: <BuildIcon sx={{ fontSize: 48 }} />,
      color: colors.primary.main,
      features: ['Engine repair', 'Brake service', 'Electrical work'],
      image: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Preventive Maintenance',
      description: 'Keep your vehicle running smoothly with regular service',
      icon: <SettingsIcon sx={{ fontSize: 48 }} />,
      color: colors.semantic.success,
      features: ['Oil changes', 'Tire rotation', 'Multi-point inspection'],
      image: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Car Detailing',
      description: 'Professional detailing to keep your car looking showroom new',
      icon: <DetailIcon sx={{ fontSize: 48 }} />,
      color: colors.secondary.dark,
      features: ['Interior cleaning', 'Paint protection', 'Ceramic coating'],
      image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <SectionHeader />
      <ServiceCards services={services} />
    </Container>
  );
}

function SectionHeader() {
  return (
    <Fade in timeout={1000}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Chip
          label="OUR SERVICES"
          sx={{
            backgroundColor: colors.secondary.light + '20',
            color: colors.secondary.main,
            fontWeight: 700,
            mb: 2,
            px: 2,
          }}
        />
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: colors.text.primary,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          What We Do Best
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
          From quick maintenance to complex repairs, our certified technicians handle it all
        </Typography>
      </Box>
    </Fade>
  );
}

function ServiceCards({ services }: { services: Service[] }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
      {services.map((service, index) => (
        <Box
          key={index}
          sx={{
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
            minWidth: { xs: '100%', sm: '280px', md: '280px' },
            maxWidth: { xs: '100%', sm: '400px', md: '320px' },
          }}
        >
          <Zoom in timeout={1000 + index * 200}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  '& .service-overlay': {
                    opacity: 1,
                  },
                  '& .service-icon': {
                    transform: 'rotate(10deg) scale(1.1)',
                  },
                },
              }}
            >
              <ServiceCardHeader service={service} />
              <ServiceCardContent service={service} />
            </Card>
          </Zoom>
        </Box>
      ))}
    </Box>
  );
}

function ServiceCardHeader({ service }: { service: Service }) {
  return (
    <Box
      sx={{
        height: 200,
        background: service.image,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        className="service-icon"
        sx={{
          backgroundColor: 'white',
          borderRadius: '50%',
          p: 3,
          color: service.color,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease',
        }}
      >
        {service.icon}
      </Box>

      <Box
        className="service-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Button
          variant="contained"
          component={Link}
          to="/services"
          sx={{
            backgroundColor: 'white',
            color: service.color,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            },
          }}
        >
          Learn More
        </Button>
      </Box>
    </Box>
  );
}

function ServiceCardContent({ service }: { service: Service }) {
  return (
    <CardContent sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: colors.text.primary,
        }}
      >
        {service.title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: colors.text.secondary,
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        {service.description}
      </Typography>
      <Stack spacing={1}>
        {service.features.map((feature, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckIcon
              sx={{
                color: service.color,
                fontSize: 20,
                mr: 1,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {feature}
            </Typography>
          </Box>
        ))}
      </Stack>
    </CardContent>
  );
}