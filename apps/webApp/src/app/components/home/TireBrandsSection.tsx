import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import {
  AcUnit as WinterIcon,
  AllInclusive as AllSeasonIcon,
  DirectionsCar as PerformanceIcon,
  LocalShipping as TruckIcon,
  Inventory as InventoryIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

interface TireCategory {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

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
    'Rovelo',
    'Ironman',
    'Westlake',
  ];

  const tireCategories: TireCategory[] = [
    {
      title: 'All-Season',
      description: 'Year-round performance',
      icon: <AllSeasonIcon />,
      highlight: 'Most Popular',
    },
    {
      title: 'Winter Tires',
      description: 'Maximum snow & ice grip',
      icon: <WinterIcon />,
    },
    {
      title: 'Performance',
      description: 'Enhanced handling & speed',
      icon: <PerformanceIcon />,
    },
    {
      title: 'Truck & SUV',
      description: 'Heavy-duty durability',
      icon: <TruckIcon />,
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='20' stroke='white' stroke-width='2' fill='none'/%3E%3Ccircle cx='30' cy='30' r='10' stroke='white' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        {/* Main Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Chip
            label="PRINCE GEORGE'S TIRE SPECIALISTS"
            sx={{
              backgroundColor: colors.secondary.main,
              color: 'white',
              fontWeight: 700,
              mb: 3,
              px: 2,
              fontSize: '0.75rem',
              letterSpacing: 1,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: 'white',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            New & Used Tires
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6,
            }}
          >
            Huge selection of quality tires for every vehicle and budget.
            Save big on premium brands without compromising on safety.
          </Typography>
        </Box>

        {/* Tire Categories */}
        <Box sx={{ mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 3,
              textAlign: 'center',
            }}
          >
            Find the Right Tire for Your Needs
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {tireCategories.map((category, index) => (
              <Box
                key={index}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {category.highlight && (
                  <Chip
                    label={category.highlight}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: colors.secondary.main,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.6rem',
                    }}
                  />
                )}
                <Box
                  sx={{
                    color: 'white',
                    mb: 1.5,
                    '& svg': { fontSize: { xs: 28, md: 36 } },
                  }}
                >
                  {category.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'white',
                    fontSize: { xs: '0.9rem', md: '1.1rem' },
                    mb: 0.5,
                  }}
                >
                  {category.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: { xs: '0.75rem', md: '0.85rem' },
                  }}
                >
                  {category.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Brands Section */}
        <Box sx={{ mb: { xs: 5, md: 6 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'rgba(255,255,255,0.8)',
              mb: 2,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontSize: '0.85rem',
            }}
          >
            Trusted Brands We Carry
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 1, md: 2 }}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ rowGap: 1 }}
          >
            {tireBrands.map((brand, index) => (
              <Chip
                key={index}
                label={brand}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: { xs: '0.75rem', md: '0.85rem' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: 'center' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/inventory"
              variant="contained"
              size="large"
              startIcon={<InventoryIcon />}
              endIcon={<ArrowIcon />}
              sx={{
                backgroundColor: colors.secondary.main,
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: colors.secondary.dark,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Browse Our Inventory
            </Button>
            <Button
              component="a"
              href="tel:2509869191"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 2,
                },
              }}
            >
              Call (250) 986-9191
            </Button>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              mt: 3,
              fontSize: '0.85rem',
            }}
          >
            Free quotes • Same-day installation available • Mobile service
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
