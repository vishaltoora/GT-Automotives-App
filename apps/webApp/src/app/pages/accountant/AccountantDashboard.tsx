import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  AttachMoney,
  Receipt,
  Analytics,
  TrendingUp,
  TrendingDown,
  Assessment,
  ShoppingCart,
  BarChart,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService, DashboardStats } from '../../requests/dashboard.requests';

export function AccountantDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const basePath = '/accountant';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quick action styles
  const actionItemStyles = {
    p: { xs: 2, sm: 3 },
    textAlign: 'center' as const,
    cursor: 'pointer',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 2,
    transition: 'all 0.2s',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: { xs: 100, sm: 120 },
  };

  const actionIconStyles = {
    fontSize: { xs: 36, sm: 48 },
    mb: 1,
  };

  const actionTextStyles = {
    fontWeight: 600,
    fontSize: { xs: '0.875rem', sm: '1rem' },
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.primary.main,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            mb: 1,
          }}
        >
          Welcome, {user?.firstName || 'Accountant'}{' '}
          <span style={{ display: 'inline-block' }}>📊</span>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: { sm: '0.875rem', md: '1rem' } }}
        >
          Financial overview and reports
        </Typography>
      </Box>

      {/* Financial Stats Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {/* Total Revenue */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
                      ${stats.revenue.value.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {stats.revenue.trend === 'up' ? (
                        <TrendingUp sx={{ fontSize: 16 }} />
                      ) : (
                        <TrendingDown sx={{ fontSize: 16 }} />
                      )}
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {stats.revenue.change}% vs last month
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Invoices */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                border: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <Receipt sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Invoices
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
                      {stats.customers.value}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      This month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Payments */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <Analytics sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Pending Invoices
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
                      {stats.vehicles.value}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Awaiting payment
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Revenue */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                border: 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Today's Revenue
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
                      ${stats.appointments.value * 150}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {stats.appointments.value} transactions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}

      {/* Quick Actions for Accountant */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: `1px solid ${colors.neutral[200]}`,
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: colors.primary.main,
            mb: 3,
          }}
        >
          Quick Access
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Invoices */}
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper
              component={Link}
              to={`${basePath}/invoices`}
              sx={{
                ...actionItemStyles,
                border: `2px solid ${colors.secondary.main}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  backgroundColor: colors.secondary.main,
                  color: 'white',
                  '& .MuiSvgIcon-root': { color: 'white !important' },
                  '& .MuiTypography-root': { color: 'white !important' },
                },
              }}
            >
              <Receipt sx={{ ...actionIconStyles, color: colors.secondary.main }} />
              <Typography sx={{ ...actionTextStyles, color: colors.secondary.main }}>
                Invoices
              </Typography>
            </Paper>
          </Grid>

          {/* Cash Report */}
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper
              component={Link}
              to={`${basePath}/cash-report`}
              sx={{
                ...actionItemStyles,
                border: `2px solid ${colors.semantic.success}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  backgroundColor: colors.semantic.success,
                  color: 'white',
                  '& .MuiSvgIcon-root': { color: 'white !important' },
                  '& .MuiTypography-root': { color: 'white !important' },
                },
              }}
            >
              <Assessment sx={{ ...actionIconStyles, color: colors.semantic.success }} />
              <Typography sx={{ ...actionTextStyles, color: colors.semantic.success }}>
                Cash Report
              </Typography>
            </Paper>
          </Grid>

          {/* Purchase & Expense */}
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper
              component={Link}
              to={`${basePath}/purchase-invoices`}
              sx={{
                ...actionItemStyles,
                border: `2px solid ${colors.primary.main}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  backgroundColor: colors.primary.main,
                  color: 'white',
                  '& .MuiSvgIcon-root': { color: 'white !important' },
                  '& .MuiTypography-root': { color: 'white !important' },
                },
              }}
            >
              <ShoppingCart sx={{ ...actionIconStyles, color: colors.primary.main }} />
              <Typography sx={{ ...actionTextStyles, color: colors.primary.main }}>
                Purchase & Expense
              </Typography>
            </Paper>
          </Grid>

          {/* Tax Report */}
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper
              component={Link}
              to={`${basePath}/reports`}
              sx={{
                ...actionItemStyles,
                border: `2px solid ${colors.semantic.info}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  backgroundColor: colors.semantic.info,
                  color: 'white',
                  '& .MuiSvgIcon-root': { color: 'white !important' },
                  '& .MuiTypography-root': { color: 'white !important' },
                },
              }}
            >
              <BarChart sx={{ ...actionIconStyles, color: colors.semantic.info }} />
              <Typography sx={{ ...actionTextStyles, color: colors.semantic.info }}>
                Tax Report
              </Typography>
            </Paper>
          </Grid>

          {/* Analytics */}
          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Paper
              component={Link}
              to={`${basePath}/analytics`}
              sx={{
                ...actionItemStyles,
                border: `2px solid #9c27b0`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  backgroundColor: '#9c27b0',
                  color: 'white',
                  '& .MuiSvgIcon-root': { color: 'white !important' },
                  '& .MuiTypography-root': { color: 'white !important' },
                },
              }}
            >
              <Analytics sx={{ ...actionIconStyles, color: '#9c27b0' }} />
              <Typography sx={{ ...actionTextStyles, color: '#9c27b0' }}>
                Analytics
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Information Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: `1px solid ${colors.neutral[200]}`,
          backgroundColor: colors.neutral[50],
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: colors.primary.main,
            mb: 2,
          }}
        >
          Accountant Access
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          As an accountant, you have access to:
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0, color: colors.text.secondary }}>
          <li>View and manage invoices</li>
          <li>Access cash reports and daily summaries</li>
          <li>Review purchase and expense invoices</li>
          <li>Generate tax reports (GST collected/paid)</li>
          <li>View financial analytics</li>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          Note: Creating, editing, or deleting invoices is restricted to admin users.
        </Typography>
      </Paper>
    </Box>
  );
}

export default AccountantDashboard;
