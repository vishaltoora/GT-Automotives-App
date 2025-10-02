import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { ServiceDto } from '@gt-automotive/data';
import { serviceService } from '../../services/service.service';
import ServiceDialog from './ServiceDialog';
import { useError } from '../../contexts/ErrorContext';

interface ServiceSelectProps {
  services: ServiceDto[];
  value?: string;
  onChange: (serviceId: string, serviceName: string, unitPrice: number) => void;
  onServicesChange: () => void;
  disabled?: boolean;
}

export const ServiceSelect: React.FC<ServiceSelectProps> = ({
  services,
  value,
  onChange,
  onServicesChange,
  disabled = false,
}) => {
  const { showError } = useError();
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceDto | null>(null);

  const selectedService = services.find(s => s.id === value);

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      onChange(service.id, service.name, parseFloat(service.unitPrice.toString()));
    }
  };

  const handleAddNew = () => {
    setEditingService(null);
    setServiceDialogOpen(true);
  };

  const handleEdit = () => {
    if (selectedService) {
      setEditingService(selectedService);
      setServiceDialogOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedService) {
      setServiceToDelete(selectedService);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      setDeleting(true);
      await serviceService.delete(serviceToDelete.id);
      // Clear selection if deleted service was selected
      onChange('', '', 0);
      await onServicesChange();
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      showError('Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleServiceSave = async (serviceData: { name: string; description?: string; unitPrice: number }) => {
    try {
      if (editingService) {
        // Update existing service
        await serviceService.update(editingService.id, serviceData);
      } else {
        // Create new service
        await serviceService.create(serviceData);
      }
      await onServicesChange();
      setServiceDialogOpen(false);
      setEditingService(null);
    } catch (error) {
      showError(editingService ? 'Failed to update service' : 'Failed to create service');
      console.error('Service save error:', error);
    }
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel>Select Service</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => handleServiceSelect(e.target.value)}
            label="Select Service"
          >
            {services.map(service => (
              <MenuItem key={service.id} value={service.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{service.name}</span>
                  <Chip
                    label={`$${service.unitPrice}`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{
          position: 'absolute',
          right: 40,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          zIndex: 1,
        }}>
          <Tooltip title="Add new service">
            <IconButton
              size="small"
              onClick={handleAddNew}
              disabled={disabled}
              sx={{ p: 0.5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {selectedService && (
            <>
              <Tooltip title="Edit service">
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  disabled={disabled}
                  sx={{ p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete service">
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

      <ServiceDialog
        open={serviceDialogOpen}
        onClose={() => {
          setServiceDialogOpen(false);
          setEditingService(null);
        }}
        onSave={handleServiceSave}
        service={editingService}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Delete Service
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{serviceToDelete?.name}"</strong>?
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

export default ServiceSelect;
