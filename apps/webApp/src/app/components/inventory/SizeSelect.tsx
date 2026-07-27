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
  TireSizeService,
  TireSize,
  CreateTireSizeDto,
  UpdateTireSizeDto,
} from '../../requests/tire-size.requests';

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
  onSuccess: (saved: TireSize) => void;
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
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['tire-sizes'] });
      onSuccess(saved);
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTireSizeDto) =>
      TireSizeService.update(size!.id, data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['tire-sizes'] });
      onSuccess(saved);
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
              setFormData((prev) => ({ ...prev, size: e.target.value }));
              if (errors.size)
                setErrors((prev) => ({ ...prev, size: undefined }));
            }}
            error={!!errors.size}
            helperText={errors.size}
            margin="normal"
            placeholder="e.g., 225/65R17, 265/70R16"
            required
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

export function SizeSelect({
  value,
  onChange,
  error,
  helperText,
  disabled,
}: SizeSelectProps) {
  const {
    items: sizes,
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
  } = useCatalogSelect<TireSize>({
    queryKey: ['tire-sizes'],
    entityLabel: 'size',
    fetchAll: () => TireSizeService.getAll(),
    fetchNames: () => TireSizeService.getSizes(),
    toFallbackItem: (size) =>
      ({
        id: size,
        size,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TireSize),
    remove: (id) => TireSizeService.delete(id),
    getId: (size) => size.id,
    getLabel: (size) => size.size,
    onDeleted: (size) => {
      if (size.size === value) onChange('', '');
    },
  });

  const selectedSize = sizes.find((s) => s.size === value) ?? null;

  return (
    <>
      <CrudAutocomplete<TireSize>
        label="Size"
        entityLabel="size"
        options={sizes}
        value={selectedSize}
        onChange={(size) => onChange(size?.id ?? '', size?.size ?? '')}
        getOptionId={(size) => size.id}
        getOptionLabel={(size) => size.size}
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
        <SizeDialog
          open={dialogOpen}
          onClose={closeDialog}
          size={editingItem}
          onSuccess={(saved) => {
            // Select what was just created, and follow a rename through to the
            // field — it stores the size, so a rename would otherwise blank it.
            if (!editingItem || editingItem.size === value) {
              onChange(saved.id, saved.size);
            }
          }}
        />
      )}
    </>
  );
}
