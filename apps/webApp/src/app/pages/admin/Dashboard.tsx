import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  People,
  AttachMoney,
  Inventory,
  SupervisorAccount,
  Analytics,
  DirectionsCar,
  Receipt,
  CalendarMonth,
  Warning,
  CheckCircle,
  Error,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  TireRepair,
  Speed,
  LocalShipping,
  Description,
  Work,
  Payment,
  ShoppingCart,
  ReceiptLong,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { Link, useNavigate } from 'react-router-dom';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import QuotationDialog from '../../components/quotations/QuotationDialog';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService, DashboardStats } from '../../services/dashboard.service';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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

  const recentActivities = [
    { id: 1, type: 'invoice', text: 'New invoice #INV-2024-043 created', time: '5 minutes ago', status: 'success' },
    { id: 2, type: 'customer', text: 'New customer John Smith registered', time: '1 hour ago', status: 'info' },
    { id: 3, type: 'inventory', text: 'Low stock alert: Michelin Pilot Sport 4S', time: '2 hours ago', status: 'warning' },
    { id: 4, type: 'appointment', text: 'Appointment scheduled for tomorrow 9 AM', time: '3 hours ago', status: 'info' },
  ];

  const handleInvoiceSuccess = (invoice: any) => {
    // Navigate to the newly created invoice details
    navigate(`/admin/invoices/${invoice.id}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: colors.semantic.success }} />;
      case 'warning':
        return <Warning sx={{ color: colors.semantic.warning }} />;
      case 'error':
        return <Error sx={{ color: colors.semantic.error }} />;
      default:
        return <Analytics sx={{ color: colors.semantic.info }} />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
              Welcome back, {user?.firstName || 'Admin'}{' '}
              <span
                style={{
                  display: 'inline-block',
                  animation: 'wave 1.5s ease-in-out infinite',
                  transformOrigin: '70% 70%',
                }}
              >
                👋
              </span>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your business today
            </Typography>
            <style>
              {`
                @keyframes wave {
                  0%, 100% { transform: rotate(0deg); }
                  10%, 30% { transform: rotate(14deg); }
                  20% { transform: rotate(-8deg); }
                  40%, 60% { transform: rotate(14deg); }
                  50% { transform: rotate(-8deg); }
                  70% { transform: rotate(0deg); }
                }
              `}
            </style>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={loadStats}
              disabled={loading}
              sx={{
                border: `1px solid ${colors.neutral[300]}`,
                '&:hover': { backgroundColor: colors.neutral[100] },
              }}
            >
              <Refresh />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards - Compact Design */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AttachMoney sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25 }}>
                    ${stats.revenue.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.revenue.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: 14 }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: 14 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {stats.revenue.change}% vs last month
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <People sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Total Customers
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25 }}>
                    {stats.customers.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.customers.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: 14 }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: 14 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {stats.customers.change}% growth
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Total Vehicles
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25 }}>
                    {stats.vehicles.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.vehicles.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: 14 }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: 14 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {Math.abs(stats.vehicles.change)}% change
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              border: 'none',
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    p: 1,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CalendarMonth sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Today's Jobs
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25 }}>
                    {stats.appointments.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.appointments.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: 14 }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: 14 }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      {stats.appointments.change}% vs yesterday
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : null}

      {/* Charts and Activity Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main }}>
                Quick Actions
              </Typography>
              <Chip label="Most Used" size="small" color="primary" />
            </Box>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}>
              <Paper
                onClick={() => setInvoiceDialogOpen(true)}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.secondary.main,
                  },
                }}
              >
                <Receipt sx={{ fontSize: 32, color: colors.secondary.main, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  New Invoice
                </Typography>
              </Paper>
              
              <Paper
                onClick={() => setQuotationDialogOpen(true)}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.primary.lighter,
                  },
                }}
              >
                <Description sx={{ fontSize: 32, color: colors.primary.lighter, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  New Quotation
                </Typography>
              </Paper>
              
              <Paper
                component={Link}
                to="/admin/customers"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.primary.main,
                  },
                }}
              >
                <People sx={{ fontSize: 32, color: colors.primary.main, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Customers
                </Typography>
              </Paper>
              
              <Paper
                component={Link}
                to="/admin/inventory"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.semantic.success,
                  },
                }}
              >
                <Inventory sx={{ fontSize: 32, color: colors.semantic.success, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Inventory
                </Typography>
              </Paper>
              
              <Paper
                component={Link}
                to="/admin/reports"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.semantic.info,
                  },
                }}
              >
                <Analytics sx={{ fontSize: 32, color: colors.semantic.info, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  View Reports
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/admin/vehicles"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.semantic.warning,
                  },
                }}
              >
                <DirectionsCar sx={{ fontSize: 32, color: colors.semantic.warning, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Vehicles
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/admin/appointments/new"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.primary.lighter,
                  },
                }}
              >
                <CalendarMonth sx={{ fontSize: 32, color: colors.primary.lighter, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  New Appointment
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/admin/payroll/jobs"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#9c27b0',
                  },
                }}
              >
                <Work sx={{ fontSize: 32, color: '#9c27b0', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Jobs
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/admin/payroll/payments"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#00bcd4',
                  },
                }}
              >
                <Payment sx={{ fontSize: 32, color: '#00bcd4', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Payments
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/admin/purchase-invoices"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#ff5722',
                  },
                }}
              >
                <ShoppingCart sx={{ fontSize: 32, color: '#ff5722', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Purchase Invoices
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/admin/expense-invoices"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#795548',
                  },
                }}
              >
                <ReceiptLong sx={{ fontSize: 32, color: '#795548', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Expense Invoices
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main, mb: 2 }}>
              Quick Navigation
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 2 
            }}>
              <Paper
                component={Link}
                to="/admin/inventory"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.primary.main}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.primary.main,
                    color: 'white',
                    '& .MuiSvgIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    },
                  },
                }}
              >
                <Inventory sx={{ fontSize: 28, color: colors.primary.main, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.primary.main }}>
                  Inventory
                </Typography>
              </Paper>
              
              <Paper
                component={Link}
                to="/admin/invoices"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.secondary.main}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.secondary.main,
                    color: 'white',
                    '& .MuiSvgIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    },
                  },
                }}
              >
                <Receipt sx={{ fontSize: 28, color: colors.secondary.main, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.secondary.main }}>
                  Invoices
                </Typography>
              </Paper>
              
              <Paper
                component={Link}
                to="/admin/quotations"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.semantic.info}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.semantic.info,
                    color: 'white',
                    '& .MuiSvgIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    },
                  },
                }}
              >
                <Description sx={{ fontSize: 28, color: colors.semantic.info, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.semantic.info }}>
                  Quotations
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main }}>
                Recent Activity
              </Typography>
              <Button size="small" sx={{ color: colors.primary.main }}>
                View All
              </Button>
            </Box>
            
            <List sx={{ p: 0 }}>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      px: 0,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: colors.neutral[50],
                        borderRadius: 1,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      {getStatusIcon(activity.status)}
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500, color: colors.text.primary }}>
                          {activity.text}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: colors.text.secondary }}>
                          {activity.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ ml: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Business Insights */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              background: `linear-gradient(135deg, ${colors.primary.main}10 0%, ${colors.secondary.main}10 100%)`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main, mb: 3 }}>
              Business Insights
            </Typography>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: 3,
            }}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  background: 'white',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Speed sx={{ fontSize: 36, color: colors.primary.main, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary.main }}>
                  4.2 hrs
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Service Time
                </Typography>
              </Paper>
              
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  background: 'white',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <TireRepair sx={{ fontSize: 36, color: colors.secondary.main, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary.main }}>
                  347
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tires in Stock
                </Typography>
              </Paper>
              
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  background: 'white',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <LocalShipping sx={{ fontSize: 36, color: colors.semantic.success, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary.main }}>
                  12
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending Orders
                </Typography>
              </Paper>
              
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  background: 'white',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <SupervisorAccount sx={{ fontSize: 36, color: colors.semantic.info, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary.main }}>
                  8
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Staff
                </Typography>
              </Paper>
              
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  background: 'white',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CalendarMonth sx={{ fontSize: 36, color: colors.semantic.warning, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary.main }}>
                  156
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monthly Jobs
                </Typography>
              </Paper>
              
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  background: 'white',
                  border: `1px solid ${colors.neutral[200]}`,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Receipt sx={{ fontSize: 36, color: colors.primary.dark, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: colors.primary.main }}>
                  $45.8K
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Invoice
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onSuccess={handleInvoiceSuccess}
      />

      {/* Quotation Dialog */}
      <QuotationDialog
        open={quotationDialogOpen}
        onClose={() => setQuotationDialogOpen(false)}
        onSuccess={() => {
          setQuotationDialogOpen(false);
          // Optionally navigate to quotations list or show success message
        }}
      />
    </Box>
  );
}