import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CrudAutocomplete } from '../common/CrudAutocomplete';
import { useCatalogSelect } from '../../hooks/useCatalogSelect';
import {
  LocationService,
  Location,
  CreateLocationDto,
  UpdateLocationDto,
} from '../../requests/location.requests';

interface LocationSelectProps {
  value?: string;
  onChange: (locationId: string, locationName: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
  location?: Location | null;
  onSuccess: (saved: Location) => void;
}

function LocationDialog({
  open,
  onClose,
  location,
  onSuccess,
}: LocationDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!location;
  const [formData, setFormData] = useState({
    name: '',
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: location?.name ?? '',
      });
      setErrors({});
    }
  }, [open, location]);

  const createMutation = useMutation({
    mutationFn: (data: CreateLocationDto) => LocationService.create(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onSuccess(saved);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLocationDto) =>
      LocationService.update(location!.id, data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onSuccess(saved);
      onClose();
    },
  });

  const handleSubmit = () => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Location name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      name: formData.name.trim(),
    };

    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} disableEscapeKeyDown maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Edit Location' : 'Add New Location'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </Alert>
          )}

          <TextField
            label="Location Name"
            fullWidth
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            required
            placeholder="e.g., Main Warehouse, Storage Room A"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          {isEditMode ? 'Update' : 'Add'} Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function LocationSelect({
  value,
  onChange,
  error,
  helperText,
  disabled,
}: LocationSelectProps) {
  const {
    items: locations,
    isLoading,
    canManage,
    canDelete,
    dialogOpen,
    editingItem,
    openAdd,
    openEdit,
    closeDialog,
    requestDelete,
    pendingDeleteId,
  } = useCatalogSelect<Location>({
    queryKey: ['locations'],
    entityLabel: 'location',
    fetchAll: () => LocationService.getAll(),
    fetchNames: () => LocationService.getLocations(),
    toFallbackItem: (name) =>
      ({
        id: name,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Location),
    remove: (id) => LocationService.delete(id),
    getId: (location) => location.id,
    getLabel: (location) => location.name,
    onDeleted: (location) => {
      if (location.name === value) onChange('', '');
    },
  });

  const selectedLocation = locations.find((l) => l.name === value) ?? null;

  return (
    <>
      <CrudAutocomplete<Location>
        label="Location"
        entityLabel="location"
        options={locations}
        value={selectedLocation}
        onChange={(location) =>
          onChange(location?.id ?? '', location?.name ?? '')
        }
        getOptionId={(location) => location.id}
        getOptionLabel={(location) => location.name}
        loading={isLoading}
        disabled={disabled}
        error={error}
        helperText={helperText}
        onAdd={canManage ? openAdd : undefined}
        onEdit={canManage ? openEdit : undefined}
        onDelete={canDelete ? requestDelete : undefined}
        pendingDeleteId={pendingDeleteId}
      />

      {canManage && (
        <LocationDialog
          open={dialogOpen}
          onClose={closeDialog}
          location={editingItem}
          onSuccess={(saved) => {
            // Select what was just created, and follow a rename through to the
            // field — it stores the name, so a rename would otherwise blank it.
            if (!editingItem || editingItem.name === value) {
              onChange(saved.id, saved.name);
            }
          }}
        />
      )}
    </>
  );
}
