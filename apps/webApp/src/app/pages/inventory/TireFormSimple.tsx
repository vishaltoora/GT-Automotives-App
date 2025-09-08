import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import {
  ITireCreateInput,
  ITireUpdateInput,
} from '@gt-automotive/shared-interfaces';
// Define enums locally to avoid Prisma client browser issues
const TireType = {
  ALL_SEASON: 'ALL_SEASON',
  SUMMER: 'SUMMER',
  WINTER: 'WINTER',
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
import { useAuth } from '../../hooks/useAuth';
import { 
  useTire, 
  useCreateTire, 
  useUpdateTire,
} from '../../hooks/useTires';

const TIRE_TYPES = Object.values(TireType);
const TIRE_CONDITIONS = Object.values(TireCondition);

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
};

const formatCondition = (condition: TireCondition): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
};

export function TireFormSimple() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const isEditing = Boolean(id && id !== 'new');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    size: '',
    type: TireType.ALL_SEASON,
    condition: TireCondition.NEW,
    quantity: 0,
    price: 0,
    cost: isAdmin ? 0 : undefined,
    minStock: 5,
    location: '',
    imageUrl: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data fetching
  const { data: tire, isLoading: tireLoading } = useTire(id || '', isEditing);

  // Mutations
  const createMutation = useCreateTire();
  const updateMutation = useUpdateTire();

  // Load tire data for editing
  useEffect(() => {
    if (tire && isEditing) {
      setFormData({
        brand: tire.brand || '',
        size: tire.size || '',
        type: tire.type || TireType.ALL_SEASON,
        condition: tire.condition || TireCondition.NEW,
        quantity: tire.quantity || 0,
        price: tire.price || 0,
        cost: tire.cost || 0,
        minStock: tire.minStock || 5,
        location: tire.location || '',
        imageUrl: tire.imageUrl || '',
        notes: tire.notes || '',
      });
    }
  }, [tire, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.size.trim()) newErrors.size = 'Size is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (isAdmin && formData.cost !== undefined && formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        cost: isAdmin ? formData.cost : undefined,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          id: id!,
          data: submitData as ITireUpdateInput,
        });
      } else {
        await createMutation.mutateAsync(submitData as ITireCreateInput);
      }

      navigate('/inventory');
    } catch (error) {
      console.error('Failed to save tire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    const hasChanges = Object.keys(formData).some(key => {
      if (tire && isEditing) {
        return formData[key as keyof typeof formData] !== tire[key as keyof typeof tire];
      }
      return formData[key as keyof typeof formData] !== (key === 'type' ? TireType.ALL_SEASON : 
        key === 'condition' ? TireCondition.NEW : 
        key === 'minStock' ? 5 : 
        typeof formData[key as keyof typeof formData] === 'number' ? 0 : '');
    });

    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      navigate('/inventory');
    }
  };

  if (tireLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading tire data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/inventory')}>
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Edit Tire' : 'Add New Tire'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditing 
              ? `Update details for ${tire?.brand} - ${tire?.size}`
              : 'Enter tire information to add to inventory'
            }
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Brand */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Brand *"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      error={!!errors.brand}
                      helperText={errors.brand}
                    />
                  </Grid>

                  {/* Model */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Model *"
                      value={formData.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      error={!!errors.model}
                      helperText={errors.model}
                    />
                  </Grid>

                  {/* Size */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Size *"
                      placeholder="e.g., 225/45R17"
                      value={formData.size}
                      onChange={(e) => handleChange('size', e.target.value)}
                      error={!!errors.size}
                      helperText={errors.size}
                    />
                  </Grid>

                  {/* Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type *</InputLabel>
                      <Select
                        value={formData.type}
                        label="Type *"
                        onChange={(e) => handleChange('type', e.target.value)}
                      >
                        {TIRE_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {formatTireType(type)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Condition */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Condition *</InputLabel>
                      <Select
                        value={formData.condition}
                        label="Condition *"
                        onChange={(e) => handleChange('condition', e.target.value)}
                      >
                        {TIRE_CONDITIONS.map((condition) => (
                          <MenuItem key={condition} value={condition}>
                            {formatCondition(condition)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Location */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Storage Location"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g., Aisle A, Shelf 3"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Inventory & Pricing
                </Typography>

                <Grid container spacing={2}>
                  {/* Quantity */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Quantity *"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                      error={!!errors.quantity}
                      helperText={errors.quantity}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  {/* Min Stock */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Minimum Stock Level"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  {/* Price */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Selling Price *"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                      error={!!errors.price}
                      helperText={errors.price}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>

                  {/* Cost (Admin only) */}
                  {isAdmin && (
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Cost"
                        type="number"
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
                  )}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Notes */}
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes about this tire..."
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Preview */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preview
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">
                    {formData.brand} {formData.model}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.size}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Chip label={formatTireType(formData.type)} size="small" />
                    <Chip label={formatCondition(formData.condition)} size="small" />
                  </Stack>
                  <Typography variant="h6" color="primary">
                    ${formData.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    {formData.quantity} in stock
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Card sx={{ mt: 3, p: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Tire' : 'Add Tire')}
            </Button>
          </Stack>
        </Card>
      </form>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to leave without saving?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>
            Continue Editing
          </Button>
          <Button onClick={() => navigate('/inventory')} color="error">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TireFormSimple;