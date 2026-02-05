import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { colors } from '../../theme/colors';

export function ContactSection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
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
          <ContactHeader />
          <ContactCards />
        </CardContent>
      </Card>
    </Container>
  );
}

function ContactHeader() {
  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          color: 'white',
          mb: 1.5,
          fontSize: { xs: '1.75rem', md: '2.5rem' },
          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        Get In Touch
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255,255,255,0.9)',
          maxWidth: 600,
          mx: 'auto',
          fontWeight: 400,
          fontSize: { xs: '0.95rem', md: '1.1rem' },
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
            Office:{' '}
            <a
              href="tel:2505702333"
              style={{
                color: colors.primary.main,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              (250) 570-2333
            </a>
          </Typography>
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
    <Grid container spacing={3} justifyContent="center" alignItems="stretch">
      {contactInfo.map((item, index) => (
        <Grid key={index} size={{ xs: 12, sm: index < 2 ? 6 : 12, md: 4, lg: 4 }}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              textAlign: 'center',
              borderRadius: 3,
              backgroundColor: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
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

