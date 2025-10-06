import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
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
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: '',
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        contactPerson: vendor.contactPerson || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        taxId: vendor.taxId || '',
        paymentTerms: vendor.paymentTerms || '',
        isActive: vendor.isActive ?? true,
        notes: vendor.notes || '',
      });
    } else {
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: '',
        isActive: true,
        notes: '',
      });
    }
  }, [vendor, open]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSwitchChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.checked });
  };

  const handleSubmit = () => {
    const submitData: any = {
      name: formData.name,
    };

    if (formData.contactPerson) submitData.contactPerson = formData.contactPerson;
    if (formData.email) submitData.email = formData.email;
    if (formData.phone) submitData.phone = formData.phone;
    if (formData.address) submitData.address = formData.address;
    if (formData.taxId) submitData.taxId = formData.taxId;
    if (formData.paymentTerms) submitData.paymentTerms = formData.paymentTerms;
    if (formData.notes) submitData.notes = formData.notes;
    if (vendor) submitData.isActive = formData.isActive;

    onSave(submitData);
  };

  const isValid = formData.name.trim().length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{vendor ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Vendor Name"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange('contactPerson')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tax ID"
                value={formData.taxId}
                onChange={handleChange('taxId')}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={handleChange('paymentTerms')}
                placeholder="e.g., Net 30, Net 60, Cash on Delivery"
              />
            </Grid>

            {vendor && (
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleSwitchChange('isActive')}
                    />
                  }
                  label="Active"
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
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
