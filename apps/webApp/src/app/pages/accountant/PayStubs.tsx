import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { PayrollHoursDto, PayStubDto } from '@gt-automotive/data';
import { payStubService } from '../../requests/pay-stub.requests';
import { timeClockService } from '../../requests/time-clock.requests';
import { PayStubDialog } from '../../components/pay-stubs/PayStubDialog';
import { PayStubViewer } from '../../components/pay-stubs/PayStubViewer';
import { colors } from '../../theme/colors';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

const displayName = (row: PayrollHoursDto) =>
  [row.employee?.firstName, row.employee?.lastName].filter(Boolean).join(' ') ||
  row.employee?.email ||
  'Unknown employee';

/**
 * Accountant view of issued pay stubs, and where new ones are raised.
 *
 * Deep-linkable from the Employee Hours page: `?employeeId=&start=&end=` opens
 * the create dialog pre-scoped to that employee and period.
 */
export function PayStubs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payStubs, setPayStubs] = useState<PayStubDto[]>([]);
  const [employees, setEmployees] = useState<PayrollHoursDto[]>([]);
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewing, setViewing] = useState<PayStubDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prefillEmployeeId = searchParams.get('employeeId') || undefined;
  const prefillStart = searchParams.get('start') || undefined;
  const prefillEnd = searchParams.get('end') || undefined;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // The payroll-hours endpoint doubles as the employee roster here: it is
      // already scoped to payroll-eligible staff and carries their names, so
      // the accountant does not also need access to the full user list.
      const [stubs, roster] = await Promise.all([
        payStubService.findAll(filterEmployeeId || undefined),
        timeClockService.getPayrollHours({
          startDate: startOfMonth(new Date()).toISOString(),
          endDate: endOfMonth(new Date()).toISOString(),
        }),
      ]);
      setPayStubs(stubs);
      setEmployees(roster);
    } catch (err: any) {
      setError(err.message || 'Failed to load pay stubs');
    } finally {
      setLoading(false);
    }
  }, [filterEmployeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (prefillEmployeeId) setDialogOpen(true);
  }, [prefillEmployeeId]);

  const employeeOptions = useMemo(
    () =>
      employees.map((row) => ({ id: row.employeeId, name: displayName(row) })),
    [employees]
  );

  const closeDialog = () => {
    setDialogOpen(false);
    // Drop the deep-link params so reopening the page does not immediately
    // reopen the dialog.
    if (prefillEmployeeId || prefillStart || prefillEnd) {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.primary.main,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            Pay Stubs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Issued pay stubs. Employees can view and print their own from their
            profile.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            label="Employee"
            value={filterEmployeeId}
            onChange={(event) => setFilterEmployeeId(event.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Employees</MenuItem>
            {employeeOptions.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Create Pay Stub
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : payStubs.length === 0 ? (
        <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              No pay stubs yet. Create one to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Pay Cycle</TableCell>
                <TableCell>Pay Date</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell align="right">Gross</TableCell>
                <TableCell align="right">Withholding</TableCell>
                <TableCell align="right">Net Pay</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payStubs.map((stub) => (
                <TableRow key={stub.id} hover>
                  <TableCell>{stub.employeeName}</TableCell>
                  <TableCell>
                    {stub.periodStart} — {stub.periodEnd}
                  </TableCell>
                  <TableCell>{stub.payDate}</TableCell>
                  <TableCell align="right">
                    {stub.regularHours.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(stub.grossPay)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(stub.totalWithholding)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatCurrency(stub.netPay)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => setViewing(stub)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PayStubDialog
        open={dialogOpen}
        onClose={closeDialog}
        onCreated={(created) => {
          setPayStubs((prev) => [created, ...prev]);
          setViewing(created);
        }}
        employees={employeeOptions}
        initialEmployeeId={prefillEmployeeId}
        initialPeriodStart={
          prefillStart || format(startOfMonth(new Date()), 'yyyy-MM-dd')
        }
        initialPeriodEnd={
          prefillEnd || format(endOfMonth(new Date()), 'yyyy-MM-dd')
        }
      />

      <PayStubViewer
        payStub={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
      />
    </Box>
  );
}

export default PayStubs;
