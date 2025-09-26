import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Stack,
  Alert,
  Divider,
  IconButton,
  Paper,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { TireResponseDto as ITire } from '@gt-automotive/data';
import { useStockAdjustment } from '../../hooks/useTires';

interface StockAdjustmentDialogProps {
  open: boolean;
  tire: ITire | null;
  onClose: () => void;
  onConfirm?: (adjustment: { quantity: number; type: 'add' | 'remove' | 'set'; reason: string }) => void;
}

interface AdjustmentForm {
  type: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
}

const ADJUSTMENT_TYPES = [
  { value: 'add', label: 'Add Stock', icon: <AddIcon />, description: 'Increase inventory quantity' },
  { value: 'remove', label: 'Remove Stock', icon: <RemoveIcon />, description: 'Decrease inventory quantity' },
  { value: 'set', label: 'Set Stock', icon: <EditIcon />, description: 'Set exact inventory quantity' },
] as const;

const COMMON_REASONS = [
  'New shipment received',
  'Return from customer',
  'Sale to customer',
  'Damaged/defective',
  'Inventory correction',
  'Transfer to another location',
  'Promotional giveaway',
  'Internal use',
];

export function StockAdjustmentDialog({ 
  open, 
  tire, 
  onClose, 
  onConfirm 
}: StockAdjustmentDialogProps) {
  const [form, setForm] = useState<AdjustmentForm>({
    type: 'add',
    quantity: 1,
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stockAdjustmentMutation = useStockAdjustment();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setForm({
        type: 'add',
        quantity: 1,
        reason: '',
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.quantity || form.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (form.type === 'remove' && tire && form.quantity > tire.quantity) {
      newErrors.quantity = `Cannot remove more than current stock (${tire.quantity})`;
    }

    if (!form.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!tire || !validateForm()) return;

    try {
      if (onConfirm) {
        onConfirm(form);
      } else {
        await stockAdjustmentMutation.mutateAsync({
          id: tire.id,
          adjustment: form,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  };

  const calculateNewQuantity = (): number => {
    if (!tire) return 0;

    switch (form.type) {
      case 'add':
        return tire.quantity + form.quantity;
      case 'remove':
        return Math.max(0, tire.quantity - form.quantity);
      case 'set':
        return form.quantity;
      default:
        return tire.quantity;
    }
  };

  if (!tire) return null;

  const newQuantity = calculateNewQuantity();
  const isLoading = stockAdjustmentMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">Adjust Stock</Typography>
          <Typography variant="body2" color="text.secondary">
            {tire.brand} - {tire.size}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Current Stock Display */}
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InventoryIcon color="primary" />
              <Typography variant="subtitle1">Current Stock</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {tire.quantity} units
            </Typography>
            {tire.quantity <= (tire.minStock || 5) && (
              <Chip 
                label="Low Stock" 
                color="warning" 
                size="small" 
                sx={{ mt: 1 }}
              />
            )}
          </Paper>

          {/* Adjustment Type */}
          <FormControl component="fieldset">
            <FormLabel component="legend">Adjustment Type</FormLabel>
            <RadioGroup
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'add' | 'remove' | 'set' })}
            >
              {ADJUSTMENT_TYPES.map((type) => (
                <FormControlLabel
                  key={type.value}
                  value={type.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {type.icon}
                      <Box>
                        <Typography variant="body1">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Quantity Input */}
          <TextField
            label={form.type === 'set' ? 'New Stock Quantity' : 'Quantity to Adjust'}
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
            error={!!errors.quantity}
            helperText={errors.quantity}
            fullWidth
            inputProps={{ min: 1 }}
          />

          {/* Reason Input */}
          <FormControl fullWidth>
            <TextField
              label="Reason for Adjustment"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              error={!!errors.reason}
              helperText={errors.reason}
              multiline
              rows={2}
              placeholder="Explain why you're adjusting the stock..."
            />
            
            {/* Common Reasons */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Common reasons:
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                {COMMON_REASONS.map((reason) => (
                  <Chip
                    key={reason}
                    label={reason}
                    size="small"
                    variant="outlined"
                    onClick={() => setForm({ ...form, reason })}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          </FormControl>

          <Divider />

          {/* Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Stock Adjustment Preview
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Stock
                  </Typography>
                  <Typography variant="h6">
                    {tire.quantity}
                  </Typography>
                </Box>
                
                <Typography variant="h6" color="text.secondary">
                  →
                </Typography>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    New Stock
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={newQuantity <= (tire.minStock || 5) ? 'warning.main' : 'primary.main'}
                  >
                    {newQuantity}
                  </Typography>
                </Box>
              </Stack>
              
              {newQuantity <= (tire.minStock || 5) && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  {newQuantity === 0 
                    ? 'This will result in zero stock!'
                    : 'This will result in low stock levels.'
                  }
                </Alert>
              )}
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || Object.keys(errors).length > 0}
        >
          {isLoading ? 'Adjusting...' : 'Confirm Adjustment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StockAdjustmentDialog;