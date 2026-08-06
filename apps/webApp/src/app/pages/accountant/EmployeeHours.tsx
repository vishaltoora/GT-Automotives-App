import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Description,
  Warning,
} from '@mui/icons-material';
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { PayrollHoursDto, PayType } from '@gt-automotive/data';
import { timeClockService } from '../../requests/time-clock.requests';
import { colors } from '../../theme/colors';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

const employeeName = (row: PayrollHoursDto) =>
  [row.employee?.firstName, row.employee?.lastName].filter(Boolean).join(' ') ||
  row.employee?.email ||
  'Unknown employee';

/**
 * Read-only view of approved hours per employee for a pay period.
 *
 * The accountant reviews these figures and raises pay stubs from them;
 * approving, adjusting and processing time entries stays with admin/foreman, so
 * nothing on this page mutates. In particular the figures come from the
 * read-only payroll-hours endpoint, never from process-payroll, which would
 * stamp the entries as processed as a side effect of looking at them.
 */
export function EmployeeHours() {
  const navigate = useNavigate();
  const location = useLocation();
  // This page is mounted under both /accountant and /admin, so links stay
  // within whichever section the user is actually in.
  const basePath = `/${location.pathname.split('/')[1]}`;
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [rows, setRows] = useState<PayrollHoursDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = startOfMonth(viewMonth).toISOString();
  const monthEnd = endOfMonth(viewMonth).toISOString();
  const monthLabel = format(viewMonth, 'MMMM yyyy');
  const isCurrentMonth = isSameMonth(viewMonth, new Date());

  const loadHours = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await timeClockService.getPayrollHours({
        startDate: monthStart,
        endDate: monthEnd,
      });
      setRows(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee hours');
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    loadHours();
  }, [loadHours]);

  const totals = rows.reduce(
    (acc, row) => ({
      hours: acc.hours + row.hours,
      grossPay: acc.grossPay + row.grossPay,
    }),
    { hours: 0, grossPay: 0 }
  );

  const withHours = rows.filter((row) => row.hours > 0 || row.grossPay > 0);

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
          Employee Hours
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Approved hours for the period. Use these to raise pay stubs — viewing
          them does not process payroll.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <IconButton
          size="small"
          aria-label="Previous month"
          onClick={() => setViewMonth(startOfMonth(subMonths(viewMonth, 1)))}
          disabled={loading}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, minWidth: 170, textAlign: 'center' }}
        >
          {monthLabel}
        </Typography>
        <IconButton
          size="small"
          aria-label="Next month"
          onClick={() => setViewMonth(startOfMonth(addMonths(viewMonth, 1)))}
          disabled={loading || isCurrentMonth}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
        {!isCurrentMonth && (
          <Button
            size="small"
            onClick={() => setViewMonth(startOfMonth(new Date()))}
            disabled={loading}
          >
            This Month
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : withHours.length === 0 ? (
        <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              No approved hours for {monthLabel}. Hours appear here once they
              have been approved in the time clock.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Approved Hours</TableCell>
                <TableCell align="right">Already Processed</TableCell>
                <TableCell align="right">Pay Rate</TableCell>
                <TableCell align="right">Gross Pay</TableCell>
                <TableCell align="center">Pay Stub</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withHours.map((row) => (
                <TableRow key={row.employeeId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {employeeName(row)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.entryCount}{' '}
                      {row.entryCount === 1 ? 'entry' : 'entries'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{row.hours.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    {row.processedHours > 0 ? (
                      <Chip
                        size="small"
                        color="success"
                        label={`${row.processedHours.toFixed(2)} hrs`}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!row.hasCompensation ? (
                      <Tooltip title="No active compensation record for this employee">
                        <Chip
                          size="small"
                          color="warning"
                          icon={<Warning />}
                          label="Not set"
                        />
                      </Tooltip>
                    ) : row.payType === PayType.SALARIED ? (
                      'Salaried'
                    ) : (
                      `${formatCurrency(row.hourlyRate)}/hr`
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {row.hasCompensation ? (
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(row.grossPay)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Needs a pay rate
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Create a pay stub for this period">
                      <Button
                        size="small"
                        startIcon={<Description />}
                        onClick={() =>
                          navigate(
                            `${basePath}/pay-stubs?employeeId=${
                              row.employeeId
                            }&start=${format(
                              startOfMonth(viewMonth),
                              'yyyy-MM-dd'
                            )}&end=${format(
                              endOfMonth(viewMonth),
                              'yyyy-MM-dd'
                            )}`
                          )
                        }
                      >
                        Create
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {totals.hours.toFixed(2)}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {formatCurrency(totals.grossPay)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default EmployeeHours;
