// React import removed - not needed with modern JSX transform
import { Box, Typography, Fade, CircularProgress } from '@mui/material';
import { keyframes } from '@emotion/react';
import { colors } from '../theme/colors';

// Keyframe animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const rotateAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({ message = "Loading..." }: AuthLoadingProps) {
  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #f1f5f9 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: 1,
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary.main} 2px, transparent 2px), 
                             radial-gradient(circle at 75% 75%, ${colors.secondary.main} 2px, transparent 2px)`,
            backgroundSize: '50px 50px',
            backgroundPosition: '0 0, 25px 25px',
            animation: `${floatAnimation} 20s ease-in-out infinite`,
          }}
        />
      
        {/* Animated GT Logo */}
        <Box
          sx={{
            position: 'relative',
            mb: 4,
          }}
        >
          {/* Main GT Logo */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
              boxShadow: `0 10px 30px ${colors.primary.main}40`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* GT Text */}
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 800,
                fontSize: '2.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                animation: `${floatAnimation} 3s ease-in-out infinite`,
              }}
            >
              GT
            </Typography>
            
            {/* Rotating Border */}
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                left: -5,
                width: 130,
                height: 130,
                borderRadius: '50%',
                border: `3px solid transparent`,
                borderTop: `3px solid ${colors.secondary.main}`,
                borderRight: `3px solid ${colors.secondary.main}`,
                animation: `${rotateAnimation} 2s linear infinite`,
              }}
            />
          </Box>

          {/* Floating Icons */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: colors.secondary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${floatAnimation} 2.5s ease-in-out infinite reverse`,
              boxShadow: `0 5px 15px ${colors.secondary.main}40`,
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>🔧</Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: -15,
              left: -25,
              width: 35,
              height: 35,
              borderRadius: '50%',
              backgroundColor: colors.primary.light,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${floatAnimation} 3.5s ease-in-out infinite`,
              boxShadow: `0 5px 15px ${colors.primary.light}40`,
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '1rem' }}>🛞</Typography>
          </Box>
        </Box>

        {/* Loading Text */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              color: colors.primary.main,
              fontWeight: 600,
              mb: 1,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          >
            GT Automotive
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: colors.text.secondary,
              fontSize: '1.1rem',
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Loading Progress */}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <CircularProgress
            size={50}
            thickness={3}
            sx={{
              color: colors.primary.main,
              animation: `${rotateAnimation} 1.5s linear infinite`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress
              variant="determinate"
              size={50}
              thickness={3}
              value={75}
              sx={{
                color: colors.secondary.main,
                transform: 'rotate(90deg)',
              }}
            />
          </Box>
        </Box>

        {/* Subtitle */}
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
            mt: 3,
            opacity: 0.7,
            fontSize: '0.9rem',
          }}
        >
          Professional Tire & Auto Services
        </Typography>
      </Box>
    </Fade>
  );
}