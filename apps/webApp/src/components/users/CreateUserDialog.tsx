import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import { useError } from '../../app/contexts/ErrorContext';
import { PhoneInput } from '../../app/components/common/PhoneInput';
import axios from 'axios';

// @ts-ignore - TypeScript doesn't recognize import.meta.env properly in some contexts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onUserCreated,
}) => {
  const { getToken } = useAuth();
  const { showError, showInfo, showWarning } = useError();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roleName: 'STAFF' as 'ADMIN' | 'STAFF',
    smsEnabled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const response = await fetch('/api/users/admin-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          roleName: formData.roleName,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server error response:', error);

        // Extract more detailed error message
        let errorMessage = error.message || 'Failed to create user';

        // Check for specific Clerk errors
        if (errorMessage.includes('already exists') || errorMessage.includes('identifier_already_exists')) {
          errorMessage = 'A user with this email or username already exists';
        } else if (errorMessage.includes('password')) {
          errorMessage = 'Password does not meet minimum requirements. Please use a different password.';
        } else if (errorMessage.includes('username')) {
          errorMessage = 'Username is invalid or already taken. Please try a different username.';
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Save SMS preferences if phone number is provided
      if (result.id && formData.phone) {
        try {
          const token = await getToken();
          await axios.post(
            `${API_URL}/api/sms/preferences/user`,
            {
              userId: result.id,
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
          // Don't fail the whole operation
        }
      }

      if (result.clerkCreated) {
        showInfo('User created successfully with Clerk authentication');
      } else {
        showWarning('User created successfully (Clerk not configured)');
      }

      onUserCreated();
      handleClose();
    } catch (error: any) {
      console.error('Error creating user:', error);
      showError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleName: 'STAFF',
      smsEnabled: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              This will create an admin or staff user who can log in to manage the system.
            </Alert>
            
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

            <TextField
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
              error={!!errors.username}
              helperText={errors.username || 'User can login with username or email'}
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

            <Box>
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

            <FormControl fullWidth required>
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
                Admins have full system access, Staff have limited access
              </FormHelperText>
            </FormControl>

            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={!!errors.password}
              helperText={errors.password || 'Minimum 8 characters (any combination)'}
              fullWidth
              required
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateUserDialog;