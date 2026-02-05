import {
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Box, Fab, Zoom } from '@mui/material';
import { colors } from '../../theme/colors';

interface FloatingActionButtonsProps {
  onBookAppointment?: () => void;
}

export function FloatingActionButtons({ onBookAppointment }: FloatingActionButtonsProps) {
  const handleCall = () => {
    window.location.href = 'tel:2509869191';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, md: 24 },
        right: { xs: 16, md: 24 },
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Book Now Button */}
      <Zoom in timeout={300}>
        <Fab
          variant="extended"
          onClick={onBookAppointment}
          sx={{
            backgroundColor: colors.secondary.main,
            color: 'white',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
            px: 3,
            '&:hover': {
              backgroundColor: colors.secondary.dark,
              transform: 'scale(1.05)',
              boxShadow: '0 6px 25px rgba(255, 107, 53, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ScheduleIcon
            sx={{
              mr: 1,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.2)' },
              },
            }}
          />
          Book Now
        </Fab>
      </Zoom>

      {/* Call Us Button */}
      <Zoom in timeout={500}>
        <Fab
          variant="extended"
          onClick={handleCall}
          sx={{
            backgroundColor: colors.secondary.main,
            color: 'white',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
            px: 3,
            '&:hover': {
              backgroundColor: colors.secondary.dark,
              transform: 'scale(1.05)',
              boxShadow: '0 6px 25px rgba(255, 107, 53, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <PhoneIcon
            sx={{
              mr: 1,
              animation: 'ring 1.5s ease-in-out infinite',
              '@keyframes ring': {
                '0%, 100%': { transform: 'rotate(0deg)' },
                '10%': { transform: 'rotate(15deg)' },
                '20%': { transform: 'rotate(-10deg)' },
                '30%': { transform: 'rotate(15deg)' },
                '40%': { transform: 'rotate(-10deg)' },
                '50%': { transform: 'rotate(0deg)' },
              },
            }}
          />
          Call Us
        </Fab>
      </Zoom>
    </Box>
  );
}
