import { Box, Container, Grid, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

export function TireBrandsSection() {
  const tireBrands = [
    'Michelin',
    'Bridgestone',
    'Goodyear',
    'Continental',
    'BF Goodrich',
    'Pirelli',
    'Firestone',
    'Yokohama',
  ];

  return (
    <Box sx={{ backgroundColor: colors.background.light, py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.text.primary,
            mb: 4,
            textAlign: 'center',
          }}
        >
          Tire Brands We Carry
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {tireBrands.map((brand, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={index}>
              <BrandCard brand={brand} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function BrandCard({ brand }: { brand: string }) {
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        p: 3,
        borderRadius: 2,
        textAlign: 'center',
        border: `1px solid ${colors.neutral[200]}`,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: colors.primary.main,
          '& .tire-icon': {
            transform: 'rotate(360deg)',
            color: colors.primary.main,
          },
        },
      }}
    >
      <Box
        className="tire-icon"
        sx={{
          fontSize: 24,
          transition: 'all 0.5s ease',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        🛞
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
        {brand}
      </Typography>
    </Box>
  );
}