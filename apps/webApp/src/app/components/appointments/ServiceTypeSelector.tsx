import React, { useEffect, useState } from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { NumberInput } from '../common';
import { serviceTypeService } from '../../requests/service-type.requests';

interface ServiceTypeOption {
  value: string;
  label: string;
  duration: number;
}

// Fallback list used if the API is unavailable. The admin-managed catalog in
// the database is the source of truth (seeded with these same values).
export const SERVICE_TYPES: ServiceTypeOption[] = [
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
  onDurationChange: (duration: number | undefined) => void;
}

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  serviceType,
  duration,
  onServiceTypeChange,
  onDurationChange,
}) => {
  const [options, setOptions] = useState<ServiceTypeOption[]>(SERVICE_TYPES);

  useEffect(() => {
    let active = true;
    serviceTypeService
      .list(true)
      .then((types) => {
        if (!active || types.length === 0) return;
        setOptions(
          types.map((t) => ({
            value: t.code,
            label: t.name,
            duration: t.duration,
          }))
        );
      })
      .catch(() => {
        // Keep the hardcoded fallback on failure.
      });
    return () => {
      active = false;
    };
  }, []);

  // The saved appointment may reference a service type that's no longer active;
  // keep it selectable so editing doesn't silently drop the value.
  const displayOptions =
    serviceType && !options.some((o) => o.value === serviceType)
      ? [
          ...options,
          {
            value: serviceType,
            label: serviceType.replace(/_/g, ' '),
            duration,
          },
        ]
      : options;

  const handleServiceTypeChange = (newServiceType: string) => {
    const service = displayOptions.find((s) => s.value === newServiceType);
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
            {displayOptions.map((service) => (
              <MenuItem key={service.value} value={service.value}>
                {service.label} ({service.duration} min)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Duration */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <NumberInput
          fullWidth
          label="Duration (minutes)"
          min={15}
          max={480}
          value={duration}
          onChange={(v) => onDurationChange(v)}
          required
        />
      </Grid>
    </>
  );
};
