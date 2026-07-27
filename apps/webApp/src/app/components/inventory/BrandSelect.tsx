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
  TireBrandService,
  TireBrand,
  CreateTireBrandDto,
  UpdateTireBrandDto,
} from '../../requests/tire-brand.requests';

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
  onSuccess: (saved: TireBrand) => void;
}

function BrandDialog({ open, onClose, brand, onSuccess }: BrandDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!brand;
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<{ name?: string; imageUrl?: string }>(
    {}
  );

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
    mutationFn: (data: CreateTireBrandDto) => TireBrandService.create(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
      onSuccess(saved);
      onClose();
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Create brand failed:',
          error?.response?.data?.message || error.message
        );
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTireBrandDto) =>
      TireBrandService.update(brand!.id, data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['tire-brands'] });
      onSuccess(saved);
      onClose();
    },
    onError: (error: any) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Update brand failed:',
          error?.response?.data?.message || error.message
        );
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
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            required
          />

          <TextField
            label="Image URL (Optional)"
            fullWidth
            value={formData.imageUrl}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, imageUrl: e.target.value }));
              if (errors.imageUrl)
                setErrors((prev) => ({ ...prev, imageUrl: undefined }));
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

export function BrandSelect({
  value,
  onChange,
  error,
  helperText,
  disabled,
}: BrandSelectProps) {
  const {
    items: brands,
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
  } = useCatalogSelect<TireBrand>({
    queryKey: ['tire-brands'],
    entityLabel: 'brand',
    fetchAll: () => TireBrandService.getAll(),
    fetchNames: () => TireBrandService.getBrands(),
    toFallbackItem: (name) =>
      ({
        id: name,
        name,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TireBrand),
    remove: (id) => TireBrandService.delete(id),
    getId: (brand) => brand.id,
    getLabel: (brand) => brand.name,
    onDeleted: (brand) => {
      // The field holds the brand *name*; clear it when that brand is gone.
      if (brand.name === value) onChange('', '');
    },
  });

  const selectedBrand = brands.find((b) => b.name === value) ?? null;

  return (
    <>
      <CrudAutocomplete<TireBrand>
        label="Brand"
        entityLabel="brand"
        options={brands}
        value={selectedBrand}
        onChange={(brand) => onChange(brand?.id ?? '', brand?.name ?? '')}
        getOptionId={(brand) => brand.id}
        getOptionLabel={(brand) => brand.name}
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
        <BrandDialog
          open={dialogOpen}
          onClose={closeDialog}
          brand={editingItem}
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
