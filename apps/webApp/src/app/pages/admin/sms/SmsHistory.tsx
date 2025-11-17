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
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [statistics, setStatistics] = useState<SmsStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [statsExpanded, setStatsExpanded] = useState(false);

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
    <Box sx={{
      p: {
        xs: theme.custom.spacing.pagePadding.mobile,
        sm: theme.custom.spacing.pagePadding.tablet,
        md: theme.custom.spacing.pagePadding.desktop
      }
    }}>
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ mb: { xs: 2, sm: 3 } }}>
        SMS Message History
      </Typography>

      {/* Statistics Cards */}
      {statistics && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          {isMobile && (
            <Button
              fullWidth
              onClick={() => setStatsExpanded(!statsExpanded)}
              endIcon={statsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ mb: statsExpanded ? 2 : 0, justifyContent: 'space-between' }}
            >
              Statistics
            </Button>
          )}
          <Collapse in={!isMobile || statsExpanded}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Messages
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"}>{statistics.totalMessages}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Delivered
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} color="success.main">
                      {statistics.deliveredMessages}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', sm: '0.75rem' } }}>
                      {statistics.deliveryRate}% delivery rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Failed
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"} color="error.main">
                      {statistics.failedMessages}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Cost
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"}>${statistics.totalCost.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Opted-In Customers
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"}>{statistics.optedInCustomers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Opted-In Staff/Admin
                    </Typography>
                    <Typography variant={isMobile ? "h5" : "h4"}>{statistics.optedInUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Collapse>
        </Box>
      )}

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          label="Filter by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 250 } }}
          size={isMobile ? 'small' : 'medium'}
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

      {/* Messages */}
      {isMobile ? (
        // Mobile: Card Layout
        <Box>
          {filteredMessages.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No SMS messages found
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredMessages.map((message) => (
                <Card key={message.id} variant="outlined">
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {message.customer && `${message.customer.firstName} ${message.customer.lastName}`}
                          {message.user && `${message.user.firstName} ${message.user.lastName} (Staff)`}
                          {!message.customer && !message.user && 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {message.to}
                        </Typography>
                      </Box>
                      <Chip
                        label={message.status}
                        color={getStatusColor(message.status) as any}
                        size="small"
                        sx={{ fontSize: '0.6875rem', height: '20px' }}
                      />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {getTypeLabel(message.type)}
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {message.body}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(message.createdAt).toLocaleDateString()} {new Date(message.createdAt).toLocaleTimeString()}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {message.segments || 1} seg
                        </Typography>
                        <Typography variant="caption" fontWeight="medium">
                          ${((message.segments || 1) * 0.0025).toFixed(4)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        // Desktop: Table Layout
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
      )}
    </Box>
  );
};
