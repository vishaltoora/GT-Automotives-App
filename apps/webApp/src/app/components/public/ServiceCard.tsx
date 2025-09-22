import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  price?: string;
  duration?: string;
  features?: string[];
  category?: 'tire' | 'maintenance' | 'repair' | 'inspection';
  actionLabel?: string;
  actionPath?: string;
  highlighted?: boolean;
  emergency?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  price,
  duration,
  features = [],
  category = 'maintenance',
  actionLabel = 'Learn More',
  actionPath = '/services',
  highlighted = false,
  emergency = false,
}) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'tire':
        return colors.service.tires;
      case 'maintenance':
        return colors.service.maintenance;
      case 'repair':
        return colors.service.repair;
      case 'inspection':
        return colors.service.inspection;
      default:
        return colors.primary.main;
    }
  };

  const categoryColor = getCategoryColor();

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: highlighted ? `2px solid ${categoryColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 3,
        background: highlighted
          ? `linear-gradient(135deg, ${categoryColor}08 0%, ${categoryColor}03 100%)`
          : 'white',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: highlighted
            ? `0 24px 48px ${categoryColor}30`
            : '0 24px 48px rgba(0,0,0,0.15)',
          borderColor: categoryColor,
          '& .service-icon-box': {
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
      }}
    >
      {/* Badges */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 2,
        }}
      >
        {highlighted && (
          <Box
            sx={{
              backgroundColor: categoryColor,
              color: 'white',
              px: 2,
              py: 0.75,
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              boxShadow: `0 4px 12px ${categoryColor}40`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            ⭐ Popular
          </Box>
        )}
        {emergency && (
          <Box
            sx={{
              backgroundColor: colors.semantic.error,
              color: 'white',
              px: 2,
              py: 0.75,
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              boxShadow: `0 4px 12px ${colors.semantic.error}40`,
            }}
          >
            24/7
          </Box>
        )}
      </Stack>

      <CardContent sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        p: 3,
        pt: highlighted ? 4 : 3,
      }}>
        {/* Icon */}
        {icon && (
          <Box
            className="service-icon-box"
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${categoryColor}20 0%, ${categoryColor}10 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              color: categoryColor,
              position: 'relative',
              transition: 'transform 0.3s ease',
              '&:after': {
                content: '""',
                position: 'absolute',
                inset: -4,
                borderRadius: '50%',
                border: `2px solid ${categoryColor}15`,
              },
            }}
          >
            {icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: colors.text.primary,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Price and Duration */}
        {(price || duration) && (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {price && (
              <Typography
                variant="h6"
                sx={{
                  color: categoryColor,
                  fontWeight: 700,
                }}
              >
                {price}
              </Typography>
            )}
            {duration && (
              <Chip
                label={duration}
                size="small"
                sx={{
                  backgroundColor: colors.neutral[100],
                  color: colors.text.secondary,
                  fontWeight: 500,
                }}
              />
            )}
          </Stack>
        )}

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: colors.text.secondary,
            mb: 2,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        {/* Features */}
        {features.length > 0 && (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  padding: '8px 12px',
                  backgroundColor: colors.neutral[50],
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${categoryColor}08`,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: `${categoryColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: categoryColor,
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {feature}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Spacer to push button to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Action Button */}
        <Button
          component={Link}
          to={actionPath}
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          sx={{
            mt: 2,
            backgroundColor: categoryColor,
            color: 'white',
            fontWeight: 600,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: `0 4px 12px ${categoryColor}30`,
            '&:hover': {
              backgroundColor: colors.primary.dark,
              boxShadow: `0 6px 20px ${categoryColor}40`,
              '& .MuiButton-endIcon': {
                transform: 'translateX(4px)',
              },
            },
            '& .MuiButton-endIcon': {
              transition: 'transform 0.3s ease',
            },
          }}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};