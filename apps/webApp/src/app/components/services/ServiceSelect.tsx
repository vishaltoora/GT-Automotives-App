import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ServiceDto } from '@gt-automotive/data';
import { serviceService } from '../../requests/service.requests';
import ServiceDialog from './ServiceDialog';
import { useError } from '../../contexts/ErrorContext';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { CrudAutocomplete } from '../common/CrudAutocomplete';

interface ServiceSelectProps {
  services: ServiceDto[];
  /** Selected service id. */
  value?: string;
  onChange: (serviceId: string, serviceName: string, unitPrice: number) => void;
  onServicesChange: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const priceOf = (service: ServiceDto) =>
  parseFloat(service.unitPrice.toString()) || 0;

export const ServiceSelect: React.FC<ServiceSelectProps> = ({
  services,
  value,
  onChange,
  onServicesChange,
  disabled = false,
  size = 'medium',
}) => {
  const { showError } = useError();
  const { confirmDelete } = useConfirmationHelpers();
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceDto | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === value) || null;

  const handleAddNew = () => {
    setEditingService(null);
    setServiceDialogOpen(true);
  };

  const handleEdit = (service: ServiceDto) => {
    setEditingService(service);
    setServiceDialogOpen(true);
  };

  const handleDelete = async (service: ServiceDto) => {
    const confirmed = await confirmDelete(`the service "${service.name}"`);
    if (!confirmed) return;

    try {
      setPendingDeleteId(service.id);
      await serviceService.delete(service.id);
      // Only drop the line's selection if it was this service.
      if (service.id === value) {
        onChange('', '', 0);
      }
      await onServicesChange();
    } catch (error: any) {
      showError({
        title: 'Could not delete service',
        message:
          error?.response?.data?.message ||
          'Something went wrong deleting this service. Please try again.',
      });
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleServiceSave = async (serviceData: {
    name: string;
    description?: string;
    unitPrice: number;
  }) => {
    try {
      if (editingService) {
        const updated = await serviceService.update(
          editingService.id,
          serviceData
        );
        await onServicesChange();
        // Keep the line in step with a rename or a price change.
        if (editingService.id === value) {
          onChange(updated.id, updated.name, priceOf(updated));
        }
      } else {
        const created = await serviceService.create(serviceData);
        await onServicesChange();
        onChange(created.id, created.name, priceOf(created));
      }
      setServiceDialogOpen(false);
      setEditingService(null);
    } catch (error: any) {
      showError({
        title: editingService
          ? 'Could not update service'
          : 'Could not create service',
        message:
          error?.response?.data?.message ||
          'Something went wrong saving this service. Please try again.',
      });
    }
  };

  return (
    <>
      <CrudAutocomplete<ServiceDto>
        label="Select Service"
        entityLabel="service"
        placeholder="Type to search..."
        options={services}
        value={selectedService}
        onChange={(service) =>
          service
            ? onChange(service.id, service.name, priceOf(service))
            : onChange('', '', 0)
        }
        getOptionId={(service) => service.id}
        getOptionLabel={(service) => service.name}
        getOptionSearchText={(service) => service.description || ''}
        renderOptionContent={(service) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <span>{service.name}</span>
            <Typography variant="caption" color="text.secondary">
              ${priceOf(service).toFixed(2)}
            </Typography>
          </Box>
        )}
        size={size}
        disabled={disabled}
        onAdd={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pendingDeleteId={pendingDeleteId}
      />

      <ServiceDialog
        open={serviceDialogOpen}
        onClose={() => {
          setServiceDialogOpen(false);
          setEditingService(null);
        }}
        onSave={handleServiceSave}
        service={editingService}
      />
    </>
  );
};

export default ServiceSelect;
