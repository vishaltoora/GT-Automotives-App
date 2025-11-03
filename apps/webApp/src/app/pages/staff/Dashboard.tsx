import { Box, Typography, Grid, Card, CardContent, Button, Paper, Chip, CircularProgress, Avatar, Divider, Stack, useTheme, useMediaQuery } from '@mui/material';
import { People, Inventory, Receipt, Schedule, ArrowUpward, ArrowDownward, Build, Assignment, CheckCircle, AccessTime, Description, Pending, Warning, Work, CalendarMonth, TireRepair, Event, AttachMoney } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService, DashboardStats } from '../../services/dashboard.service';
import { appointmentService, Appointment } from '../../services/appointment.service';
import { colors } from '../../theme/colors';
import { CreateJobDialog } from '../../components/payroll/CreateJobDialog';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import QuotationDialog from '../../components/quotations/QuotationDialog';
import { CustomerDialog } from '../../components/customers/CustomerDialog';
import { AppointmentDialog } from '../../components/appointments/AppointmentDialog';
import TireDialog from '../../components/inventory/TireDialog';

export function StaffDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [myJobDialogOpen, setMyJobDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [tireDialogOpen, setTireDialogOpen] = useState(false);

  useEffect(() => {
    loadStats();
    loadTodayAppointments();
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

  const loadTodayAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const data = await appointmentService.getTodayAppointments();

      // Staff can see all appointments (no filtering)
      setTodayAppointments(data);
    } catch (error) {
      console.error('Failed to load today appointments:', error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatTimeRange = (startTime: string, endTime?: string, duration?: number) => {
    const start = formatTime(startTime);

    // If endTime is provided, use it
    if (endTime) {
      const end = formatTime(endTime);
      return `${start} - ${end}`;
    }

    // Otherwise calculate from duration
    if (duration) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + duration;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      const end = formatTime(endTimeStr);
      return `${start} - ${end}`;
    }

    return start;
  };

  const formatPhone = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as XXX-XXX-XXXX
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Return original if not 10 digits
    return phone;
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 0 } }}>
      {/* Waving hand animation - global for both mobile and desktop */}
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

      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        {isMobile ? (
          /* Mobile Header */
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: colors.secondary.main,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}
              >
                {user?.firstName?.charAt(0) || 'S'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.secondary.main }}>
                  Welcome {user?.firstName || 'Staff'}{' '}
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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime sx={{ fontSize: 12 }} />
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          /* Desktop Header */
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: colors.secondary.main,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {user?.firstName?.charAt(0) || 'S'}
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.secondary.main }}>
                  Welcome Back {user?.firstName || 'Staff Member'}{' '}
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
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 16 }} />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
            <Chip
              label="Operations"
              color="secondary"
              icon={<Build />}
              sx={{ fontWeight: 600, px: 1 }}
            />
          </Box>
        )}
      </Box>

      {/* Today's Metrics - Hidden on mobile */}
      {!isMobile && (loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : stats ? (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}>
          {/* Today's Jobs Card */}
          <Card
            elevation={0}
            sx={{
              backgroundColor: colors.primary.main,
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
                  <Assignment sx={{ fontSize: 24 }} />
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

          {/* Customers Card */}
          <Card
            elevation={0}
            sx={{
              backgroundColor: colors.secondary.main,
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
                    {stats.customers.value}
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

          {/* Inventory Card */}
          <Card
            elevation={0}
            sx={{
              backgroundColor: colors.semantic.success,
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
                  <Inventory sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Items in Stock
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25 }}>
                    {stats.inventory.value.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stats.inventory.lowStock > 0 ? (
                      <>
                        <Warning sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                          {stats.inventory.lowStock} items low stock
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CheckCircle sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                          All stock levels good
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Pending Quotes Card */}
          <Card
            elevation={0}
            sx={{
              backgroundColor: colors.semantic.info,
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
                  <Description sx={{ fontSize: 24 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                    Pending Quotes
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, my: 0.25 }}>
                    8
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Pending sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                      Awaiting response
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : null)}

      {/* Main Content Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        {/* Quick Actions Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 3 },
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              mb: { xs: 1.5, sm: 3 },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 700, color: colors.secondary.main }}>
                Quick Actions
              </Typography>
              {!isMobile && <Chip label="Most Used" size="small" color="secondary" />}
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(6, 1fr)',
              },
              gap: { xs: 1, sm: 2 },
            }}>
              <Paper
                onClick={() => setAppointmentDialogOpen(true)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
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
                <CalendarMonth sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.primary.lighter, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  New Appointment
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/staff/appointments"
                sx={{
                  p: { xs: 1.5, sm: 2 },
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
                <CalendarMonth sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.primary.lighter, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Appointments
                </Typography>
              </Paper>

              <Paper
                onClick={() => setMyJobDialogOpen(true)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.primary.main,
                  },
                }}
              >
                <Assignment sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.primary.main, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Add My Job
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/staff/jobs"
                sx={{
                  p: { xs: 1.5, sm: 2 },
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
                <Work sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.primary.main, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  My Jobs
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/staff/earnings"
                sx={{
                  p: { xs: 1.5, sm: 2 },
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
                <AttachMoney sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.success, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  My Earnings
                </Typography>
              </Paper>

              <Paper
                onClick={() => setInvoiceDialogOpen(true)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.secondary.main,
                  },
                }}
              >
                <Receipt sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.secondary.main, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  New Invoice
                </Typography>
              </Paper>

              <Paper
                onClick={() => setQuotationDialogOpen(true)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
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
                <Description sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.info, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  New Quote
                </Typography>
              </Paper>

              <Paper
                onClick={() => setTireDialogOpen(true)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.semantic.success,
                  },
                }}
              >
                <TireRepair sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.success, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Add Tires
                </Typography>
              </Paper>

              <Paper
                onClick={() => setCustomerDialogOpen(true)}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px solid ${colors.neutral[200]}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: colors.semantic.warning,
                  },
                }}
              >
                <People sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.warning, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Add Customer
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/staff/availability"
                sx={{
                  p: { xs: 1.5, sm: 2 },
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
                <Event sx={{ fontSize: { xs: 28, sm: 32 }, color: '#9c27b0', mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text.primary, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Availability
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ my: { xs: 1.5, sm: 2, md: 3 } }} />

            <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 700, color: colors.primary.main, mb: { xs: 1, sm: 1.5, md: 2 }, fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
              Quick Navigation
            </Typography>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: { xs: 1, sm: 1.5, md: 2 }
            }}>
              <Paper
                component={Link}
                to="/staff/inventory"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.semantic.success}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.semantic.success,
                    '& .MuiSvgIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    },
                  },
                }}
              >
                <Inventory sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.success, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.semantic.success, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Inventory
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/staff/invoices"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.secondary.main}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.secondary.main,
                    '& .MuiSvgIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    },
                  },
                }}
              >
                <Receipt sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.secondary.main, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.secondary.main, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Invoices
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to="/staff/quotations"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  border: `1px solid ${colors.semantic.info}`,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: colors.semantic.info,
                    '& .MuiSvgIcon-root': {
                      color: 'white !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'white !important',
                    },
                  },
                }}
              >
                <Description sx={{ fontSize: { xs: 28, sm: 32 }, color: colors.semantic.info, mb: { xs: 0.5, sm: 1 } }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.semantic.info, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Quotations
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Grid>

        {/* Right Sidebar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Today's Schedule */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 3 },
              borderRadius: 2,
              border: `1px solid ${colors.neutral[200]}`,
              mb: { xs: 1.5, sm: 3 },
              background: `linear-gradient(135deg, ${colors.semantic.info}10 0%, white 100%)`,
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', lg: '800px' },
              maxHeight: { xs: 'none', lg: '800px' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 700, color: colors.semantic.info }}>
                Today's Schedule
              </Typography>
              {appointmentsLoading ? (
                <CircularProgress size={20} sx={{ color: colors.semantic.info }} />
              ) : (
                <Chip
                  label={`${todayAppointments.length} ${todayAppointments.length === 1 ? 'Appointment' : 'Appointments'}`}
                  size="small"
                  sx={{
                    backgroundColor: colors.semantic.info,
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                mb: 2,
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: colors.neutral[100],
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: colors.semantic.info,
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: colors.primary.main,
                  },
                },
              }}
            >
              {appointmentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: colors.semantic.info }} />
                </Box>
              ) : todayAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Schedule sx={{ fontSize: 48, color: colors.neutral[300], mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No appointments scheduled for today
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} divider={<Divider />}>
                  {todayAppointments.map((appointment) => {
                  const customerName = `${appointment.customer.firstName} ${appointment.customer.lastName}`;
                  const customerPhone = appointment.customer.phone ? formatPhone(appointment.customer.phone) : 'No phone';
                  const vehicleInfo = appointment.vehicle
                    ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
                    : null;
                  const technicianName = appointment.employee
                    ? `${appointment.employee.firstName} ${appointment.employee.lastName}`
                    : 'Unassigned';

                  return (
                    <Box key={appointment.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: colors.semantic.info,
                            fontSize: '0.875rem',
                            fontWeight: 700,
                          }}
                        >
                          {appointment.customer.firstName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: colors.neutral[900] }}>
                            {formatTimeRange(appointment.scheduledTime, appointment.endTime, appointment.duration)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.neutral[900] }}>
                            {appointment.serviceType}
                          </Typography>
                        </Box>
                        <Chip
                          label={appointment.status}
                          size="small"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            backgroundColor:
                              appointment.status === 'CONFIRMED' ? colors.semantic.success :
                              appointment.status === 'IN_PROGRESS' ? colors.semantic.warning :
                              colors.semantic.info,
                            color: 'white',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ ml: 5, color: colors.neutral[900] }}>
                        {customerName} • {customerPhone}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 5, display: 'block', color: colors.neutral[900] }}>
                        {vehicleInfo ? `${vehicleInfo} • ` : ''}Tech: {technicianName}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>

          <Button
            fullWidth
            variant="outlined"
            component={Link}
            to="/staff/appointments"
            sx={{
              borderColor: colors.semantic.info,
              color: colors.semantic.info,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: colors.semantic.info,
                color: 'white',
              },
            }}
          >
            View Full Schedule
          </Button>
        </Paper>
      </Grid>
      </Grid>

      {/* My Job Dialog - For staff to add their own job */}
      <CreateJobDialog
        open={myJobDialogOpen}
        onClose={() => setMyJobDialogOpen(false)}
        onSuccess={(job) => {
          setMyJobDialogOpen(false);
          loadStats(); // Refresh stats after creating job
        }}
        preselectedEmployeeId={user?.id}
        hideEmployeeSelect={true}
      />

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onSuccess={() => {
          setInvoiceDialogOpen(false);
          loadStats();
        }}
      />

      {/* Quotation Dialog */}
      <QuotationDialog
        open={quotationDialogOpen}
        onClose={() => setQuotationDialogOpen(false)}
        onSuccess={() => {
          setQuotationDialogOpen(false);
          loadStats();
        }}
      />

      {/* Customer Dialog */}
      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onSuccess={() => {
          setCustomerDialogOpen(false);
          loadStats();
        }}
      />

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        onSuccess={() => {
          setAppointmentDialogOpen(false);
          loadStats();
          loadTodayAppointments(); // Reload today's appointments
        }}
      />

      {/* Tire Dialog */}
      <TireDialog
        open={tireDialogOpen}
        onClose={() => setTireDialogOpen(false)}
        onSuccess={() => {
          setTireDialogOpen(false);
          loadStats();
        }}
      />
    </Box>
  );
}