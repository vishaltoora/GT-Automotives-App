import {
  LocalShipping as TruckIcon,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { colors } from '../../theme/colors';

export function ServiceAreasSection() {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
        py: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)
          `,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TruckIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: 'white',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Service Coverage Area
            </Typography>
          </Stack>
          
          <Typography
            variant="h5"
            sx={{
              color: colors.secondary.main,
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            Prince George & 100km Radius
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' },
            }}
          >
            Our mobile tire emergency service reaches you wherever you are within 100 kilometers of Prince George
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}