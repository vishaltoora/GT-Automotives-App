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
import { AddIcon, EditIcon, DeleteIcon } from '../../icons/standard.icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TireBrandService, TireBrand, CreateTireBrandDto, UpdateTireBrandDto } from '../../services/tire-brand.service';

interface BrandSelectProps {
  value?: string;
  onChange: (brandId: string, brandName: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

interface BrandDialogProps {
  open: boolean;
  onClose: () => void;
  brand?: TireBrand | null;
  onSuccess: () => void;
}

function BrandDialog({ open, onClose, brand, onSuccess }: BrandDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!brand;
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<{ name?: string; imageUrl?: string }>({});

  useEffect(() => {
    if (open) {
      if (brand) {
        setFormData({
          name: brand.name,
          imageUrl: brand.imageUrl || '',
        });
      } else {
        setFormData({
          name: '',
          imageUrl: '',
        });
      }
      setErrors({});
    }
  }, [brand, open]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateTireBrandDto) => {
      // Ensure we have a valid token before making the request
      await ensureValidToken();
      return TireBrandService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Create brand failed:', error?.response?.data?.message || error.message);
      }
    },
  });

  // Function to ensure we have a valid auth token
  const ensureValidToken = async () => {
    let token = localStorage.getItem('authToken');

    if (!token && window.Clerk?.session) {
      try {
        token = await window.Clerk.session.getToken();
        if (token) {
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        throw new Error('Authentication required');
      }
    }

    if (!token) {
      throw new Error('No authentication token available');
    }

    return token;
  };

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateTireBrandDto) => {
      // Ensure we have a valid token before making the request
      await ensureValidToken();
      return TireBrandService.update(brand!.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Update brand failed:', error?.response?.data?.message || error.message);
      }
    },
  });

  const handleSubmit = () => {
    const newErrors: { name?: string; imageUrl?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (formData.imageUrl && !formData.imageUrl.match(/^https?:\/\/.+/)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const data = {
      name: formData.name.trim(),
      ...(formData.imageUrl.trim() && { imageUrl: formData.imageUrl.trim() }),
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
      <DialogTitle>{isEditMode ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </Alert>
          )}

          <TextField
            label="Brand Name"
            fullWidth
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            error={!!errors.name}
            helperText={errors.name || (isEditMode ? "Brand name cannot be changed" : undefined)}
            margin="normal"
            required
            disabled={isEditMode}
            InputProps={{
              readOnly: isEditMode,
            }}
          />

          <TextField
            label="Image URL (Optional)"
            fullWidth
            value={formData.imageUrl}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
              if (errors.imageUrl) setErrors(prev => ({ ...prev, imageUrl: undefined }));
            }}
            error={!!errors.imageUrl}
            helperText={errors.imageUrl}
            margin="normal"
            placeholder="https://example.com/brand-logo.jpg"
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
          {isEditMode ? 'Update' : 'Add'} Brand
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function BrandSelect({ value, onChange, error, helperText, disabled }: BrandSelectProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<TireBrand | null>(null);
  const [, setIsAuthenticated] = useState(true);

  // Check if we have a token which indicates authentication capability
  const hasAuthToken = !!localStorage.getItem('authToken') || !!window.Clerk?.session;

  // Try to load full brand objects for authenticated users with CRUD, fallback to simple names
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['tire-brands'],
    queryFn: async () => {
      try {
        // Try authenticated endpoint first for full CRUD functionality
        return await TireBrandService.getAll();
      } catch (error: any) {
        // If auth fails (401), fallback to public endpoint and create mock brand objects
        if (error?.response?.status === 401) {
          setIsAuthenticated(false);
          const brandNames = await TireBrandService.getBrands();
          return brandNames.map(name => ({
            id: name, // Use name as ID for fallback
            name,
            imageUrl: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
        throw error;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => TireBrandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
      // If the deleted brand was selected, clear the selection
      if (value && brands.find(b => b.id === value && !brands.find(b2 => b2.id === value))) {
        onChange('', '');
      }
    },
  });

  const handleAddNew = () => {
    setEditingBrand(null);
    setDialogOpen(true);
  };

  const handleEdit = (brand: TireBrand) => {
    setEditingBrand(brand);
    setDialogOpen(true);
  };

  const handleDelete = async (brand: TireBrand) => {
    if (window.confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(brand.id);
    }
  };

  const handleChange = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    onChange(brandId, brand?.name || '');
  };

  const selectedBrand = brands.find(b => b.name === value);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Autocomplete
          options={brands}
          getOptionLabel={(option) => option.name}
          value={selectedBrand || null}
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
              label="Brand"
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
            <Tooltip title="Add new brand">
              <IconButton
                size="small"
                onClick={handleAddNew}
                disabled={disabled}
                sx={{ p: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {selectedBrand && (
              <>
                <Tooltip title="Edit brand">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(selectedBrand)}
                    disabled={disabled}
                    sx={{ p: 0.5 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete brand">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(selectedBrand)}
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
              </>
            )}
          </Box>
        )}
      </Box>

      {hasAuthToken && (
        <BrandDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          brand={editingBrand}
          onSuccess={() => {
            // If we just added a new brand, auto-select it
            if (!editingBrand) {
              queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
            }
          }}
        />
      )}
    </>
  );
}