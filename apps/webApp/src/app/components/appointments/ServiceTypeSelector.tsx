import React, { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import { AddCircleOutline as AddIcon } from '@mui/icons-material';
import { NumberInput } from '../common';
import { serviceTypeService } from '../../requests/service-type.requests';
import { useAuth } from '../../hooks/useAuth';
import { useError } from '../../contexts/ErrorContext';

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

// Sentinel value used by the inline "Add new service type" menu entry.
const ADD_NEW = '__ADD_NEW_SERVICE_TYPE__';

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
  const { isAdmin, isSupervisor } = useAuth();
  const { showError } = useError();
  const canManage = isAdmin || isSupervisor;

  const [options, setOptions] = useState<ServiceTypeOption[]>(SERVICE_TYPES);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const types = await serviceTypeService.list(true);
      if (types.length === 0) return [] as ServiceTypeOption[];
      const mapped = types.map((t) => ({
        value: t.code,
        label: t.name,
        duration: t.duration,
      }));
      setOptions(mapped);
      return mapped;
    } catch {
      // Keep the hardcoded fallback on failure.
      return null;
    }
  }, []);

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
    if (newServiceType === ADD_NEW) {
      setNewName('');
      setNewDuration(60);
      setAddOpen(true);
      return;
    }
    const service = displayOptions.find((s) => s.value === newServiceType);
    onServiceTypeChange(newServiceType);
    if (service) {
      onDurationChange(service.duration);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      showError('Please enter a service name.');
      return;
    }
    setSaving(true);
    try {
      const created = await serviceTypeService.create({
        name: newName.trim(),
        duration: newDuration,
      });
      await loadOptions();
      // Auto-select the newly created type.
      onServiceTypeChange(created.code);
      onDurationChange(created.duration);
      setAddOpen(false);
    } catch (err: any) {
      showError(
        err?.response?.data?.message || 'Failed to create the service type.'
      );
    } finally {
      setSaving(false);
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
            {canManage && <Divider />}
            {canManage && (
              <MenuItem value={ADD_NEW}>
                <ListItemIcon>
                  <AddIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary="Add new service type…" />
              </MenuItem>
            )}
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

      {/* Inline create dialog (admin/supervisor only) */}
      <Dialog
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Service Type</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Service Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <NumberInput
              label="Default Duration (minutes)"
              min={15}
              max={480}
              value={newDuration}
              onChange={(v) => setNewDuration(v ?? 60)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Saving…' : 'Create & Select'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
