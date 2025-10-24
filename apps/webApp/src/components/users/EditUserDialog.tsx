import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import { useError } from '../../app/contexts/ErrorContext';
import { PhoneInput } from '../../app/components/common/PhoneInput';
import axios from 'axios';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

interface EditUserDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  user,
  onClose,
  onUserUpdated,
}) => {
  const { getToken } = useAuth();
  const { showError, showInfo } = useError();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
    roleName: 'STAFF' as 'ADMIN' | 'STAFF',
    smsEnabled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load existing SMS preferences when user data loads
  const loadSmsPreferences = async (userId: string) => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/api/sms/preferences/user?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormData(prev => ({ ...prev, smsEnabled: response.data.optedIn || false }));
    } catch (error) {
      console.error('Failed to load SMS preferences:', error);
      // Don't show error to user - just default to disabled
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        isActive: user.isActive,
        roleName: user.role.name as 'ADMIN' | 'STAFF',
        smsEnabled: false, // Will be updated by loadSmsPreferences
      });

      // Load SMS preferences for this user
      if (user.phone) {
        loadSmsPreferences(user.id);
      }
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateBasicInfo = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      // Save SMS preferences if phone number is provided
      if (formData.phone) {
        try {
          const token = await getToken();
          await axios.post(
            `${API_URL}/api/sms/preferences/user`,
            {
              userId: user.id,
              optedIn: formData.smsEnabled,
              appointmentAlerts: formData.smsEnabled,
              scheduleReminders: formData.smsEnabled,
              dailySummary: formData.smsEnabled,
              urgentAlerts: formData.smsEnabled,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (smsError) {
          console.error('Failed to save SMS preferences:', smsError);
          // Don't fail the whole operation if SMS preferences fail
        }
      }

      showInfo('User updated successfully');
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating user:', error);
      showError(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (formData.roleName === user.role.name) {
      showInfo('No role change detected');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(`/api/users/${user.id}/role-by-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roleName: formData.roleName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update role');
      }

      showInfo('User role updated successfully');
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating role:', error);
      showError(error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update basic info first
    await handleUpdateBasicInfo();

    // Then update role if changed
    if (formData.roleName !== user.role.name) {
      await handleUpdateRole();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Basic Information
            </Typography>
            
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={!!errors.firstName}
                helperText={errors.firstName}
                fullWidth
                required
              />

              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={!!errors.lastName}
                helperText={errors.lastName}
                fullWidth
                required
              />
            </Stack>

            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              label="Phone Number"
              placeholder="555-123-4567"
              fullWidth
            />

            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.smsEnabled}
                    onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
                    disabled={!formData.phone}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Enable SMS Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.phone
                        ? 'Receive appointment alerts, schedule reminders, and urgent notifications'
                        : 'Add a phone number to enable SMS'}
                    </Typography>
                  </Box>
                }
              />
            </Box>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Account Settings
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.roleName}
                label="Role"
                onChange={(e) => setFormData({ ...formData, roleName: e.target.value as 'ADMIN' | 'STAFF' })}
              >
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
              <FormHelperText>
                Changing role will affect user permissions
              </FormHelperText>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Account Active"
            />
            {!formData.isActive && (
              <Typography variant="caption" color="error">
                Inactive users cannot log in to the system
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditUserDialog;