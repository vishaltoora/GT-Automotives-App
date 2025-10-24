import {
  WorkspacePremium as CertifiedIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Emergency as EmergencyIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import { colors } from '../../theme/colors';

export function ContactSection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      <ContactHeader />
      <ContactCards />
      <WhyGTAutomotives />
    </Container>
  );
}

function ContactHeader() {
  return (
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          color: colors.text.primary,
          mb: 2,
        }}
      >
        Get In Touch
      </Typography>
      <Typography
        variant="h6"
        sx={{
          color: colors.text.secondary,
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        We're here to help with all your automotive needs
      </Typography>
    </Box>
  );
}

function ContactCards() {
  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: 30 }} />,
      title: 'Call Us',
      content: (
        <Stack spacing={1}>
          <Typography variant="body1">
            Johny:{' '}
            <a
              href="tel:2509869191"
              style={{
                color: colors.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              (250) 986-9191
            </a>
          </Typography>
          <Typography variant="body1">
            Harjinder:{' '}
            <a
              href="tel:2505651571"
              style={{
                color: colors.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              (250) 565-1571
            </a>
          </Typography>
        </Stack>
      ),
    },
    {
      icon: <EmailIcon sx={{ fontSize: 30 }} />,
      title: 'Email Us',
      content: (
        <>
          <Typography variant="body1">
            <a
              href="mailto:gt-automotives@outlook.com"
              style={{
                color: colors.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
                wordBreak: 'break-word',
              }}
            >
              gt-automotives@outlook.com
            </a>
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 2 }}>
            We'll respond within 24 hours
          </Typography>
        </>
      ),
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 30 }} />,
      title: 'Business Hours',
      content: (
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Monday - Friday
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            8:00 AM - 6:00 PM
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Saturday - Sunday
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            9:00 AM - 5:00 PM
          </Typography>
          <Chip
            label="24/7 Emergency"
            sx={{
              backgroundColor: colors.secondary.light + '20',
              color: colors.secondary.main,
              fontWeight: 600,
            }}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center" alignItems="stretch">
      {contactInfo.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: index < 2 ? 6 : 12, md: 4, lg: 4 }}>
          <Card
            sx={{
              p: 4,
              height: '100%',
              textAlign: 'center',
              borderRadius: 3,
              border: `2px solid ${colors.neutral[200]}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: colors.primary.main,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                transform: 'translateY(-4px)',
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
                mb: 3,
                color: colors.primary.main,
              }}
            >
              {item.icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {item.title}
            </Typography>
            {item.content}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function WhyGTAutomotives() {
  const features = [
    { icon: <CertifiedIcon />, text: 'Certified ASE Technicians' },
    { icon: <EmergencyIcon />, text: '24/7 Emergency Service' },
    { icon: <TruckIcon />, text: 'Mobile Tire Installation' },
    { icon: <CheckIcon />, text: '100% Satisfaction Guarantee' },
    { icon: <MoneyIcon />, text: 'Competitive Pricing' },
    { icon: <StarIcon />, text: 'Top Rated Service' },
  ];

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
        borderRadius: 3,
        p: { xs: 4, md: 6 },
        color: 'white',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 4,
          textAlign: 'center',
        }}
      >
        Why GT Automotivess?
      </Typography>
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {features.map((item, index) => (
          <Box key={index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(8px)',
                },
              }}
            >
              <Box
                sx={{
                  color: colors.secondary.main,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {React.cloneElement(item.icon, { sx: { fontSize: 28 } })}
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: 'white',
                  fontWeight: 500,
                }}
              >
                {item.text}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}