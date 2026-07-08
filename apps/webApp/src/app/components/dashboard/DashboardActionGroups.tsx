import React from 'react';
import { Box, Paper, Typography, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

export interface DashboardAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** Accent color for border, icon, and hover fill. */
  color: string;
  /** Internal route to link to. Use either `to` or `onClick`. */
  to?: string;
  onClick?: () => void;
  /** Optional numeric badge (e.g. pending booking requests). Hidden when 0. */
  badge?: number;
}

export interface DashboardActionGroup {
  title: string;
  items: DashboardAction[];
}

interface DashboardActionGroupsProps {
  groups: DashboardActionGroup[];
}

const cardBaseStyles = {
  p: { xs: 1.5, sm: 2 },
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center' as const,
  cursor: 'pointer',
  textDecoration: 'none',
  borderRadius: 2,
  transition: 'all 0.2s',
  height: '100%',
};

const iconStyles = {
  fontSize: { xs: 26, sm: 30 },
  mb: { xs: 0.5, sm: 1 },
};

const labelStyles = {
  fontWeight: 600,
  fontSize: { xs: '0.75rem', sm: '0.875rem' },
  lineHeight: 1.2,
};

/**
 * Renders dashboard shortcuts organized into labelled groups. Each group is a
 * heading followed by a responsive grid of accent-colored action cards. Cards
 * either navigate (`to`) or run a handler (`onClick`).
 */
export const DashboardActionGroups: React.FC<DashboardActionGroupsProps> = ({
  groups,
}) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}
    >
      {groups.map((group) => (
        <Box key={group.title}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: 1,
              color: colors.text.secondary,
              mb: 1,
            }}
          >
            {group.title}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {group.items.map((item) => {
              const accent = item.color;
              const iconEl = item.badge ? (
                <Badge badgeContent={item.badge} color="warning">
                  <Box sx={{ ...iconStyles, color: accent, display: 'flex' }}>
                    {item.icon}
                  </Box>
                </Badge>
              ) : (
                <Box sx={{ ...iconStyles, color: accent, display: 'flex' }}>
                  {item.icon}
                </Box>
              );

              const linkProps = item.to
                ? { component: Link, to: item.to }
                : {
                    component: 'button' as const,
                    type: 'button' as const,
                    onClick: item.onClick,
                  };

              return (
                <Paper
                  key={item.key}
                  elevation={0}
                  {...linkProps}
                  sx={{
                    ...cardBaseStyles,
                    width: '100%',
                    border: `1px solid ${accent}`,
                    color: accent,
                    background: 'white',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      backgroundColor: accent,
                      color: 'white',
                      '& .MuiSvgIcon-root': { color: 'white !important' },
                      '& .MuiTypography-root': { color: 'white !important' },
                      '& .MuiBadge-badge': {
                        backgroundColor: 'white !important',
                        color: `${accent} !important`,
                      },
                    },
                  }}
                >
                  {iconEl}
                  <Typography
                    variant="body2"
                    sx={{ ...labelStyles, color: accent }}
                  >
                    {item.label}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
