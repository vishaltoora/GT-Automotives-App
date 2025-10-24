import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Paper,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

interface SmsMessage {
  id: string;
  to: string;
  body: string;
  status: string;
  type: string;
  cost: number;
  segments: number;
  customer?: {
    firstName: string;
    lastName: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  deliveredAt: string | null;
}

interface SmsStatistics {
  totalMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  totalCost: number;
  deliveryRate: string;
  optedInCustomers: number;
  optedInUsers: number;
}

export const SmsHistory: React.FC = () => {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [statistics, setStatistics] = useState<SmsStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await getToken();

      const [messagesResponse, statsResponse] = await Promise.all([
        axios.get('/api/sms/history?limit=100', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get('/api/sms/statistics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setMessages(messagesResponse.data);
      setStatistics(statsResponse.data);
    } catch (err) {
      console.error('Failed to load SMS data', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'success';
      case 'SENT': return 'info';
      case 'QUEUED': return 'info';
      case 'FAILED': return 'error';
      case 'UNDELIVERED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredMessages = filterType === 'all'
    ? messages
    : messages.filter(m => m.type === filterType);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        SMS Message History
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Messages
                </Typography>
                <Typography variant="h4">{statistics.totalMessages}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Delivered
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.deliveredMessages}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.deliveryRate}% delivery rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Failed
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.failedMessages}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Total Cost
                </Typography>
                <Typography variant="h4">${statistics.totalCost.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Opted-In Customers
                </Typography>
                <Typography variant="h4">{statistics.optedInCustomers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" variant="body2" gutterBottom>
                  Opted-In Staff/Admin
                </Typography>
                <Typography variant="h4">{statistics.optedInUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          label="Filter by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="all">All Messages</MenuItem>
          <MenuItem value="APPOINTMENT_REMINDER">Appointment Reminder</MenuItem>
          <MenuItem value="APPOINTMENT_CONFIRMATION">Appointment Confirmation</MenuItem>
          <MenuItem value="SERVICE_STATUS">Service Status</MenuItem>
          <MenuItem value="SERVICE_COMPLETE">Service Complete</MenuItem>
          <MenuItem value="PROMOTIONAL">Promotional</MenuItem>
          <MenuItem value="STAFF_APPOINTMENT_ALERT">Staff Appointment Alert</MenuItem>
          <MenuItem value="STAFF_SCHEDULE_REMINDER">Staff Schedule Reminder</MenuItem>
          <MenuItem value="ADMIN_DAILY_SUMMARY">Admin Daily Summary</MenuItem>
          <MenuItem value="ADMIN_URGENT_ALERT">Admin Urgent Alert</MenuItem>
        </TextField>
      </Box>

      {/* Messages Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Recipient</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Message Preview</TableCell>
              <TableCell align="right">Segments</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No SMS messages found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    {new Date(message.createdAt).toLocaleDateString()}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {message.customer && `${message.customer.firstName} ${message.customer.lastName}`}
                    {message.user && `${message.user.firstName} ${message.user.lastName} (Staff)`}
                    {!message.customer && !message.user && 'Unknown'}
                  </TableCell>
                  <TableCell>{message.to}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{getTypeLabel(message.type)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={message.status}
                      color={getStatusColor(message.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {message.body}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{message.segments || 1}</TableCell>
                  <TableCell align="right">
                    ${((message.segments || 1) * 0.0025).toFixed(4)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
