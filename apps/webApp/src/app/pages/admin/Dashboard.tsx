import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  AttachMoney,
  Inventory,
  SupervisorAccount,
  Analytics,
  Receipt,
  CalendarMonth,
  Warning,
  CheckCircle,
  Error,
  TireRepair,
  Speed,
  LocalShipping,
  Description,
  Work,
  Payment,
  Assignment,
  RequestPage,
  AccessTime,
  AssignmentTurnedIn,
  CarRepair,
  People,
  Schedule,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { useNavigate } from 'react-router-dom';
import {
  DashboardActionGroups,
  DashboardActionGroup,
} from '../../components/dashboard/DashboardActionGroups';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import QuotationDialog from '../../components/quotations/QuotationDialog';
import { CreateJobDialog } from '../../components/payroll/CreateJobDialog';
import { AppointmentDialog } from '../../components/appointments/AppointmentDialog';
import TireDialog from '../../components/inventory/TireDialog';
import { QuickTireSaleDialog } from '../../components/tire-sales';
import { useAuth } from '../../hooks/useAuth';
import { timeClockService } from '../../requests/time-clock.requests';
import { TimeEntryDto } from '@gt-automotive/data';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Determine base path based on user role
  const basePath =
    role === 'supervisor'
      ? '/supervisor'
      : role === 'accountant'
      ? '/accountant'
      : role === 'foreman'
      ? '/foreman'
      : '/admin';
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [tireDialogOpen, setTireDialogOpen] = useState(false);
  const [tireSaleDialogOpen, setTireSaleDialogOpen] = useState(false);

  const [bookingRequestsCount, setBookingRequestsCount] = useState(0);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntryDto | null>(
    null
  );
  const [clockActionLoading, setClockActionLoading] = useState(false);

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
    loadBookingRequestsCount();
    if (role !== 'accountant') {
      loadCurrentTimeEntry();
    }
  }, [role]);

  const loadCurrentTimeEntry = async () => {
    try {
      setCurrentTimeEntry(await timeClockService.getMyCurrent());
    } catch (error) {
      console.error('Failed to load current time entry:', error);
    }
  };

  const handleQuickClockIn = async () => {
    if (role === 'accountant') return;

    if (currentTimeEntry) {
      navigate(`${basePath}/time-clock`);
      return;
    }

    try {
      setClockActionLoading(true);
      setCurrentTimeEntry(await timeClockService.clockIn());
    } catch (error) {
      console.error('Failed to clock in:', error);
    } finally {
      setClockActionLoading(false);
    }
  };

  const loadBookingRequestsCount = async () => {
    try {
      const token = await window.Clerk?.session?.getToken({});
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/booking-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Count only new requests (PENDING, ACCEPTED, REJECTED)
        const newCount = data.filter((r: any) =>
          ['PENDING', 'ACCEPTED', 'REJECTED'].includes(r.status)
        ).length;
        setBookingRequestsCount(newCount);
      }
    } catch (error) {
      console.error('Failed to load booking requests count:', error);
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'invoice',
      text: 'New invoice #INV-2024-043 created',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'customer',
      text: 'New customer John Smith registered',
      time: '1 hour ago',
      status: 'info',
    },
    {
      id: 3,
      type: 'inventory',
      text: 'Low stock alert: Michelin Pilot Sport 4S',
      time: '2 hours ago',
      status: 'warning',
    },
    {
      id: 4,
      type: 'appointment',
      text: 'Appointment scheduled for tomorrow 9 AM',
      time: '3 hours ago',
      status: 'info',
    },
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

  const isSupervisor = role === 'supervisor';
  const clockLabel = clockActionLoading
    ? 'Clocking In...'
    : currentTimeEntry
    ? 'Clocked In'
    : 'Clock In';

  const actionGroups: DashboardActionGroup[] = [
    {
      title: 'My Work',
      items: [
        {
          key: 'clock',
          label: clockLabel,
          icon: <AccessTime />,
          color: colors.semantic.success,
          onClick: handleQuickClockIn,
        },
        {
          key: 'time-clock',
          label: 'Time Clock',
          icon: <Schedule />,
          color: colors.semantic.info,
          to: `${basePath}/time-clock`,
        },
        {
          key: 'jobs',
          label: 'Jobs',
          icon: <Work />,
          color: '#9c27b0',
          to: `${basePath}/jobs`,
        },
        ...(isSupervisor
          ? [
              {
                key: 'my-jobs',
                label: 'My Jobs',
                icon: <Work />,
                color: '#9c27b0',
                to: `${basePath}/my-jobs`,
              },
              {
                key: 'my-earnings',
                label: 'My Earnings',
                icon: <AttachMoney />,
                color: colors.semantic.success,
                to: `${basePath}/my-earnings`,
              },
              {
                key: 'my-commission',
                label: 'My Commission',
                icon: <TireRepair />,
                color: colors.tire?.new || '#1976d2',
                to: `${basePath}/my-commission`,
              },
            ]
          : []),
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          key: 'appointments',
          label: 'Appointments',
          icon: <CalendarMonth />,
          color: colors.primary.lighter,
          to: `${basePath}/appointments`,
        },
        {
          key: 'booking-requests',
          label: 'Booking Requests',
          icon: <RequestPage />,
          color: colors.semantic.warning,
          to: `${basePath}/booking-requests`,
          badge: bookingRequestsCount,
        },
        {
          key: 'repair-orders',
          label: 'Repair Orders',
          icon: <CarRepair />,
          color: colors.secondary.main,
          to: `${basePath}/repair-orders`,
        },
        {
          key: 'inspections',
          label: 'Inspections',
          icon: <AssignmentTurnedIn />,
          color: colors.semantic.info,
          to: `${basePath}/inspections`,
        },
        {
          key: 'day-summary',
          label: 'Day Summary',
          icon: <Assignment />,
          color: colors.semantic.success,
          to: `${basePath}/day-summary`,
        },
      ],
    },
    {
      title: 'Sales & Billing',
      items: [
        {
          key: 'tire-sale',
          label: 'Quick Tire Sale',
          icon: <TireRepair />,
          color: colors.tire?.new || '#1976d2',
          onClick: () => setTireSaleDialogOpen(true),
        },
        {
          key: 'invoices',
          label: 'Invoices',
          icon: <Receipt />,
          color: colors.secondary.main,
          to: `${basePath}/invoices`,
        },
        {
          key: 'quotations',
          label: 'Quotations',
          icon: <Description />,
          color: colors.semantic.info,
          to: `${basePath}/quotations`,
        },
        ...(role === 'admin'
          ? [
              {
                key: 'payments',
                label: 'Payments',
                icon: <Payment />,
                color: colors.semantic.success,
                to: `${basePath}/payments`,
              },
            ]
          : []),
      ],
    },
    {
      title: 'Inventory & Setup',
      items: [
        {
          key: 'inventory',
          label: 'Inventory',
          icon: <Inventory />,
          color: colors.primary.main,
          to: `${basePath}/inventory`,
        },
        {
          key: 'customers',
          label: 'Customers',
          icon: <People />,
          color: colors.primary.lighter,
          to: `${basePath}/customers`,
        },
      ],
    },
  ];

  // Foreman has time-clock and jobs access like admin, but no EOD Day Summary
  // page — drop that one quick action to avoid a dead link.
  const foremanHiddenActions = new Set(['day-summary']);
  const visibleActionGroups =
    role === 'foreman'
      ? actionGroups
          .map((g) => ({
            ...g,
            items: g.items.filter((i) => !foremanHiddenActions.has(i.key)),
          }))
          .filter((g) => g.items.length > 0)
      : actionGroups;

  return (
    <Box sx={{ px: { xs: 0.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 1, sm: 2 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.primary.main,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
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
                fontSize: { sm: '0.875rem', md: '1rem' },
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

      {/* Charts and Activity Section */}
      <Grid
        container
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ mt: { xs: 1, sm: 2, md: 3 } }}
      >
        {/* Quick Actions */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <DashboardActionGroups groups={visibleActionGroups} />
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: { xs: 1, sm: 1.5, md: 2 },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: colors.primary.main,
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                }}
              >
                Recent Activity
              </Typography>
              <Button
                size="small"
                sx={{
                  color: colors.primary.main,
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                }}
              >
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
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: colors.text.primary }}
                        >
                          {activity.text}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{ color: colors.text.secondary }}
                        >
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
      <Grid
        container
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ mt: { xs: 1, sm: 2, md: 3 } }}
      >
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
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: colors.primary.main,
                mb: { xs: 1.5, sm: 2, md: 3 },
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              }}
            >
              Business Insights
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(6, 1fr)',
                },
                gap: { xs: 1, sm: 1.5, md: 2, lg: 3 },
              }}
            >
              <Paper sx={insightCardStyles}>
                <Speed
                  sx={{ ...insightIconStyles, color: colors.primary.main }}
                />
                <Typography variant="h5" sx={insightValueStyles}>
                  4.2 hrs
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={insightLabelStyles}
                >
                  Avg Service Time
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <TireRepair
                  sx={{ ...insightIconStyles, color: colors.secondary.main }}
                />
                <Typography variant="h5" sx={insightValueStyles}>
                  347
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={insightLabelStyles}
                >
                  Tires in Stock
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <LocalShipping
                  sx={{ ...insightIconStyles, color: colors.semantic.success }}
                />
                <Typography variant="h5" sx={insightValueStyles}>
                  12
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={insightLabelStyles}
                >
                  Pending Orders
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <SupervisorAccount
                  sx={{ ...insightIconStyles, color: colors.semantic.info }}
                />
                <Typography variant="h5" sx={insightValueStyles}>
                  8
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={insightLabelStyles}
                >
                  Active Staff
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <CalendarMonth
                  sx={{ ...insightIconStyles, color: colors.semantic.warning }}
                />
                <Typography variant="h5" sx={insightValueStyles}>
                  156
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={insightLabelStyles}
                >
                  Monthly Jobs
                </Typography>
              </Paper>

              <Paper sx={insightCardStyles}>
                <Receipt
                  sx={{ ...insightIconStyles, color: colors.primary.dark }}
                />
                <Typography variant="h5" sx={insightValueStyles}>
                  $45.8K
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={insightLabelStyles}
                >
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
        }}
      />

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={() => setAppointmentDialogOpen(false)}
        onSuccess={() => {
          setAppointmentDialogOpen(false);
        }}
      />

      {/* Tire Dialog */}
      <TireDialog
        open={tireDialogOpen}
        onClose={() => setTireDialogOpen(false)}
        onSuccess={() => {
          setTireDialogOpen(false);
        }}
      />

      {/* Quick Tire Sale Dialog */}
      <QuickTireSaleDialog
        open={tireSaleDialogOpen}
        onClose={() => setTireSaleDialogOpen(false)}
        onSuccess={() => {}}
      />
    </Box>
  );
}
