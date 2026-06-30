import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import {
  PayoutRule,
  payoutRuleService,
  CreatePayoutRuleDto,
  DEFAULT_PAYOUT_PERCENTAGE,
} from '../../../requests/payout-rule.requests';
import { NumberInput } from '../../../components/common';
import { useConfirmation } from '../../../contexts/ConfirmationContext';
import { useError } from '../../../contexts/ErrorContext';

interface RuleDialogProps {
  open: boolean;
  rule?: PayoutRule;
  onClose: () => void;
  onSave: (dto: CreatePayoutRuleDto) => Promise<void>;
}

const RuleDialog: React.FC<RuleDialogProps> = ({
  open,
  rule,
  onClose,
  onSave,
}) => {
  const [triggerAmount, setTriggerAmount] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTriggerAmount(rule ? String(rule.triggerAmount) : '');
      setPayoutAmount(rule ? String(rule.payoutAmount) : '');
      setDescription(rule?.description ?? '');
      setIsActive(rule?.isActive ?? true);
      setError(null);
    }
  }, [open, rule]);

  const handleSave = async () => {
    const trigger = parseFloat(triggerAmount);
    const payout = parseFloat(payoutAmount);
    if (!isFinite(trigger) || trigger <= 0) {
      setError('Trigger amount must be greater than 0');
      return;
    }
    if (!isFinite(payout) || payout < 0) {
      setError('Payout amount must be 0 or greater');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        triggerAmount: trigger,
        payoutAmount: payout,
        description: description.trim() || undefined,
        isActive,
      });
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to save rule'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{rule ? 'Edit Payout Rule' : 'New Payout Rule'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <NumberInput
            label="Appointment Total (Trigger)"
            allowDecimals
            min={0}
            value={triggerAmount}
            onChange={(v) => setTriggerAmount(v === undefined ? '' : String(v))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            helperText="When the appointment payment equals this amount, this rule applies"
            fullWidth
          />
          <NumberInput
            label="Total Payout (Pool)"
            allowDecimals
            min={0}
            value={payoutAmount}
            onChange={(v) => setPayoutAmount(v === undefined ? '' : String(v))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            helperText="Pool split equally among the employees who completed the appointment"
            fullWidth
          />
          <TextField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Standard tire mount + balance"
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <Typography variant="body2">
              {isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PayoutRulesManagement: React.FC = () => {
  const [rules, setRules] = useState<PayoutRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PayoutRule | undefined>();
  const { confirm } = useConfirmation();
  const { showError } = useError();

  const load = async () => {
    setLoading(true);
    try {
      const data = await payoutRuleService.list();
      setRules(data);
    } catch (err: any) {
      showError({
        title: 'Failed to load payout rules',
        message: err?.response?.data?.message || err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (dto: CreatePayoutRuleDto) => {
    if (editing) {
      await payoutRuleService.update(editing.id, dto);
    } else {
      await payoutRuleService.create(dto);
    }
    await load();
  };

  const handleDelete = async (rule: PayoutRule) => {
    const confirmed = await confirm({
      title: 'Delete Payout Rule',
      message: `Delete the rule for $${Number(rule.triggerAmount).toFixed(2)}?`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!confirmed) return;
    try {
      await payoutRuleService.remove(rule.id);
      await load();
    } catch (err: any) {
      showError({
        title: 'Failed to delete rule',
        message: err?.response?.data?.message || err?.message,
      });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Appointment Payout Rules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When an appointment is completed for one of these amounts, the
            payout pool below is split equally among the employees who completed
            it. Anything not in the table falls back to{' '}
            {Math.round(DEFAULT_PAYOUT_PERCENTAGE * 100)}% of the appointment
            total.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          New Rule
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : rules.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CalculateIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No payout rules yet. All completed appointments will use the{' '}
              {Math.round(DEFAULT_PAYOUT_PERCENTAGE * 100)}% default.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Appointment Total</TableCell>
                  <TableCell>Total Payout</TableCell>
                  <TableCell>Effective %</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => {
                  const trigger = Number(rule.triggerAmount);
                  const payout = Number(rule.payoutAmount);
                  const pct = trigger > 0 ? (payout / trigger) * 100 : 0;
                  return (
                    <TableRow key={rule.id} hover>
                      <TableCell>${trigger.toFixed(2)}</TableCell>
                      <TableCell>${payout.toFixed(2)}</TableCell>
                      <TableCell>{pct.toFixed(1)}%</TableCell>
                      <TableCell>{rule.description ?? '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={rule.isActive ? 'Active' : 'Inactive'}
                          color={rule.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(rule);
                              setDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(rule)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <RuleDialog
        open={dialogOpen}
        rule={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
};

export default PayoutRulesManagement;
