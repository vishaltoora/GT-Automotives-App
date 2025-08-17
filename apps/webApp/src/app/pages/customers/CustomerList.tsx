import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  DirectionsCar as CarIcon,
  Receipt as ReceiptIcon,
  CalendarMonth as CalendarIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerService, Customer } from '../../services/customer.service';
import { useAuth } from '../../hooks/useAuth';

export function CustomerList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm) {
      const filtered = customers.filter((customer) => {
        const fullName = `${customer.user.firstName} ${customer.user.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          customer.user.email.toLowerCase().includes(searchLower) ||
          customer.phone.includes(searchTerm) ||
          (customer.address && customer.address.toLowerCase().includes(searchLower))
        );
      });
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(id);
        await loadCustomers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Customers
        </Typography>
        {(role === 'staff' || role === 'admin') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/customers/new')}
          >
            Add Customer
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search customers by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="center">Vehicles</TableCell>
              <TableCell align="center">Invoices</TableCell>
              <TableCell align="center">Appointments</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No customers found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(customer.user.firstName, customer.user.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {customer.user.firstName} {customer.user.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ID: {customer.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.user.email}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.address || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<CarIcon />}
                      label={customer._count?.vehicles || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<ReceiptIcon />}
                      label={customer._count?.invoices || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<CalendarIcon />}
                      label={customer._count?.appointments || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/customers/${customer.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {(role === 'staff' || role === 'admin') && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/customers/${customer.id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {role === 'admin' && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}