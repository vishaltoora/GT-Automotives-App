import React from 'react';
import { Link } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
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
import { colors } from '../../theme/colors';

interface BannerCta {
  label: string;
  path: string;
  external?: boolean;
}

interface ServiceHighlightBannerProps {
  /** Section header above the card */
  headerTitle: string;
  headerSubtitle: string;
  /** Card content */
  badge: string;
  title: string;
  titleIcon: React.ComponentType<{ sx?: object }>;
  description: string;
  features: string[];
  image: string;
  imageAlt: string;
  primaryCta: BannerCta;
  secondaryCta?: BannerCta;
  /** Image on the right instead of the left */
  reverse?: boolean;
}

function ctaProps(cta: BannerCta) {
  if (
    cta.external ||
    cta.path.startsWith('tel:') ||
    cta.path.startsWith('http')
  ) {
    return { component: 'a' as const, href: cta.path };
  }
  return { component: Link, to: cta.path };
}

export const ServiceHighlightBanner: React.FC<ServiceHighlightBannerProps> = ({
  headerTitle,
  headerSubtitle,
  badge,
  title,
  titleIcon: TitleIcon,
  description,
  features,
  image,
  imageAlt,
  primaryCta,
  secondaryCta,
  reverse = false,
}) => {
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
          {headerTitle}
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
          {headerSubtitle}
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
            inset: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' stroke='white' stroke-width='2' fill='none'/%3E%3Ccircle cx='30' cy='30' r='10' stroke='white' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />

        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: reverse ? 'row-reverse' : 'row',
              },
              alignItems: 'center',
              gap: { xs: 3, md: 5 },
            }}
          >
            {/* Image */}
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: '100%', md: '38%' },
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <Box
                component="img"
                src={image}
                alt={imageAlt}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: { xs: 220, md: 300 },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Chip
                label={badge}
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
                  {title}
                </Typography>
                <TitleIcon
                  sx={{ color: 'white', fontSize: { xs: 32, sm: 40, md: 48 } }}
                />
              </Box>

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
                {description}
              </Typography>

              {/* Features */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                  mb: 3,
                }}
              >
                {features.map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    <CheckIcon sx={{ color: 'white', fontSize: 22 }} />
                    <Typography
                      variant="body1"
                      sx={{ color: 'white', fontSize: '1rem', fontWeight: 700 }}
                    >
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* CTAs */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
              >
                <Button
                  {...ctaProps(primaryCta)}
                  variant="contained"
                  size="large"
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
                  {primaryCta.label}
                </Button>
                {secondaryCta && (
                  <Button
                    {...ctaProps(secondaryCta)}
                    variant="outlined"
                    size="large"
                    startIcon={
                      secondaryCta.path.startsWith('tel:') ? (
                        <PhoneIcon />
                      ) : undefined
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
                    {secondaryCta.label}
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ServiceHighlightBanner;
