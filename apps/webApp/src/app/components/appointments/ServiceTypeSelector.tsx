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
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { NumberInput } from '../common';
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
  const { confirm } = useConfirmation();
  const canManage = isAdmin || isSupervisor;

  const [options, setOptions] = useState<ServiceTypeOption[]>(SERVICE_TYPES);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleSelectChange = (newServiceType: string) => {
    if (newServiceType === ADD_NEW) {
      openCreate();
      return;
    }
    const service = displayOptions.find((s) => s.value === newServiceType);
    onServiceTypeChange(newServiceType);
    if (service) {
      onDurationChange(service.duration);
    }
  };

  const openCreate = () => {
    setMenuOpen(false);
    setEditingId(null);
    setFormName('');
    setFormDuration(60);
    setDialogOpen(true);
  };

  const openEdit = (option: ServiceTypeOption) => {
    if (!option.id) return;
    setMenuOpen(false);
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
    setMenuOpen(false);
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
        <FormControl fullWidth required>
          <InputLabel>Service Type</InputLabel>
          <Select
            value={serviceType}
            open={menuOpen}
            onOpen={() => setMenuOpen(true)}
            onClose={() => setMenuOpen(false)}
            onChange={(e) => handleSelectChange(e.target.value)}
            label="Service Type"
            renderValue={(value) => {
              const opt = displayOptions.find((o) => o.value === value);
              return opt ? `${opt.label} (${opt.duration} min)` : '';
            }}
          >
            {displayOptions.map((service) => (
              <MenuItem key={service.value} value={service.value}>
                <ListItemText
                  primary={`${service.label} (${service.duration} min)`}
                />
                {canManage && service.id && (
                  <Box
                    sx={{ display: 'flex', gap: 0.5, ml: 1 }}
                    // Prevent selecting the row when tapping the icons.
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(service);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(service);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
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
