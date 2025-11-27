import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Customer } from '../../requests/customer.requests';

interface VehicleSelectorProps {
  customer: Customer | null;
  selectedVehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  customer,
  selectedVehicleId,
  onVehicleChange,
}) => {
  // Only render if customer has vehicles
  if (!customer?.vehicles || customer.vehicles.length === 0) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }}>
      <FormControl fullWidth>
        <InputLabel>Vehicle (Optional)</InputLabel>
        <Select
          value={selectedVehicleId}
          onChange={(e) => onVehicleChange(e.target.value)}
          label="Vehicle (Optional)"
        >
          <MenuItem value="">None</MenuItem>
          {customer.vehicles.map((vehicle) => (
            <MenuItem key={vehicle.id} value={vehicle.id}>
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ''}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};
