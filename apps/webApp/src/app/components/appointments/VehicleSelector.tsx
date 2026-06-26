import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { DirectionsCar, Add as AddIcon } from '@mui/icons-material';
import { Customer } from '../../requests/customer.requests';

interface VehicleSelectorProps {
  customer: Customer | null;
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
  /** When provided, an "Add Vehicle" button is shown that invokes this callback. */
  onAddVehicle?: () => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  customer,
  selectedVehicleId,
  onVehicleChange,
  onAddVehicle,
}) => {
  // Without a customer there is nothing to attach a vehicle to.
  if (!customer) {
    return null;
  }

  const vehicles = customer.vehicles ?? [];
  const hasVehicles = vehicles.length > 0;
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <FormControl fullWidth disabled={!hasVehicles}>
          <InputLabel>Vehicle (Optional)</InputLabel>
          <Select
            value={hasVehicles ? selectedVehicleId : ''}
            onChange={(e) => onVehicleChange(e.target.value)}
            label="Vehicle (Optional)"
          >
            <MenuItem value="">None</MenuItem>
            {vehicles.map((vehicle) => (
              <MenuItem key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.engineType ? ` • ${vehicle.engineType}` : ''}
                {vehicle.licensePlate ? ` • ${vehicle.licensePlate}` : ''}
                {vehicle.vin ? ` • VIN ${vehicle.vin.slice(-6)}` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {onAddVehicle && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddVehicle}
            sx={{ whiteSpace: 'nowrap', height: 56 }}
          >
            Add Vehicle
          </Button>
        )}
      </Box>

      {/* Full details of the chosen vehicle, including the full VIN when available. */}
      {selectedVehicle && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: 1, color: 'text.secondary' }}
        >
          <DirectionsCar fontSize="small" />
          <Typography variant="caption">
            {selectedVehicle.year} {selectedVehicle.make}{' '}
            {selectedVehicle.model}
            {selectedVehicle.engineType
              ? ` · ${selectedVehicle.engineType}`
              : ''}
            {selectedVehicle.mileage != null
              ? ` · ${selectedVehicle.mileage.toLocaleString()} km`
              : ''}
            {selectedVehicle.licensePlate
              ? ` · Plate ${selectedVehicle.licensePlate}`
              : ''}
            {` · VIN ${selectedVehicle.vin || 'not on file'}`}
          </Typography>
        </Stack>
      )}

      {!hasVehicles && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          This customer has no vehicles yet. Use “Add Vehicle” to create one.
        </Typography>
      )}
    </Grid>
  );
};
