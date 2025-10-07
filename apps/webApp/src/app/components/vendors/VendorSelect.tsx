import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import vendorService, { Vendor } from '../../services/vendor.service';
import VendorDialog from './VendorDialog';
import { useError } from '../../contexts/ErrorContext';

interface VendorSelectProps {
  vendors: Vendor[];
  value?: string;
  onChange: (vendorId: string, vendorName: string) => void;
  onVendorsChange: () => void;
  disabled?: boolean;
  allowFreeSolo?: boolean;
  onFreeTextChange?: (vendorName: string) => void;
  size?: 'small' | 'medium';
}

export const VendorSelect: React.FC<VendorSelectProps> = ({
  vendors,
  value,
  onChange,
  onVendorsChange,
  disabled = false,
  allowFreeSolo = true,
  onFreeTextChange,
  size = 'medium',
}) => {
  const { showError } = useError();
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const selectedVendor = vendors.find(v => v.id === value);

  const handleVendorSelect = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      onChange(vendor.id, vendor.name);
    }
  };

  const handleAddNew = () => {
    setEditingVendor(null);
    setVendorDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedVendor) {
      setEditingVendor(selectedVendor);
      setVendorDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedVendor) {
      setVendorToDelete(selectedVendor);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      setDeleting(true);
      await vendorService.delete(vendorToDelete.id);
      // Clear selection if deleted vendor was selected
      onChange('', '');
      await onVendorsChange();
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch (error) {
      showError('Failed to delete vendor');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setVendorToDelete(null);
  };

  const handleVendorSave = async (vendorData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }) => {
    try {
      if (editingVendor) {
        // Update existing vendor
        await vendorService.update(editingVendor.id, vendorData);
      } else {
        // Create new vendor
        const newVendor = await vendorService.create(vendorData);
        // Auto-select the newly created vendor
        onChange(newVendor.id, newVendor.name);
      }
      await onVendorsChange();
      setVendorDialogOpen(false);
      setEditingVendor(null);
    } catch (error) {
      showError(editingVendor ? 'Failed to update vendor' : 'Failed to create vendor');
      console.error('Vendor save error:', error);
    }
  };

  const handleAutocompleteChange = (_: any, newValue: Vendor | string | null) => {
    if (typeof newValue === 'string') {
      // Free-text input
      if (allowFreeSolo && onFreeTextChange) {
        onFreeTextChange(newValue);
      }
      onChange('', newValue);
    } else if (newValue) {
      // Selected from list
      handleVendorSelect(newValue.id);
    } else {
      // Cleared
      onChange('', '');
    }
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Autocomplete
          options={vendors}
          value={selectedVendor || null}
          onChange={handleAutocompleteChange}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
          renderOption={(props, vendor) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {vendor.name}
                </Typography>
                {vendor.email && (
                  <Typography variant="caption" color="text.secondary">
                    {vendor.email}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vendor"
              placeholder={allowFreeSolo ? 'Select or type vendor name' : 'Select vendor'}
              size={size}
            />
          )}
          size={size}
          fullWidth
          disabled={disabled}
          freeSolo={allowFreeSolo}
          onInputChange={(_, inputValue) => {
            if (allowFreeSolo && !selectedVendor && onFreeTextChange) {
              onFreeTextChange(inputValue);
            }
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            right: 40,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            zIndex: 1,
          }}
        >
          <Tooltip title="Add new vendor">
            <IconButton
              size="small"
              onClick={handleAddNew}
              disabled={disabled}
              sx={{ p: 0.5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {selectedVendor && (
            <>
              <Tooltip title="Edit vendor">
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  disabled={disabled}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete vendor">
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  disabled={disabled || deleting}
                  sx={{ p: 0.5 }}
                >
                  {deleting ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DeleteIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <VendorDialog
        open={vendorDialogOpen}
        onClose={() => {
          setVendorDialogOpen(false);
          setEditingVendor(null);
        }}
        onSave={handleVendorSave}
        vendor={editingVendor}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Delete Vendor
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{vendorToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VendorSelect;