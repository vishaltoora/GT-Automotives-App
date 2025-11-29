import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  TablePagination,
  Badge,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  MoreVert as MoreVertIcon,
  EventAvailable as EventAvailableIcon,
  Delete as DeleteIcon,
  FiberNew as NewIcon,
  CheckCircle as ProcessedIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { format } from 'date-fns';
import { useAuth } from '@clerk/clerk-react';
import { AppointmentDialog } from '../../components/appointments/AppointmentDialog';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useError } from '../../contexts/ErrorContext';

interface BookingRequest {
  id: string;
  appointmentType: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address?: string;
  serviceType: string;
  requestedDate: string;
  requestedTime: string;
  notes?: string;
  status: string;
  createdAt: string;
  customer?: any;
  appointment?: any;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  TIRE_CHANGE: 'Tire Mount Balance',
  TIRE_ROTATION: 'Tire Rotation',
  TIRE_REPAIR: 'Tire Repair',
  TIRE_SWAP: 'Tire Swap',
  TIRE_BALANCE: 'Tire Balance',
  OIL_CHANGE: 'Oil Change',
  BRAKE_SERVICE: 'Brake Service',
  MECHANICAL_WORK: 'Mechanical Work',
  ENGINE_DIAGNOSTIC: 'Engine Diagnostic',
  OTHER: 'Other Service',
};

export function BookingRequests() {
  const { getToken } = useAuth();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);
  const [preselectedServiceType, setPreselectedServiceType] = useState<string | undefined>(undefined);
  const [currentBookingRequestId, setCurrentBookingRequestId] = useState<string | undefined>(undefined);
  const { confirm } = useConfirmation();
  const { showError } = useError();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  useEffect(() => {
    // Reset to first page when tab changes
    setPage(0);
  }, [activeTab]);

  const fetchBookingRequests = async () => {
    try {
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/booking-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBookingRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: BookingRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleBookAppointment = async () => {
    if (!selectedRequest) return;

    // Store booking request ID before closing menu
    const bookingRequestId = selectedRequest.id;
    setCurrentBookingRequestId(bookingRequestId);

    handleMenuClose();

    try {
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // Step 1: Search for existing customer by phone (most unique identifier)
      let existingCustomers: any[] = [];

      // Search by phone first (most reliable)
      if (selectedRequest.phone) {
        const phoneSearchResponse = await fetch(`${apiUrl}/api/customers/search?q=${encodeURIComponent(selectedRequest.phone)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (phoneSearchResponse.ok) {
          existingCustomers = await phoneSearchResponse.json();
        }
      }

      // If not found by phone, try email
      if (existingCustomers.length === 0 && selectedRequest.email && selectedRequest.email.trim() !== '') {
        const emailSearchResponse = await fetch(`${apiUrl}/api/customers/search?q=${encodeURIComponent(selectedRequest.email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (emailSearchResponse.ok) {
          existingCustomers = await emailSearchResponse.json();
        }
      }

      let customer;

      if (existingCustomers.length > 0) {
        // Customer exists - update their information
        const existingCustomer = existingCustomers[0];

        const updateData: any = {
          firstName: selectedRequest.firstName,
          lastName: selectedRequest.lastName,
          address: selectedRequest.address || 'Prince George, BC',
        };

        const updateResponse = await fetch(`${apiUrl}/api/customers/${existingCustomer.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update customer information');
        }

        customer = await updateResponse.json();
      } else {
        // No existing customer - create new one
        const customerData: any = {
          firstName: selectedRequest.firstName,
          lastName: selectedRequest.lastName,
          phone: selectedRequest.phone,
          address: selectedRequest.address || 'Prince George, BC',
        };

        if (selectedRequest.email && selectedRequest.email.trim() !== '') {
          customerData.email = selectedRequest.email;
        }

        const createResponse = await fetch(`${apiUrl}/api/customers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json().catch(() => ({ message: 'Failed to create customer' }));
          throw new Error(errorData.message || 'Failed to create customer');
        }

        customer = await createResponse.json();
      }

      // Set preselected customer ID, service type, and open appointment dialog
      setPreselectedCustomerId(customer.id);
      setPreselectedServiceType(selectedRequest.serviceType || undefined);
      setAppointmentDialogOpen(true);
    } catch (error: any) {
      showError({
        title: 'Failed to process customer',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedRequest) return;

    const confirmed = await confirm({
      title: 'Delete Booking Request',
      message: `Are you sure you want to delete the booking request from ${selectedRequest.firstName} ${selectedRequest.lastName}?`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });

    if (confirmed) {
      handleMenuClose();

      try {
        const token = await getToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        const response = await fetch(`${apiUrl}/api/booking-requests/${selectedRequest.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete booking request');
        }

        // Refresh the list
        fetchBookingRequests();
      } catch (error: any) {
        showError({
          title: 'Failed to delete booking request',
          message: error.message,
        });
      }
    }
  };

  const handleAppointmentSuccess = async () => {
    // Update the booking request status to PROCESSED
    if (currentBookingRequestId) {
      try {
        const token = await getToken();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        await fetch(`${apiUrl}/api/booking-requests/${currentBookingRequestId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'PROCESSED' }),
        });
      } catch (error) {
        console.error('Failed to update booking request status:', error);
      }
    }

    setPreselectedCustomerId(undefined);
    setCurrentBookingRequestId(undefined);
    fetchBookingRequests();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return colors.semantic.warning;
      case 'ACCEPTED':
        return colors.semantic.info;
      case 'CONVERTED':
        return colors.semantic.success;
      case 'PROCESSED':
        return colors.semantic.success;
      case 'REJECTED':
        return colors.semantic.error;
      default:
        return colors.neutral[500];
    }
  };

  // Filter requests based on active tab
  const filteredRequests = bookingRequests.filter((request) => {
    if (activeTab === 0) {
      // New tab: PENDING, ACCEPTED, REJECTED
      return ['PENDING', 'ACCEPTED', 'REJECTED'].includes(request.status);
    } else {
      // Processed tab: CONVERTED, PROCESSED
      return ['CONVERTED', 'PROCESSED'].includes(request.status);
    }
  });

  // Paginated requests
  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Count for badges
  const newCount = bookingRequests.filter((r) =>
    ['PENDING', 'ACCEPTED', 'REJECTED'].includes(r.status)
  ).length;
  const processedCount = bookingRequests.filter((r) =>
    ['CONVERTED', 'PROCESSED'].includes(r.status)
  ).length;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderTableRow = (request: BookingRequest) => (
    <TableRow key={request.id} hover>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {request.firstName} {request.lastName}
        </Typography>
        {request.notes && (
          <Typography variant="caption" color="text.secondary" display="block">
            Note: {request.notes}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Call customer">
              <IconButton
                size="small"
                component="a"
                href={`tel:${request.phone}`}
                sx={{ color: colors.primary.main }}
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{request.phone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Send email">
              <IconButton
                size="small"
                component="a"
                href={`mailto:${request.email}`}
                sx={{ color: colors.primary.main }}
              >
                <EmailIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="body2">{request.email}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {SERVICE_TYPE_LABELS[request.serviceType] || request.serviceType}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {request.appointmentType === 'AT_GARAGE' ? (
            <>
              <StoreIcon fontSize="small" sx={{ color: colors.primary.main }} />
              <Typography variant="body2">At Garage</Typography>
            </>
          ) : (
            <>
              <LocationIcon fontSize="small" sx={{ color: colors.secondary.main }} />
              <Box>
                <Typography variant="body2">Mobile Service</Typography>
                {request.address && (
                  <Typography variant="caption" color="text.secondary">
                    {request.address}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {request.requestedDate}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {request.requestedTime}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={request.status}
          size="small"
          sx={{
            backgroundColor: `${getStatusColor(request.status)}20`,
            color: getStatusColor(request.status),
            fontWeight: 600,
          }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(request.createdAt), 'MMM d, yyyy')}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {format(new Date(request.createdAt), 'h:mm a')}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, request)}
        >
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderMobileCard = (request: BookingRequest) => (
    <Card
      key={request.id}
      sx={{
        mb: 2,
        border: `1px solid ${colors.neutral[200]}`,
        '&:hover': {
          boxShadow: 2,
        },
      }}
    >
      <CardContent>
        {/* Header: Customer Name and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.1rem' }}>
              {request.firstName} {request.lastName}
            </Typography>
            <Chip
              label={request.status}
              size="small"
              sx={{
                mt: 0.5,
                backgroundColor: `${getStatusColor(request.status)}20`,
                color: getStatusColor(request.status),
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, request)}
            sx={{ mt: -0.5 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Service Type */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Service Type
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.9rem' }}>
            {SERVICE_TYPE_LABELS[request.serviceType] || request.serviceType}
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Location
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
            {request.appointmentType === 'AT_GARAGE' ? (
              <>
                <StoreIcon fontSize="small" sx={{ color: colors.primary.main, fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>At Garage</Typography>
              </>
            ) : (
              <>
                <LocationIcon fontSize="small" sx={{ color: colors.secondary.main, fontSize: '1rem' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Mobile Service</Typography>
                  {request.address && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {request.address}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Contact Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
            Contact
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                component="a"
                href={`tel:${request.phone}`}
                sx={{ color: colors.primary.main, p: 0.5 }}
              >
                <PhoneIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{request.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                component="a"
                href={`mailto:${request.email}`}
                sx={{ color: colors.primary.main, p: 0.5 }}
              >
                <EmailIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{request.email}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Requested Date/Time */}
        <Box sx={{ mb: request.notes ? 2 : 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Requested Date & Time
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
            {request.requestedDate} at {request.requestedTime}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Received: {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
          </Typography>
        </Box>

        {/* Notes */}
        {request.notes && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${colors.neutral[200]}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.5 }}>
              {request.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading booking requests...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          Booking Requests
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          View and manage customer booking requests from the website
        </Typography>
      </Box>

      <Card sx={{ boxShadow: { xs: 1, sm: 2 } }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_e, newValue) => setActiveTab(newValue)}
            aria-label="booking request tabs"
            variant="fullWidth"
            sx={{
              minHeight: { xs: 48, sm: 56 },
              '& .MuiTab-root': {
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                minHeight: { xs: 48, sm: 56 },
                px: { xs: 1, sm: 2 },
              },
            }}
          >
            <Tab
              icon={<NewIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
              iconPosition="start"
              label={
                <Badge badgeContent={newCount} color="warning" sx={{ pr: { xs: 1, sm: 2 } }}>
                  <Box sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {window.innerWidth < 600 ? 'New' : 'New Requests'}
                  </Box>
                </Badge>
              }
            />
            <Tab
              icon={<ProcessedIcon sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }} />}
              iconPosition="start"
              label={
                <Badge badgeContent={processedCount} color="success" sx={{ pr: { xs: 1, sm: 2 } }}>
                  <Box sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Processed
                  </Box>
                </Badge>
              }
            />
          </Tabs>
        </Box>

        <CardContent sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 } }}>
          {filteredRequests.length === 0 ? (
            <Box sx={{ py: { xs: 6, sm: 8 }, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {activeTab === 0 ? 'No new booking requests' : 'No processed booking requests'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                {activeTab === 0
                  ? 'New booking requests from the website will appear here'
                  : 'Processed requests will appear here after appointments are booked'}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Customer</strong></TableCell>
                        <TableCell><strong>Contact</strong></TableCell>
                        <TableCell><strong>Service</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Requested Date/Time</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Received</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRequests.map(renderTableRow)}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Mobile Card View */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {paginatedRequests.map(renderMobileCard)}
              </Box>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredRequests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '.MuiTablePagination-toolbar': {
                    px: { xs: 1, sm: 2 },
                  },
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  },
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleBookAppointment}>
          <ListItemIcon>
            <EventAvailableIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Book Appointment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Appointment Dialog */}
      <AppointmentDialog
        open={appointmentDialogOpen}
        onClose={() => {
          setAppointmentDialogOpen(false);
          setPreselectedCustomerId(undefined);
          setPreselectedServiceType(undefined);
        }}
        onSuccess={handleAppointmentSuccess}
        preselectedCustomerId={preselectedCustomerId}
        preselectedServiceType={preselectedServiceType}
      />
    </Box>
  );
}
