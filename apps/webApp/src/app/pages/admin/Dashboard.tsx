import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
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
  TireRepair,
  Speed,
  LocalShipping,
  Description,
  Work,
  Payment,
  Assignment,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { Link, useNavigate } from 'react-router-dom';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import QuotationDialog from '../../components/quotations/QuotationDialog';
import { CreateJobDialog } from '../../components/payroll/CreateJobDialog';
import { AppointmentDialog } from '../../components/appointments/AppointmentDialog';
import TireDialog from '../../components/inventory/TireDialog';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService, DashboardStats } from '../../services/dashboard.service';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Determine base path based on user role
  const basePath = role === 'supervisor' ? '/supervisor' : '/admin';
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [tireDialogOpen, setTireDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Common mobile-optimized styles for action items
  const actionItemStyles = {
    p: { xs: 1.5, sm: 2 },
    textAlign: 'center' as const,
    cursor: 'pointer',
    border: `1px solid ${colors.neutral[200]}`,
    transition: 'all 0.2s',
  };

  const actionIconStyles = {
    fontSize: { xs: 28, sm: 32 },
    mb: { xs: 0.5, sm: 1 },
  };

  const actionTextStyles = {
    fontWeight: 600,
    fontSize: { xs: '0.75rem', sm: '0.875rem' },
  };

  // Common styles for insight cards
  const insightCardStyles = {
    p: { xs: 1, sm: 1.5, md: 2 },
    textAlign: 'center' as const,
    background: 'white',
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: 2,
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
  };

  const insightIconStyles = {
    fontSize: { xs: 28, sm: 32, md: 36 },
    mb: { xs: 0.5, sm: 0.75, md: 1 },
  };

  const insightValueStyles = {
    fontWeight: 700,
    color: colors.primary.main,
    fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
  };

  const insightLabelStyles = {
    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
  };

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
    navigate(`${basePath}/invoices/${invoice.id}`);
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
    <Box sx={{ px: { xs: 0.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.primary.main,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
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
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontSize: { sm: '0.875rem', md: '1rem' }
              }}
            >
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
        </Box>
      </Box>

      {/* Stats Cards - Compact Design - Hidden on mobile */}
      {loading ? (
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', py: { sm: 6, md: 8 } }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <Box sx={{
          display: { xs: 'none', sm: 'grid' },
          gridTemplateColumns: {
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: { sm: 1.5, md: 2 },
          mb: { sm: 2.5, md: 3 },
        }}>
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    p: { xs: 0.75, sm: 1 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <AttachMoney sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    ${stats.revenue.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.revenue.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
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
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    p: { xs: 0.75, sm: 1 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <People sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Total Customers
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.customers.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.customers.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
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
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    p: { xs: 0.75, sm: 1 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <DirectionsCar sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Total Vehicles
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.vehicles.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.vehicles.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
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
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    p: { xs: 0.75, sm: 1 },
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CalendarMonth sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Today's Jobs
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {stats.appointments.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.appointments.trend === 'up' ? (
                      <ArrowUpward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    ) : (
                      <ArrowDownward sx={{ fontSize: { xs: 12, sm: 14 } }} />
                    )}
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
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
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: { xs: 1, sm: 2, md: 3 } }}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                Quick Actions
              </Typography>
              <Chip label="Most Used" size="small" color="primary" sx={{ display: { xs: 'none', sm: 'flex' } }} />
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: { xs: 1, sm: 1.5, md: 2 },
              mb: { xs: 1.5, sm: 2, md: 3 },
            }}>
              {/* Day Summary - First position */}
              <Paper
                component={Link}
                to={`${basePath}/day-summary`}
                sx={{
                  ...actionItemStyles,
                  textDecoration: 'none',
                  border: `1px solid ${colors.semantic.success}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.semantic.success,
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
                <Assignment sx={{ ...actionIconStyles, color: colors.semantic.success }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.semantic.success }}>
                  Day Summary
                </Typography>
              </Paper>

              <Paper
                onClick={() => setAppointmentDialogOpen(true)}
                sx={{
                  ...actionItemStyles,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.primary.lighter,
                  },
                }}
              >
                <CalendarMonth sx={{ ...actionIconStyles, color: colors.primary.lighter }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                  New Appointment
                </Typography>
              </Paper>

              <Paper
                onClick={() => setInvoiceDialogOpen(true)}
                sx={{
                  ...actionItemStyles,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.secondary.main,
                  },
                }}
              >
                <Receipt sx={{ ...actionIconStyles, color: colors.secondary.main }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                  New Invoice
                </Typography>
              </Paper>

              <Paper
                onClick={() => setQuotationDialogOpen(true)}
                sx={{
                  ...actionItemStyles,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.primary.lighter,
                  },
                }}
              >
                <Description sx={{ ...actionIconStyles, color: colors.primary.lighter }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                  New Quotation
                </Typography>
              </Paper>

              {/* My Jobs - Supervisor only - Before New Job */}
              {role === 'supervisor' && (
                <Paper
                  component={Link}
                  to={`${basePath}/my-jobs`}
                  sx={{
                    ...actionItemStyles,
                    textDecoration: 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: colors.secondary.main,
                    },
                  }}
                >
                  <Work sx={{ ...actionIconStyles, color: colors.secondary.main }} />
                  <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                    My Jobs
                  </Typography>
                </Paper>
              )}

              <Paper
                onClick={() => setJobDialogOpen(true)}
                sx={{
                  ...actionItemStyles,
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: '#9c27b0',
                  },
                }}
              >
                <Work sx={{ ...actionIconStyles, color: '#9c27b0' }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                  New Job
                </Typography>
              </Paper>

              {/* Payments - Admin only */}
              {role === 'admin' && (
                <Paper
                  component={Link}
                  to={`${basePath}/payments`}
                  sx={{
                    ...actionItemStyles,
                    textDecoration: 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: '#00bcd4',
                    },
                  }}
                >
                  <Payment sx={{ ...actionIconStyles, color: '#00bcd4' }} />
                  <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                    Payments
                  </Typography>
                </Paper>
              )}

              {/* My Earnings - Supervisor only */}
              {role === 'supervisor' && (
                <Paper
                  component={Link}
                  to={`${basePath}/my-earnings`}
                  sx={{
                    ...actionItemStyles,
                    textDecoration: 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: '#00bcd4',
                    },
                  }}
                >
                  <AttachMoney sx={{ ...actionIconStyles, color: '#00bcd4' }} />
                  <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.text.primary }}>
                    My Earnings
                  </Typography>
                </Paper>
              )}
            </Box>

            <Divider sx={{ my: { xs: 1.5, sm: 2, md: 3 } }} />

            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main, mb: { xs: 1, sm: 1.5, md: 2 }, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Quick Navigation
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: { xs: 1, sm: 1.5, md: 2 }
            }}>
              <Paper
                component={Link}
                to={`${basePath}/appointments`}
                sx={{
                  ...actionItemStyles,
                  textDecoration: 'none',
                  border: `1px solid ${colors.primary.lighter}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.primary.lighter,
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
                <CalendarMonth sx={{ ...actionIconStyles, color: colors.primary.lighter }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.primary.lighter }}>
                  Appointments
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to={`${basePath}/jobs`}
                sx={{
                  ...actionItemStyles,
                  textDecoration: 'none',
                  border: `1px solid #9c27b0`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#9c27b0',
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
                <Work sx={{ ...actionIconStyles, color: '#9c27b0' }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: '#9c27b0' }}>
                  Jobs
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to={`${basePath}/inventory`}
                sx={{
                  ...actionItemStyles,
                  textDecoration: 'none',
                  border: `1px solid ${colors.primary.main}`,
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
                <Inventory sx={{ ...actionIconStyles, color: colors.primary.main }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.primary.main }}>
                  Inventory
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to={`${basePath}/invoices`}
                sx={{
                  ...actionItemStyles,
                  textDecoration: 'none',
                  border: `1px solid ${colors.secondary.main}`,
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
                <Receipt sx={{ ...actionIconStyles, color: colors.secondary.main }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.secondary.main }}>
                  Invoices
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to={`${basePath}/quotations`}
                sx={{
                  ...actionItemStyles,
                  textDecoration: 'none',
                  border: `1px solid ${colors.semantic.info}`,
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
                <Description sx={{ ...actionIconStyles, color: colors.semantic.info }} />
                <Typography variant="body2" sx={{ ...actionTextStyles, color: colors.semantic.info }}>
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
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1, sm: 1.5, md: 2 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                Recent Activity
              </Typography>
              <Button size="small" sx={{ color: colors.primary.main, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
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
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: { xs: 1, sm: 2, md: 3 } }}>
        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              background: `linear-gradient(135deg, ${colors.primary.main}10 0%, ${colors.secondary.main}10 100%)`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.primary.main, mb: { xs: 1.5, sm: 2, md: 3 }, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Business Insights
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: { xs: 1, sm: 1.5, md: 2, lg: 3 },
            }}>
              <Paper sx={insightCardStyles}>
                <Speed sx={{ ...insightIconStyles, color: colors.primary.main }} />
                <Typography variant="h5" sx={insightValueStyles}>4.2 hrs</Typography>
                <Typography variant="caption" color="text.secondary" sx={insightLabelStyles}>
                  Avg Service Time
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <TireRepair sx={{ ...insightIconStyles, color: colors.secondary.main }} />
                <Typography variant="h5" sx={insightValueStyles}>347</Typography>
                <Typography variant="caption" color="text.secondary" sx={insightLabelStyles}>
                  Tires in Stock
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <LocalShipping sx={{ ...insightIconStyles, color: colors.semantic.success }} />
                <Typography variant="h5" sx={insightValueStyles}>12</Typography>
                <Typography variant="caption" color="text.secondary" sx={insightLabelStyles}>
                  Pending Orders
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <SupervisorAccount sx={{ ...insightIconStyles, color: colors.semantic.info }} />
                <Typography variant="h5" sx={insightValueStyles}>8</Typography>
                <Typography variant="caption" color="text.secondary" sx={insightLabelStyles}>
                  Active Staff
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <CalendarMonth sx={{ ...insightIconStyles, color: colors.semantic.warning }} />
                <Typography variant="h5" sx={insightValueStyles}>156</Typography>
                <Typography variant="caption" color="text.secondary" sx={insightLabelStyles}>
                  Monthly Jobs
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <Receipt sx={{ ...insightIconStyles, color: colors.primary.dark }} />
                <Typography variant="h5" sx={insightValueStyles}>$45.8K</Typography>
                <Typography variant="caption" color="text.secondary" sx={insightLabelStyles}>
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

      {/* Create Job Dialog */}
      <CreateJobDialog
        open={jobDialogOpen}
        onClose={() => setJobDialogOpen(false)}
        onSuccess={(job) => {
          setJobDialogOpen(false);
          loadStats(); // Refresh stats after creating job
        }}
      />

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        onSuccess={() => {
          setAppointmentDialogOpen(false);
          loadStats(); // Refresh stats after creating appointment
        }}
      />

      {/* Tire Dialog */}
      <TireDialog
        open={tireDialogOpen}
        onClose={() => setTireDialogOpen(false)}
        onSuccess={() => {
          setTireDialogOpen(false);
          loadStats(); // Refresh stats after adding tire
        }}
      />
    </Box>
  );
}