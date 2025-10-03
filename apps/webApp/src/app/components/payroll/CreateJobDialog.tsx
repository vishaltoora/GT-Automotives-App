import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Slide,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CreateJobDto, JobType } from '@gt-automotive/data';
import { jobService } from '../../services/job.service';
import { userService } from '../../services/user.service';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CreateJobDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (job: any) => void;
  preselectedEmployeeId?: string;
  hideEmployeeSelect?: boolean;
}

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export const CreateJobDialog: React.FC<CreateJobDialogProps> = ({
  open,
  onClose,
  onSuccess,
  preselectedEmployeeId,
  hideEmployeeSelect = false,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<CreateJobDto>({
    employeeId: preselectedEmployeeId || '',
    title: '',
    description: '',
    payAmount: 0,
    jobType: JobType.REGULAR,
    dueDate: '',
  });

  useEffect(() => {
    if (open) {
      if (!hideEmployeeSelect) {
        fetchEmployees();
      }
      setFormData({
        employeeId: preselectedEmployeeId || '',
        title: '',
        description: '',
        payAmount: 0,
        jobType: JobType.REGULAR,
        dueDate: '',
      });
      setError(null);
    }
  }, [open, user, preselectedEmployeeId, hideEmployeeSelect]);

  const fetchEmployees = async () => {
    try {
      const users = await userService.getUsers();
      const staffMembers = users.filter(u => u.role?.name === 'STAFF');
      setEmployees(staffMembers);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
    }
  };

  const handleInputChange = (field: keyof CreateJobDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.title || formData.payAmount <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const jobData = {
        employeeId: formData.employeeId,
        title: formData.title,
        payAmount: formData.payAmount,
        jobType: formData.jobType,
        ...(formData.description && formData.description.trim() && { description: formData.description }),
        ...(formData.dueDate && { dueDate: formData.dueDate }),
      };

      const newJob = await jobService.createJob(jobData);
      onSuccess(newJob);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employee: Employee) => {
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3,
        }}
      >
        <WorkIcon />
        <Typography variant="h5" component="div" sx={{ flex: 1 }}>
          Create New Job
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!hideEmployeeSelect && (
              <FormControl fullWidth required>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  label="Employee"
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {getEmployeeName(employee)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              required
              label="Job Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Tire Installation, Oil Change, Brake Repair"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the job..."
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Payment Amount"
                value={formData.payAmount}
                onChange={(e) => handleInputChange('payAmount', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: colors.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <FormControl fullWidth required>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  label="Job Type"
                >
                  {Object.values(JobType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <DateTimePicker
              label="Due Date (Optional)"
              value={formData.dueDate ? new Date(formData.dueDate) : null}
              onChange={(date) => handleInputChange('dueDate', date?.toISOString() || '')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'outlined',
                },
              }}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{ minWidth: 120 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            minWidth: 120,
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          }}
        >
          {loading ? 'Creating...' : 'Create Job'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};