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
  IconButton,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Coffee,
  Delete,
  Edit,
  Groups,
  HourglassEmpty,
  Login,
  Logout,
  Payment,
  PendingActions,
  PlayArrow,
  Refresh,
  Save,
  WorkspacePremium,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PayType, TimeEntryDto, TimeEntryStatus, UpsertEmployeeCompensationDto } from '@gt-automotive/data';
import { User, userService } from '../../../requests/user.requests';
import { timeClockService } from '../../../requests/time-clock.requests';
import { useAuth } from '../../../hooks/useAuth';
import { colors } from '../../../theme/colors';

const formatHours = (minutes: number) => `${(minutes / 60).toFixed(2)} hrs`;
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
}).format(amount);
const formatStatus = (status: TimeEntryStatus) => {
  if (status === TimeEntryStatus.OPEN) return 'Clocked In';
  if (status === TimeEntryStatus.ON_BREAK) return 'On Break';
  if (status === TimeEntryStatus.CLOCKED_OUT) return 'Clocked Out';
  return status.replace('_', ' ');
};
const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`time-clock-tabpanel-${index}`}>
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
  const [myCurrentEntry, setMyCurrentEntry] = useState<TimeEntryDto | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [payType, setPayType] = useState<PayType>(PayType.HOURLY);
  const [hourlyRate, setHourlyRate] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null);
  const [editClockInAt, setEditClockInAt] = useState('');
  const [editClockOutAt, setEditClockOutAt] = useState('');
  const [editReason, setEditReason] = useState('');
  const [deletingEntry, setDeletingEntry] = useState<TimeEntryDto | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TimeEntryStatus>('ALL');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userData, currentData, entryData] = await Promise.all([
        userService.getUsers(),
        timeClockService.getCurrentEntries(),
        timeClockService.getEntries({
          startDate: startOfMonth(new Date()).toISOString(),
          endDate: endOfMonth(new Date()).toISOString(),
        }),
      ]);
      const myCurrent = await timeClockService.getMyCurrent();
      const employees = userData.filter((user) => ['ADMIN', 'SUPERVISOR', 'STAFF'].includes(user.role?.name || ''));
      setUsers(employees);
      setCurrentEntries(currentData);
      setEntries(entryData);
      setMyCurrentEntry(myCurrent);
      if (!selectedEmployeeId && employees[0]) {
        setSelectedEmployeeId(employees[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load time clock data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    const loadCompensation = async () => {
      try {
        const compensation = await timeClockService.getCompensation(selectedEmployeeId);
        if (compensation) {
          setPayType(compensation.payType);
          setHourlyRate(compensation.hourlyRate?.toString() || '');
          setAnnualSalary(compensation.annualSalary?.toString() || '');
        } else {
          setPayType(PayType.HOURLY);
          setHourlyRate('');
          setAnnualSalary('');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load compensation');
      }
    };

    loadCompensation();
  }, [selectedEmployeeId]);

  const selectedEmployee = users.find((user) => user.id === selectedEmployeeId);
  const currentEntryByEmployeeId = new Map(currentEntries.map((entry) => [entry.employeeId, entry]));
  const monthStart = startOfMonth(new Date()).toISOString();
  const monthEnd = endOfMonth(new Date()).toISOString();
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const selectedReadyEntries = entries.filter((entry) =>
    entry.employeeId === selectedEmployeeId &&
    entry.status === TimeEntryStatus.APPROVED &&
    !entry.payrollProcessedAt
  );
  const selectedReadyHours = selectedReadyEntries.reduce((sum, entry) => sum + entry.paidMinutes / 60, 0);
  const selectedProcessedEntries = entries.filter((entry) =>
    entry.employeeId === selectedEmployeeId &&
    Boolean(entry.payrollProcessedAt)
  );
  const selectedProcessedHours = selectedProcessedEntries.reduce((sum, entry) => sum + entry.paidMinutes / 60, 0);
  const selectedEstimatedPay = payType === PayType.HOURLY ? selectedReadyHours * Number(hourlyRate || 0) : 0;

  // Dashboard aggregate stats across all employees for the current month
  const totalReadyHours = useMemo(
    () => entries
      .filter((entry) => entry.status === TimeEntryStatus.APPROVED && !entry.payrollProcessedAt)
      .reduce((sum, entry) => sum + entry.paidMinutes / 60, 0),
    [entries],
  );
  const totalProcessedHours = useMemo(
    () => entries
      .filter((entry) => Boolean(entry.payrollProcessedAt))
      .reduce((sum, entry) => sum + entry.paidMinutes / 60, 0),
    [entries],
  );
  const pendingApprovalCount = useMemo(
    () => entries.filter((entry) => entry.clockOutAt && entry.status !== TimeEntryStatus.APPROVED && entry.status !== TimeEntryStatus.VOIDED).length,
    [entries],
  );

  const summaryStats = [
    { label: 'Clocked In Now', value: String(currentEntries.length), icon: <Groups />, color: colors.primary.main },
    { label: 'Ready for Payroll', value: `${totalReadyHours.toFixed(1)} hrs`, icon: <HourglassEmpty />, color: colors.semantic.warning },
    { label: 'Pending Approval', value: String(pendingApprovalCount), icon: <PendingActions />, color: colors.semantic.info },
    { label: 'Processed This Month', value: `${totalProcessedHours.toFixed(1)} hrs`, icon: <CheckCircle />, color: colors.semantic.success },
  ];

  const filteredEntries = useMemo(
    () => entries.filter((entry) => {
      if (filterEmployeeId && entry.employeeId !== filterEmployeeId) return false;
      if (filterStatus !== 'ALL' && entry.status !== filterStatus) return false;
      const entryDate = format(new Date(entry.clockInAt), 'yyyy-MM-dd');
      if (filterStartDate && entryDate < filterStartDate) return false;
      if (filterEndDate && entryDate > filterEndDate) return false;
      return true;
    }),
    [entries, filterEmployeeId, filterStatus, filterStartDate, filterEndDate],
  );

  const hasEntryFilters = Boolean(filterEmployeeId || filterStatus !== 'ALL' || filterStartDate || filterEndDate);
  const clearEntryFilters = () => {
    setFilterEmployeeId('');
    setFilterStatus('ALL');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  const saveCompensation = async () => {
    if (!selectedEmployeeId) return;
    const payload: UpsertEmployeeCompensationDto = {
      payType,
      hourlyRate: payType === PayType.HOURLY ? Number(hourlyRate) : undefined,
      annualSalary: payType === PayType.SALARIED ? Number(annualSalary) : undefined,
    };

    try {
      setSaving(true);
      setError(null);
      await timeClockService.updateCompensation(selectedEmployeeId, payload);
      setMessage('Compensation updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update compensation');
    } finally {
      setSaving(false);
    }
  };

  const addBonus = async () => {
    if (!selectedEmployeeId) return;
    try {
      setSaving(true);
      setError(null);
      await timeClockService.createAdjustment({
        employeeId: selectedEmployeeId,
        amount: Number(bonusAmount),
        reason: bonusReason,
        effectiveDate: new Date().toISOString(),
      });
      setBonusAmount('');
      setBonusReason('');
      setMessage('Bonus added');
    } catch (err: any) {
      setError(err.message || 'Failed to add bonus');
    } finally {
      setSaving(false);
    }
  };

  const processPayroll = async () => {
    if (!selectedEmployeeId) return;
    try {
      setSaving(true);
      setError(null);
      const result = await timeClockService.processPayroll({
        employeeId: selectedEmployeeId,
        startDate: monthStart,
        endDate: monthEnd,
      });
      await loadData();
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
      await loadData();
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
    setEditReason('');
  };

  const saveEntryEdit = async () => {
    if (!editingEntry) return;
    try {
      setSaving(true);
      setError(null);
      await timeClockService.updateEntry(editingEntry.id, {
        clockInAt: new Date(editClockInAt).toISOString(),
        clockOutAt: editClockOutAt ? new Date(editClockOutAt).toISOString() : undefined,
        adjustmentReason: editReason,
      });
      setEditingEntry(null);
      await loadData();
      setMessage('Time entry updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update time entry');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteEntry = (entry: TimeEntryDto) => {
    setDeletingEntry(entry);
    setDeleteReason('');
  };

  const deleteEntry = async () => {
    if (!deletingEntry) return;
    try {
      setSaving(true);
      setError(null);
      await timeClockService.voidEntry(deletingEntry.id, deleteReason || 'Deleted by admin');
      setDeletingEntry(null);
      await loadData();
      setMessage('Time entry deleted');
    } catch (err: any) {
      setError(err.message || 'Failed to delete time entry');
    } finally {
      setSaving(false);
    }
  };

  const runMyClockAction = async (action: () => Promise<TimeEntryDto>, successMessage: string) => {
    try {
      setSaving(true);
      setError(null);
      await action();
      await loadData();
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
        notes: `Clocked in by admin for ${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      });
      await loadData();
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
        notes: `Clocked out by admin for ${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
      });
      await loadData();
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
      <Box sx={{
        mb: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main, fontSize: { xs: '1.6rem', sm: '2.125rem' } }}>
            Time Clock
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage employee hours, hourly rates, salary profiles, and bonuses
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={loadData} disabled={saving} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message}</Alert>}

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
          <Tab icon={<Payment />} iconPosition="start" label="This Month's Entries" />
        </Tabs>
      </Box>

      {/* Dashboard tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 3 }}>
          {summaryStats.map((stat) => (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Card elevation={0} sx={{ height: '100%', border: `1px solid ${colors.neutral[200]}` }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      color: stat.color,
                      backgroundColor: `${stat.color}1A`,
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
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

        <Card elevation={0} sx={{ mb: 3, border: `1px solid ${colors.neutral[200]}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2.5} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  My Time Clock
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, mt: 1 }}>
                  <Chip
                    color={isOnBreak ? 'warning' : isClockedIn ? 'success' : 'default'}
                    label={isOnBreak ? 'On Break' : isClockedIn ? 'Clocked In' : 'Clocked Out'}
                  />
                  {myCurrentEntry && (
                    <Typography variant="body2" color="text.secondary">
                      Since {format(new Date(myCurrentEntry.clockInAt), 'MMM d, h:mm a')} · {formatHours(myCurrentEntry.paidMinutes)}
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.25 }}>
                  {!isClockedIn && (
                    <Button
                      variant="contained"
                      startIcon={<Login />}
                      disabled={saving}
                      onClick={() => runMyClockAction(() => timeClockService.clockIn(), 'Clocked in')}
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
                      onClick={() => runMyClockAction(() => timeClockService.startBreak(), 'Break started')}
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
                      onClick={() => runMyClockAction(() => timeClockService.endBreak(), 'Break ended')}
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
                      onClick={() => runMyClockAction(() => timeClockService.clockOut(), 'Clocked out')}
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

        <Card elevation={0} sx={{ mb: 4, border: `1px solid ${colors.neutral[200]}` }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Compensation & Bonus
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Employee"
                  value={selectedEmployeeId}
                  onChange={(event) => setSelectedEmployeeId(event.target.value)}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role?.name})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Pay Type"
                  value={payType}
                  onChange={(event) => setPayType(event.target.value as PayType)}
                >
                  <MenuItem value={PayType.HOURLY}>Hourly</MenuItem>
                  <MenuItem value={PayType.SALARIED}>Salaried</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={payType === PayType.HOURLY ? 'Hourly Rate' : 'Annual Salary'}
                  value={payType === PayType.HOURLY ? hourlyRate : annualSalary}
                  onChange={(event) => payType === PayType.HOURLY ? setHourlyRate(event.target.value) : setAnnualSalary(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button fullWidth variant="contained" startIcon={<Save />} onClick={saveCompensation} disabled={saving || !selectedEmployeeId}>
                  Save
                </Button>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Bonus Amount"
                  value={bonusAmount}
                  onChange={(event) => setBonusAmount(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  label="Bonus Reason"
                  value={bonusReason}
                  onChange={(event) => setBonusReason(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<WorkspacePremium />}
                  onClick={addBonus}
                  disabled={saving || !selectedEmployeeId || !bonusAmount || !bonusReason}
                >
                  Bonus
                </Button>
              </Grid>
            </Grid>
            {selectedEmployee && (
              <Box sx={{ mt: 2.5, p: 2, border: `1px solid ${colors.neutral[200]}`, borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Ready for Payroll
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {selectedReadyHours.toFixed(2)} hrs
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Estimated Pay
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: colors.semantic.success }}>
                      {formatCurrency(selectedEstimatedPay)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Processed This Month
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
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Approved hours for {selectedEmployee.firstName} {selectedEmployee.lastName} stay ready until payroll is processed.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Employee Quick Clock In
        </Typography>
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
          {users.map((employee) => {
            const activeEntry = currentEntryByEmployeeId.get(employee.id);
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={employee.id}>
                <Card elevation={0} sx={{ height: '100%', border: `1px solid ${colors.neutral[200]}` }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {employee.role?.name} · {employee.email}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={activeEntry ? activeEntry.status === TimeEntryStatus.ON_BREAK ? 'warning' : 'success' : 'default'}
                        label={activeEntry ? formatStatus(activeEntry.status) : 'Out'}
                      />
                    </Box>
                    {activeEntry && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Since {format(new Date(activeEntry.clockInAt), 'h:mm a')} · {formatHours(activeEntry.paidMinutes)}
                      </Typography>
                    )}
                    {activeEntry ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        startIcon={<Logout />}
                        sx={{ mt: 2 }}
                        disabled={saving}
                        onClick={() => clockOutEmployee(employee)}
                      >
                        Clock Out
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Login />}
                        sx={{ mt: 2 }}
                        disabled={saving}
                        onClick={() => clockInEmployee(employee)}
                      >
                        Clock In
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      {/* This Month's Entries tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Time Entries · {monthLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEntries.length} of {entries.length} entries
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              select
              size="small"
              label="Employee"
              value={filterEmployeeId}
              onChange={(event) => setFilterEmployeeId(event.target.value)}
              sx={{ minWidth: { sm: 180 }, flex: { xs: 1, sm: 'none' } }}
            >
              <MenuItem value="">All Employees</MenuItem>
              {users.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as 'ALL' | TimeEntryStatus)}
              sx={{ minWidth: { sm: 150 }, flex: { xs: 1, sm: 'none' } }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              {Object.values(TimeEntryStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {formatStatus(status)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              size="small"
              label="From"
              value={filterStartDate}
              onChange={(event) => setFilterStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: format(startOfMonth(new Date()), 'yyyy-MM-dd'), max: filterEndDate || format(endOfMonth(new Date()), 'yyyy-MM-dd') }}
              sx={{ minWidth: { sm: 150 }, flex: { xs: 1, sm: 'none' } }}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              value={filterEndDate}
              onChange={(event) => setFilterEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: filterStartDate || format(startOfMonth(new Date()), 'yyyy-MM-dd'), max: format(endOfMonth(new Date()), 'yyyy-MM-dd') }}
              sx={{ minWidth: { sm: 150 }, flex: { xs: 1, sm: 'none' } }}
            />
            {hasEntryFilters && (
              <Button size="small" onClick={clearEntryFilters} sx={{ alignSelf: 'center' }}>
                Clear
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'grid', lg: 'none' }, gap: 1.5 }}>
          {filteredEntries.map((entry) => (
            <Card key={entry.id} elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {entry.employee?.firstName} {entry.employee?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(entry.clockInAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
                    <Chip size="small" label={formatStatus(entry.status)} />
                    {entry.status === TimeEntryStatus.APPROVED && (
                      <Chip
                        size="small"
                        color={entry.payrollProcessedAt ? 'success' : 'info'}
                        variant="outlined"
                        label={entry.payrollProcessedAt ? 'Processed' : 'Ready for Payroll'}
                      />
                    )}
                  </Box>
                </Box>

                <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Clock In</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{format(new Date(entry.clockInAt), 'h:mm a')}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Clock Out</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.clockOutAt ? format(new Date(entry.clockOutAt), 'h:mm a') : 'Open'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant="caption" color="text.secondary">Paid Hours</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatHours(entry.paidMinutes)}</Typography>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => openEditEntry(entry)}
                    disabled={saving || entry.status === TimeEntryStatus.APPROVED}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => openDeleteEntry(entry)}
                    disabled={saving || entry.status === TimeEntryStatus.VOIDED}
                  >
                    Delete
                  </Button>
                  {entry.clockOutAt && entry.status !== TimeEntryStatus.APPROVED && (
                    <Button size="small" variant="contained" startIcon={<CheckCircle />} onClick={() => approveEntry(entry.id)} disabled={saving}>
                      Approve
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
          {filteredEntries.length === 0 && (
            <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No time entries found for this month
            </Paper>
          )}
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Clock In</TableCell>
                <TableCell>Clock Out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payroll</TableCell>
                <TableCell align="right">Paid Hours</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.employee?.firstName} {entry.employee?.lastName}</TableCell>
                  <TableCell>{format(new Date(entry.clockInAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(entry.clockInAt), 'h:mm a')}</TableCell>
                  <TableCell>{entry.clockOutAt ? format(new Date(entry.clockOutAt), 'h:mm a') : '-'}</TableCell>
                  <TableCell><Chip size="small" label={formatStatus(entry.status)} /></TableCell>
                  <TableCell>
                    {entry.status === TimeEntryStatus.APPROVED ? (
                      <Chip
                        size="small"
                        color={entry.payrollProcessedAt ? 'success' : 'info'}
                        variant="outlined"
                        label={entry.payrollProcessedAt ? 'Processed' : 'Ready'}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">{formatHours(entry.paidMinutes)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit time entry">
                      <IconButton size="small" onClick={() => openEditEntry(entry)} disabled={saving || entry.status === TimeEntryStatus.APPROVED}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete time entry">
                      <IconButton size="small" color="error" onClick={() => openDeleteEntry(entry)} disabled={saving || entry.status === TimeEntryStatus.VOIDED}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {entry.clockOutAt && entry.status !== TimeEntryStatus.APPROVED && (
                      <Button size="small" startIcon={<CheckCircle />} onClick={() => approveEntry(entry.id)} disabled={saving}>
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No time entries found for this month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={Boolean(editingEntry)} onClose={() => setEditingEntry(null)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setEditingEntry(null)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveEntryEdit}
            disabled={saving || !editClockInAt || !editReason.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deletingEntry)} onClose={() => setDeletingEntry(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Time Entry</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will remove the entry from active payroll by marking it voided.
          </Typography>
          <TextField
            fullWidth
            required
            multiline
            minRows={2}
            label="Delete Reason"
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingEntry(null)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={deleteEntry}
            disabled={saving || !deleteReason.trim()}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
