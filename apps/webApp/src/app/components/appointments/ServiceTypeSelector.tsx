import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const SERVICE_TYPES = [
  { value: 'TIRE_CHANGE', label: 'Tire Mount Balance', duration: 60 },
  { value: 'TIRE_ROTATION', label: 'Tire Rotation', duration: 30 },
  { value: 'TIRE_REPAIR', label: 'Tire Repair', duration: 30 },
  { value: 'TIRE_SWAP', label: 'Tire Swap', duration: 30 },
  { value: 'TIRE_BALANCE', label: 'Tire Balance', duration: 30 },
  { value: 'OIL_CHANGE', label: 'Oil Change', duration: 45 },
  { value: 'BRAKE_SERVICE', label: 'Brake Service', duration: 90 },
  { value: 'MECHANICAL_WORK', label: 'Mechanical Work', duration: 60 },
  { value: 'OTHER', label: 'Other Service', duration: 60 },
];

interface ServiceTypeSelectorProps {
  serviceType: string;
  duration: number;
  onServiceTypeChange: (serviceType: string) => void;
  onDurationChange: (duration: number) => void;
}

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  serviceType,
  duration,
  onServiceTypeChange,
  onDurationChange,
}) => {
  const handleServiceTypeChange = (newServiceType: string) => {
    const service = SERVICE_TYPES.find((s) => s.value === newServiceType);
    onServiceTypeChange(newServiceType);
    if (service) {
      onDurationChange(service.duration);
    }
  };

  return (
    <>
      {/* Service Type */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth required>
          <InputLabel>Service Type</InputLabel>
          <Select
            value={serviceType}
            onChange={(e) => handleServiceTypeChange(e.target.value)}
            label="Service Type"
          >
            {SERVICE_TYPES.map((service) => (
              <MenuItem key={service.value} value={service.value}>
                {service.label} ({service.duration} min)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Duration */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Duration (minutes)"
          type="number"
          value={duration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          inputProps={{ min: 15, max: 480, step: 15 }}
          required
        />
      </Grid>
    </>
  );
};
