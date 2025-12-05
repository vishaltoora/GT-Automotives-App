import { useState, useEffect } from 'react';
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
  Avatar,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
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
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { customerService, Customer } from '../../requests/customer.requests';
import { useAuth } from '../../hooks/useAuth';
import { CustomerDialog } from '../../components/customers/CustomerDialog';
import { CustomerDetailsDialog } from '../../components/customers/CustomerDetailsDialog';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { formatPhoneForDisplay } from '../../utils/phone';

export function CustomerList() {
  const { role } = useAuth();
  const { confirmDelete } = useConfirmationHelpers();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsCustomerId, setDetailsCustomerId] = useState<string | null>(null);
  const [showOutstandingOnly, setShowOutstandingOnly] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Filter customers based on search term and outstanding balance filter
    let filtered = customers;

    // Apply outstanding balance filter
    if (showOutstandingOnly) {
      filtered = filtered.filter((customer) => {
        const outstandingBalance = customer.stats?.outstandingBalance || 0;
        return outstandingBalance > 0;
      });
    }

    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter((customer) => {
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
          (customer.phone && customer.phone.includes(searchTerm)) ||
          (customer.address && customer.address.toLowerCase().includes(searchLower)) ||
          (customer.businessName && customer.businessName.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredCustomers(filtered);
    // Reset to first page when filters change
    setPage(0);
  }, [searchTerm, customers, showOutstandingOnly]);

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

  const handleDelete = async (customer: Customer) => {
    const customerName = `${customer.firstName} ${customer.lastName}`;
    const confirmed = await confirmDelete(`customer "${customerName}"`);
    
    if (confirmed) {
      try {
        await customerService.deleteCustomer(customer.id);
        await loadCustomers();
      } catch (err: any) {
        // TODO: Replace with error notification
        console.error('Failed to delete customer:', err);
      }
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  // Count customers with outstanding balance
  const customersWithOutstanding = customers.filter(
    (c) => (c.stats?.outstandingBalance || 0) > 0
  ).length;

  const TableRowMenu = ({ customer }: { customer: Customer }) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
      setMenuAnchor(null);
    };

    const handleEdit = () => {
      handleMenuClose();
      handleEditClick(customer);
    };

    const handleDeleteClick = () => {
      handleMenuClose();
      handleDelete(customer);
    };

    return (
      <>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label="more actions"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {(role === 'staff' || role === 'supervisor' || role === 'admin') && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}
          {role === 'admin' && (
            <MenuItem onClick={handleDeleteClick}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  };

  const CustomerCard = ({ customer }: { customer: Customer }) => {
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchor);
    const outstandingBalance = customer.stats?.outstandingBalance || 0;

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
      setMenuAnchor(null);
    };

    const handleEdit = () => {
      handleMenuClose();
      handleEditClick(customer);
    };

    const handleDeleteClick = () => {
      handleMenuClose();
      handleDelete(customer);
    };

    return (
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: outstandingBalance > 0 ? 4 : 0,
        borderColor: outstandingBalance > 0 ? 'warning.main' : undefined,
      }}>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Outstanding Balance Indicator */}
          {outstandingBalance > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={formatCurrency(outstandingBalance)}
              color="warning"
              size="small"
              sx={{ mb: 1.5, fontWeight: 'bold' }}
            />
          )}
          {/* Header with Avatar and Name */}
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {getInitials(customer.firstName, customer.lastName)}
            </Avatar>
            <Box flex={1}>
              <Typography
                variant="h6"
                fontWeight="medium"
                noWrap
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
                onClick={() => handleCustomerNameClick(customer)}
              >
                {customer.firstName} {customer.lastName}
              </Typography>
              {customer.phone && (
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  {formatPhoneForDisplay(customer.phone)}
                </Typography>
              )}
              {customer.businessName && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {customer.businessName}
                  </Typography>
                </Box>
              )}
            </Box>
            {(role === 'staff' || role === 'supervisor' || role === 'admin') && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  aria-label="more actions"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                  </MenuItem>
                  {role === 'admin' && (
                    <MenuItem onClick={handleDeleteClick}>
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Contact Info */}
        <Stack spacing={1} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>
              {customer.email || 'No email'}
            </Typography>
          </Box>
          <Box display="flex" alignItems="start" gap={1}>
            <LocationIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-word' }}>
              {customer.address || '-'}
            </Typography>
          </Box>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          <Chip
            icon={<CarIcon />}
            label={`${customer._count?.vehicles || 0} vehicles`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            icon={<ReceiptIcon />}
            label={`${customer._count?.invoices || 0} invoices`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Chip
            icon={<CalendarIcon />}
            label={`${customer._count?.appointments || 0} appts`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Stack>
      </CardContent>

      </Card>
    );
  };

  const handleAddClick = () => {
    setSelectedCustomer(undefined);
    setSelectedCustomerId(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedCustomerId(customer.id);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCustomer(undefined);
    setSelectedCustomerId(undefined);
  };

  const handleDialogSuccess = () => {
    loadCustomers();
    handleDialogClose();
  };

  const handleCustomerNameClick = (customer: Customer) => {
    setDetailsCustomerId(customer.id);
    setDetailsDialogOpen(true);
  };

  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
    setDetailsCustomerId(null);
  };

  const handleEditFromDetails = (customer: Customer) => {
    handleEditClick(customer);
  };

  // Calculate pagination
  const paginatedCustomers = filteredCustomers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
    <Box sx={{ p: { xs: 0, sm: 3 } }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{ px: { xs: 2, sm: 0 } }}
      >
        <Typography variant={isMobile ? 'h5' : 'h4'} component="h1">
          Customers
        </Typography>
        {(role === 'staff' || role === 'supervisor' || role === 'admin') && !isMobile && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            size="large"
          >
            Add Customer
          </Button>
        )}
      </Box>

      {/* Search Bar with Filter and Add Button */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 3, mx: { xs: 0.5, sm: 0 } }}>
        <TextField
          sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
          variant="outlined"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size={isMobile ? 'small' : 'medium'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        {/* Outstanding Balance Filter Chip */}
        <Chip
          icon={<WarningIcon />}
          label={isMobile ? `${customersWithOutstanding}` : `Outstanding (${customersWithOutstanding})`}
          color={showOutstandingOnly ? 'warning' : 'default'}
          variant={showOutstandingOnly ? 'filled' : 'outlined'}
          onClick={() => setShowOutstandingOnly(!showOutstandingOnly)}
          sx={{
            fontWeight: showOutstandingOnly ? 'bold' : 'normal',
            cursor: 'pointer',
            height: isMobile ? 40 : 56,
            borderRadius: 2,
            '& .MuiChip-label': {
              px: 1.5,
            },
          }}
        />
        {(role === 'staff' || role === 'supervisor' || role === 'admin') && isMobile && (
          <IconButton
            color="primary"
            onClick={handleAddClick}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              width: 40,
              height: 40,
            }}
          >
            <AddIcon />
          </IconButton>
        )}
      </Box>

      {/* Card View for Mobile, Table for Desktop */}
      {isMobile ? (
        paginatedCustomers.length === 0 ? (
          <Card sx={{ mx: 0.5, p: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No customers found
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={1.5} sx={{ px: 0.5 }}>
            {paginatedCustomers.map((customer) => (
              <Grid size={{ xs: 12, sm: 6 }} key={customer.id}>
                <CustomerCard customer={customer} />
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="center">Outstanding</TableCell>
                <TableCell align="center">Vehicles</TableCell>
                <TableCell align="center">Invoices</TableCell>
                <TableCell align="center">Appointments</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(customer.firstName, customer.lastName)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main',
                                textDecoration: 'underline',
                              },
                            }}
                            onClick={() => handleCustomerNameClick(customer)}
                          >
                            {customer.firstName} {customer.lastName}
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
                          <Typography variant="body2">{customer.email || 'No email'}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {customer.phone ? formatPhoneForDisplay(customer.phone) : 'No phone'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {customer.businessName && (
                          <Typography variant="body2" fontWeight="medium">
                            {customer.businessName}
                          </Typography>
                        )}
                        <Typography variant="body2" color={customer.businessName ? 'textSecondary' : 'inherit'}>
                          {customer.address || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {(customer.stats?.outstandingBalance || 0) > 0 ? (
                        <Chip
                          icon={<WarningIcon />}
                          label={formatCurrency(customer.stats?.outstandingBalance || 0)}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 'bold' }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
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
                      <TableRowMenu customer={customer} />
                    </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredCustomers.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      )}

      {/* Pagination for Mobile Card View */}
      {isMobile && filteredCustomers.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TablePagination
            component="div"
            count={filteredCustomers.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Box>
      )}

      <CustomerDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        customerId={selectedCustomerId}
        customer={selectedCustomer}
      />

      {detailsCustomerId && (
        <CustomerDetailsDialog
          open={detailsDialogOpen}
          onClose={handleDetailsDialogClose}
          customerId={detailsCustomerId}
          onEdit={handleEditFromDetails}
          onPaymentSuccess={loadCustomers}
        />
      )}
    </Box>
  );
}