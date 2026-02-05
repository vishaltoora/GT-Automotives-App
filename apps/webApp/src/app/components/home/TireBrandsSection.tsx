import {
  Box,
  Button,
  Card,
  CardContent,
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
  Phone as PhoneIcon,
} from '@mui/icons-material';
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
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            color: colors.text.primary,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Quality Tires For Every Budget
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: colors.text.secondary,
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 400,
          }}
        >
          Shop our wide selection of new and used tires from top brands at competitive prices
        </Typography>
      </Box>

      <Card
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
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

        <CardContent sx={{ p: { xs: 3, md: 5 }, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 3, md: 5 },
            }}
          >
            {/* Left Side - Tire Image */}
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: '100%', md: '35%' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="https://static.vecteezy.com/system/resources/thumbnails/037/073/074/small/ai-generated-stack-of-black-car-tires-arranged-artistically-against-a-transparent-background-created-with-generative-ai-technology-png.png"
                alt="Stack of quality tires"
                sx={{
                  maxWidth: { xs: 200, sm: 250, md: 300 },
                  height: 'auto',
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                }}
              />
            </Box>

            {/* Right Side - Content */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              {/* Header */}
              <Chip
                label="PRINCE GEORGE'S TIRE SPECIALISTS"
                sx={{
                  backgroundColor: colors.secondary.main,
                  color: 'white',
                  fontWeight: 700,
                  mb: 2,
                  px: 2,
                  fontSize: '0.75rem',
                  letterSpacing: 1,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  mb: 1.5,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                New & Used Tires
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.6,
                }}
              >
                Huge selection of quality tires for every vehicle and budget.
                Save big on premium brands without compromising on safety.
              </Typography>

              {/* Tire Categories */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: 1.5,
                  mb: 3,
                }}
              >
                {tireCategories.map((category, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {category.highlight && (
                      <Chip
                        label={category.highlight}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: colors.secondary.main,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.55rem',
                          height: 18,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        color: 'white',
                        mb: 0.5,
                        '& svg': { fontSize: 24 },
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'white',
                        fontSize: '0.8rem',
                      }}
                    >
                      {category.title}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Brands */}
              <Stack
                direction="row"
                spacing={0.75}
                flexWrap="wrap"
                useFlexGap
                sx={{ rowGap: 0.75, mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                {tireBrands.map((brand, index) => (
                  <Chip
                    key={index}
                    label={brand}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                      fontWeight: 500,
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontSize: '0.7rem',
                      height: 24,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* CTA Section */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                  }}
                >
                  For more information
                </Typography>
                <Button
                  component="a"
                  href="tel:2509869191"
                  variant="contained"
                  size="large"
                  startIcon={
                    <PhoneIcon
                      sx={{
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
                  }
                  sx={{
                    backgroundColor: colors.secondary.main,
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderRadius: 50,
                    '&:hover': {
                      backgroundColor: colors.secondary.dark,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Call Us
                </Button>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
