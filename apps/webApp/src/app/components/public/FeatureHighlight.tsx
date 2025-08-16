import React from 'react';
import { Box, Typography, Grid, Container, Stack } from '@mui/material';
import { colors } from '../../theme/colors';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureHighlightProps {
  title?: string;
  subtitle?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: 'centered' | 'left-aligned';
  backgroundColor?: string;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  title,
  subtitle,
  features,
  columns = 3,
  variant = 'centered',
  backgroundColor = colors.background.light,
}) => {
  const gridColumns = 12 / columns;

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        {(title || subtitle) && (
          <Box
            sx={{
              textAlign: variant === 'centered' ? 'center' : 'left',
              mb: { xs: 4, md: 6 },
              maxWidth: variant === 'centered' ? 800 : '100%',
              mx: variant === 'centered' ? 'auto' : 0,
            }}
          >
            {subtitle && (
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
                {subtitle}
              </Typography>
            )}
            {title && (
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: colors.text.primary,
                  mb: 2,
                }}
              >
                {title}
              </Typography>
            )}
          </Box>
        )}

        {/* Features Grid */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={gridColumns} key={index}>
              <Stack
                spacing={2}
                sx={{
                  height: '100%',
                  textAlign: variant === 'centered' ? 'center' : 'left',
                  alignItems: variant === 'centered' ? 'center' : 'flex-start',
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3,
                    background: colors.gradients.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(30,58,95,0.2)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {feature.icon}
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: colors.text.primary,
                  }}
                >
                  {feature.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.text.secondary,
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};