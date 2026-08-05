import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { companyService, Company } from '../../requests/company.requests';
import { colors } from '../../theme/colors';

/**
 * System settings for admins.
 *
 * Currently holds the invoice terms & conditions. Those are a liability
 * statement owned by the business, so they live on the Company record and are
 * edited here rather than being baked into the invoice templates — the wording
 * can change without a deploy.
 */
export function Settings() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SettingsIcon color="primary" />
        <Typography variant="h5">Settings</Typography>
      </Box>

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
        {companies.map((company) => (
          <Card key={company.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{company.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {company.registrationNumber}
                {company.isDefault ? ' — default company' : ''}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <TextField
                fullWidth
                multiline
                minRows={6}
                label="Terms & Conditions"
                value={drafts[company.id] ?? ''}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [company.id]: e.target.value,
                  }))
                }
                helperText={`${
                  (drafts[company.id] ?? '').length
                } / 4000 characters`}
                slotProps={{ htmlInput: { maxLength: 4000 } }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 2,
                  mt: 2,
                }}
              >
                {savedId === company.id && (
                  <Typography
                    variant="caption"
                    sx={{ color: colors.semantic.success }}
                  >
                    Saved
                  </Typography>
                )}
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={() => handleSave(company)}
                  disabled={
                    savingId === company.id ||
                    (drafts[company.id] ?? '') ===
                      (company.termsAndConditions ?? '')
                  }
                >
                  {savingId === company.id ? 'Saving…' : 'Save'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default Settings;
