import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Vendor } from '../../services/vendor.service';

interface VendorDialogProps {
  open: boolean;
  vendor: Vendor | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const VendorDialog: React.FC<VendorDialogProps> = ({ open, vendor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
      });
    } else {
      setFormData({
        name: '',
      });
    }
  }, [vendor, open]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = () => {
    onSave({ name: formData.name });
  };

  const isValid = formData.name.trim().length > 0;

  return (
    <Dialog open={open} disableEscapeKeyDown maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {vendor ? 'Edit Vendor' : 'Add Vendor'}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            required
            autoFocus
            label="Vendor Name"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Enter vendor name"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>
          {vendor ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorDialog;
