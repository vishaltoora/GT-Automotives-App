import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
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
import { timeClockService } from '../../requests/time-clock.requests';
import { colors } from '../../theme/colors';
import {
  PayPeriod,
  currentPayPeriod,
  payPeriodLabel,
} from '../../utils/payPeriod';

/**
 * The time entries behind every employee's hours, for the accountant.
 *
 * The accountant issues the pay stubs, so they need to be able to check the
 * auto-populated hours against the shifts they came from. The capability is the
 * same one admins have under Time Clock; what differs is that nothing here
 * mutates — approving, adjusting and processing stay with admin and foreman,
 * which the API enforces regardless of what this page renders.
 */
export function AccountantTimeEntries() {
  const [period, setPeriod] = useState<PayPeriod>(() => currentPayPeriod());
  const [rows, setRows] = useState<PayPeriodHoursDto[]>([]);
  const [entries, setEntries] = useState<TimeEntryDto[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodStart = period.start.toISOString();
  const periodEnd = period.end.toISOString();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [hoursData, entryData] = await Promise.all([
        timeClockService.getPayPeriodHours({
          startDate: periodStart,
          endDate: periodEnd,
        }),
        timeClockService.getEntries({
          startDate: periodStart,
          endDate: periodEnd,
        }),
      ]);
      setRows(hoursData);
      setEntries(entryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load time entries');
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedCard = rows.find((row) => row.employeeId === employeeId);

  const visibleEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          // A voided entry is a withdrawn claim; it is not evidence behind any
          // figure on a pay stub, so it would only be noise here.
          entry.status !== TimeEntryStatus.VOIDED &&
          (!employeeId || entry.employeeId === employeeId)
      ),
    [entries, employeeId]
  );

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: colors.primary.main,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Time Entries
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Verify the hours behind each pay stub. Viewing entries changes nothing
          — approving and processing stay with the shop.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2.5 }}>
        <PayPeriodNavigator
          period={period}
          onChange={setPeriod}
          disabled={loading}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <EmployeeHoursCards
            rows={rows}
            selectedEmployeeId={employeeId}
            onSelect={(id) =>
              setEmployeeId((current) => (current === id ? '' : id))
            }
          />

          <Box sx={{ mt: 4, mb: 2 }}>
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

          <TimeEntriesTable
            entries={visibleEntries}
            showEmployee={!employeeId}
            emptyMessage={`No time entries for ${payPeriodLabel(period)}`}
          />
        </>
      )}
    </Box>
  );
}

export default AccountantTimeEntries;
