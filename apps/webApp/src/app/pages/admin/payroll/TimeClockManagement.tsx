import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  Add,
  CheckCircle,
  Coffee,
  Groups,
  HourglassEmpty,
  Login,
  Logout,
  Payment,
  PendingActions,
  PlayArrow,
  Refresh,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  CreateTimeEntryDto,
  EmployeeCompensationDto,
  PayPeriodHoursDto,
  PayType,
  TimeEntryDto,
  TimeEntryStatus,
} from '@gt-automotive/data';
import { NumberInput } from '../../../components/common';
import {
  EmployeeHoursCards,
  PayPeriodNavigator,
  TimeEntriesTable,
  formatStatus,
} from '../../../components/time-clock';
import { User, userService } from '../../../requests/user.requests';
import { timeClockService } from '../../../requests/time-clock.requests';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';
import {
  PayPeriod,
  isCurrentPayPeriod,
  currentPayPeriod,
  payPeriodLabel,
} from '../../../utils/payPeriod';

const formatHours = (minutes: number) => `${(minutes / 60).toFixed(2)} hrs`;
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return offsetDate.toISOString().slice(0, 16);
};

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`time-clock-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function TimeClockManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<TimeEntryDto[]>([]);
  const [currentEntries, setCurrentEntries] = useState<TimeEntryDto[]>([]);
  const [myCurrentEntry, setMyCurrentEntry] = useState<TimeEntryDto | null>(
    null
  );
  // How the open card's employee is paid. Read-only here — it is edited under
  // Settings → Compensation & Bonus. Held so estimated pay can be shown next to
  // the hours payroll is about to process.
  const [cardCompensation, setCardCompensation] =
    useState<EmployeeCompensationDto | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null);
  const [editClockInAt, setEditClockInAt] = useState('');
  const [editClockOutAt, setEditClockOutAt] = useState('');
  const [editBreakMinutes, setEditBreakMinutes] = useState('');
  const [editReason, setEditReason] = useState('');
  const [deletingEntry, setDeletingEntry] = useState<TimeEntryDto | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addEmployeeId, setAddEmployeeId] = useState('');
  const [addClockInAt, setAddClockInAt] = useState('');
  const [addClockOutAt, setAddClockOutAt] = useState('');
  const [addBreakMinutes, setAddBreakMinutes] = useState('');
  const [addReason, setAddReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TimeEntryStatus>(
    'ALL'
  );
  /**
   * The pay period on screen. Hours are reviewed against the boundaries the
   * shop actually pays on — semi-monthly — so the total chased mid-period is
   * the total that ends up on a stub. Changing it refetches.
   */
  const [period, setPeriod] = useState<PayPeriod>(() => currentPayPeriod());
  // The card that has been opened, if any. Empty means the whole team's
  // entries, which is the view an admin lands on. Deliberately not reset when
  // the period changes: an admin comparing one person across periods should not
  // have to find them again each time.
  const [cardEmployeeId, setCardEmployeeId] = useState('');
  const [payPeriodRows, setPayPeriodRows] = useState<PayPeriodHoursDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const periodStart = period.start.toISOString();
  const periodEnd = period.end.toISOString();
  const periodLabel = payPeriodLabel(period);
  const isCurrentPeriod = isCurrentPayPeriod(period);

  const loadData = async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) setLoading(true);
      setError(null);
      const [userData, currentData, entryData, hoursData] = await Promise.all([
        userService.getUsers(),
        timeClockService.getCurrentEntries(),
        timeClockService.getEntries({
          startDate: periodStart,
          endDate: periodEnd,
        }),
        timeClockService.getPayPeriodHours({
          startDate: periodStart,
          endDate: periodEnd,
        }),
      ]);
      const myCurrent = await timeClockService.getMyCurrent();
      const employees = userData.filter((user) =>
        ['ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF'].includes(
          user.role?.name || ''
        )
      );
      setUsers(employees);
      setCurrentEntries(currentData);
      setEntries(entryData);
      setPayPeriodRows(hoursData);
      setMyCurrentEntry(myCurrent);
    } catch (err: any) {
      setError(err.message || 'Failed to load time clock data');
    } finally {
      if (!options?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodStart, periodEnd]);

  // Paying out a period is admin-only on the server, so everyone else is spared
  // both the button and the pay data behind it. An allowlist rather than a
  // denylist: supervisors reach this same screen, and a role added later should
  // start with no access rather than all of it.
  const canProcessPayroll = user?.role?.name === 'ADMIN';

  useEffect(() => {
    if (!cardEmployeeId || !canProcessPayroll) {
      setCardCompensation(null);
      return;
    }

    // Cards are clicked in quick succession, so an earlier response can land
    // after a later one. Without this, estimated pay can end up showing the
    // previous employee's rate against this employee's hours.
    let cancelled = false;

    const loadCompensation = async () => {
      try {
        const compensation = await timeClockService.getCompensation(
          cardEmployeeId
        );
        if (!cancelled) setCardCompensation(compensation);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load compensation');
      }
    };

    void loadCompensation();

    return () => {
      cancelled = true;
    };
  }, [cardEmployeeId, canProcessPayroll]);

  const currentEntryByEmployeeId = new Map(
    currentEntries.map((entry) => [entry.employeeId, entry])
  );
  const selectedReadyEntries = entries.filter(
    (entry) =>
      entry.employeeId === cardEmployeeId &&
      entry.status === TimeEntryStatus.APPROVED &&
      !entry.payrollProcessedAt
  );
  const selectedReadyHours = selectedReadyEntries.reduce(
    (sum, entry) => sum + entry.paidMinutes / 60,
    0
  );
  const selectedProcessedEntries = entries.filter(
    (entry) =>
      entry.employeeId === cardEmployeeId && Boolean(entry.payrollProcessedAt)
  );
  const selectedProcessedHours = selectedProcessedEntries.reduce(
    (sum, entry) => sum + entry.paidMinutes / 60,
    0
  );
  // Salaried pay is not a function of hours, so there is no estimate to show
  // against a period's approved hours — null, so the panel can say so rather
  // than print a confident $0.00 next to the button that pays them.
  const selectedEstimatedPay =
    cardCompensation?.payType === PayType.HOURLY
      ? selectedReadyHours * Number(cardCompensation.hourlyRate || 0)
      : null;

  // Dashboard aggregate stats across all employees for the viewed pay period
  const totalReadyHours = useMemo(
    () =>
      entries
        .filter(
          (entry) =>
            entry.status === TimeEntryStatus.APPROVED &&
            !entry.payrollProcessedAt
        )
        .reduce((sum, entry) => sum + entry.paidMinutes / 60, 0),
    [entries]
  );
  const totalProcessedHours = useMemo(
    () =>
      entries
        .filter((entry) => Boolean(entry.payrollProcessedAt))
        .reduce((sum, entry) => sum + entry.paidMinutes / 60, 0),
    [entries]
  );
  const pendingApprovalCount = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.clockOutAt &&
          entry.status !== TimeEntryStatus.APPROVED &&
          entry.status !== TimeEntryStatus.VOIDED
      ).length,
    [entries]
  );

  const summaryStats = [
    {
      label: 'Clocked In Now',
      value: String(currentEntries.length),
      icon: <Groups />,
      color: colors.primary.main,
    },
    {
      label: 'Ready for Payroll',
      value: `${totalReadyHours.toFixed(1)} hrs`,
      icon: <HourglassEmpty />,
      color: colors.semantic.warning,
    },
    {
      label: 'Pending Approval',
      value: String(pendingApprovalCount),
      icon: <PendingActions />,
      color: colors.semantic.info,
    },
    {
      label: isCurrentPeriod
        ? 'Processed This Period'
        : `Processed · ${periodLabel}`,
      value: `${totalProcessedHours.toFixed(1)} hrs`,
      icon: <CheckCircle />,
      color: colors.semantic.success,
    },
  ];

  // The card selection is the employee filter — picking someone from the team
  // and reading their entries is one gesture rather than two filter operations.
  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (cardEmployeeId && entry.employeeId !== cardEmployeeId) return false;
        if (filterStatus !== 'ALL' && entry.status !== filterStatus)
          return false;
        return true;
      }),
    [entries, cardEmployeeId, filterStatus]
  );

  const selectedCard = payPeriodRows.find(
    (row) => row.employeeId === cardEmployeeId
  );

  // A second click on an open card closes it, back to the whole team.
  const toggleCard = (employeeId: string) =>
    setCardEmployeeId((current) => (current === employeeId ? '' : employeeId));

  const processPayroll = async () => {
    if (!cardEmployeeId) return;
    try {
      setSaving(true);
      setError(null);
      const result = await timeClockService.processPayroll({
        employeeId: cardEmployeeId,
        startDate: periodStart,
        endDate: periodEnd,
      });
      await loadData({ silent: true });
      setMessage(`Processed ${result.processedHours.toFixed(2)} payroll hours`);
    } catch (err: any) {
      setError(err.message || 'Failed to process payroll');
    } finally {
      setSaving(false);
    }
  };

  const approveEntry = async (id: string) => {
    try {
      setSaving(true);
      setError(null);
      await timeClockService.approveEntry(id);
      await loadData({ silent: true });
      setMessage('Time entry approved');
    } catch (err: any) {
      setError(err.message || 'Failed to approve entry');
    } finally {
      setSaving(false);
    }
  };

  const openEditEntry = (entry: TimeEntryDto) => {
    setEditingEntry(entry);
    setEditClockInAt(toDateTimeLocal(entry.clockInAt));
    setEditClockOutAt(toDateTimeLocal(entry.clockOutAt));
    setEditBreakMinutes(
      entry.unpaidBreakMinutes ? String(entry.unpaidBreakMinutes) : ''
    );
    setEditReason('');
  };

  const saveEntryEdit = async () => {
    if (!editingEntry) return;
    try {
      setSaving(true);
      setError(null);
      await timeClockService.updateEntry(editingEntry.id, {
        clockInAt: new Date(editClockInAt).toISOString(),
        clockOutAt: editClockOutAt
          ? new Date(editClockOutAt).toISOString()
          : undefined,
        breakMinutes: editBreakMinutes ? Number(editBreakMinutes) : 0,
        adjustmentReason: editReason,
      });
      setEditingEntry(null);
      await loadData({ silent: true });
      setMessage('Time entry updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update time entry');
    } finally {
      setSaving(false);
    }
  };

  const unapproveEntry = async (id: string) => {
    try {
      setSaving(true);
      setError(null);
      await timeClockService.unapproveEntry(id);
      await loadData({ silent: true });
      setMessage('Time entry unapproved and reopened for editing');
    } catch (err: any) {
      setError(err.message || 'Failed to unapprove entry');
    } finally {
      setSaving(false);
    }
  };

  const openAddEntry = () => {
    // An open card is who the admin is already looking at, so it is the
    // employee they almost certainly mean to add time for.
    setAddEmployeeId(cardEmployeeId || users[0]?.id || '');
    setAddClockInAt('');
    setAddClockOutAt('');
    setAddBreakMinutes('');
    setAddReason('');
    setAddOpen(true);
  };

  const saveAddEntry = async () => {
    if (!addEmployeeId || !addClockInAt || !addClockOutAt) return;
    const payload: CreateTimeEntryDto = {
      employeeId: addEmployeeId,
      clockInAt: new Date(addClockInAt).toISOString(),
      clockOutAt: new Date(addClockOutAt).toISOString(),
      breakMinutes: addBreakMinutes ? Number(addBreakMinutes) : undefined,
      reason: addReason.trim() || undefined,
    };
    try {
      setSaving(true);
      setError(null);
      await timeClockService.createEntry(payload);
      setAddOpen(false);
      await loadData({ silent: true });
      setMessage('Time entry added');
    } catch (err: any) {
      setError(err.message || 'Failed to add time entry');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteEntry = (entry: TimeEntryDto) => {
    setDeletingEntry(entry);
  };

  const deleteEntry = async () => {
    if (!deletingEntry) return;
    try {
      setSaving(true);
      setError(null);
      await timeClockService.deleteEntry(deletingEntry.id);
      setDeletingEntry(null);
      await loadData({ silent: true });
      setMessage('Time entry permanently deleted');
    } catch (err: any) {
      setError(err.message || 'Failed to delete time entry');
    } finally {
      setSaving(false);
    }
  };

  const runMyClockAction = async (
    action: () => Promise<TimeEntryDto>,
    successMessage: string
  ) => {
    try {
      setSaving(true);
      setError(null);
      await action();
      await loadData({ silent: true });
      setMessage(successMessage);
    } catch (err: any) {
      setError(err.message || 'Time clock action failed');
    } finally {
      setSaving(false);
    }
  };

  const clockInEmployee = async (employee: User) => {
    try {
      setSaving(true);
      setError(null);
      await timeClockService.adminClockIn(employee.id, {
        notes: `Clocked in by admin for ${employee.firstName || ''} ${
          employee.lastName || ''
        }`.trim(),
      });
      await loadData({ silent: true });
      setMessage(`${employee.firstName || employee.email} clocked in`);
    } catch (err: any) {
      setError(err.message || 'Failed to clock in employee');
    } finally {
      setSaving(false);
    }
  };

  const clockOutEmployee = async (employee: User) => {
    try {
      setSaving(true);
      setError(null);
      await timeClockService.adminClockOut(employee.id, {
        notes: `Clocked out by admin for ${employee.firstName || ''} ${
          employee.lastName || ''
        }`.trim(),
      });
      await loadData({ silent: true });
      setMessage(`${employee.firstName || employee.email} clocked out`);
    } catch (err: any) {
      setError(err.message || 'Failed to clock out employee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isClockedIn = Boolean(myCurrentEntry);
  const isOnBreak = myCurrentEntry?.status === TimeEntryStatus.ON_BREAK;

  return (
    <Box sx={{ px: { xs: 1, sm: 0 } }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.primary.main,
              fontSize: { xs: '1.6rem', sm: '2.125rem' },
            }}
          >
            Time Clock
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee hours, hourly rates, salary profiles, and bonuses
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={() => loadData({ silent: true })}
          disabled={saving}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_event, value) => setActiveTab(value)}
          aria-label="time clock tabs"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.85rem', sm: '0.95rem' },
            },
          }}
        >
          <Tab icon={<AccessTime />} iconPosition="start" label="Dashboard" />
          <Tab icon={<Payment />} iconPosition="start" label="Time Entries" />
        </Tabs>
      </Box>

      {/* Dashboard tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3 }}>
          {summaryStats.map((stat) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        color: stat.color,
                        backgroundColor: `${stat.color}1A`,
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card
          elevation={0}
          sx={{ mb: 3, border: `1px solid ${colors.neutral[200]}` }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2.5} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  My Time Clock
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.25,
                    mt: 1,
                  }}
                >
                  <Chip
                    color={
                      isOnBreak
                        ? 'warning'
                        : isClockedIn
                        ? 'success'
                        : 'default'
                    }
                    label={
                      isOnBreak
                        ? 'On Break'
                        : isClockedIn
                        ? 'Clocked In'
                        : 'Clocked Out'
                    }
                  />
                  {myCurrentEntry && (
                    <Typography variant="body2" color="text.secondary">
                      Since{' '}
                      {format(
                        new Date(myCurrentEntry.clockInAt),
                        'MMM d, h:mm a'
                      )}{' '}
                      · {formatHours(myCurrentEntry.paidMinutes)}
                    </Typography>
                  )}
                  {!myCurrentEntry && user && (
                    <Typography variant="body2" color="text.secondary">
                      {user.firstName} {user.lastName}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    gap: 1.25,
                  }}
                >
                  {!isClockedIn && (
                    <Button
                      variant="contained"
                      startIcon={<Login />}
                      disabled={saving}
                      onClick={() =>
                        runMyClockAction(
                          () => timeClockService.clockIn(),
                          'Clocked in'
                        )
                      }
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Clock In
                    </Button>
                  )}
                  {isClockedIn && !isOnBreak && (
                    <Button
                      variant="outlined"
                      startIcon={<Coffee />}
                      disabled={saving}
                      onClick={() =>
                        runMyClockAction(
                          () => timeClockService.startBreak(),
                          'Break started'
                        )
                      }
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Start Break
                    </Button>
                  )}
                  {isOnBreak && (
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      disabled={saving}
                      onClick={() =>
                        runMyClockAction(
                          () => timeClockService.endBreak(),
                          'Break ended'
                        )
                      }
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      End Break
                    </Button>
                  )}
                  {isClockedIn && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Logout />}
                      disabled={saving}
                      onClick={() =>
                        runMyClockAction(
                          () => timeClockService.clockOut(),
                          'Clocked out'
                        )
                      }
                      sx={{ width: { xs: '100%', sm: 'auto' } }}
                    >
                      Clock Out
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Employee Quick Clock In
        </Typography>
        <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
          {users.map((employee, index) => {
            const activeEntry = currentEntryByEmployeeId.get(employee.id);
            return (
              <Box
                key={employee.id}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: { xs: 1.5, sm: 2 },
                  p: { xs: 2, sm: 2.5 },
                  borderTop:
                    index === 0 ? 'none' : `1px solid ${colors.neutral[200]}`,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {employee.firstName} {employee.lastName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {employee.role?.name} · {employee.email}
                  </Typography>
                </Box>
                {activeEntry && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Since {format(new Date(activeEntry.clockInAt), 'h:mm a')} ·{' '}
                    {formatHours(activeEntry.paidMinutes)}
                  </Typography>
                )}
                <Chip
                  size="small"
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  color={
                    activeEntry
                      ? activeEntry.status === TimeEntryStatus.ON_BREAK
                        ? 'warning'
                        : 'success'
                      : 'default'
                  }
                  label={activeEntry ? formatStatus(activeEntry.status) : 'Out'}
                />
                {activeEntry ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Logout />}
                    disabled={saving}
                    onClick={() => clockOutEmployee(employee)}
                    sx={{
                      width: { xs: '100%', sm: 190 },
                      flexShrink: 0,
                    }}
                  >
                    Clock Out
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Login />}
                    disabled={saving}
                    onClick={() => clockInEmployee(employee)}
                    sx={{
                      width: { xs: '100%', sm: 190 },
                      flexShrink: 0,
                    }}
                  >
                    Clock In
                  </Button>
                )}
              </Box>
            );
          })}
          {users.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No employees found
            </Box>
          )}
        </Card>
      </TabPanel>

      {/* Time Entries tab — a card per employee for the pay period, opening
          onto that employee's entries. */}
      <TabPanel value={activeTab} index={1}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          <PayPeriodNavigator
            period={period}
            onChange={setPeriod}
            disabled={loading}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddEntry}
            disabled={saving || users.length === 0}
            sx={{ width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap' }}
          >
            Add Time
          </Button>
        </Box>

        <EmployeeHoursCards
          rows={payPeriodRows}
          selectedEmployeeId={cardEmployeeId}
          onSelect={toggleCard}
        />

        {/* Paying out the open card's approved hours for this period. It lives
            beside the hours it pays rather than with the pay rates, which are a
            setting. Foreman and supervisors review hours but do not pay them. */}
        {selectedCard && canProcessPayroll && (
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              border: `1px solid ${colors.neutral[200]}`,
              borderRadius: 1,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Ready for Payroll
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedReadyHours.toFixed(2)} hrs
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Estimated Pay
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color:
                      selectedEstimatedPay === null
                        ? 'text.secondary'
                        : colors.semantic.success,
                  }}
                >
                  {selectedEstimatedPay === null
                    ? 'Salaried'
                    : formatCurrency(selectedEstimatedPay)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  Processed · {periodLabel}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedProcessedHours.toFixed(2)} hrs
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={processPayroll}
                  disabled={saving || selectedReadyEntries.length === 0}
                >
                  Process
                </Button>
              </Grid>
            </Grid>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1.5 }}
            >
              Approved hours for{' '}
              {[
                selectedCard.employee?.firstName,
                selectedCard.employee?.lastName,
              ]
                .filter(Boolean)
                .join(' ') || selectedCard.employee?.email}{' '}
              stay ready until payroll is processed. Their pay rate is set under
              Settings → Compensation &amp; Bonus.
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mt: 4,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedCard
                ? `${
                    [
                      selectedCard.employee?.firstName,
                      selectedCard.employee?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ') || selectedCard.employee?.email
                  } · Time Entries`
                : 'All Time Entries'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedCard
                ? 'Select the card again to go back to the whole team'
                : 'Select an employee card above to see just their entries'}
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label="Status"
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value as 'ALL' | TimeEntryStatus)
            }
            sx={{ minWidth: { sm: 180 } }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            {Object.values(TimeEntryStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {formatStatus(status)}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TimeEntriesTable
          entries={filteredEntries}
          showEmployee={!cardEmployeeId}
          emptyMessage={`No time entries for ${periodLabel}`}
          actions={{
            saving,
            onEdit: openEditEntry,
            onApprove: (entry) => approveEntry(entry.id),
            onUnapprove: (entry) => unapproveEntry(entry.id),
            onDelete: openDeleteEntry,
          }}
        />
      </TabPanel>

      <Dialog
        open={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Time Entry</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Clock In"
                value={editClockInAt}
                onChange={(event) => setEditClockInAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Clock Out"
                value={editClockOutAt}
                onChange={(event) => setEditClockOutAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumberInput
                fullWidth
                min={0}
                label="Break (minutes)"
                value={editBreakMinutes}
                onChange={(v) =>
                  setEditBreakMinutes(v === undefined ? '' : String(v))
                }
                helperText="Unpaid break deducted from paid hours"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={2}
                label="Adjustment Reason"
                value={editReason}
                onChange={(event) => setEditReason(event.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingEntry(null)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveEntryEdit}
            disabled={saving || !editClockInAt || !editReason.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Time Entry</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will permanently delete the time entry. This action cannot be
            undone.
          </Alert>
          {deletingEntry && (
            <Typography variant="body2" color="text.secondary">
              {deletingEntry.employee?.firstName}{' '}
              {deletingEntry.employee?.lastName} ·{' '}
              {format(new Date(deletingEntry.clockInAt), 'MMM d, yyyy')} ·{' '}
              {formatHours(deletingEntry.paidMinutes)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingEntry(null)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteEntry}
            disabled={saving}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Time Entry</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Employee"
                value={addEmployeeId}
                onChange={(event) => setAddEmployeeId(event.target.value)}
              >
                {users.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} (
                    {employee.role?.name})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Clock In"
                value={addClockInAt}
                onChange={(event) => setAddClockInAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Clock Out"
                value={addClockOutAt}
                onChange={(event) => setAddClockOutAt(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumberInput
                fullWidth
                min={0}
                label="Break (minutes)"
                value={addBreakMinutes}
                onChange={(v) =>
                  setAddBreakMinutes(v === undefined ? '' : String(v))
                }
                helperText="Unpaid break deducted from paid hours"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Reason / Notes (optional)"
                value={addReason}
                onChange={(event) => setAddReason(event.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={saveAddEntry}
            disabled={
              saving ||
              !addEmployeeId ||
              !addClockInAt ||
              !addClockOutAt ||
              new Date(addClockOutAt) <= new Date(addClockInAt) ||
              (Boolean(addBreakMinutes) &&
                Number(addBreakMinutes) * 60000 >=
                  new Date(addClockOutAt).getTime() -
                    new Date(addClockInAt).getTime())
            }
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
