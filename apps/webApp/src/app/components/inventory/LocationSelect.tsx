import { useState, useEffect } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Tooltip,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { AddIcon, DeleteIcon } from '../../icons/standard.icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LocationService, Location, CreateLocationDto } from '../../requests/location.requests';

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
  onSuccess: () => void;
}

function LocationDialog({ open, onClose, onSuccess }: LocationDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
      });
      setErrors({});
    }
  }, [open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateLocationDto) => LocationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onSuccess();
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

    createMutation.mutate(data);
  };

  const isLoading = createMutation.isPending;
  const error = createMutation.error;

  return (
    <Dialog open={open} disableEscapeKeyDown maxWidth="sm" fullWidth>
      <DialogTitle>Add New Location</DialogTitle>
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
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
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
          Add Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function LocationSelect({ value, onChange, error, helperText, disabled }: LocationSelectProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, setIsAuthenticated] = useState(true);

  // Check if we have a token which indicates authentication capability
  const hasAuthToken = !!localStorage.getItem('authToken') || !!window.Clerk?.session;

  // Try to load full location objects for authenticated users with CRUD, fallback to simple names
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        // Try authenticated endpoint first for full CRUD functionality
        return await LocationService.getAll();
      } catch (error: any) {
        // If auth fails (401), fallback to public endpoint and create mock location objects
        if (error?.response?.status === 401) {
          setIsAuthenticated(false);
          const locationNames = await LocationService.getLocations();
          return locationNames.map(name => ({
            id: name, // Use name as ID for fallback
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
        throw error;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LocationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      // If the deleted location was selected, clear the selection
      if (value && locations.find(l => l.id === value && !locations.find(l2 => l2.id === value))) {
        onChange('', '');
      }
    },
  });

  const handleAddNew = () => {
    setDialogOpen(true);
  };

  const handleDelete = async (location: Location) => {
    if (window.confirm(`Are you sure you want to delete "${location.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(location.id);
    }
  };

  const handleChange = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    onChange(locationId, location?.name || '');
  };

  const selectedLocation = locations.find(l => l.name === value);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Autocomplete
          options={locations}
          getOptionLabel={(option) => option.name}
          value={selectedLocation || null}
          onChange={(event, newValue) => {
            if (newValue) {
              handleChange(newValue.id);
            } else {
              onChange('', '');
            }
          }}
          loading={isLoading}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Location"
              error={error}
              helperText={helperText}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          filterOptions={(options, { inputValue }) => {
            return options.filter((option) =>
              option.name.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
        />
        {hasAuthToken && (
          <Box sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1
          }}>
            <Tooltip title="Add new location">
              <IconButton
                size="small"
                onClick={handleAddNew}
                disabled={disabled}
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {selectedLocation && (
              <Tooltip title="Delete location">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(selectedLocation)}
                  disabled={disabled || deleteMutation.isPending}
                  sx={{ p: 0.5 }}
                >
                  {deleteMutation.isPending ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {hasAuthToken && (
        <LocationDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSuccess={() => {
            // Auto-select the newly added location if possible
            queryClient.invalidateQueries({ queryKey: ['locations'] });
          }}
        />
      )}
    </>
  );
}