import React, { useState } from 'react';
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
import { ServiceDto } from '@gt-automotive/data';

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (service: { name: string; description?: string; unitPrice: number }) => void;
  service?: ServiceDto | null;
}

export const ServiceDialog: React.FC<ServiceDialogProps> = ({
  open,
  onClose,
  onSave,
  service,
}) => {
  const [name, setName] = useState(service?.name || '');
  const [description, setDescription] = useState(service?.description || '');
  const [unitPrice, setUnitPrice] = useState<number | string>(service?.unitPrice || '');

  React.useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setUnitPrice(service.unitPrice);
    } else {
      setName('');
      setDescription('');
      setUnitPrice('');
    }
  }, [service, open]);

  const handleSave = () => {
    if (name && Number(unitPrice) > 0) {
      onSave({ name, description, unitPrice: Number(unitPrice) });
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setUnitPrice('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {service ? 'Edit Service' : 'Add New Service'}
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Service Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            placeholder="e.g., Oil Change, Tire Rotation"
          />
          <TextField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Brief description of the service"
          />
          <TextField
            label="Unit Price"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            fullWidth
            required
            inputProps={{ min: 0, step: 0.01 }}
            autoComplete="off"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name || !unitPrice || Number(unitPrice) <= 0}
        >
          {service ? 'Update' : 'Add'} Service
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDialog;
