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
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  DirectionsCar as CarIcon,
  Speed as SpeedIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { vehicleService, Vehicle } from '../../requests/vehicle.requests';
import { useAuth } from '../../hooks/useAuth';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';

export function VehicleList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { confirmDelete } = useConfirmationHelpers();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    // Filter vehicles based on search term
    if (searchTerm) {
      const filtered = vehicles.filter((vehicle) => {
        const searchLower = searchTerm.toLowerCase();
        const customerDisplay = getCustomerDisplay(vehicle);
        const customerText = `${customerDisplay.name} ${customerDisplay.email}`.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.year.toString().includes(searchTerm) ||
          (vehicle.vin && vehicle.vin.toLowerCase().includes(searchLower)) ||
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchLower)) ||
          customerText.includes(searchLower)
        );
      });
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [searchTerm, vehicles]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
      setFilteredVehicles(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const vehicleDescription = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    const confirmed = await confirmDelete(`vehicle "${vehicleDescription}"`);
    
    if (confirmed) {
      try {
        await vehicleService.deleteVehicle(vehicle.id);
        await loadVehicles();
      } catch (err: any) {
        // TODO: Replace with error notification
        console.error('Failed to delete vehicle:', err);
      }
    }
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return '-';
    return mileage.toLocaleString() + ' mi';
  };

  const getCustomerDisplay = (vehicle: Vehicle) => {
    const customer = vehicle.customer as any;
    const firstName = customer?.user?.firstName || customer?.firstName || '';
    const lastName = customer?.user?.lastName || customer?.lastName || '';
    const email = customer?.user?.email || customer?.email || '';
    const businessName = customer?.businessName || '';
    const name = [firstName, lastName].filter(Boolean).join(' ') || businessName;

    return { name, email };
  };

  const routePrefix = location.pathname.match(/^\/(admin|staff|supervisor|customer)(?=\/)/)?.[0] || '';
  const vehiclePath = (path: string) => `${routePrefix}/vehicles${path}`;

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
          Vehicles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(vehiclePath('/new'))}
        >
          Add Vehicle
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search vehicles by make, model, year, VIN, license plate, or owner..."
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
              <TableCell>Vehicle</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>VIN</TableCell>
              <TableCell>License Plate</TableCell>
              <TableCell align="right">Mileage</TableCell>
              <TableCell align="center">Services</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No vehicles found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => {
                const customerDisplay = getCustomerDisplay(vehicle);
                const canDelete =
                  role === 'admin' ||
                  (role === 'customer' && vehicle.customerId === vehicle.customer?.id);

                return (
                  <TableRow key={vehicle.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CarIcon color="action" />
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ID: {vehicle.id.slice(0, 8)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {customerDisplay.name || customerDisplay.email ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">
                              {customerDisplay.name || customerDisplay.email}
                            </Typography>
                            {customerDisplay.email && (
                              <Typography variant="caption" color="textSecondary">
                                {customerDisplay.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {vehicle.vin || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {vehicle.licensePlate || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                        <SpeedIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatMileage(vehicle.mileage)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Chip
                          icon={<BuildIcon />}
                          label={vehicle._count?.invoices || 0}
                          size="small"
                          variant="outlined"
                          title="Total Services"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(vehiclePath(`/${vehicle.id}`))}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(vehiclePath(`/${vehicle.id}/edit`))}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {canDelete && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(vehicle)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
