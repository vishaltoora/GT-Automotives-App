import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { vehicleService, Vehicle } from '../../requests/vehicle.requests';
import { AddVehicleDialog } from '../repair-orders/AddVehicleDialog';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useAuth } from '../../hooks/useAuth';

interface CustomerVehiclesSectionProps {
  customerId: string;
  customerName: string;
}

/**
 * Inline vehicle management for the customer add/edit experience: lists the
 * customer's vehicles with full details and supports add / edit / delete.
 * Delete is limited to admin/foreman and may be blocked server-side by service history.
 */
export function CustomerVehiclesSection({
  customerId,
  customerName,
}: CustomerVehiclesSectionProps) {
  const { showApiError } = useErrorHelpers();
  const { confirm } = useConfirmation();
  const { role } = useAuth();
  // Vehicle deletion is permitted for admin and foreman (matches the server
  // gate in vehicles.service). Deletes may still be blocked by service history.
  const canDeleteVehicle = role === 'admin' || role === 'foreman';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Note: intentionally depends only on customerId. `showApiError` from
  // useErrorHelpers() is a fresh function each render, so including it would
  // re-create this callback every render and put the load effect in a loop.
  const loadVehicles = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const data = await vehicleService.getCustomerVehicles(customerId);
      setVehicles(data);
    } catch (error) {
      showApiError(error, 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleAdd = () => {
    setEditingVehicle(null);
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmed = await confirm({
      title: 'Delete Vehicle',
      message: `Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}? This cannot be undone.`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!confirmed) return;

    setDeletingId(vehicle.id);
    try {
      await vehicleService.deleteVehicle(vehicle.id);
      await loadVehicles();
    } catch (error) {
      // Surfaces the "existing service history" block from the API.
      showApiError(error, 'Failed to delete vehicle.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <DirectionsCar fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight={600}>
            Vehicles
          </Typography>
        </Stack>
        <Button size="small" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Vehicle
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      ) : vehicles.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No vehicles yet. Use “Add Vehicle” to create one.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {vehicles.map((vehicle) => (
            <Paper key={vehicle.id} variant="outlined" sx={{ p: 1.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {vehicle.engineType ? `${vehicle.engineType} · ` : ''}
                    {vehicle.mileage != null
                      ? `${vehicle.mileage.toLocaleString()} km · `
                      : ''}
                    {vehicle.licensePlate
                      ? `Plate ${vehicle.licensePlate} · `
                      : ''}
                    {`VIN ${vehicle.vin || 'not on file'}`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Edit vehicle">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {canDeleteVehicle && (
                    <Tooltip title="Delete vehicle">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(vehicle)}
                          disabled={deletingId === vehicle.id}
                        >
                          {deletingId === vehicle.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <AddVehicleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        customerId={customerId}
        customerName={customerName}
        requireVin={false}
        vehicle={editingVehicle}
        onAdded={async () => {
          setDialogOpen(false);
          await loadVehicles();
        }}
      />
    </Box>
  );
}
