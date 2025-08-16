import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  EmojiEvents as TrophyIcon,
  Handshake as HandshakeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Hero, FeatureHighlight, CTASection } from '../../components/public';
import { colors } from '../../theme/colors';

interface TeamMember {
  name: string;
  role: string;
  experience: string;
  specialties: string[];
  avatar?: string;
}

export const About: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'John Anderson',
      role: 'Owner & Master Technician',
      experience: '25+ years',
      specialties: ['Engine Diagnostics', 'Transmission', 'Electrical Systems'],
    },
    {
      name: 'Sarah Mitchell',
      role: 'Service Manager',
      experience: '15+ years',
      specialties: ['Customer Service', 'Quality Control', 'Team Management'],
    },
    {
      name: 'Mike Rodriguez',
      role: 'Senior Technician',
      experience: '18+ years',
      specialties: ['Brake Systems', 'Suspension', 'Alignment'],
    },
    {
      name: 'David Chen',
      role: 'Tire Specialist',
      experience: '12+ years',
      specialties: ['Tire Installation', 'Balancing', 'TPMS'],
    },
    {
      name: 'Lisa Thompson',
      role: 'Customer Relations',
      experience: '8+ years',
      specialties: ['Scheduling', 'Customer Care', 'Billing'],
    },
    {
      name: 'James Wilson',
      role: 'Technician',
      experience: '10+ years',
      specialties: ['Oil Changes', 'Maintenance', 'Inspections'],
    },
  ];

  const milestones = [
    { year: '2010', event: 'GT Automotives founded with a vision to provide honest, quality service' },
    { year: '2012', event: 'Expanded services to include complete mechanical repairs' },
    { year: '2015', event: 'Moved to larger facility to better serve our growing customer base' },
    { year: '2018', event: 'Added state-of-the-art diagnostic equipment and alignment system' },
    { year: '2020', event: 'Launched online appointment booking and customer portal' },
    { year: '2023', event: 'Celebrated serving over 5,000 satisfied customers' },
  ];

  const values = [
    {
      icon: <HandshakeIcon sx={{ fontSize: 32 }} />,
      title: 'Integrity',
      description: 'We believe in transparent pricing and honest recommendations. No hidden fees, no unnecessary repairs.',
    },
    {
      icon: <StarIcon sx={{ fontSize: 32 }} />,
      title: 'Quality',
      description: 'We use only quality parts and stand behind our work with comprehensive warranties.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      title: 'Efficiency',
      description: 'We respect your time. Most services completed same day without compromising quality.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: 'Safety',
      description: 'Your safety is our priority. Every service includes a thorough safety inspection.',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Hero
        title="About GT Automotives"
        subtitle="Our Story"
        description="Family-owned and operated since 2010, serving our community with pride and dedication."
        primaryAction={{
          label: 'Meet Our Team',
          path: '#team',
        }}
        secondaryAction={{
          label: 'Contact Us',
          path: '/contact',
        }}
        height="40vh"
      />

      {/* Company Story */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
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
              Since 2010
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 3,
              }}
            >
              Our Journey
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              GT Automotives started with a simple mission: to provide honest, reliable automotive
              service at fair prices. Founded by John Anderson, a master technician with over 25
              years of experience, we began in a small two-bay garage with just three employees.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
                lineHeight: 1.8,
                mb: 3,
              }}
            >
              Today, we've grown to a full-service automotive center with six certified technicians,
              state-of-the-art equipment, and over 5,000 satisfied customers. But our core values
              remain the same: treat every customer like family and every vehicle like our own.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: colors.text.secondary,
                lineHeight: 1.8,
              }}
            >
              We're proud to be your neighborhood automotive experts, offering everything from new
              and used tires to complete mechanical services. Our commitment to quality and customer
              satisfaction has made us the trusted choice for vehicle maintenance and repair.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                backgroundColor: colors.background.light,
                borderRadius: 3,
                p: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: colors.text.primary,
                  mb: 3,
                }}
              >
                Why Customers Choose Us
              </Typography>
              <Stack spacing={2}>
                {[
                  'Family-owned and operated business',
                  'ASE certified technicians',
                  'Transparent, upfront pricing',
                  'Quality parts with warranty',
                  'Same-day service available',
                  'Free vehicle inspections',
                  'Comfortable waiting area',
                  'Shuttle service available',
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CheckIcon sx={{ color: colors.semantic.success, fontSize: 20 }} />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Company Values */}
      <FeatureHighlight
        title="Our Core Values"
        subtitle="What Drives Us"
        features={values}
        columns={4}
        backgroundColor={colors.background.light}
      />

      {/* Milestones Timeline */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Our Milestones
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: colors.text.secondary,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Building trust and excellence over the years
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {/* Timeline Line */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              height: '100%',
              backgroundColor: colors.neutral[300],
              display: { xs: 'none', md: 'block' },
            }}
          />

          {/* Milestones */}
          <Stack spacing={4}>
            {milestones.map((milestone, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Box sx={{ flex: 1, textAlign: { xs: 'left', md: index % 2 === 0 ? 'right' : 'left' } }}>
                  <Card
                    sx={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: colors.primary.main,
                          mb: 1,
                        }}
                      >
                        {milestone.year}
                      </Typography>
                      <Typography variant="body1" sx={{ color: colors.text.secondary }}>
                        {milestone.event}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: colors.primary.main,
                    border: `4px solid white`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1,
                    display: { xs: 'none', md: 'block' },
                  }}
                />
                <Box sx={{ flex: 1 }} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>

      {/* Team Section */}
      <Box id="team" sx={{ backgroundColor: colors.background.light, py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                mb: 2,
              }}
            >
              Meet Our Team
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: colors.text.secondary,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Experienced professionals dedicated to keeping you safely on the road
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar
                      src={member.avatar}
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 2,
                        backgroundColor: colors.primary.main,
                        fontSize: '2rem',
                      }}
                    >
                      {!member.avatar && member.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: colors.text.primary,
                        mb: 0.5,
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: colors.primary.main,
                        fontWeight: 500,
                        mb: 1,
                      }}
                    >
                      {member.role}
                    </Typography>
                    <Chip
                      label={member.experience}
                      size="small"
                      sx={{
                        backgroundColor: colors.secondary.light + '20',
                        color: colors.secondary.dark,
                        fontWeight: 600,
                        mb: 2,
                      }}
                    />
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.secondary,
                        mb: 2,
                      }}
                    >
                      Specialties:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center">
                      {member.specialties.map((specialty, idx) => (
                        <Chip
                          key={idx}
                          label={specialty}
                          size="small"
                          sx={{
                            backgroundColor: colors.neutral[100],
                            color: colors.text.secondary,
                            fontSize: '0.75rem',
                            mb: 0.5,
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Awards & Certifications */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: colors.text.primary,
              mb: 2,
            }}
          >
            Awards & Certifications
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {[
            { icon: <TrophyIcon />, title: 'Best Auto Shop 2023', subtitle: 'Local Business Awards' },
            { icon: <StarIcon />, title: '4.8 Star Rating', subtitle: '500+ Google Reviews' },
            { icon: <CheckIcon />, title: 'ASE Certified', subtitle: 'All Technicians' },
            { icon: <SecurityIcon />, title: 'BBB Accredited', subtitle: 'A+ Rating' },
          ].map((award, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: colors.primary.light + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: colors.primary.main,
                  }}
                >
                  {React.cloneElement(award.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {award.title}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                  {award.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <CTASection
          title="Experience the GT Automotives Difference"
          description="Join thousands of satisfied customers who trust us with their vehicles"
          primaryAction={{
            label: 'Schedule Service',
            path: '/contact',
          }}
          secondaryAction={{
            label: 'View Services',
            path: '/services',
          }}
          variant="gradient"
        />
      </Container>
    </>
  );
};