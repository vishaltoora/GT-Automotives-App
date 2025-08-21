import React from 'react';
import { Box, Container, Typography, Button, Stack, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    path: string;
  };
  secondaryAction?: {
    label: string;
    path: string;
  };
  backgroundImage?: string;
  height?: string | number;
  overlay?: boolean;
  logo?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundImage,
  height = '70vh',
  overlay = true,
  logo,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Helper function to check if a path is external
  const isExternalPath = (path: string) => {
    return path.startsWith('http') || path.startsWith('tel:') || path.startsWith('mailto:') || path.startsWith('#');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: backgroundImage 
          ? `url(${backgroundImage})` 
          : colors.gradients.hero,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      {overlay && backgroundImage && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(30, 58, 95, 0.8), rgba(30, 58, 95, 0.9))',
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Stack
          spacing={3}
          alignItems="center"
          textAlign="center"
          sx={{ maxWidth: 800, mx: 'auto' }}
        >
          {/* Logo */}
          {logo && (
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'white',
                padding: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                mb: 2,
              }}
            >
              <img
                src={logo}
                alt="GT Automotives Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '50%',
                }}
              />
            </Box>
          )}

          {subtitle && (
            <Typography
              variant="overline"
              sx={{
                color: backgroundImage || overlay ? 'white' : colors.secondary.main,
                letterSpacing: 2,
                fontWeight: 600,
              }}
            >
              {subtitle}
            </Typography>
          )}

          <Typography
            variant={isMobile ? 'h3' : 'h1'}
            sx={{
              fontWeight: 800,
              color: backgroundImage || overlay ? 'white' : colors.text.primary,
              textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant={isMobile ? 'body1' : 'h6'}
              sx={{
                color: backgroundImage || overlay ? 'rgba(255,255,255,0.95)' : colors.text.secondary,
                maxWidth: 600,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          )}

          {(primaryAction || secondaryAction) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              {primaryAction && (
                <Button
                  {...(isExternalPath(primaryAction.path) 
                    ? { href: primaryAction.path } 
                    : { component: Link, to: primaryAction.path }
                  )}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    backgroundColor: colors.secondary.main,
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: colors.secondary.dark,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(255,107,53,0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {primaryAction.label}
                </Button>
              )}

              {secondaryAction && (
                <Button
                  {...(isExternalPath(secondaryAction.path) 
                    ? { href: secondaryAction.path } 
                    : { component: Link, to: secondaryAction.path }
                  )}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: backgroundImage || overlay ? 'white' : colors.primary.main,
                    color: backgroundImage || overlay ? 'white' : colors.primary.main,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: backgroundImage || overlay ? 'white' : colors.primary.dark,
                      backgroundColor: backgroundImage || overlay ? 'rgba(255,255,255,0.1)' : 'rgba(30,58,95,0.05)',
                      transform: 'translateY(-2px)',
                      borderWidth: 2,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {secondaryAction.label}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Container>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
          zIndex: 1,
          display: backgroundImage ? 'none' : 'block',
        }}
      />
    </Box>
  );
};