import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
  Autocomplete,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Drafts as DraftIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  ITireCreateInput,
  ITireUpdateInput,
} from '@gt-automotive/data';
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
  useTireBrands,
  useTireSizeSuggestions 
} from '../../hooks/useTires';
import TireImageUpload from '../../components/inventory/TireImageUpload';

const TIRE_TYPES = Object.values(TireType);
const TIRE_CONDITIONS = Object.values(TireCondition);

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatCondition = (condition: TireCondition): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Validation schema
const validationSchema = Yup.object({
  brand: Yup.string().required('Brand is required').min(2, 'Brand must be at least 2 characters'),
  size: Yup.string()
    .required('Size is required')
    .matches(/^\d{3}\/\d{2}R\d{2}$/, 'Size must be in format like 225/45R17'),
  type: Yup.string().oneOf(TIRE_TYPES, 'Invalid tire type').required('Type is required'),
  condition: Yup.string().oneOf(TIRE_CONDITIONS, 'Invalid condition').required('Condition is required'),
  quantity: Yup.number()
    .required('Quantity is required')
    .min(0, 'Quantity cannot be negative')
    .integer('Quantity must be a whole number'),
  price: Yup.number()
    .required('Price is required')
    .min(0.01, 'Price must be greater than 0'),
  cost: Yup.number()
    .min(0, 'Cost cannot be negative')
    .test('cost-less-than-price', 'Cost should be less than price', function(cost) {
      if (!cost || !this.parent.price) return true;
      return cost <= this.parent.price;
    }),
  minStock: Yup.number()
    .min(0, 'Minimum stock cannot be negative')
    .integer('Minimum stock must be a whole number'),
  location: Yup.string().max(100, 'Location must be 100 characters or less'),
  notes: Yup.string().max(500, 'Notes must be 500 characters or less'),
});

export function TireForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const isEditing = Boolean(id && id !== 'new');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [sizeQuery, setSizeQuery] = useState('');

  // Data fetching
  const { data: tire, isLoading: tireLoading } = useTire(id || '', isEditing);
  const { data: brands = [] } = useTireBrands();
  const { data: sizeSuggestions = [] } = useTireSizeSuggestions(sizeQuery);

  // Mutations
  const createMutation = useCreateTire();
  const updateMutation = useUpdateTire();

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Form setup
  const formik = useFormik({
    initialValues: {
      brand: '',
      size: '',
      type: TireType.ALL_SEASON as TireType,
      condition: TireCondition.NEW as TireCondition,
      quantity: '' as unknown as number,
      price: '' as unknown as number,
      cost: isAdmin ? ('' as unknown as number) : undefined,
      minStock: 5,
      location: '',
      imageUrl: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const submitData = {
          ...values,
          cost: isAdmin ? values.cost : undefined,
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
      }
    },
  });

  // Load tire data for editing
  useEffect(() => {
    if (tire && isEditing) {
      formik.setValues({
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

  const handleCancel = () => {
    if (formik.dirty) {
      setShowCancelDialog(true);
    } else {
      navigate('/inventory');
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/inventory');
  };

  const handleSaveDraft = async () => {
    // In a real app, you might save to localStorage or draft endpoint
    // For now, just save normally
    formik.handleSubmit();
  };

  const handleSizeChange = (value: string | null) => {
    setSizeQuery(value || '');
    formik.setFieldValue('size', value || '');
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

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Brand */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={brands}
                      value={formik.values.brand}
                      onChange={(_, value) => formik.setFieldValue('brand', value || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Brand *"
                          error={formik.touched.brand && Boolean(formik.errors.brand)}
                          helperText={formik.touched.brand && formik.errors.brand}
                        />
                      )}
                      freeSolo
                    />
                  </Grid>


                  {/* Size */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      options={sizeSuggestions}
                      value={formik.values.size}
                      onChange={(_, value) => handleSizeChange(value)}
                      onInputChange={(_, value) => setSizeQuery(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Size *"
                          placeholder="e.g., 225/45R17"
                          error={formik.touched.size && Boolean(formik.errors.size)}
                          helperText={formik.touched.size && formik.errors.size}
                        />
                      )}
                      freeSolo
                    />
                  </Grid>

                  {/* Type */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Type *</InputLabel>
                      <Select
                        name="type"
                        value={formik.values.type}
                        label="Type *"
                        onChange={formik.handleChange}
                        error={formik.touched.type && Boolean(formik.errors.type)}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Condition *</InputLabel>
                      <Select
                        name="condition"
                        value={formik.values.condition}
                        label="Condition *"
                        onChange={formik.handleChange}
                        error={formik.touched.condition && Boolean(formik.errors.condition)}
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Storage Location"
                      name="location"
                      value={formik.values.location}
                      onChange={formik.handleChange}
                      error={formik.touched.location && Boolean(formik.errors.location)}
                      helperText={formik.touched.location && formik.errors.location}
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
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Quantity *"
                      name="quantity"
                      type="number"
                      value={formik.values.quantity}
                      onChange={formik.handleChange}
                      error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                      helperText={formik.touched.quantity && formik.errors.quantity}
                      inputProps={{ min: 0 }}
                      autoComplete="off"
                    />
                  </Grid>

                  {/* Min Stock */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Minimum Stock Level"
                      name="minStock"
                      type="number"
                      value={formik.values.minStock}
                      onChange={formik.handleChange}
                      error={formik.touched.minStock && Boolean(formik.errors.minStock)}
                      helperText={formik.touched.minStock && formik.errors.minStock}
                      inputProps={{ min: 0 }}
                      autoComplete="off"
                    />
                  </Grid>

                  {/* Price */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Selling Price *"
                      name="price"
                      type="number"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      error={formik.touched.price && Boolean(formik.errors.price)}
                      helperText={formik.touched.price && formik.errors.price}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                      autoComplete="off"
                    />
                  </Grid>

                  {/* Cost (Admin only) */}
                  {isAdmin && (
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Cost"
                        name="cost"
                        type="number"
                        value={formik.values.cost}
                        onChange={formik.handleChange}
                        error={formik.touched.cost && Boolean(formik.errors.cost)}
                        helperText={formik.touched.cost && formik.errors.cost}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        autoComplete="off"
                      />
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Notes */}
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                  placeholder="Additional notes about this tire..."
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Images */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <TireImageUpload
                  tireId={isEditing ? id : undefined}
                  existingImages={[]}
                  primaryImageUrl={tire?.imageUrl}
                  onImagesChange={(images) => {
                    // Handle image changes
                    if (images.length > 0) {
                      formik.setFieldValue('imageUrl', images[0]);
                    }
                  }}
                  onPrimaryChange={(imageUrl) => {
                    formik.setFieldValue('imageUrl', imageUrl);
                  }}
                />
              </CardContent>
            </Card>

            {/* Preview Card */}
            {formik.values.brand && formik.values.size && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preview
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1">
                      {formik.values.brand} - {formik.values.size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formik.values.size}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Chip label={formatTireType(formik.values.type)} size="small" />
                      <Chip label={formatCondition(formik.values.condition)} size="small" />
                    </Stack>
                    <Typography variant="h6" color="primary">
                      ${formik.values.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      {formik.values.quantity} in stock
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Actions */}
        <Card sx={{ mt: 3, p: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={isLoading || !formik.dirty}
              startIcon={<DraftIcon />}
            >
              Save as Draft
            </Button>
            
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isLoading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              disabled={!formik.isValid}
            >
              {isEditing ? 'Update Tire' : 'Add Tire'}
            </LoadingButton>
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
          <Button onClick={handleConfirmCancel} color="error">
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TireForm;