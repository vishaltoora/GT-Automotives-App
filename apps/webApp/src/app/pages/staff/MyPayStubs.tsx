import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { PayStubDto } from '@gt-automotive/data';
import { payStubService } from '../../requests/pay-stub.requests';
import { PayStubViewer } from '../../components/pay-stubs/PayStubViewer';
import { colors } from '../../theme/colors';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

/**
 * The signed-in employee's own pay stubs.
 *
 * Backed by `GET /api/pay-stubs/mine`, which can only ever return the caller's
 * own records — an employee never sees a colleague's pay.
 */
export function MyPayStubs() {
  const [payStubs, setPayStubs] = useState<PayStubDto[]>([]);
  const [viewing, setViewing] = useState<PayStubDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setPayStubs(await payStubService.findMine());
      } catch (err: any) {
        setError(err.message || 'Failed to load your pay stubs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          My Pay Stubs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and print your pay stubs.
        </Typography>
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
              You don't have any pay stubs yet. They appear here once payroll
              issues them.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pay Cycle</TableCell>
                <TableCell>Pay Date</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell align="right">Gross</TableCell>
                <TableCell align="right">Vacation</TableCell>
                <TableCell align="right">Withholding</TableCell>
                <TableCell align="right">Net Pay</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payStubs.map((stub) => (
                <TableRow key={stub.id} hover>
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
                    {/* Earned this period, with what is still banked
                        underneath — the figure people actually want from this
                        column. The bank runs across years, unlike YTD. */}
                    {formatCurrency(stub.vacationPayAmount)}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      {formatCurrency(stub.vacationPayBalance)} banked
                    </Typography>
                    {stub.vacationPayPaidOut > 0 && (
                      <Typography
                        variant="caption"
                        color="success.main"
                        sx={{ display: 'block' }}
                      >
                        {formatCurrency(stub.vacationPayPaidOut)} paid out
                      </Typography>
                    )}
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

      <PayStubViewer
        payStub={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
      />
    </Box>
  );
}

export default MyPayStubs;
