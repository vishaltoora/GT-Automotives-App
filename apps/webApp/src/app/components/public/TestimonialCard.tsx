import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Rating, Stack } from '@mui/material';
import { FormatQuote as QuoteIcon } from '@mui/icons-material';
import { colors } from '../../theme/colors';

interface TestimonialCardProps {
  name: string;
  role?: string;
  content: string;
  rating?: number;
  avatar?: string;
  date?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  content,
  rating,
  avatar,
  date,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
          borderColor: 'rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {/* Quote Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: colors.primary.light + '15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: colors.primary.main,
          }}
        >
          <QuoteIcon fontSize="small" />
        </Box>

        {/* Rating */}
        {rating && (
          <Box sx={{ mb: 2 }}>
            <Rating
              value={rating}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: colors.secondary.main,
                },
              }}
            />
          </Box>
        )}

        {/* Content */}
        <Typography
          variant="body1"
          sx={{
            color: colors.text.primary,
            lineHeight: 1.7,
            mb: 3,
            flex: 1,
            fontStyle: 'italic',
          }}
        >
          "{content}"
        </Typography>

        {/* Author */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={avatar}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: colors.primary.main,
            }}
          >
            {!avatar && getInitials(name)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: colors.text.primary,
              }}
            >
              {name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flexWrap: 'wrap' }}
            >
              {role && (
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                  }}
                >
                  {role}
                </Typography>
              )}
              {role && date && (
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                  }}
                >
                  •
                </Typography>
              )}
              {date && (
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                  }}
                >
                  {date}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};