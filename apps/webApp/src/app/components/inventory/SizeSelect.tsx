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
import { TireSizeService, TireSize, CreateTireSizeDto, UpdateTireSizeDto } from '../../services/tire-size.service';

interface SizeSelectProps {
  value?: string;
  onChange: (sizeId: string, sizeName: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

interface SizeDialogProps {
  open: boolean;
  onClose: () => void;
  size?: TireSize | null;
  onSuccess: () => void;
}

function SizeDialog({ open, onClose, size, onSuccess }: SizeDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!size;
  const [formData, setFormData] = useState({
    size: '',
  });
  const [errors, setErrors] = useState<{ size?: string }>({});

  useEffect(() => {
    if (size) {
      setFormData({
        size: size.size,
      });
    } else {
      setFormData({
        size: '',
      });
    }
    setErrors({});
  }, [size, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateTireSizeDto) => TireSizeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-sizes'] });
      onSuccess();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTireSizeDto) => TireSizeService.update(size!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-sizes'] });
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = () => {
    const newErrors: { size?: string } = {};

    if (!formData.size.trim()) {
      newErrors.size = 'Size is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      size: formData.size.trim(),
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
      <DialogTitle>{isEditMode ? 'Edit Size' : 'Add New Size'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </Alert>
          )}

          <TextField
            label="Tire Size"
            fullWidth
            value={formData.size}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, size: e.target.value }));
              if (errors.size) setErrors(prev => ({ ...prev, size: undefined }));
            }}
            error={!!errors.size}
            helperText={errors.size || (isEditMode ? "Tire size cannot be changed" : undefined)}
            margin="normal"
            placeholder={isEditMode ? undefined : "e.g., 225/65R17, 265/70R16"}
            required
            disabled={isEditMode}
            InputProps={{
              readOnly: isEditMode,
            }}
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
          {isEditMode ? 'Update' : 'Add'} Size
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SizeSelect({ value, onChange, error, helperText, disabled }: SizeSelectProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<TireSize | null>(null);
  const [, setIsAuthenticated] = useState(true);

  // Check if we have a token which indicates authentication capability
  const hasAuthToken = !!localStorage.getItem('authToken') || !!window.Clerk?.session;

  // Try to load full size objects for authenticated users with CRUD, fallback to simple names
  const { data: sizes = [], isLoading } = useQuery({
    queryKey: ['tire-sizes'],
    queryFn: async () => {
      try {
        // Try authenticated endpoint first for full CRUD functionality
        return await TireSizeService.getAll();
      } catch (error: any) {
        // If auth fails (401), fallback to public endpoint and create mock size objects
        if (error?.response?.status === 401) {
          setIsAuthenticated(false);
          const sizeNames = await TireSizeService.getSizes();
          return sizeNames.map(size => ({
            id: size, // Use size as ID for fallback
            size,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
        throw error;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TireSizeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-sizes'] });
      // If the deleted size was selected, clear the selection
      if (value && sizes.find(s => s.id === value && !sizes.find(s2 => s2.id === value))) {
        onChange('', '');
      }
    },
  });

  const handleAddNew = () => {
    setEditingSize(null);
    setDialogOpen(true);
  };

  const handleDelete = async (size: TireSize) => {
    if (window.confirm(`Are you sure you want to delete size "${size.size}"? This action cannot be undone.`)) {
      deleteMutation.mutate(size.id);
    }
  };

  const handleChange = (sizeId: string) => {
    const size = sizes.find(s => s.id === sizeId);
    onChange(sizeId, size?.size || '');
  };

  const selectedSize = sizes.find(s => s.size === value);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Autocomplete
          options={sizes}
          getOptionLabel={(option) => option.size}
          value={selectedSize || null}
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
              label="Size"
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
              option.size.toLowerCase().includes(inputValue.toLowerCase())
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
            <Tooltip title="Add new size">
              <IconButton
                size="small"
                onClick={handleAddNew}
                disabled={disabled}
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {selectedSize && (
              <Tooltip title="Delete size">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(selectedSize)}
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
        <SizeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          size={editingSize}
          onSuccess={() => {
            // If we just added a new size, auto-select it
            if (!editingSize) {
              queryClient.invalidateQueries({ queryKey: ['tire-sizes'] });
            }
          }}
        />
      )}
    </>
  );
}