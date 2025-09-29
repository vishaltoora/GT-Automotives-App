import { Box, Typography, Grid, Card, CardContent, Button, Paper, Chip } from '@mui/material';
import { People, Inventory, Receipt, CalendarMonth, TrendingUp, Schedule, DirectionsCar } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';

export function StaffDashboard() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: colors.primary.main, fontWeight: 700 }}>
          Staff Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage customers, inventory, and daily operations efficiently.
        </Typography>
        <Chip
          label="Staff Portal"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            background: `linear-gradient(135deg, ${colors.primary.lighter}20 0%, ${colors.primary.main}10 100%)`,
            border: `1px solid ${colors.primary.lighter}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${colors.primary.main}20`,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: colors.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <People sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <TrendingUp sx={{ color: colors.semantic.success }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: colors.primary.main, mb: 1 }}>
                42
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Customers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active customers managed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            background: `linear-gradient(135deg, ${colors.semantic.successLight}20 0%, ${colors.semantic.success}10 100%)`,
            border: `1px solid ${colors.semantic.successLight}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${colors.semantic.success}20`,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: colors.semantic.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Inventory sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <DirectionsCar sx={{ color: colors.primary.main }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: colors.semantic.success, mb: 1 }}>
                156
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Inventory Items
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tires and parts in stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            background: `linear-gradient(135deg, ${colors.semantic.warningLight}20 0%, ${colors.semantic.warning}10 100%)`,
            border: `1px solid ${colors.semantic.warningLight}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${colors.semantic.warning}20`,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: colors.semantic.warning,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Receipt sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <TrendingUp sx={{ color: colors.semantic.success }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: colors.semantic.warning, mb: 1 }}>
                8
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Today's Sales
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoices completed today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{
            background: `linear-gradient(135deg, ${colors.semantic.infoLight}20 0%, ${colors.semantic.info}10 100%)`,
            border: `1px solid ${colors.semantic.infoLight}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${colors.semantic.info}20`,
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: colors.semantic.info,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarMonth sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Schedule sx={{ color: colors.semantic.warning }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: colors.semantic.info, mb: 1 }}>
                5
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scheduled for today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 4,
            background: `linear-gradient(135deg, ${colors.neutral[50]} 0%, white 100%)`,
            border: `1px solid ${colors.neutral[200]}`,
            borderRadius: 2,
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: colors.primary.main, mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Button
                variant="contained"
                component={Link}
                to="/staff/invoices/new"
                size="large"
                sx={{
                  py: 2,
                  backgroundColor: colors.primary.main,
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: colors.primary.dark,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Invoice
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/staff/customers/new"
                size="large"
                sx={{
                  py: 2,
                  borderColor: colors.secondary.main,
                  color: colors.secondary.main,
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: colors.secondary.lighter + '20',
                    borderColor: colors.secondary.dark,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Add Customer
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/staff/inventory"
                size="large"
                sx={{
                  py: 2,
                  borderColor: colors.semantic.success,
                  color: colors.semantic.success,
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: colors.semantic.successLight + '20',
                    borderColor: colors.semantic.successDark,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Check Inventory
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/staff/quotations/new"
                size="large"
                sx={{
                  py: 2,
                  borderColor: colors.semantic.info,
                  color: colors.semantic.info,
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: colors.semantic.infoLight + '20',
                    borderColor: colors.semantic.infoDark,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Quote
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{
            p: 4,
            background: `linear-gradient(135deg, ${colors.semantic.infoLight}10 0%, white 100%)`,
            border: `1px solid ${colors.semantic.infoLight}30`,
            borderRadius: 2,
            height: 'fit-content',
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: colors.primary.main, mb: 3 }}>
              Today's Schedule
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                9:00 AM - Tire Installation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Customer: John Smith - 2023 Honda Civic
              </Typography>

              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                2:00 PM - Oil Change
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Customer: Sarah Johnson - 2021 Toyota Camry
              </Typography>

              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                4:30 PM - Brake Inspection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer: Mike Davis - 2020 Ford F-150
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="text"
              component={Link}
              to="/staff/appointments"
              sx={{
                mt: 2,
                color: colors.primary.main,
                fontWeight: 600,
              }}
            >
              View Full Schedule
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}