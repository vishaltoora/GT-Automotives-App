import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Coffee, Login, Logout, PlayArrow, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import { TimeEntryDto, TimeEntryStatus } from '@gt-automotive/data';
import { timeClockService } from '../../requests/time-clock.requests';
import { colors } from '../../theme/colors';

const formatHours = (minutes: number) => `${(minutes / 60).toFixed(2)} hrs`;
const formatStatus = (status: TimeEntryStatus) => {
  if (status === TimeEntryStatus.OPEN) return 'Clocked In';
  if (status === TimeEntryStatus.ON_BREAK) return 'On Break';
  if (status === TimeEntryStatus.CLOCKED_OUT) return 'Clocked Out';
  return status.replace('_', ' ');
};

export function TimeClock() {
  const [currentEntry, setCurrentEntry] = useState<TimeEntryDto | null>(null);
  const [entries, setEntries] = useState<TimeEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [current, history] = await Promise.all([
        timeClockService.getMyCurrent(),
        timeClockService.getMyEntries(),
      ]);
      setCurrentEntry(current);
      setEntries(history);
    } catch (err: any) {
      setError(err.message || 'Failed to load time clock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (action: () => Promise<TimeEntryDto>) => {
    try {
      setSubmitting(true);
      setError(null);
      await action();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Time clock action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isClockedIn = Boolean(currentEntry);
  const isOnBreak = currentEntry?.status === TimeEntryStatus.ON_BREAK;

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
            Track your shop hours and breaks
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={loadData} disabled={submitting} fullWidth={false} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card elevation={0} sx={{ mb: 4, border: `1px solid ${colors.neutral[200]}` }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary">
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, mt: 1 }}>
                <Chip
                  color={isOnBreak ? 'warning' : isClockedIn ? 'success' : 'default'}
                  label={isOnBreak ? 'On Break' : isClockedIn ? 'Clocked In' : 'Clocked Out'}
                />
                {currentEntry && (
                  <Typography variant="body2" color="text.secondary">
                    Since {format(new Date(currentEntry.clockInAt), 'MMM d, h:mm a')}
                  </Typography>
                )}
              </Box>
              {currentEntry && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatHours(currentEntry.paidMinutes)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Paid time so far, excluding unpaid breaks
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: 1.25, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                {!isClockedIn && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Login />}
                    disabled={submitting}
                    onClick={() => runAction(() => timeClockService.clockIn())}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Clock In
                  </Button>
                )}
                {isClockedIn && !isOnBreak && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Coffee />}
                    disabled={submitting}
                    onClick={() => runAction(() => timeClockService.startBreak())}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Start Break
                  </Button>
                )}
                {isOnBreak && (
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    disabled={submitting}
                    onClick={() => runAction(() => timeClockService.endBreak())}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    End Break
                  </Button>
                )}
                {isClockedIn && (
                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<Logout />}
                    disabled={submitting}
                    onClick={() => runAction(() => timeClockService.clockOut())}
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
        Recent Time Entries
      </Typography>
      <Box sx={{ display: { xs: 'grid', md: 'none' }, gap: 1.5 }}>
        {entries.map((entry) => (
          <Card key={entry.id} elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {format(new Date(entry.clockInAt), 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(entry.clockInAt), 'h:mm a')} - {entry.clockOutAt ? format(new Date(entry.clockOutAt), 'h:mm a') : 'Open'}
                  </Typography>
                </Box>
                <Chip size="small" label={formatStatus(entry.status)} />
              </Box>
              <Grid container spacing={1.5}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Breaks</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatHours(entry.unpaidBreakMinutes)}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">Paid Hours</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatHours(entry.paidMinutes)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            No time entries yet
          </Paper>
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Clock In</TableCell>
              <TableCell>Clock Out</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Breaks</TableCell>
              <TableCell align="right">Paid Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.clockInAt), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(entry.clockInAt), 'h:mm a')}</TableCell>
                <TableCell>{entry.clockOutAt ? format(new Date(entry.clockOutAt), 'h:mm a') : '-'}</TableCell>
                <TableCell><Chip size="small" label={formatStatus(entry.status)} /></TableCell>
                <TableCell align="right">{formatHours(entry.unpaidBreakMinutes)}</TableCell>
                <TableCell align="right">{formatHours(entry.paidMinutes)}</TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No time entries yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
