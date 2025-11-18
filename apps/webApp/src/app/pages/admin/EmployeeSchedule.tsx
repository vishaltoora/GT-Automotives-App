import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Send as SendIcon, Email as EmailIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
}

interface Appointment {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  serviceType: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  vehicle?: {
    year: number;
    make: string;
    model: string;
  };
  appointmentType: string;
  notes?: string;
}

export default function EmployeeSchedule() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = await window.Clerk?.session?.getToken();
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter only STAFF, ADMIN, and SUPERVISOR users
      const staffAndAdmin = response.data.filter(
        (user: User) => user.role.name === 'STAFF' || user.role.name === 'ADMIN' || user.role.name === 'SUPERVISOR'
      );
      setEmployees(staffAndAdmin);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setMessage({ type: 'error', text: 'Failed to load employees' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const sendEmployeeSchedule = async () => {
    if (!selectedEmployee) {
      setMessage({ type: 'error', text: 'Please select an employee' });
      return;
    }

    try {
      setSending(true);
      setMessage(null);

      const token = await window.Clerk?.session?.getToken();
      const employee = employees.find(e => e.id === selectedEmployee);

      if (!employee) {
        throw new Error('Employee not found');
      }

      // Fetch appointments for the selected employee and date
      // CRITICAL: Use direct date formatting to avoid timezone conversion
      // toISOString() converts to UTC which causes -1 day shift after 5 PM PST
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const appointmentsResponse = await axios.get(`${API_URL}/api/appointments`, {
        params: {
          startDate: dateStr,
          endDate: dateStr,
          employeeId: selectedEmployee,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const appointments: Appointment[] = appointmentsResponse.data;

      // Sort appointments by time (earliest first)
      appointments.sort((a, b) => {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });

      // Format appointments for email
      const formattedAppointments = appointments.map(apt => ({
        time: formatTime(apt.scheduledTime),
        customerName: `${apt.customer.firstName} ${apt.customer.lastName}`,
        serviceType: apt.serviceType,
        vehicleInfo: apt.vehicle
          ? `${apt.vehicle.year} ${apt.vehicle.make} ${apt.vehicle.model}`
          : 'No vehicle specified',
        location: apt.appointmentType === 'AT_GARAGE' ? 'At Garage' : 'Mobile Service',
        duration: apt.duration,
        notes: apt.notes,
      }));

      // Send email
      await axios.post(
        `${API_URL}/api/email/send-employee-schedule`,
        {
          employeeEmail: employee.email,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          date: dateStr,
          appointments: formattedAppointments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        type: 'success',
        text: `Schedule email sent successfully to ${employee.firstName} ${employee.lastName} (${appointments.length} appointment${appointments.length !== 1 ? 's' : ''})`,
      });
    } catch (error: any) {
      console.error('Failed to send schedule:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send schedule email',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmailIcon /> Employee Day Schedule
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Send daily schedule emails to employees with their appointment details
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Select Employee</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  label="Select Employee"
                  disabled={loading}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.role.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {message && (
              <Grid size={{ xs: 12 }}>
                <Alert severity={message.type} onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Button
                variant={!selectedEmployee || sending ? 'outlined' : 'contained'}
                size="large"
                startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={sendEmployeeSchedule}
                disabled={!selectedEmployee || sending}
                fullWidth
              >
                {sending ? 'Sending...' : 'Send Schedule Email'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          How it works:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          <ol>
            <li>Select an employee from the dropdown</li>
            <li>Choose the date for the schedule</li>
            <li>Click "Send Schedule Email" to email their daily appointments</li>
            <li>The email will include appointment times, customer names, services, and vehicle details</li>
          </ol>
        </Typography>
      </Box>
    </Box>
  );
}
