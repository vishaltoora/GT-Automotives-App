import React, { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import { NumberInput } from '../common';
import { CrudAutocomplete } from '../common/CrudAutocomplete';
import { serviceTypeService } from '../../requests/service-type.requests';
import { useAuth } from '../../hooks/useAuth';
import { useError } from '../../contexts/ErrorContext';
import { useConfirmation } from '../../contexts/ConfirmationContext';

interface ServiceTypeOption {
  id?: string; // present only for API-loaded (manageable) types
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
  const { isAdmin, isSupervisor } = useAuth();
  const { showError } = useError();
  const { confirm } = useConfirmation();
  const canManage = isAdmin || isSupervisor;

  const [options, setOptions] = useState<ServiceTypeOption[]>(SERVICE_TYPES);

  // Create/edit dialog state. `editingId` null => creating.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    const types = await serviceTypeService.list(true);
    if (types.length === 0) return [] as ServiceTypeOption[];
    const mapped = types.map((t) => ({
      id: t.id,
      value: t.code,
      label: t.name,
      duration: t.duration,
    }));
    setOptions(mapped);
    return mapped;
  }, []);

  useEffect(() => {
    let active = true;
    loadOptions().catch(() => {
      // Keep the hardcoded fallback on failure.
      if (!active) return;
    });
    return () => {
      active = false;
    };
  }, [loadOptions]);

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

  const selectedOption =
    displayOptions.find((o) => o.value === serviceType) ?? null;

  const handleSelectChange = (newServiceType: string) => {
    const service = displayOptions.find((s) => s.value === newServiceType);
    onServiceTypeChange(newServiceType);
    if (service) {
      onDurationChange(service.duration);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormDuration(60);
    setDialogOpen(true);
  };

  const openEdit = (option: ServiceTypeOption) => {
    if (!option.id) return;
    setEditingId(option.id);
    setFormName(option.label);
    setFormDuration(option.duration);
    setDialogOpen(true);
  };

  const handleSaveDialog = async () => {
    if (!formName.trim()) {
      showError('Please enter a service name.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await serviceTypeService.update(editingId, {
          name: formName.trim(),
          duration: formDuration,
        });
        await loadOptions();
        // If the edited type is the selected one, sync its duration.
        if (updated.code === serviceType) {
          onDurationChange(updated.duration);
        }
      } else {
        const created = await serviceTypeService.create({
          name: formName.trim(),
          duration: formDuration,
        });
        await loadOptions();
        onServiceTypeChange(created.code);
        onDurationChange(created.duration);
      }
      setDialogOpen(false);
    } catch (err: any) {
      showError(
        err?.response?.data?.message || 'Failed to save the service type.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (option: ServiceTypeOption) => {
    if (!option.id) return;
    const confirmed = await confirm({
      title: 'Delete Service Type',
      message: `Delete "${option.label}"? Existing appointments keep their record, but this type will no longer be selectable.`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!confirmed) return;

    try {
      await serviceTypeService.remove(option.id);
      await loadOptions();
      // Clear the selection if the deleted type was chosen.
      if (option.value === serviceType) {
        onServiceTypeChange('');
      }
    } catch (err: any) {
      showError(
        err?.response?.data?.message || 'Failed to delete the service type.'
      );
    }
  };

  return (
    <>
      {/* Service Type */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <CrudAutocomplete<ServiceTypeOption>
          label="Service Type"
          entityLabel="service type"
          required
          options={displayOptions}
          value={selectedOption}
          onChange={(option) => handleSelectChange(option?.value ?? '')}
          getOptionId={(option) => option.value}
          getOptionLabel={(option) =>
            `${option.label} (${option.duration} min)`
          }
          // Only types loaded from the API have an id; the hardcoded fallbacks
          // and a retired type kept for an existing appointment cannot be edited.
          isOptionManageable={(option) => Boolean(option.id)}
          onAdd={canManage ? openCreate : undefined}
          onEdit={canManage ? openEdit : undefined}
          onDelete={canManage ? handleDelete : undefined}
        />
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

      {/* Create / edit dialog (admin/supervisor only) */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editingId ? 'Edit Service Type' : 'Add Service Type'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Service Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <NumberInput
              label="Default Duration (minutes)"
              min={15}
              max={480}
              value={formDuration}
              onChange={(v) => setFormDuration(v ?? 60)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDialog}
            disabled={saving}
          >
            {saving
              ? 'Saving…'
              : editingId
              ? 'Save Changes'
              : 'Create & Select'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
