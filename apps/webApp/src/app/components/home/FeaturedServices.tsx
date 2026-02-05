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
} from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface Service {
  title: string;
  description: string;
  icon?: React.ReactElement;
  color: string;
  features: string[];
  image: string;
  hideIcon?: boolean;
}

export function FeaturedServices() {
  const services: Service[] = [
    {
      title: 'Mobile Tire Service',
      description: 'Professional tire installation at your location, available 24/7',
      color: colors.secondary.main,
      features: ['On-site installation', '24/7 service', 'All tire brands'],
      image: 'url(https://www.hunter.com/globalassets/hunter/sema2022/theme-pages/equipmentgroup-mobile.png)',
      hideIcon: true,
    },
    {
      title: 'Tire Installation',
      description: 'Expert mounting and balancing for all tire types and sizes',
      color: colors.primary.main,
      features: ['Mount & Balance', 'TPMS Service', 'Valve Replacement'],
      image: 'url(https://totalkare.co.uk/wp-content/uploads/2023/03/HP641SQ.22.png)',
      hideIcon: true,
    },
    {
      title: 'Complete Auto Repair',
      description: 'From engine diagnostics to brake service, we fix it all',
      color: colors.primary.dark,
      features: ['Engine repair', 'Brake service', 'Electrical work'],
      image: 'url(https://static.vecteezy.com/system/resources/thumbnails/038/777/271/small_2x/ai-generated-of-car-engine-against-transparent-background-free-png.png)',
      hideIcon: true,
    },
    {
      title: 'Preventive Maintenance',
      description: 'Keep your vehicle running smoothly with regular service',
      color: colors.semantic.success,
      features: ['Oil changes', 'Tire rotation', 'Multi-point inspection'],
      image: 'url(https://www.pngmart.com/files/23/Mechanic-Logo-PNG-Photo.png)',
      hideIcon: true,
    },
    {
      title: 'Winter Tire Service',
      description: 'Get ready for winter with professional tire changeover',
      color: '#1565c0',
      features: ['Seasonal swap', 'Tire storage', 'Studded options'],
      image: 'url(https://png.pngtree.com/png-clipart/20240404/original/pngtree-close-up-of-car-tires-in-winter-on-the-road-covered-png-image_14747453.png)',
      hideIcon: true,
    },
    {
      title: 'Summer Tire Service',
      description: 'Switch to summer tires for better warm weather performance',
      color: '#ff9800',
      features: ['Performance tires', 'All-season options', 'Free inspection'],
      image: 'url(https://thumbs.dreamstime.com/b/summer-tires-isolated-white-background-black-45349515.jpg)',
      hideIcon: true,
    },
    {
      title: 'Car Detailing',
      description: 'Professional detailing to keep your car looking showroom new',
      color: colors.secondary.dark,
      features: ['Interior cleaning', 'Paint protection', 'Ceramic coating'],
      image: 'url(https://www.pngkey.com/png/full/47-470032_car-detailing-new-jersey-auto-detailing-png.png)',
      hideIcon: true,
    },
    {
      title: 'Wheel Balancing',
      description: 'Precise balancing for smooth rides and even tire wear',
      color: '#9c27b0',
      features: ['Computer balancing', 'Vibration fix', 'Weight adjustment'],
      image: 'url(https://img.freepik.com/premium-psd/wheel-balancing-machine-with-car-wheels-3d-rendering-isolated-transparent-background_808337-26147.jpg)',
      hideIcon: true,
    },
    {
      title: 'Mechanical Service',
      description: 'Full mechanical repairs - mobile or at our shop location',
      color: '#455a64',
      features: ['Mobile service available', 'In-shop repairs', 'All makes & models'],
      image: 'url(https://i.pinimg.com/736x/6e/f8/6d/6ef86db4bd277edc3cd0dc38aa98d8d5.jpg)',
      hideIcon: true,
    },
  ];

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <SectionHeader />
      </Container>
      <ServicesSlider services={services} />
    </Box>
  );
}

function SectionHeader() {
  return (
    <Fade in timeout={1000}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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

function ServicesSlider({ services }: { services: Service[] }) {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate services for seamless infinite loop
  const duplicatedServices = [...services, ...services];

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        py: 2,
        px: { xs: 2, md: 0 },
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          animation: 'scroll 40s linear infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
          width: 'fit-content',
          '@keyframes scroll': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: `translateX(-${services.length * 320}px)`,
            },
          },
        }}
      >
        {duplicatedServices.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </Box>
    </Box>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card
      sx={{
        width: 300,
        minWidth: 300,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        flexShrink: 0,
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
  );
}

function ServiceCardHeader({ service }: { service: Service }) {
  return (
    <Box
      sx={{
        height: service.hideIcon ? 200 : 160,
        background: service.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {!service.hideIcon && service.icon && (
        <Box
          className="service-icon"
          sx={{
            backgroundColor: 'white',
            borderRadius: '50%',
            p: 2.5,
            color: service.color,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
          }}
        >
          {service.icon}
        </Box>
      )}

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
    <CardContent sx={{ p: 2.5 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 1,
          color: colors.text.primary,
          fontSize: '1.1rem',
        }}
      >
        {service.title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: colors.text.secondary,
          mb: 2,
          lineHeight: 1.5,
          fontSize: '0.85rem',
        }}
      >
        {service.description}
      </Typography>
      <Stack spacing={0.5}>
        {service.features.map((feature, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: service.color,
                mr: 1,
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.5)', opacity: 0.7 },
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {feature}
            </Typography>
          </Box>
        ))}
      </Stack>
    </CardContent>
  );
}