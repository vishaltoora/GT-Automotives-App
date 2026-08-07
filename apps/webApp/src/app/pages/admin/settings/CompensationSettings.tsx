import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Save, WorkspacePremium } from '@mui/icons-material';
import {
  DEFAULT_VACATION_PAY_RATE,
  PayType,
  UpsertEmployeeCompensationDto,
} from '@gt-automotive/data';
import { NumberInput } from '../../../components/common';
import { User, userService } from '../../../requests/user.requests';
import { timeClockService } from '../../../requests/time-clock.requests';
import { colors } from '../../../theme/colors';

/**
 * How each employee is paid, and one-off bonuses.
 *
 * This is a setting, not a day's work: the standing arrangement changes rarely
 * and decides what every future pay stub says. It used to be a tab inside Time
 * Clock, which put it next to this period's hours and made it look like part of
 * reviewing them. Processing payroll for a period stayed behind in Time Clock,
 * where the hours are.
 */
export function CompensationSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [payType, setPayType] = useState<PayType>(PayType.HOURLY);
  const [hourlyRate, setHourlyRate] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  // Blank means the statutory minimum applies — only an entitlement above it
  // needs recording here.
  const [vacationPayRate, setVacationPayRate] = useState('');
  // Job title for this employee's pay stubs. Kept with pay because it is set
  // by the same person at the same moment, and it is what a stub prints.
  const [position, setPosition] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await userService.getUsers();
        const employees = userData.filter((user) =>
          ['ADMIN', 'FOREMAN', 'SUPERVISOR', 'STAFF'].includes(
            user.role?.name || ''
          )
        );
        setUsers(employees);
        if (employees[0]) setSelectedEmployeeId(employees[0].id);
      } catch (err: any) {
        setError(err.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    void loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    const loadCompensation = async () => {
      try {
        const compensation = await timeClockService.getCompensation(
          selectedEmployeeId
        );
        if (compensation) {
          setPayType(compensation.payType);
          setPosition(compensation.position || '');
          setHourlyRate(compensation.hourlyRate?.toString() || '');
          setAnnualSalary(compensation.annualSalary?.toString() || '');
          setVacationPayRate(compensation.vacationPayRate?.toString() || '');
        } else {
          setPayType(PayType.HOURLY);
          setPosition('');
          setHourlyRate('');
          setAnnualSalary('');
          setVacationPayRate('');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load compensation');
      }
    };

    void loadCompensation();
  }, [selectedEmployeeId]);

  const saveCompensation = async () => {
    if (!selectedEmployeeId) return;
    const payload: UpsertEmployeeCompensationDto = {
      payType,
      position: position.trim() || undefined,
      hourlyRate: payType === PayType.HOURLY ? Number(hourlyRate) : undefined,
      annualSalary:
        payType === PayType.SALARIED ? Number(annualSalary) : undefined,
      // Left off entirely when blank, so the pay stub falls back to the
      // statutory minimum rather than being told the rate is zero.
      vacationPayRate:
        vacationPayRate.trim() === '' ? undefined : Number(vacationPayRate),
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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

      <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Compensation &amp; Bonus
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set how an employee is paid from now on, or pay them a one-off
            bonus. Both apply to the employee selected below.
          </Typography>
          {/* Two jobs share this card and one employee selector: setting how
              someone is paid from now on, and paying a one-off bonus now.
              They are kept as labelled groups so the standing arrangement is
              not confused with a single payment. Rows add to 12 columns, and
              the buttons match the 56px input height so each group reads as
              one control strip. */}
          <Grid container spacing={2} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Employee"
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                helperText="Applies to both compensation and bonus below"
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.role?.name})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <Divider textAlign="left">
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  HOW THIS EMPLOYEE IS PAID
                </Typography>
              </Divider>
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
              <NumberInput
                fullWidth
                allowDecimals
                min={0}
                label={
                  payType === PayType.HOURLY ? 'Hourly Rate' : 'Annual Salary'
                }
                value={payType === PayType.HOURLY ? hourlyRate : annualSalary}
                onChange={(v) => {
                  const next = v === undefined ? '' : String(v);
                  payType === PayType.HOURLY
                    ? setHourlyRate(next)
                    : setAnnualSalary(next);
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                placeholder="e.g. Tire Technician"
                helperText="Optional — printed on this employee's pay stubs"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <NumberInput
                fullWidth
                allowDecimals
                min={0}
                label="Vacation Pay %"
                value={vacationPayRate}
                onChange={(v) =>
                  setVacationPayRate(v === undefined ? '' : String(v))
                }
                helperText={`Blank = ${DEFAULT_VACATION_PAY_RATE}% minimum`}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Save />}
                onClick={saveCompensation}
                disabled={saving || !selectedEmployeeId}
                sx={{ height: 56 }}
              >
                Save
              </Button>
            </Grid>

            <Grid size={12}>
              <Divider textAlign="left" sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ONE-OFF BONUS
                </Typography>
              </Divider>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <NumberInput
                fullWidth
                allowDecimals
                min={0}
                label="Bonus Amount"
                value={bonusAmount}
                onChange={(v) =>
                  setBonusAmount(v === undefined ? '' : String(v))
                }
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
                disabled={
                  saving || !selectedEmployeeId || !bonusAmount || !bonusReason
                }
                sx={{ height: 56 }}
              >
                Add Bonus
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CompensationSettings;
