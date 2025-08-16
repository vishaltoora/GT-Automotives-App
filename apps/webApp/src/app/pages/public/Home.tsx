import {
  Build as BuildIcon,
  WorkspacePremium as CertifiedIcon,
  CheckCircle as CheckIcon,
  Email as EmailIcon,
  Emergency as EmergencyIcon,
  AttachMoney as MoneyIcon,
  LocalOffer as OfferIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import {
  CTASection,
  FeatureHighlight,
  Hero,
  ServiceCard,
  TestimonialCard,
} from '../../components/public';
import { colors } from '../../theme/colors';
import gtLogo from '../../images-and-logos/gt-automotive-logo.svg';

export function Home() {
  const featuredServices = [
    {
      title: 'Mobile Tire Service',
      description:
        'We come to you! Professional tire installation at your location. Available 24/7 for emergency assistance.',
      icon: <TruckIcon sx={{ fontSize: 32 }} />,
      price: 'Call for Quote',
      features: [
        'On-site installation',
        '24/7 emergency service',
        'All tire brands',
        'Roadside assistance',
      ],
      category: 'tire' as const,
      actionPath: '/services',
      highlighted: true,
    },
    {
      title: 'Professional Oil Change',
      description:
        'Full-service oil change with multi-point inspection. Keep your engine running smoothly.',
      icon: <BuildIcon sx={{ fontSize: 32 }} />,
      price: 'From $39.99',
      duration: '30 minutes',
      features: [
        'Quality oil',
        '21-point inspection',
        'Filter replacement',
        'Fluid top-off',
      ],
      category: 'maintenance' as const,
      actionPath: '/services',
    },
    {
      title: 'Complete Brake Service',
      description:
        'Expert brake inspection and repair. Your safety is our priority.',
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      price: 'From $149',
      features: [
        'Free inspection',
        'Quality parts',
        'Warranty included',
        'Same-day service',
      ],
      category: 'repair' as const,
      actionPath: '/services',
    },
  ];

  const whyChooseUsFeatures = [
    {
      icon: <CertifiedIcon sx={{ fontSize: 32 }} />,
      title: 'Certified Technicians',
      description: 'ASE certified mechanics with years of experience',
    },
    {
      icon: <EmergencyIcon sx={{ fontSize: 32 }} />,
      title: '24/7 Emergency Service',
      description: 'Available round the clock for roadside assistance',
    },
    {
      icon: <TruckIcon sx={{ fontSize: 32 }} />,
      title: 'Mobile Service',
      description: 'We come to your location for tire installation',
    },
    {
      icon: <CheckIcon sx={{ fontSize: 32 }} />,
      title: '100% Satisfaction',
      description: 'Guaranteed quality work and customer service',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      content:
        'GT Automotives saved my day! Their mobile tire service is incredibly convenient. Professional, quick, and reliable. Highly recommend!',
      rating: 5,
      date: '1 week ago',
    },
    {
      name: 'Mike Thompson',
      role: 'Fleet Manager',
      content:
        'We rely on GT for all our fleet maintenance. Their 24/7 service and professional team keep our vehicles running smoothly.',
      rating: 5,
      date: '2 weeks ago',
    },
    {
      name: 'Emily Davis',
      role: 'Local Resident',
      content:
        "Best auto shop in town! Fair prices, honest service, and they really know their stuff. Won't go anywhere else.",
      rating: 5,
      date: '1 month ago',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Customers' },
    { value: '24/7', label: 'Emergency Service' },
    { value: '15+', label: 'Years Experience' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const allServices = [
    'Tire Installation',
    'Mobile Tire Services',
    'Emergency Roadside Assistance',
    'Oil Changes',
    'Engine Repair',
    'Electrical Diagnostics',
    'Brake Service',
    'AC & Heating',
    'Battery Service',
    'Performance Tuning',
  ];

  const tireBrands = [
    'Michelin',
    'Bridgestone',
    'Goodyear',
    'Continental',
    'BF Goodrich',
    'Pirelli',
    'Firestone',
    'Yokohama',
  ];

  return (
    <>
      {/* Hero Section */}
      <Hero
        title="Professional Tire & Auto Services"
        description="Your trusted automotive partner with 24/7 emergency service and mobile tire installation. Certified technicians, competitive pricing, and 100% satisfaction guarantee."
        primaryAction={{
          label: 'Get Free Quote',
          path: '/contact',
        }}
        secondaryAction={{
          label: 'Emergency Service',
          path: 'tel:2509869191',
        }}
        height="85vh"
        logo={gtLogo}
      />

      {/* Stats Bar */}
      <Box
        sx={{
          backgroundColor: colors.primary.main,
          py: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    position: 'relative',
                    '&:not(:last-child)::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '40px',
                      width: '1px',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: { xs: 'none', sm: 'block' },
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Emergency Service Banner */}
      <Box
        sx={{
          backgroundColor: colors.secondary.main,
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <EmergencyIcon sx={{ color: 'white', fontSize: 28 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                24/7 Emergency Roadside Assistance Available
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component="a"
                href="tel:2509869191"
                variant="contained"
                startIcon={<PhoneIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: colors.secondary.main,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Johny: (250) 986-9191
              </Button>
              <Button
                component="a"
                href="tel:2505651571"
                variant="contained"
                startIcon={<PhoneIcon />}
                sx={{
                  backgroundColor: 'white',
                  color: colors.secondary.main,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Harjinder: (250) 565-1571
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Featured Services */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: colors.secondary.main,
              fontWeight: 600,
              letterSpacing: 1,
              display: 'block',
              mb: 1,
            }}
          >
            Our Services
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Professional Auto Care
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: colors.text.secondary,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            From mobile tire installation to complete auto repair, we've got you
            covered
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          {featuredServices.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={{ height: '100%' }}>
                <ServiceCard {...service} highlighted={index === 0} />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* All Services Grid */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: colors.text.primary,
              mb: 3,
              textAlign: 'center',
            }}
          >
            Complete Service List
          </Typography>
          <Grid container spacing={2}>
            {allServices.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CheckIcon sx={{ color: colors.primary.main, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {service}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/services"
            variant="outlined"
            size="large"
            sx={{
              borderColor: colors.primary.main,
              color: colors.primary.main,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderColor: colors.primary.dark,
                backgroundColor: colors.primary.main,
                color: 'white',
                borderWidth: 2,
              },
              transition: 'all 0.3s ease',
            }}
          >
            View All Services
          </Button>
        </Box>
      </Container>

      {/* Tire Brands Section */}
      <Box
        sx={{ backgroundColor: colors.background.light, py: { xs: 6, md: 8 } }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 4,
              textAlign: 'center',
            }}
          >
            Tire Brands We Carry
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {tireBrands.map((brand, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                <Box
                  sx={{
                    backgroundColor: 'white',
                    p: 3,
                    borderRadius: 2,
                    textAlign: 'center',
                    border: `1px solid ${colors.neutral[200]}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: colors.primary.main,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.text.primary }}
                  >
                    {brand}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us */}
      <FeatureHighlight
        title="Why Choose GT Automotives?"
        subtitle="Your Trusted Auto Care Partner"
        features={whyChooseUsFeatures}
        columns={4}
        backgroundColor="white"
      />

      {/* Special Offers Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{
              color: colors.secondary.main,
              fontWeight: 600,
              letterSpacing: 1,
              display: 'block',
              mb: 1,
            }}
          >
            Special Offers
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Current Promotions
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: colors.gradients.primary,
                color: 'white',
                height: '100%',
                minHeight: 280,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  p: 4,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Chip
                  label="MOBILE SERVICE"
                  sx={{
                    backgroundColor: colors.secondary.main,
                    color: 'white',
                    fontWeight: 700,
                    mb: 3,
                    alignSelf: 'flex-start',
                  }}
                />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  We Come To You!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, opacity: 0.95, lineHeight: 1.6 }}
                >
                  Professional tire installation at your location. Available
                  24/7 for emergency roadside assistance. Call now for immediate
                  service.
                </Typography>
                <Button
                  component="a"
                  href="tel:2509869191"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: colors.primary.main,
                    fontWeight: 600,
                    alignSelf: 'flex-start',
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Call Now
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Card sx={{ flex: 1, minHeight: 130 }}>
                <CardContent
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: '100%' }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        backgroundColor: colors.semantic.success + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.semantic.success,
                        flexShrink: 0,
                      }}
                    >
                      <OfferIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Free Tire Rotation
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary, lineHeight: 1.5 }}
                      >
                        With any brake service or alignment
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1, minHeight: 130 }}>
                <CardContent
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ width: '100%' }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        backgroundColor: colors.semantic.info + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.semantic.info,
                        flexShrink: 0,
                      }}
                    >
                      <MoneyIcon sx={{ fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Competitive Pricing
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: colors.text.secondary, lineHeight: 1.5 }}
                      >
                        Best prices guaranteed on all services
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Testimonials */}
      <Box
        sx={{ backgroundColor: colors.background.light, py: { xs: 6, md: 10 } }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              sx={{
                color: colors.secondary.main,
                fontWeight: 600,
                letterSpacing: 1,
                display: 'block',
                mb: 1,
              }}
            >
              Testimonials
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 2,
              }}
            >
              What Our Customers Say
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Rating value={4.9} readOnly precision={0.1} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                4.9 out of 5
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                (1000+ reviews)
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ height: '100%' }}>
                  <TestimonialCard {...testimonial} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Information Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 3,
              }}
            >
              Get In Touch
            </Typography>

            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <PhoneIcon sx={{ color: colors.primary.main, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Call Us
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    Johny:{' '}
                    <a
                      href="tel:2509869191"
                      style={{
                        color: colors.primary.main,
                        textDecoration: 'none',
                      }}
                    >
                      (250) 986-9191
                    </a>
                  </Typography>
                  <Typography variant="body1">
                    Harjinder Gill:{' '}
                    <a
                      href="tel:2505651571"
                      style={{
                        color: colors.primary.main,
                        textDecoration: 'none',
                      }}
                    >
                      (250) 565-1571
                    </a>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <EmailIcon sx={{ color: colors.primary.main, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Email Us
                  </Typography>
                  <Typography variant="body1">
                    <a
                      href="mailto:gt-automotives@outlook.com"
                      style={{
                        color: colors.primary.main,
                        textDecoration: 'none',
                      }}
                    >
                      gt-automotives@outlook.com
                    </a>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <ScheduleIcon sx={{ color: colors.primary.main, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Business Hours
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    Monday - Friday: 8:00 AM - 6:00 PM
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 0.5 }}>
                    Saturday - Sunday: 9:00 AM - 5:00 PM
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.secondary.main,
                      fontWeight: 600,
                      mt: 1,
                    }}
                  >
                    24/7 Emergency Service Available
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: colors.primary.main,
                borderRadius: 3,
                p: 4,
                color: 'white',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Why GT Automotives?
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: colors.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Certified ASE Technicians"
                    primaryTypographyProps={{ sx: { color: 'white' } }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: colors.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="24/7 Emergency Service"
                    primaryTypographyProps={{ sx: { color: 'white' } }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: colors.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mobile Tire Installation"
                    primaryTypographyProps={{ sx: { color: 'white' } }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: colors.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="100% Satisfaction Guarantee"
                    primaryTypographyProps={{ sx: { color: 'white' } }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckIcon sx={{ color: colors.secondary.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Competitive Pricing"
                    primaryTypographyProps={{ sx: { color: 'white' } }}
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <CTASection
          title="Need Emergency Service?"
          description="We're available 24/7 for roadside assistance and emergency repairs"
          primaryAction={{
            label: 'Call Now: (250) 986-9191',
            path: 'tel:2509869191',
          }}
          secondaryAction={{
            label: 'Schedule Service',
            path: '/contact',
            icon: <ScheduleIcon />,
          }}
          variant="gradient"
        />
      </Container>

      {/* Service Areas */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: colors.text.primary,
              mb: 4,
            }}
          >
            Proudly Serving British Columbia
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
              mb: 3,
            }}
          >
            Mobile service available throughout the region
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1.5,
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            {[
              'Prince George',
              'Quesnel',
              'Williams Lake',
              'Fort St. John',
              'Dawson Creek',
              'Mackenzie',
            ].map((area) => (
              <Chip
                key={area}
                label={area}
                sx={{
                  backgroundColor: colors.neutral[100],
                  color: colors.text.secondary,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  px: 2.5,
                  py: 2.5,
                  height: 'auto',
                  borderRadius: 3,
                  '&:hover': {
                    backgroundColor: colors.primary.light,
                    color: colors.primary.main,
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
}
