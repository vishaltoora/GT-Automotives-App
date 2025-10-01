import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { 
  TireDto, 
  CreateTireDto, 
  UpdateTireDto
} from '@gt-automotive/data';
// Define enums locally to avoid Prisma client browser issues
const TireType = {
  ALL_SEASON: 'ALL_SEASON',
  SUMMER: 'SUMMER',
  WINTER: 'WINTER',
  WINTER_STUDDED: 'WINTER_STUDDED',
  PERFORMANCE: 'PERFORMANCE',
  OFF_ROAD: 'OFF_ROAD',
  RUN_FLAT: 'RUN_FLAT',
} as const;

const TireCondition = {
  NEW: 'NEW',
  USED_EXCELLENT: 'USED_EXCELLENT',
  USED_GOOD: 'USED_GOOD',
  USED_FAIR: 'USED_FAIR',
} as const;

type TireType = typeof TireType[keyof typeof TireType];
type TireCondition = typeof TireCondition[keyof typeof TireCondition];
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TireService } from '../../services/tire.service';
import { useAuth } from '../../hooks/useAuth';
import { BrandSelect } from './BrandSelect';
import { SizeSelect } from './SizeSelect';
import { LocationSelect } from './LocationSelect';

// Type declaration for Clerk global
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken(): Promise<string>;
      };
    };
  }
}

interface TireDialogProps {
  open: boolean;
  onClose: () => void;
  tire?: TireDto | null;
  onSuccess?: () => void;
}

const TIRE_TYPES = [
  { value: TireType.ALL_SEASON, label: '🌤️ All Season' },
  { value: TireType.SUMMER, label: '☀️ Summer' },
  { value: TireType.WINTER, label: '❄️ Winter' },
  { value: TireType.WINTER_STUDDED, label: '🧊 Winter Studded' },
  { value: TireType.PERFORMANCE, label: '🏁 Performance' },
  { value: TireType.OFF_ROAD, label: '🏔️ Off Road' },
  { value: TireType.RUN_FLAT, label: '🔧 Run Flat' },
];

const TIRE_CONDITIONS = [
  { value: TireCondition.NEW, label: 'New' },
  { value: TireCondition.USED_EXCELLENT, label: 'Used - Excellent' },
  { value: TireCondition.USED_GOOD, label: 'Used - Good' },
  { value: TireCondition.USED_FAIR, label: 'Used - Fair' },
];

export function TireDialog({ open, onClose, tire, onSuccess }: TireDialogProps) {
  const queryClient = useQueryClient();
  useAuth();
  const isEditMode = !!tire;

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

  const [formData, setFormData] = useState<CreateTireDto>({
    brand: '',
    size: '',
    type: TireType.ALL_SEASON as any,
    condition: TireCondition.NEW as any,
    quantity: 0,
    price: 0,
    cost: 0,
    minStock: 5,
    location: '',
    notes: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTireDto, string>>>({});

  useEffect(() => {
    if (open) {
      if (tire) {
        setFormData({
          brand: tire.brand || '',
          size: tire.size || '',
          type: tire.type,
          condition: tire.condition,
          quantity: tire.quantity,
          price: tire.price,
          cost: tire.cost || 0,
          minStock: tire.minStock,
          location: tire.location || '',
          notes: tire.notes || '',
          imageUrl: tire.imageUrl || '',
        });
      } else {
        setFormData({
          brand: '',
          size: '',
          type: TireType.ALL_SEASON as any,
          condition: TireCondition.NEW as any,
          quantity: 0,
          price: 0,
          cost: 0,
          minStock: 5,
          location: '',
          notes: '',
          imageUrl: '',
        });
      }
      setErrors({});
    }
  }, [tire, open]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateTireDto) => {
      // Ensure we have a valid token before making the request
      await ensureValidToken();
      return TireService.createTire(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Create tire failed:', error?.response?.data?.message || error.message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateTireDto) => {
      // Ensure we have a valid token before making the request
      await ensureValidToken();
      return TireService.updateTire(tire!.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] });
      queryClient.invalidateQueries({ queryKey: ['tire', tire!.id] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Update tire failed:', error?.response?.data?.message || error.message);
      }
    },
  });

  const handleSubmit = () => {
    const newErrors: Partial<Record<keyof CreateTireDto, string>> = {};

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.size.trim()) newErrors.size = 'Size is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.cost && formData.cost < 0) newErrors.cost = 'Cost cannot be negative';
    if (formData.minStock != null && formData.minStock < 0) newErrors.minStock = 'Minimum stock cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clean up optional fields before submission
    const cleanedData = { ...formData };
    
    // Handle cost field - if 0 or empty, remove it (optional field)
    if (!cleanedData.cost || cleanedData.cost <= 0) {
      delete (cleanedData as any).cost;
    }
    
    // Handle imageUrl field - if empty string, remove it (optional field)
    if (!cleanedData.imageUrl || cleanedData.imageUrl.trim() === '') {
      delete cleanedData.imageUrl;
    }

    // Handle location field - if empty string, remove it (optional field)
    if (!cleanedData.location || cleanedData.location.trim() === '') {
      delete cleanedData.location;
    }

    // Handle notes field - if empty string, remove it (optional field)  
    if (!cleanedData.notes || cleanedData.notes.trim() === '') {
      delete cleanedData.notes;
    }

    if (isEditMode) {
      updateMutation.mutate(cleanedData as UpdateTireDto);
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const handleChange = (field: keyof CreateTireDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBrandChange = (brandId: string, brandName: string) => {
    handleChange('brand', brandName);

    // Find the brand object to get its image URL
    const brands = queryClient.getQueryData(['tire-brands']) as any[];
    if (brands) {
      const selectedBrand = brands.find(b => b.id === brandId);
      if (selectedBrand?.imageUrl) {
        // Auto-populate image URL from selected brand
        handleChange('imageUrl', selectedBrand.imageUrl);
      } else {
        // Clear image URL if brand has no image
        handleChange('imageUrl', '');
      }
    }
  };

  const handleSizeChange = (sizeId: string, sizeName: string) => {
    handleChange('size', sizeName);
  };

  const handleLocationChange = (locationId: string, locationName: string) => {
    handleChange('location', locationName);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Tire' : 'Add New Tire'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.response?.data?.message || 'An error occurred'}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <BrandSelect
                value={formData.brand}
                onChange={handleBrandChange}
                error={!!errors.brand}
                helperText={errors.brand}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SizeSelect
                value={formData.size}
                onChange={handleSizeChange}
                error={!!errors.size}
                helperText={errors.size}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <LocationSelect
                value={formData.location}
                onChange={handleLocationChange}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {TIRE_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition}
                  label="Condition"
                  onChange={(e) => handleChange('condition', e.target.value)}
                >
                  {TIRE_CONDITIONS.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                error={!!errors.quantity}
                helperText={errors.quantity}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Cost"
                type="number"
                fullWidth
                value={formData.cost}
                onChange={(e) => handleChange('cost', parseFloat(e.target.value) || 0)}
                error={!!errors.cost}
                helperText={errors.cost}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Minimum Stock"
                type="number"
                fullWidth
                value={formData.minStock}
                onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                error={!!errors.minStock}
                helperText={errors.minStock}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Image URL"
                fullWidth
                value={formData.imageUrl}
                onChange={(e) => handleChange('imageUrl', e.target.value)}
                placeholder="https://example.com/tire-image.jpg"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional information about this tire..."
              />
            </Grid>
          </Grid>
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
          {isEditMode ? 'Update' : 'Add'} Tire
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TireDialog;