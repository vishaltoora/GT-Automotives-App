import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import {
  CreatePayStubDto,
  PayrollHoursDto,
  PayStubDto,
  PayType,
} from '@gt-automotive/data';
import { payStubService } from '../../requests/pay-stub.requests';
import { timeClockService } from '../../requests/time-clock.requests';
import { colors } from '../../theme/colors';

interface PayStubDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (payStub: PayStubDto) => void;
  /** Employees the accountant can raise a stub for. */
  employees: { id: string; name: string }[];
  initialEmployeeId?: string;
  initialPeriodStart?: string;
  initialPeriodEnd?: string;
}

const today = () => format(new Date(), 'yyyy-MM-dd');
const toNumber = (value: string) => (value.trim() === '' ? 0 : Number(value));

const emptyForm = {
  employeeId: '',
  periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  payDate: today(),
  position: '',
  payRate: '',
  regularHours: '',
  regularAmount: '',
  eiAmount: '',
  cppAmount: '',
  incomeTaxAmount: '',
  otherDeductions: '',
  otherDeductionsLabel: '',
  notes: '',
};

/**
 * Raise a pay stub for an employee.
 *
 * Hours, pay rate and gross pre-fill from the employee's approved time for the
 * selected period. That comes from the read-only payroll-hours endpoint, never
 * from process-payroll — opening this form must not mark anyone's time entries
 * as processed as a side effect of looking at the numbers.
 *
 * Statutory deductions are typed by the accountant. The system deliberately
 * does not calculate EI or CPP: the rates change yearly and a wrong guess is
 * worse than an honest blank.
 */
export function PayStubDialog({
  open,
  onClose,
  onCreated,
  employees,
  initialEmployeeId,
  initialPeriodStart,
  initialPeriodEnd,
}: PayStubDialogProps) {
  const [form, setForm] = useState({ ...emptyForm });
  const [hours, setHours] = useState<PayrollHoursDto | null>(null);
  const [loadingHours, setLoadingHours] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      employeeId: initialEmployeeId || '',
      periodStart: initialPeriodStart || emptyForm.periodStart,
      periodEnd: initialPeriodEnd || emptyForm.periodEnd,
    });
    setHours(null);
    setError(null);
  }, [open, initialEmployeeId, initialPeriodStart, initialPeriodEnd]);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const loadHours = useCallback(async () => {
    if (!form.employeeId || !form.periodStart || !form.periodEnd) {
      setHours(null);
      return;
    }

    try {
      setLoadingHours(true);
      setError(null);
      const [result] = await timeClockService.getPayrollHours({
        employeeId: form.employeeId,
        startDate: new Date(`${form.periodStart}T00:00:00`).toISOString(),
        endDate: new Date(`${form.periodEnd}T23:59:59`).toISOString(),
      });
      setHours(result || null);

      if (result) {
        // Pre-fill, never force: the accountant confirms these figures and can
        // overwrite any of them before the stub is raised.
        setForm((prev) => ({
          ...prev,
          regularHours: result.hours ? String(result.hours) : '',
          payRate:
            result.hasCompensation && result.payType === PayType.HOURLY
              ? String(result.hourlyRate)
              : prev.payRate,
          regularAmount: result.grossPay ? String(result.grossPay) : '',
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load approved hours');
    } finally {
      setLoadingHours(false);
    }
  }, [form.employeeId, form.periodStart, form.periodEnd]);

  useEffect(() => {
    loadHours();
  }, [loadHours]);

  const grossPay = toNumber(form.regularAmount);
  const totalWithholding =
    toNumber(form.eiAmount) +
    toNumber(form.cppAmount) +
    toNumber(form.incomeTaxAmount) +
    toNumber(form.otherDeductions);
  const netPay = grossPay - totalWithholding;

  const canSave =
    Boolean(form.employeeId) &&
    Boolean(form.periodStart) &&
    Boolean(form.periodEnd) &&
    Boolean(form.payDate) &&
    form.regularAmount.trim() !== '' &&
    netPay >= 0 &&
    !saving;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const dto: CreatePayStubDto = {
        employeeId: form.employeeId,
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        payDate: form.payDate,
        position: form.position || undefined,
        payRate: form.payRate ? toNumber(form.payRate) : undefined,
        regularHours: toNumber(form.regularHours),
        regularAmount: toNumber(form.regularAmount),
        eiAmount: toNumber(form.eiAmount),
        cppAmount: toNumber(form.cppAmount),
        incomeTaxAmount: toNumber(form.incomeTaxAmount),
        otherDeductions: toNumber(form.otherDeductions),
        otherDeductionsLabel: form.otherDeductionsLabel || undefined,
        notes: form.notes || undefined,
      };
      const created = await payStubService.create(dto);
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create the pay stub');
    } finally {
      setSaving(false);
    }
  };

  const money = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Pay Stub</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Employee"
              value={form.employeeId}
              onChange={(event) => setField('employeeId', event.target.value)}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Position"
              value={form.position}
              onChange={(event) => setField('position', event.target.value)}
              placeholder="e.g. Business Manager"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Period Start"
              value={form.periodStart}
              onChange={(event) => setField('periodStart', event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Period End"
              value={form.periodEnd}
              onChange={(event) => setField('periodEnd', event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Pay Date"
              value={form.payDate}
              onChange={(event) => setField('payDate', event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {form.employeeId && (
            <Grid size={12}>
              {loadingHours ? (
                <Alert severity="info">Loading approved hours…</Alert>
              ) : hours && !hours.hasCompensation ? (
                <Alert severity="warning">
                  This employee has no active compensation record, so no pay
                  rate could be pre-filled. Enter the rate and gross manually.
                </Alert>
              ) : hours && hours.payType === PayType.SALARIED ? (
                <Alert severity="info">
                  Salaried employee — gross is prorated from the annual salary
                  across this period, not derived from hours. Adjust if needed.
                </Alert>
              ) : hours && hours.hours === 0 ? (
                <Alert severity="warning">
                  No approved hours found for this period. Enter the figures
                  manually, or approve the time entries first.
                </Alert>
              ) : hours ? (
                <Alert severity="success">
                  Pre-filled from {hours.entryCount} approved{' '}
                  {hours.entryCount === 1 ? 'entry' : 'entries'} (
                  {hours.hours.toFixed(2)} hrs).
                  {hours.processedHours > 0
                    ? ` ${hours.processedHours.toFixed(
                        2
                      )} hrs already processed for payroll.`
                    : ''}
                </Alert>
              ) : null}
            </Grid>
          )}

          <Grid size={12}>
            <Divider textAlign="left" sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                EARNINGS
              </Typography>
            </Divider>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Pay Rate"
              value={form.payRate}
              onChange={(event) => setField('payRate', event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Regular Hours"
              value={form.regularHours}
              onChange={(event) => setField('regularHours', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              label="Gross Pay"
              value={form.regularAmount}
              onChange={(event) =>
                setField('regularAmount', event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={12}>
            <Divider textAlign="left" sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                WITHHOLDINGS
              </Typography>
            </Divider>
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Employee EI"
              value={form.eiAmount}
              onChange={(event) => setField('eiAmount', event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Employee CPP/QPP"
              value={form.cppAmount}
              onChange={(event) => setField('cppAmount', event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Income Tax"
              value={form.incomeTaxAmount}
              onChange={(event) =>
                setField('incomeTaxAmount', event.target.value)
              }
              helperText="Omitted from the stub when zero"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Other Deduction"
              value={form.otherDeductions}
              onChange={(event) =>
                setField('otherDeductions', event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
          </Grid>
          {toNumber(form.otherDeductions) > 0 && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Other Deduction Label"
                value={form.otherDeductionsLabel}
                onChange={(event) =>
                  setField('otherDeductionsLabel', event.target.value)
                }
                placeholder="e.g. Uniform"
              />
            </Grid>
          )}

          <Grid size={12}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Notes (optional)"
              value={form.notes}
              onChange={(event) => setField('notes', event.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
                p: 2,
                borderRadius: 1,
                background: colors.neutral[100],
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Gross Pay
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {money(grossPay)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Withholding Totals
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {money(totalWithholding)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Net Pay
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: netPay < 0 ? 'error.main' : colors.primary.main,
                  }}
                >
                  {money(netPay)}
                </Typography>
              </Box>
            </Box>
            {netPay < 0 && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Withholdings exceed gross pay — check the amounts.
              </Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave}>
          {saving ? 'Creating…' : 'Create Pay Stub'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PayStubDialog;
