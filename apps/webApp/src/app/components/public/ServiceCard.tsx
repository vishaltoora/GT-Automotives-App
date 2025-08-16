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
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: highlighted ? `2px solid ${categoryColor}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          borderColor: highlighted ? categoryColor : 'rgba(0,0,0,0.12)',
        },
      }}
    >
      {highlighted && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: categoryColor,
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            zIndex: 1,
          }}
        >
          Popular
        </Box>
      )}

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
            sx={{
              width: 60,
              height: 60,
              borderRadius: 2,
              backgroundColor: `${categoryColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              color: categoryColor,
            }}
          >
            {icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: colors.text.primary,
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
          <Stack spacing={1} sx={{ mb: 3 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: categoryColor,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                    fontSize: '0.875rem',
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
          variant="text"
          endIcon={<ArrowForwardIcon />}
          sx={{
            mt: 2,
            color: categoryColor,
            fontWeight: 600,
            justifyContent: 'flex-start',
            px: 0,
            '&:hover': {
              backgroundColor: 'transparent',
              color: colors.primary.dark,
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