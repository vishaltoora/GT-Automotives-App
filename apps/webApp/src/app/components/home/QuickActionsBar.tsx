import {
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  TireRepair as TireIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface QuickActionsBarProps {
  onBookAppointment?: () => void;
}

export function QuickActionsBar({ onBookAppointment }: QuickActionsBarProps) {
  const actions = [
    {
      label: 'Book Appointment',
      icon: <ScheduleIcon />,
      variant: 'contained' as const,
      color: colors.primary.main,
      onClick: onBookAppointment,
      path: undefined,
    },
    {
      label: 'Browse Services',
      icon: <CarIcon />,
      variant: 'outlined' as const,
      color: colors.primary.main,
      path: '/services',
      onClick: undefined,
    },
    {
      label: 'Browse Tires',
      icon: <TireIcon />,
      variant: 'outlined' as const,
      color: colors.tire.new,
      path: '/inventory',
      onClick: undefined,
    },
    {
      label: 'Contact Us',
      icon: <PhoneIcon />,
      variant: 'contained' as const,
      color: colors.secondary.main,
      path: '/contact',
      onClick: undefined,
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        py: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          {actions.map((action, index) => (
            <Grid key={index} size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant={action.variant}
                startIcon={action.icon}
                sx={{
                  ...(action.variant === 'contained'
                    ? {
                        backgroundColor: action.color,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: action.color === colors.primary.main
                            ? colors.primary.dark
                            : colors.secondary.dark,
                        },
                      }
                    : {
                        borderColor: action.color,
                        color: action.color,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          backgroundColor: action.color + '10',
                        },
                      }),
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
                {...(action.onClick
                  ? { onClick: action.onClick }
                  : { component: Link, to: action.path }
                )}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}