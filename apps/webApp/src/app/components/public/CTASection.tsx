import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface CTASectionProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    path: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    path: string;
    icon?: React.ReactNode;
  };
  variant?: 'gradient' | 'solid' | 'outlined';
  alignment?: 'center' | 'left';
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'gradient',
  alignment = 'center',
}) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'gradient':
        return {
          background: colors.gradients.hero,
          color: 'white',
        };
      case 'solid':
        return {
          backgroundColor: colors.primary.main,
          color: 'white',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${colors.primary.main}`,
          color: colors.text.primary,
        };
      default:
        return {};
    }
  };

  const isLight = variant === 'gradient' || variant === 'solid';

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        my: { xs: 4, md: 6 },
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        ...getBackgroundStyle(),
      }}
    >
      {/* Background Pattern */}
      {variant === 'gradient' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />
      )}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          spacing={3}
          alignItems={alignment === 'center' ? 'center' : 'flex-start'}
          textAlign={alignment}
          sx={{ maxWidth: alignment === 'center' ? 800 : '100%', mx: alignment === 'center' ? 'auto' : 0 }}
        >
          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: isLight ? 'white' : colors.text.primary,
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          {description && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 400,
                color: isLight ? 'rgba(255,255,255,0.9)' : colors.text.secondary,
                maxWidth: 600,
              }}
            >
              {description}
            </Typography>
          )}

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 2 }}
            >
              {primaryAction && (
                <Button
                  component={Link}
                  to={primaryAction.path}
                  variant="contained"
                  size="large"
                  startIcon={primaryAction.icon}
                  endIcon={!primaryAction.icon && <ArrowForwardIcon />}
                  sx={{
                    backgroundColor: isLight ? colors.secondary.main : colors.primary.main,
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: isLight ? colors.secondary.dark : colors.primary.dark,
                      transform: 'translateY(-2px)',
                      boxShadow: isLight 
                        ? '0 6px 20px rgba(255,107,53,0.4)'
                        : '0 6px 20px rgba(30,58,95,0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {primaryAction.label}
                </Button>
              )}

              {secondaryAction && (
                <Button
                  component={Link}
                  to={secondaryAction.path}
                  variant="outlined"
                  size="large"
                  startIcon={secondaryAction.icon}
                  sx={{
                    borderColor: isLight ? 'white' : colors.primary.main,
                    color: isLight ? 'white' : colors.primary.main,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderColor: isLight ? 'white' : colors.primary.dark,
                      backgroundColor: isLight ? 'rgba(255,255,255,0.1)' : 'rgba(30,58,95,0.05)',
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
    </Box>
  );
};