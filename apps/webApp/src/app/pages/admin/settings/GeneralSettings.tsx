import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Gavel as GavelIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { companyService, Company } from '../../../requests/company.requests';
import { colors } from '../../../theme/colors';

/**
 * The General tab of system settings.
 *
 * Holds the time clock's shop-hours window and the invoice terms & conditions. Those are a liability statement owned
 * by the business, so they live on the Company record and are edited here
 * rather than being baked into the invoice templates — the wording can change
 * without a deploy.
 */
export function GeneralSettings() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  // The terms are read-only until Edit is pressed. They print on every invoice
  // and are a liability statement, so they should not be a field you can change
  // by clicking into it by accident.
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getCompanies(true);
      setCompanies(data);
      setDrafts(
        Object.fromEntries(
          data.map((company) => [company.id, company.termsAndConditions ?? ''])
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setError(null);
    setSavedId(null);
    setDrafts((prev) => ({
      ...prev,
      [company.id]: company.termsAndConditions ?? '',
    }));
    setEditingId(company.id);
  };

  /** Discard the draft and drop back to read-only. */
  const handleCancel = (company: Company) => {
    setDrafts((prev) => ({
      ...prev,
      [company.id]: company.termsAndConditions ?? '',
    }));
    setEditingId(null);
    setError(null);
  };

  const handleSave = async (company: Company) => {
    setSavingId(company.id);
    setError(null);
    setSavedId(null);
    try {
      const updated = await companyService.updateTermsAndConditions(
        company.id,
        drafts[company.id] ?? ''
      );
      setCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setSavedId(company.id);
      setEditingId(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to save terms and conditions'
      );
    } finally {
      setSavingId(null);
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
      <TimeClockHoursCard
        company={companies.find((company) => company.isDefault)}
        onSaved={(updated) =>
          setCompanies((prev) =>
            prev.map((company) =>
              company.id === updated.id ? updated : company
            )
          )
        }
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <GavelIcon color="primary" fontSize="small" />
        <Typography variant="h6">Invoice Terms &amp; Conditions</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Terms &amp; conditions print at the bottom of every invoice for the
        company, directly above the customer signature. Leave blank to print no
        terms at all.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {companies.map((company) => {
          const isEditing = editingId === company.id;
          const isSaving = savingId === company.id;
          const draft = drafts[company.id] ?? '';
          const saved = company.termsAndConditions ?? '';

          return (
            <Card key={company.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{company.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {company.registrationNumber}
                  {company.isDefault ? ' — default company' : ''}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    minRows={6}
                    autoFocus
                    label="Terms & Conditions"
                    value={draft}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [company.id]: e.target.value,
                      }))
                    }
                    helperText={`${draft.length} / 4000 characters`}
                    slotProps={{ htmlInput: { maxLength: 4000 } }}
                    disabled={isSaving}
                  />
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      minHeight: 120,
                      border: `1px solid ${colors.neutral[200]}`,
                      borderRadius: 1,
                      backgroundColor: colors.neutral[50],
                    }}
                  >
                    {saved ? (
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {saved}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No terms set — nothing will print on this company's
                        invoices.
                      </Typography>
                    )}
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {savedId === company.id && !isEditing && (
                    <Typography
                      variant="caption"
                      sx={{ color: colors.semantic.success }}
                    >
                      Saved
                    </Typography>
                  )}

                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => handleCancel(company)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={() => handleSave(company)}
                        disabled={isSaving || draft === saved}
                      >
                        {isSaving ? 'Saving…' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(company)}
                      // Editing one company at a time keeps "unsaved changes"
                      // unambiguous.
                      disabled={!!editingId}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

export default GeneralSettings;

/**
 * The window the employee time clock is open for.
 *
 * Held as a setting rather than in code because the shop's hours change
 * seasonally, and because switching the window off has to be possible without a
 * deploy if it ever gets in the way of real work.
 */
function TimeClockHoursCard({
  company,
  onSaved,
}: {
  company?: Company;
  onSaved: (company: Company) => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const [opensAt, setOpensAt] = useState('08:00');
  const [closesAt, setClosesAt] = useState('20:00');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setEnabled(company.timeClockWindowEnabled ?? true);
    setOpensAt(company.timeClockOpensAt ?? '08:00');
    setClosesAt(company.timeClockClosesAt ?? '20:00');
  }, [company]);

  if (!company) return null;

  const invalid = closesAt <= opensAt;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await companyService.updateTimeClockHours(company.id, {
        timeClockWindowEnabled: enabled,
        timeClockOpensAt: opensAt,
        timeClockClosesAt: closesAt,
      });
      onSaved(updated);
      setSaved(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to save the time clock hours'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <ScheduleIcon color="primary" fontSize="small" />
          <Typography variant="h6">Time Clock Hours</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Staff can only clock themselves in inside this window, and any shift
          still running at closing time is clocked out automatically so a
          forgotten clock-out cannot accrue overnight. Those entries are flagged
          and left unapproved for review. Admins are never restricted — record
          overtime by editing the time entry.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {saved && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSaved(false)}
          >
            Time clock hours updated.
          </Alert>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={saving}
            />
          }
          label="Enforce shop hours on the time clock"
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <TextField
            type="time"
            label="Opens at"
            value={opensAt}
            onChange={(e) => setOpensAt(e.target.value)}
            disabled={saving || !enabled}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            type="time"
            label="Closes at"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            disabled={saving || !enabled}
            error={invalid}
            helperText={invalid ? 'Closing must be after opening' : ' '}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || invalid}
            sx={{ height: 56 }}
          >
            {saving ? 'Saving…' : 'Save Hours'}
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Times are the shop's local time (America/Vancouver).
        </Typography>
      </CardContent>
    </Card>
  );
}
