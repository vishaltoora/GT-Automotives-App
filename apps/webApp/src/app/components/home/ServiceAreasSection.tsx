import {
  LocalShipping as TruckIcon,
  Storefront as StorefrontIcon,
  Directions as DirectionsIcon,
} from '@mui/icons-material';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { colors } from '../../theme/colors';
import {
  SHOP_ADDRESS_LINE1,
  SHOP_ADDRESS_LINE2,
  SHOP_MAP_DIRECTIONS_URL,
  SHOP_HOURS,
} from '../../config/shop';

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
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'white',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1.5,
            }}
          >
            Visit Us or We Come to You
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              maxWidth: 640,
              mx: 'auto',
            }}
          >
            Stop by our full-service shop, or book our mobile service to come to
            your location.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems="stretch"
          justifyContent="center"
        >
          {/* Our Shop */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { md: 460 },
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <StorefrontIcon sx={{ color: 'white', fontSize: 26 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                Visit Our Shop
              </Typography>
            </Stack>

            <Typography
              variant="h6"
              sx={{ color: colors.secondary.main, fontWeight: 700, mb: 0.5 }}
            >
              {SHOP_ADDRESS_LINE1}, {SHOP_ADDRESS_LINE2}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.85)', mb: 2 }}
            >
              {SHOP_HOURS.map((h) => `${h.days}: ${h.time}`).join('  •  ')}
            </Typography>

            <Button
              component="a"
              href={SHOP_MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<DirectionsIcon />}
              sx={{
                backgroundColor: colors.secondary.main,
                color: 'white',
                fontWeight: 700,
                borderRadius: 50,
                px: 3,
                py: 1.1,
                '&:hover': { backgroundColor: colors.secondary.dark },
              }}
            >
              Get Directions
            </Button>
          </Box>

          {/* Mobile Service Area */}
          <Box
            sx={{
              flex: 1,
              maxWidth: { md: 460 },
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <TruckIcon sx={{ color: 'white', fontSize: 26 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                Mobile Service
              </Typography>
            </Stack>

            <Typography
              variant="h6"
              sx={{ color: colors.secondary.main, fontWeight: 700, mb: 0.5 }}
            >
              Prince George &amp; 100km Radius
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.85)' }}
            >
              Our mobile unit brings tire and roadside service to your home,
              office or roadside — anywhere within 100 kilometers of Prince
              George.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
