import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService, CreateVehicleDto, UpdateVehicleDto } from '../../services/vehicle.service';
import { customerService, Customer } from '../../services/customer.service';
import { useAuth } from '../../hooks/useAuth';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

// Common vehicle makes
const vehicleMakes = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia',
  'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan',
  'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

export function VehicleForm() {
  const navigate = useNavigate();
  const { id, customerId: urlCustomerId } = useParams();
  const { role, user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    customerId: urlCustomerId || '',
    make: '',
    model: '',
    year: currentYear,
    vin: '',
    licensePlate: '',
    mileage: 0,
  });

  useEffect(() => {
    loadCustomers();
    if (isEdit && id) {
      loadVehicle(id);
    }
  }, [id, isEdit]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      
      // If customer role, set their customer ID automatically
      if (role === 'customer' && data.length > 0) {
        const userCustomer = data.find(c => c.userId === user?.id);
        if (userCustomer) {
          setFormData(prev => ({ ...prev, customerId: userCustomer.id }));
        }
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
    }
  };

  const loadVehicle = async (vehicleId: string) => {
    try {
      setLoading(true);
      const vehicle = await vehicleService.getVehicle(vehicleId);
      setFormData({
        customerId: vehicle.customerId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        mileage: vehicle.mileage || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      if (isEdit && id) {
        const updateData: UpdateVehicleDto = {
          make: formData.make,
          model: formData.model,
          year: formData.year,
          vin: formData.vin || undefined,
          licensePlate: formData.licensePlate || undefined,
          mileage: formData.mileage || undefined,
        };
        await vehicleService.updateVehicle(id, updateData);
      } else {
        const createData: CreateVehicleDto = {
          ...formData,
          vin: formData.vin || undefined,
          licensePlate: formData.licensePlate || undefined,
          mileage: formData.mileage || undefined,
        };
        await vehicleService.createVehicle(createData);
      }

      navigate('/vehicles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'year' || field === 'mileage' ? 
        parseInt(e.target.value) || 0 : 
        e.target.value,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" mb={3}>
        {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Only show customer selection for staff/admin or when adding new vehicle */}
              {(role !== 'customer' || !isEdit) && (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Customer</InputLabel>
                    <Select
                      value={formData.customerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      label="Customer"
                      disabled={saving || role === 'customer'}
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.user.firstName} {customer.user.lastName} - {customer.user.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} md={4}>
                <Autocomplete
                  freeSolo
                  options={vehicleMakes}
                  value={formData.make}
                  onChange={(_, value) => setFormData(prev => ({ ...prev, make: value || '' }))}
                  onInputChange={(_, value) => setFormData(prev => ({ ...prev, make: value }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Make"
                      required
                      disabled={saving}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Model"
                  value={formData.model}
                  onChange={handleChange('model')}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    label="Year"
                    disabled={saving}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="VIN"
                  value={formData.vin}
                  onChange={handleChange('vin')}
                  disabled={saving}
                  placeholder="Vehicle Identification Number"
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="License Plate"
                  value={formData.licensePlate}
                  onChange={handleChange('licensePlate')}
                  disabled={saving}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Current Mileage"
                  value={formData.mileage}
                  onChange={handleChange('mileage')}
                  disabled={saving}
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/vehicles')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={saving || !formData.customerId}
                  >
                    {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}