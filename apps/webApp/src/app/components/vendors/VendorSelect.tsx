import React, { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import vendorService, { Vendor } from '../../requests/vendor.requests';
import VendorDialog from './VendorDialog';
import { useError } from '../../contexts/ErrorContext';
import { AutocompleteWithAdd } from '../common/AutocompleteWithAdd';

interface VendorSelectProps {
  vendors: Vendor[];
  value?: string;
  onChange: (vendorId: string, vendorName: string) => void;
  onVendorsChange: () => void;
  disabled?: boolean;
  required?: boolean;
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
  required = false,
  allowFreeSolo = true,
  onFreeTextChange,
  size = 'medium',
}) => {
  const { showError } = useError();
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const selectedVendor = vendors.find(v => v.id === value);

  const handleVendorChange = (vendor: Vendor | null) => {
    if (vendor) {
      onChange(vendor.id, vendor.name);
    } else {
      onChange('', '');
    }
  };

  const handleAddNew = () => {
    setEditingVendor(null);
    setVendorDialogOpen(true);
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

  const handleInputChange = (_event: React.SyntheticEvent, inputValue: string, reason: string) => {
    if (allowFreeSolo && reason === 'input' && !selectedVendor && onFreeTextChange) {
      onFreeTextChange(inputValue);
    }
  };

  return (
    <>
      <AutocompleteWithAdd
        options={vendors}
        value={selectedVendor || null}
        onChange={handleVendorChange}
        onAddNew={handleAddNew}
        getOptionLabel={(vendor) => vendor.name}
        renderOption={(props, vendor) => (
          <Box component="li" {...props} key={vendor.id}>
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
        label="Vendor"
        placeholder={allowFreeSolo ? 'Select or type vendor name' : 'Select vendor'}
        size={size}
        disabled={disabled}
        required={required}
        freeSolo={allowFreeSolo}
        onInputChange={handleInputChange}
        addButtonTooltip="Add New Vendor"
      />

      <VendorDialog
        open={vendorDialogOpen}
        onClose={() => {
          setVendorDialogOpen(false);
          setEditingVendor(null);
        }}
        onSave={handleVendorSave}
        vendor={editingVendor}
      />
    </>
  );
};

export default VendorSelect;
