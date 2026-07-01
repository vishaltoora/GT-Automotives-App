import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { NumberInput } from '../common';
import {
  CreateInspectionFeeItemDto,
  InspectionFeeItem,
  InspectionType,
  inspectionService,
} from '../../requests/inspection.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

interface InspectionFeeItemDialogProps {
  open: boolean;
  feeItem: InspectionFeeItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const INSPECTION_TYPES: Array<{ value: InspectionType | ''; label: string }> = [
  { value: '', label: 'None (general)' },
  { value: 'PEACE_OF_MIND', label: 'Peace of Mind' },
  { value: 'OUT_OF_PROVINCE', label: 'Out of Province' },
  { value: 'PRE_PURCHASE', label: 'Pre-Purchase' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'CUSTOM', label: 'Custom' },
];

export function InspectionFeeItemDialog({
  open,
  feeItem,
  onClose,
  onSaved,
}: InspectionFeeItemDialogProps) {
  const { showApiError, showValidationError } = useErrorHelpers();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<InspectionType | ''>('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(feeItem?.name ?? '');
    setDescription(feeItem?.description ?? '');
    setType((feeItem?.type as InspectionType | undefined) ?? '');
    setPrice(feeItem ? String(feeItem.price) : '');
    setIsActive(feeItem ? feeItem.isActive : true);
  }, [open, feeItem]);

  const handleSave = async () => {
    if (!name.trim()) {
      showValidationError('Name is required.');
      return;
    }
    const priceValue = Number(price);
    if (price === '' || Number.isNaN(priceValue) || priceValue < 0) {
      showValidationError('Enter a valid price (0 or greater).');
      return;
    }

    const payload: CreateInspectionFeeItemDto = {
      name: name.trim(),
      description: description.trim() || undefined,
      type: type || undefined,
      price: priceValue,
      isActive,
    };

    try {
      setSaving(true);
      if (feeItem) {
        await inspectionService.updateFeeItem(feeItem.id, payload);
      } else {
        await inspectionService.createFeeItem(payload);
      }
      onSaved();
    } catch (error) {
      showApiError(error, 'Failed to save inspection fee item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {feeItem ? 'Edit Inspection Item' : 'Add Inspection Item'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} mt={0.5}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            required
            placeholder="e.g. Peace of Mind Inspection"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <FormControl fullWidth>
            <InputLabel>Inspection Type</InputLabel>
            <Select
              label="Inspection Type"
              value={type}
              onChange={(event) =>
                setType(event.target.value as InspectionType | '')
              }
            >
              {INSPECTION_TYPES.map((option) => (
                <MenuItem key={option.value || 'none'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <NumberInput
            label="Price"
            value={price}
            onChange={(v) => setPrice(v === undefined ? '' : String(v))}
            fullWidth
            required
            allowDecimals
            min={0}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
              />
            }
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {feeItem ? 'Save Changes' : 'Add Item'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InspectionFeeItemDialog;
