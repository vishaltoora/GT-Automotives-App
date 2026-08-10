import { useCallback, useEffect, useRef, useState } from 'react';
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
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import {
  calculateVacationPay,
  CreatePayStubDto,
  DEFAULT_VACATION_PAY_RATE,
  PayPeriodsPerYear,
  PayrollHoursDto,
  PayStubDeductionEstimateDto,
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
  /**
   * An issued stub to correct. Passing one switches the dialog to amending
   * that stub instead of raising a new one.
   */
  payStub?: PayStubDto | null;
}

const today = () => format(new Date(), 'yyyy-MM-dd');
const toNumber = (value: string) => (value.trim() === '' ? 0 : Number(value));
const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Pay frequency drives every statutory figure, because the CRA formulas work by
 * annualizing the period's pay. The shop pays semi-monthly, so that is the
 * default, but it is an explicit field rather than something inferred from the
 * dates — a wrong guess here would quietly skew the tax on every stub.
 */
const PAY_FREQUENCIES: { value: PayPeriodsPerYear; label: string }[] = [
  { value: 24, label: 'Semi-monthly (24)' },
  { value: 26, label: 'Biweekly (26)' },
  { value: 52, label: 'Weekly (52)' },
  { value: 12, label: 'Monthly (12)' },
];

/** Withholding fields the calculator fills in and the accountant may override. */
type CalculatedField = 'eiAmount' | 'cppAmount' | 'incomeTaxAmount';

const emptyForm = {
  employeeId: '',
  periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  payDate: today(),
  position: '',
  payRate: '',
  regularHours: '',
  regularAmount: '',
  vacationPayRate: String(DEFAULT_VACATION_PAY_RATE),
  vacationPayAmount: '',
  vacationPayHeld: '',
  vacationPayPaidOut: '',
  payPeriodsPerYear: 24 as PayPeriodsPerYear,
  eiAmount: '',
  cppAmount: '',
  incomeTaxAmount: '',
  otherDeductions: '',
  otherDeductionsLabel: '',
  notes: '',
};

const noOverrides: Record<CalculatedField, boolean> = {
  eiAmount: false,
  cppAmount: false,
  incomeTaxAmount: false,
};

/**
 * Raise a pay stub for an employee.
 *
 * Hours, pay rate and gross pre-fill from the employee's approved time for the
 * selected period, excluding anything an earlier stub already paid. That comes
 * from the read-only payroll-hours endpoint — opening this form must not mark
 * anyone's time entries as processed as a side effect of looking at the
 * numbers. Saving does: raising the stub is what pays those hours, and the
 * server stamps them once the stub exists.
 *
 * EI, CPP and income tax are then calculated from the gross using the CRA's
 * withholding formulas for the pay date's year, and remain fully editable: the
 * moment the accountant types in one of those boxes it stops being recalculated
 * and their figure is what gets saved. The calculator assumes basic TD1 claim
 * amounts and no other deductible amounts, which is why overriding has to stay
 * easy rather than being treated as an error.
 */
export function PayStubDialog({
  open,
  onClose,
  onCreated,
  employees,
  initialEmployeeId,
  initialPeriodStart,
  initialPeriodEnd,
  payStub = null,
}: PayStubDialogProps) {
  const isEditing = Boolean(payStub);
  const [form, setForm] = useState({ ...emptyForm });
  const [hours, setHours] = useState<PayrollHoursDto | null>(null);
  const [loadingHours, setLoadingHours] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<PayStubDeductionEstimateDto | null>(
    null
  );
  const [estimating, setEstimating] = useState(false);
  // Which withholdings the accountant has typed over. An overridden field is
  // never rewritten by a later calculation — silently replacing a figure
  // someone deliberately entered is how wrong pay gets issued.
  const [overrides, setOverrides] =
    useState<Record<CalculatedField, boolean>>(noOverrides);
  // Mirrored in a ref so the estimate effect can respect overrides without
  // listing them as a dependency — claiming a field is not a reason to go and
  // ask the server for the same numbers again.
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;
  // Gross is derived from rate × hours until the accountant types one in.
  const [grossOverridden, setGrossOverridden] = useState(false);
  const grossOverriddenRef = useRef(grossOverridden);
  grossOverriddenRef.current = grossOverridden;
  // What the employee has banked, so a payout can be checked before saving
  // rather than being refused by the server.
  const [vacationBalance, setVacationBalance] = useState<number | null>(null);
  // Vacation figures are derived from the rate until typed over, same as gross.
  const [vacationOverridden, setVacationOverridden] = useState(false);
  const [vacationHeldOverridden, setVacationHeldOverridden] = useState(false);
  // Position comes from the employee's compensation record until typed over.
  const [positionOverridden, setPositionOverridden] = useState(false);
  const [carriedPosition, setCarriedPosition] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (payStub) {
      // Amending: load the stub as issued. Everything is treated as entered by
      // hand, because it was — the figures on an issued stub are what was
      // actually withheld, and reopening the form must not quietly recalculate
      // them out from under the accountant.
      setForm({
        ...emptyForm,
        employeeId: payStub.employeeId,
        periodStart: payStub.periodStart,
        periodEnd: payStub.periodEnd,
        payDate: payStub.payDate,
        position: payStub.position || '',
        payRate: payStub.payRate != null ? String(payStub.payRate) : '',
        regularHours: String(payStub.regularHours),
        regularAmount: String(payStub.regularAmount),
        vacationPayRate: String(payStub.vacationPayRate),
        vacationPayAmount: String(payStub.vacationPayAmount),
        vacationPayHeld: String(payStub.vacationPayHeld),
        vacationPayPaidOut: payStub.vacationPayPaidOut
          ? String(payStub.vacationPayPaidOut)
          : '',
        eiAmount: String(payStub.eiAmount),
        cppAmount: String(payStub.cppAmount),
        incomeTaxAmount: String(payStub.incomeTaxAmount),
        otherDeductions: String(payStub.otherDeductions),
        otherDeductionsLabel: payStub.otherDeductionsLabel || '',
        notes: payStub.notes || '',
      });
      setOverrides({
        eiAmount: true,
        cppAmount: true,
        incomeTaxAmount: true,
      });
      setGrossOverridden(true);
      // An issued stub's figures are what was actually paid, so reopening the
      // form must not recalculate them out from under the accountant.
      setVacationOverridden(true);
      setVacationHeldOverridden(true);
      setPositionOverridden(true);
    } else {
      setForm({
        ...emptyForm,
        employeeId: initialEmployeeId || '',
        periodStart: initialPeriodStart || emptyForm.periodStart,
        periodEnd: initialPeriodEnd || emptyForm.periodEnd,
      });
      setOverrides(noOverrides);
      setGrossOverridden(false);
      setVacationOverridden(false);
      setVacationHeldOverridden(false);
      setPositionOverridden(false);
    }

    setHours(null);
    setError(null);
    setEstimate(null);
    setCarriedPosition(false);
  }, [open, payStub, initialEmployeeId, initialPeriodStart, initialPeriodEnd]);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /** Typing in a calculated field claims it: hands off from here on. */
  const setWithholding = (field: CalculatedField, value: string) => {
    setOverrides((prev) => ({ ...prev, [field]: true }));
    setField(field, value);
  };

  /**
   * Rate and hours drive gross, so editing either recalculates it — the three
   * printed on the stub should always multiply out.
   *
   * Only while gross is still derived, though. Gross is the figure that
   * actually gets paid and it is not always a product: a salaried employee has
   * no meaningful hourly rate, and hourly pay can carry an agreed adjustment.
   * Once the accountant types a gross, rate and hours become the descriptive
   * detail they are on the printed stub and stop overwriting it.
   */
  const setEarnings = (field: 'payRate' | 'regularHours', value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (grossOverriddenRef.current) return next;

      const rate = toNumber(next.payRate);
      const hours = toNumber(next.regularHours);
      // An empty rate or hours means "not known yet", not "zero" — blanking the
      // gross the moment someone clears a box to retype it would be hostile.
      if (next.payRate.trim() === '' || next.regularHours.trim() === '') {
        return next;
      }
      return { ...next, regularAmount: String(round2(rate * hours)) };
    });
  };

  const derivedGross =
    form.payRate.trim() !== '' && form.regularHours.trim() !== ''
      ? round2(toNumber(form.payRate) * toNumber(form.regularHours))
      : null;

  /** Go back to rate × hours after a manual gross. */
  const restoreDerivedGross = () => {
    if (derivedGross === null) return;
    setGrossOverridden(false);
    setField('regularAmount', String(derivedGross));
  };

  const loadHours = useCallback(async () => {
    // Amending an issued stub never re-derives from approved time: the stub
    // records what was paid, not what the time entries say today.
    if (isEditing || !form.employeeId || !form.periodStart || !form.periodEnd) {
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
        // Hours an earlier stub already paid must not be offered again —
        // raising this stub is what pays whatever it is filled with.
        unprocessedOnly: true,
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
          // The job title comes from the employee's compensation record, set
          // alongside their pay rate. Left alone once typed over.
          position:
            result.position && !positionOverridden
              ? result.position
              : prev.position,
          // This employee's own entitlement — 6% after five years — rather than
          // the statutory minimum the form defaults to. Undefined means none is
          // recorded, so the default stands.
          vacationPayRate:
            result.vacationPayRate == null
              ? prev.vacationPayRate
              : String(result.vacationPayRate),
        }));
        setCarriedPosition(Boolean(result.position) && !positionOverridden);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load approved hours');
    } finally {
      setLoadingHours(false);
    }
  }, [
    isEditing,
    positionOverridden,
    form.employeeId,
    form.periodStart,
    form.periodEnd,
  ]);

  useEffect(() => {
    loadHours();
  }, [loadHours]);

  useEffect(() => {
    if (!open || !form.employeeId) {
      setVacationBalance(null);
      return;
    }
    let cancelled = false;
    payStubService
      .getVacationBalance(form.employeeId)
      .then((result) => {
        if (!cancelled) setVacationBalance(result.balance);
      })
      // A balance we cannot read must not block raising a stub; the server
      // still refuses a payout that exceeds it.
      .catch(() => {
        if (!cancelled) setVacationBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, form.employeeId]);

  const regularAmount = toNumber(form.regularAmount);

  /**
   * Vacation follows the earnings until the accountant types over it, the same
   * way gross follows rate × hours. The held line follows the accrual, since
   * banking the whole of it is the normal case.
   */
  const vacationPayAmount = vacationOverridden
    ? toNumber(form.vacationPayAmount)
    : calculateVacationPay(regularAmount, toNumber(form.vacationPayRate));
  const vacationPayHeld = vacationHeldOverridden
    ? toNumber(form.vacationPayHeld)
    : vacationPayAmount;

  // Vacation pay is insurable and pensionable, so the CRA estimate has to see
  // it — deducting on the earnings alone under-withholds on every stub.
  const grossPay = round2(regularAmount + vacationPayAmount);

  /**
   * Recalculate the statutory deductions whenever the inputs they depend on
   * change. Debounced so typing a gross does not fire a request per keystroke,
   * and the response is discarded if the inputs moved on while it was in
   * flight — a stale estimate landing in the fields would be worse than none.
   */
  useEffect(() => {
    if (!open) return;
    if (!form.employeeId || !form.payDate || !(grossPay > 0)) {
      setEstimate(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setEstimating(true);
        const result = await payStubService.estimateDeductions({
          employeeId: form.employeeId,
          payDate: form.payDate,
          grossPay,
          payPeriodsPerYear: form.payPeriodsPerYear,
        });
        if (cancelled) return;
        setEstimate(result);
        if (result.supported) {
          const claimed = overridesRef.current;
          setForm((prev) => ({
            ...prev,
            eiAmount: claimed.eiAmount ? prev.eiAmount : String(result.ei),
            cppAmount: claimed.cppAmount ? prev.cppAmount : String(result.cpp),
            incomeTaxAmount: claimed.incomeTaxAmount
              ? prev.incomeTaxAmount
              : String(result.incomeTax),
          }));
        }
      } catch (err: any) {
        if (!cancelled) {
          // A failed estimate must not block the stub: the accountant can still
          // type the figures in, which is exactly what they did before.
          setEstimate(null);
        }
      } finally {
        if (!cancelled) setEstimating(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, form.employeeId, form.payDate, form.payPeriodsPerYear, grossPay]);

  /** Put every calculated figure back, discarding the accountant's edits. */
  const restoreCalculated = () => {
    if (!estimate?.supported) return;
    setOverrides(noOverrides);
    setForm((prev) => ({
      ...prev,
      eiAmount: String(estimate.ei),
      cppAmount: String(estimate.cpp),
      incomeTaxAmount: String(estimate.incomeTax),
    }));
  };

  const hasOverride = Object.values(overrides).some(Boolean);

  const totalWithholding = round2(
    toNumber(form.eiAmount) +
      toNumber(form.cppAmount) +
      toNumber(form.incomeTaxAmount) +
      toNumber(form.otherDeductions) +
      vacationPayHeld
  );
  // Vacation taken from the bank. Added after withholding rather than into
  // gross: it was taxed in the period it was earned, so taxing it again would
  // take the same money off the employee twice.
  const vacationPayPaidOut = toNumber(form.vacationPayPaidOut);
  const netPay = round2(grossPay - totalWithholding + vacationPayPaidOut);
  // Only claimed when the balance is known — an unreadable balance should not
  // stop a stub being raised.
  const payoutExceedsBank =
    vacationBalance !== null && vacationPayPaidOut > vacationBalance;

  const canSave =
    Boolean(form.employeeId) &&
    Boolean(form.periodStart) &&
    Boolean(form.periodEnd) &&
    Boolean(form.payDate) &&
    form.regularAmount.trim() !== '' &&
    netPay >= 0 &&
    vacationPayHeld <= vacationPayAmount &&
    !payoutExceedsBank &&
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
        regularAmount: regularAmount,
        vacationPayRate: toNumber(form.vacationPayRate),
        vacationPayAmount,
        vacationPayHeld,
        vacationPayPaidOut,
        eiAmount: toNumber(form.eiAmount),
        cppAmount: toNumber(form.cppAmount),
        incomeTaxAmount: toNumber(form.incomeTaxAmount),
        otherDeductions: toNumber(form.otherDeductions),
        otherDeductionsLabel: form.otherDeductionsLabel || undefined,
        notes: form.notes || undefined,
      };
      // Amending sends the same fields minus the employee, which a stub can
      // never change: it belongs to one person's year-to-date record.
      const saved = payStub
        ? await payStubService.update(payStub.id, {
            ...dto,
            employeeId: undefined,
          } as any)
        : await payStubService.create(dto);
      onCreated(saved);
      onClose();
    } catch (err: any) {
      setError(
        err.message || `Failed to ${payStub ? 'update' : 'create'} the pay stub`
      );
    } finally {
      setSaving(false);
    }
  };

  const money = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);

  // The options come from employees with payroll hours, so an employee who has
  // since left — or simply logged no time this period — would not be in the
  // list. On an amendment their name still has to show, not an empty box.
  const employeeOptions =
    payStub && !employees.some((option) => option.id === payStub.employeeId)
      ? [...employees, { id: payStub.employeeId, name: payStub.employeeName }]
      : employees;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? 'Edit Pay Stub' : 'Create Pay Stub'}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isEditing && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Correcting an issued pay stub. Saving recomputes this employee's
            year-to-date totals on this and every later stub in the year, and
            the change is recorded in the audit log.
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
              // A stub belongs to one person's year-to-date record; moving it
              // would corrupt both. Re-raise it against the right employee.
              disabled={isEditing}
              helperText={
                isEditing ? 'Cannot be changed on an issued stub' : undefined
              }
            >
              {employeeOptions.map((employee) => (
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
              onChange={(event) => {
                setPositionOverridden(true);
                setCarriedPosition(false);
                setField('position', event.target.value);
              }}
              placeholder="e.g. Business Manager"
              helperText={
                carriedPosition ? 'From the compensation record' : ' '
              }
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
                  No unpaid approved hours for this period. Either the time
                  entries still need approving, or an earlier stub has already
                  paid them — enter the figures manually if this is deliberate.
                </Alert>
              ) : hours ? (
                <Alert severity="success">
                  Pre-filled from {hours.entryCount} approved{' '}
                  {hours.entryCount === 1 ? 'entry' : 'entries'} (
                  {hours.hours.toFixed(2)} hrs). Raising this stub marks them
                  paid, so they will not appear on another one.
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
              onChange={(event) => setEarnings('payRate', event.target.value)}
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
              onChange={(event) =>
                setEarnings('regularHours', event.target.value)
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              required
              size="small"
              type="number"
              label="Regular Earnings"
              value={form.regularAmount}
              onChange={(event) => {
                setGrossOverridden(true);
                setField('regularAmount', event.target.value);
              }}
              helperText={
                grossOverridden
                  ? derivedGross !== null
                    ? `Entered by hand — rate × hours is ${money(derivedGross)}`
                    : 'Entered by hand'
                  : derivedGross !== null
                  ? 'Rate × hours'
                  : ' '
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                endAdornment:
                  grossOverridden && derivedGross !== null ? (
                    <InputAdornment position="end">
                      <Tooltip title="Use rate × hours">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={restoreDerivedGross}
                        >
                          <CalculateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ) : undefined,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Vacation Pay Rate"
              value={form.vacationPayRate}
              onChange={(event) => {
                // A new rate means a new accrual. Leaving a typed-over amount
                // in place would print "Vacation Pay (6%) $122.88" against
                // $3,072 of earnings — a rate the figure beside it contradicts.
                setVacationOverridden(false);
                setVacationHeldOverridden(false);
                setForm((prev) => ({
                  ...prev,
                  vacationPayRate: event.target.value,
                  vacationPayAmount: '',
                  vacationPayHeld: '',
                }));
              }}
              helperText={`${DEFAULT_VACATION_PAY_RATE}% statutory minimum, 6% after 5 years`}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Vacation Pay Earned"
              value={
                vacationOverridden
                  ? form.vacationPayAmount
                  : vacationPayAmount === 0
                  ? ''
                  : String(vacationPayAmount)
              }
              onChange={(event) => {
                setVacationOverridden(true);
                setField('vacationPayAmount', event.target.value);
              }}
              helperText={
                vacationOverridden
                  ? 'Entered by hand'
                  : 'Rate × regular earnings'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                endAdornment: vacationOverridden ? (
                  <InputAdornment position="end">
                    <Tooltip title="Use the calculated accrual">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => {
                          // Held follows the accrual again too. Restoring one
                          // without the other leaves the difference silently
                          // paid out.
                          setVacationOverridden(false);
                          setVacationHeldOverridden(false);
                          setForm((prev) => ({
                            ...prev,
                            vacationPayAmount: '',
                            vacationPayHeld: '',
                          }));
                        }}
                      >
                        <CalculateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Gross Pay
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {money(grossPay)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Vacation Paid Out"
              value={form.vacationPayPaidOut}
              onChange={(event) =>
                setField('vacationPayPaidOut', event.target.value)
              }
              error={payoutExceedsBank}
              helperText={
                payoutExceedsBank
                  ? `Only ${money(vacationBalance ?? 0)} is banked`
                  : vacationBalance === null
                  ? 'Paid from banked vacation — not taxed again'
                  : `${money(vacationBalance)} available, already taxed`
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

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Pay Frequency"
              value={form.payPeriodsPerYear}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  payPeriodsPerYear: Number(
                    event.target.value
                  ) as PayPeriodsPerYear,
                }))
              }
              helperText="Sets how the CRA formulas annualize this pay"
            >
              {PAY_FREQUENCIES.map((frequency) => (
                <MenuItem key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            {estimating ? (
              <Alert severity="info">Calculating deductions…</Alert>
            ) : estimate && !estimate.supported ? (
              <Alert severity="warning">{estimate.assumptions[0]}</Alert>
            ) : estimate?.supported ? (
              <Alert
                severity={hasOverride ? 'warning' : 'success'}
                action={
                  hasOverride ? (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={restoreCalculated}
                    >
                      Use calculated
                    </Button>
                  ) : undefined
                }
              >
                <Typography variant="body2">
                  {hasOverride
                    ? 'Some withholdings were entered by hand and are no longer being recalculated.'
                    : `Calculated from gross using ${estimate.taxYear} CRA rates.`}{' '}
                  Federal {money(estimate.federalTax)} + BC{' '}
                  {money(estimate.provincialTax)} income tax
                  {estimate.cpp2 > 0
                    ? `, including ${money(estimate.cpp2)} CPP2`
                    : ''}
                  .
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {estimate.assumptions.join(' ')}
                </Typography>
              </Alert>
            ) : null}
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Employee EI"
              value={form.eiAmount}
              onChange={(event) =>
                setWithholding('eiAmount', event.target.value)
              }
              helperText={
                overrides.eiAmount
                  ? 'Entered by hand'
                  : estimate?.supported
                  ? estimate.eiMaxedOut
                    ? 'Annual maximum reached'
                    : 'Calculated'
                  : ' '
              }
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
              onChange={(event) =>
                setWithholding('cppAmount', event.target.value)
              }
              helperText={
                overrides.cppAmount
                  ? 'Entered by hand'
                  : estimate?.supported
                  ? estimate.cppMaxedOut
                    ? 'Annual maximum reached'
                    : 'Calculated'
                  : ' '
              }
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
                setWithholding('incomeTaxAmount', event.target.value)
              }
              helperText={
                overrides.incomeTaxAmount
                  ? 'Entered by hand'
                  : estimate?.supported
                  ? 'Federal + BC, claim code 1'
                  : 'Omitted from the stub when zero'
              }
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
              label="Vacation Pay Held"
              value={
                vacationHeldOverridden
                  ? form.vacationPayHeld
                  : vacationPayHeld === 0
                  ? ''
                  : String(vacationPayHeld)
              }
              onChange={(event) => {
                setVacationHeldOverridden(true);
                setField('vacationPayHeld', event.target.value);
              }}
              error={vacationPayHeld > vacationPayAmount}
              helperText={
                vacationPayHeld > vacationPayAmount
                  ? 'Cannot hold back more vacation than was earned'
                  : vacationHeldOverridden
                  ? 'Entered by hand — the rest is paid out'
                  : 'Banked, so net pay is unchanged'
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                endAdornment: vacationHeldOverridden ? (
                  <InputAdornment position="end">
                    <Tooltip title="Hold the whole accrual">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => {
                          setVacationHeldOverridden(false);
                          setField('vacationPayHeld', '');
                        }}
                      >
                        <CalculateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : undefined,
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
          {saving
            ? isEditing
              ? 'Saving…'
              : 'Creating…'
            : isEditing
            ? 'Save Changes'
            : 'Create Pay Stub'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PayStubDialog;
