import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

interface SmsPreferenceData {
  id: string;
  customerId?: string;
  userId?: string;
  optedIn: boolean;
  appointmentReminders: boolean;
  serviceUpdates: boolean;
  promotional: boolean;
  appointmentAlerts: boolean;
  scheduleReminders: boolean;
  dailySummary: boolean;
  urgentAlerts: boolean;
}

interface SmsPreferencesProps {
  customerId?: string;
  userId?: string;
  userType: 'customer' | 'user'; // customer or staff/admin
}

export const SmsPreferences: React.FC<SmsPreferencesProps> = ({ customerId, userId, userType }) => {
  const [preferences, setPreferences] = useState<SmsPreferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [customerId, userId]);

  const loadPreferences = async () => {
    try {
      const endpoint = userType === 'customer'
        ? `/api/sms/preferences/customer?customerId=${customerId}`
        : `/api/sms/preferences/user?userId=${userId}`;

      const response = await axios.get(endpoint);
      setPreferences(response.data);
    } catch (err) {
      setError('Failed to load SMS preferences');
      console.error('Failed to load SMS preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const endpoint = userType === 'customer'
        ? '/api/sms/preferences/customer'
        : '/api/sms/preferences/user';

      await axios.post(endpoint, preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save preferences');
      console.error('Failed to save SMS preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          SMS Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {userType === 'customer'
            ? 'Manage your text message preferences for appointment reminders and updates.'
            : 'Manage your text message preferences for work notifications and summaries.'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Preferences saved successfully!</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.optedIn}
                onChange={(e) => setPreferences({ ...preferences, optedIn: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Enable SMS Notifications</Typography>
                <Typography variant="caption" color="text.secondary">
                  Receive text messages from GT Automotives
                </Typography>
              </Box>
            }
          />

          {preferences.optedIn && (
            <>
              {userType === 'customer' ? (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.appointmentReminders}
                        onChange={(e) =>
                          setPreferences({ ...preferences, appointmentReminders: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Appointment Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get reminders 7 days, 3 days, and 24 hours before your appointment
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.serviceUpdates}
                        onChange={(e) => setPreferences({ ...preferences, serviceUpdates: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Service Updates</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when your vehicle service is complete and ready for pickup
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.promotional}
                        onChange={(e) => setPreferences({ ...preferences, promotional: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Promotional Messages</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive occasional special offers and promotions (max 4 per month)
                        </Typography>
                      </Box>
                    }
                  />
                </>
              ) : (
                <>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.appointmentAlerts}
                        onChange={(e) =>
                          setPreferences({ ...preferences, appointmentAlerts: e.target.checked })
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Appointment Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when new appointments are assigned to you
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.scheduleReminders}
                        onChange={(e) => setPreferences({ ...preferences, scheduleReminders: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Schedule Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive daily schedule summary each morning at 8 AM
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.dailySummary}
                        onChange={(e) => setPreferences({ ...preferences, dailySummary: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Daily Summary</Typography>
                        <Typography variant="caption" color="text.secondary">
                          End of day summary with revenue, completions, and metrics (Admin)
                        </Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.urgentAlerts}
                        onChange={(e) => setPreferences({ ...preferences, urgentAlerts: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1">Urgent Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Critical issues requiring immediate attention (Admin)
                        </Typography>
                      </Box>
                    }
                  />
                </>
              )}
            </>
          )}

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Standard messaging rates may apply. Reply STOP to any message to opt-out.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
