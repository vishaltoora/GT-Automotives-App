import {
  Box,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import {
  Receipt,
  Analytics,
  Assessment,
  ShoppingCart,
  BarChart,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function AccountantDashboard() {
  const { user } = useAuth();


  const basePath = '/accountant';


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
