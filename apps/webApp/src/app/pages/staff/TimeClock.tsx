import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { Coffee, Login, Logout, PlayArrow, Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import {
  PayPeriodHoursDto,
  TimeEntryDto,
  TimeEntryStatus,
} from '@gt-automotive/data';
import {
  EmployeeHoursCards,
  PayPeriodNavigator,
  TimeEntriesTable,
} from '../../components/time-clock';
import {
  timeClockService,
  ShopHoursStatus,
} from '../../requests/time-clock.requests';
import { colors } from '../../theme/colors';
import {
  PayPeriod,
  currentPayPeriod,
  payPeriodLabel,
} from '../../utils/payPeriod';

const formatHours = (minutes: number) => `${(minutes / 60).toFixed(2)} hrs`;

export function TimeClock() {
  const [currentEntry, setCurrentEntry] = useState<TimeEntryDto | null>(null);
  const [entries, setEntries] = useState<TimeEntryDto[]>([]);
  // Own hours for the period, in the same card the shop sees for the whole
  // team — an employee should be able to check the figure that will be paid
  // against the same numbers their supervisor is looking at.
  const [myHours, setMyHours] = useState<PayPeriodHoursDto | null>(null);
  const [period, setPeriod] = useState<PayPeriod>(() => currentPayPeriod());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The shop-hours window, so the clock-in button can disable itself and say
  // why rather than letting someone press it and take an error back.
  const [shopHours, setShopHours] = useState<ShopHoursStatus | null>(null);

  const periodStart = period.start.toISOString();
  const periodEnd = period.end.toISOString();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [current, history, hours, hoursWindow] = await Promise.all([
        timeClockService.getMyCurrent(),
        timeClockService.getMyEntries({
          startDate: periodStart,
          endDate: periodEnd,
        }),
        timeClockService.getPayPeriodHours({
          startDate: periodStart,
          endDate: periodEnd,
        }),
        // A failure here must not take the whole screen down — worst case the
        // button stays enabled and the server refuses, which is where we were.
        timeClockService.getShopHours().catch(() => null),
      ]);
      setShopHours(hoursWindow);
      setCurrentEntry(current);
      setEntries(history);
      // The server has already narrowed this to the caller, so the first row
      // is theirs.
      setMyHours(hours[0] ?? null);
    } catch (err: any) {
      setError(err.message || 'Failed to load time clock');
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  // Only clocking *in* is restricted. Someone already on the clock must always
  // be able to clock out, whatever the hour.
  const clockInClosed = shopHours ? !shopHours.isOpen : false;

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
            Track your shop hours and breaks
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={loadData}
          disabled={submitting}
          fullWidth={false}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {clockInClosed && !isClockedIn && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {shopHours?.closedReason}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{ mb: 4, border: `1px solid ${colors.neutral[200]}` }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" color="text.secondary">
                Current Status
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
                    isOnBreak ? 'warning' : isClockedIn ? 'success' : 'default'
                  }
                  label={
                    isOnBreak
                      ? 'On Break'
                      : isClockedIn
                      ? 'Clocked In'
                      : 'Clocked Out'
                  }
                />
                {currentEntry && (
                  <Typography variant="body2" color="text.secondary">
                    Since{' '}
                    {format(new Date(currentEntry.clockInAt), 'MMM d, h:mm a')}
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: 'wrap',
                  gap: 1.25,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                {!isClockedIn && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Login />}
                    disabled={submitting || clockInClosed}
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
                    onClick={() =>
                      runAction(() => timeClockService.startBreak())
                    }
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

      <Box sx={{ mb: 2.5 }}>
        <PayPeriodNavigator
          period={period}
          onChange={setPeriod}
          disabled={loading || submitting}
        />
      </Box>

      {/* The same card the shop sees, showing only this employee. Approved and
          unapproved are separate figures because only approved hours are paid,
          so unapproved hours are what to raise with a supervisor. */}
      <Box sx={{ mb: 4 }}>
        <EmployeeHoursCards
          rows={myHours ? [myHours] : []}
          emptyMessage={`No hours recorded for ${payPeriodLabel(period)}`}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Time Entries
      </Typography>
      <TimeEntriesTable
        entries={entries}
        showEmployee={false}
        emptyMessage={`No time entries for ${payPeriodLabel(period)}`}
      />
    </Box>
  );
}
