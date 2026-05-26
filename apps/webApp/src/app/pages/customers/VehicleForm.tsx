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
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { vehicleService, CreateVehicleDto, UpdateVehicleDto } from '../../requests/vehicle.requests';
import { customerService, Customer } from '../../requests/customer.requests';
import { useAuth } from '../../hooks/useAuth';
import { useError } from '../../contexts/ErrorContext';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

// Common vehicle makes
const vehicleMakes = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia',
  'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan',
  'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

const normalizeVin = (value: string) =>
  value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);

export function VehicleForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, customerId: urlCustomerId } = useParams();
  const { role } = useAuth();
  const { showError } = useError();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [decodingVin, setDecodingVin] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decodeMessage, setDecodeMessage] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    customerId: urlCustomerId || '',
    make: '',
    model: '',
    year: currentYear,
    vin: '',
    licensePlate: '',
    mileage: 0,
  });

  const routePrefix = location.pathname.match(/^\/(admin|staff|supervisor|customer)(?=\/)/)?.[0] || '';
  const vehiclesPath = `${routePrefix}/vehicles`;

  useEffect(() => {
    loadCustomers();
    if (isEdit && id) {
      loadVehicle(id);
    }
  }, [id, isEdit]);

  useEffect(() => {
    loadModelsForMake(formData.make);
  }, [formData.make]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      
      // If customer role, they should only see their own data
      // Note: Customer-specific filtering should be handled on the backend
      if (role === 'customer' && data.length > 0) {
        // For now, if there's only one customer, use that
        if (data.length === 1) {
          setFormData(prev => ({ ...prev, customerId: data[0].id }));
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

  const loadModelsForMake = async (make: string) => {
    const trimmedMake = make.trim();

    if (!trimmedMake) {
      setModelOptions([]);
      return;
    }

    try {
      setLoadingModels(true);
      const models = await vehicleService.getModelsForMake(trimmedMake);
      setModelOptions(models);
    } catch (err) {
      setModelOptions([]);
    } finally {
      setLoadingModels(false);
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
          vin: formData.vin.trim() || null,
          licensePlate: formData.licensePlate.trim() || null,
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

      navigate(vehiclesPath);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDecodeVin = async () => {
    const vin = normalizeVin(formData.vin);

    if (!VIN_PATTERN.test(vin)) {
      showError({
        title: 'Invalid VIN',
        message: 'Enter a 17-character VIN. VINs cannot contain I, O, or Q.',
        severity: 'warning',
      });
      return;
    }

    try {
      setDecodingVin(true);
      setDecodeMessage(null);

      const decoded = await vehicleService.decodeVin(vin);
      const decodedUpdates = {
        vin: decoded.vin,
        make: decoded.make || formData.make,
        model: decoded.model || formData.model,
        year: decoded.year || formData.year,
      };

      setFormData(prev => ({
        ...prev,
        ...decodedUpdates,
      }));

      const vehicleName = [decoded.year, decoded.make, decoded.model]
        .filter(Boolean)
        .join(' ');
      const warningText = decoded.warnings.length
        ? ` ${decoded.warnings.join(' ')}`
        : '';

      setDecodeMessage(
        vehicleName
          ? `Decoded ${vehicleName}.${warningText}`
          : `VIN decoded, but no make/model/year was returned.${warningText}`,
      );
    } catch (err: any) {
      showError({
        title: 'VIN Decode Failed',
        message: err.response?.data?.message || 'Unable to decode this VIN right now.',
        details: err.message,
      });
    } finally {
      setDecodingVin(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'vin' ? normalizeVin(e.target.value) : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: field === 'year' || field === 'mileage' ? 
        parseInt(value) || 0 :
        value,
    }));

    if (field === 'vin') {
      setDecodeMessage(null);
    }
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

      {decodeMessage && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setDecodeMessage(null)}>
          {decodeMessage}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Only show customer selection for staff/admin or when adding new vehicle */}
              {(role !== 'customer' || !isEdit) && (
                <Grid size={{ xs: 12 }}>
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
                          {customer.firstName} {customer.lastName} {customer.email ? `- ${customer.email}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  freeSolo
                  options={vehicleMakes}
                  value={formData.make}
                  onChange={(_, value) => setFormData(prev => ({ ...prev, make: value || '', model: '' }))}
                  onInputChange={(_, value) => setFormData(prev => ({ ...prev, make: value, model: value === prev.make ? prev.model : '' }))}
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

              <Grid size={{ xs: 12, md: 4 }}>
                <Autocomplete
                  freeSolo
                  options={modelOptions}
                  value={formData.model}
                  loading={loadingModels}
                  onChange={(_, value) => setFormData(prev => ({ ...prev, model: value || '' }))}
                  onInputChange={(_, value) => setFormData(prev => ({ ...prev, model: value }))}
                  disabled={saving || !formData.make}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Model"
                      helperText={formData.make ? ' ' : 'Select make first'}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingModels ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="VIN"
                  value={formData.vin}
                  onChange={handleChange('vin')}
                  disabled={saving || decodingVin}
                  placeholder="Vehicle Identification Number"
                  inputProps={{ maxLength: 17, style: { textTransform: 'uppercase' } }}
                  helperText={
                    formData.vin && formData.vin.length < 17
                      ? `${17 - formData.vin.length} characters remaining`
                      : ' '
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={decodingVin ? <CircularProgress size={16} /> : <SearchIcon />}
                          onClick={handleDecodeVin}
                          disabled={saving || decodingVin || !VIN_PATTERN.test(formData.vin)}
                        >
                          Decode
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="License Plate"
                  value={formData.licensePlate}
                  onChange={handleChange('licensePlate')}
                  disabled={saving}
                  inputProps={{ style: { textTransform: 'uppercase' } }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12 }}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate(vehiclesPath)}
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
