import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Stack,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Build, Search, DirectionsCar } from '@mui/icons-material';
import { vehicleService } from '../../requests/vehicle.requests';
import { repairOrderRequests } from '../../requests/repair-order.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const normalizeVin = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, '')
    .slice(0, 17);

interface CreateRepairOrderDialogProps {
  open: boolean;
  onClose: () => void;
  /** The appointment a repair order is being created from. */
  appointment: any | null;
  onCreated: (repairOrderId: string) => void;
}

/**
 * Repair orders must be tied to a vehicle that has a VIN. This dialog gates RO
 * creation on a valid VIN: it pre-fills the linked vehicle's VIN when present,
 * otherwise prompts for one, persists it back to the vehicle, then creates the RO.
 */
export function CreateRepairOrderDialog({
  open,
  onClose,
  appointment,
  onCreated,
}: CreateRepairOrderDialogProps) {
  const { showApiError, showValidationError } = useErrorHelpers();
  const [vin, setVin] = useState('');
  const [engineType, setEngineType] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [saving, setSaving] = useState(false);

  const vehicle = appointment?.vehicle ?? null;
  const customer = appointment?.customer ?? null;
  const customerName =
    customer?.businessName ||
    `${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`.trim();

  useEffect(() => {
    if (open) {
      setVin(vehicle?.vin ? normalizeVin(vehicle.vin) : '');
      setEngineType(vehicle?.engineType ?? '');
    }
  }, [open, vehicle?.vin, vehicle?.engineType]);

  const handleDecodeVin = async () => {
    const normalized = normalizeVin(vin);
    if (!VIN_PATTERN.test(normalized)) {
      showValidationError(
        'Enter a 17-character VIN. VINs cannot contain I, O, or Q.'
      );
      return;
    }
    setDecoding(true);
    try {
      const decoded = await vehicleService.decodeVin(normalized);
      setVin(decoded.vin || normalized);
      if (decoded.engine) setEngineType(decoded.engine);
    } catch (error) {
      showApiError(error, 'Failed to decode VIN.');
    } finally {
      setDecoding(false);
    }
  };

  const handleCreate = async () => {
    if (!vehicle) return;
    if (!VIN_PATTERN.test(vin)) {
      showValidationError(
        'A valid 17-character VIN is required to create a repair order.'
      );
      return;
    }
    setSaving(true);
    try {
      // Persist VIN (and any decoded engine type) to the vehicle if it changed.
      if (
        vin !== (vehicle.vin || '') ||
        (engineType && engineType !== (vehicle.engineType || ''))
      ) {
        await vehicleService.updateVehicle(vehicle.id, {
          vin,
          ...(engineType ? { engineType } : {}),
        });
      }

      const employeeIds: string[] =
        appointment.employees && appointment.employees.length > 0
          ? appointment.employees.map((ae: any) => ae.employee.id)
          : appointment.employee
          ? [appointment.employee.id]
          : [];

      const ro = await repairOrderRequests.create({
        appointmentId: appointment.id,
        customerId: appointment.customer.id,
        vehicleId: vehicle.id,
        customerConcern: appointment.notes || undefined,
        employeeIds: employeeIds.length > 0 ? employeeIds : undefined,
      });
      onCreated(ro.id);
    } catch (error) {
      showApiError(error, 'Failed to create repair order.');
    } finally {
      setSaving(false);
    }
  };

  const createDisabled = saving || !vehicle || !VIN_PATTERN.test(vin);

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Build color="action" /> Create Repair Order
      </DialogTitle>
      <DialogContent>
        {customerName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Creating a repair order for <strong>{customerName}</strong>.
          </Typography>
        )}

        {!vehicle ? (
          <Alert severity="warning">
            This appointment has no vehicle linked. Add or select a vehicle on
            the appointment before creating a repair order.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ color: 'text.secondary' }}
            >
              <DirectionsCar fontSize="small" />
              <Typography variant="body2">
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.licensePlate ? ` · Plate ${vehicle.licensePlate}` : ''}
              </Typography>
            </Stack>

            {!vehicle.vin && (
              <Alert severity="info">
                A VIN is required to create a repair order. Enter the vehicle's
                VIN to continue — it will be saved to the vehicle.
              </Alert>
            )}

            <TextField
              label="VIN"
              required
              fullWidth
              size="small"
              value={vin}
              onChange={(e) => setVin(normalizeVin(e.target.value))}
              placeholder="17-character VIN"
              error={vin.length > 0 && !VIN_PATTERN.test(vin)}
              helperText={
                vin.length > 0 && !VIN_PATTERN.test(vin)
                  ? `${vin.length}/17 characters`
                  : ' '
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={handleDecodeVin}
                      disabled={decoding || !vin}
                      startIcon={
                        decoding ? (
                          <CircularProgress size={14} />
                        ) : (
                          <Search fontSize="small" />
                        )
                      }
                    >
                      Decode
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Engine Type (optional)"
              size="small"
              fullWidth
              value={engineType}
              onChange={(e) => setEngineType(e.target.value)}
              placeholder="Auto-filled from VIN decode"
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Box>
          <Button
            variant={createDisabled ? 'outlined' : 'contained'}
            onClick={handleCreate}
            disabled={createDisabled}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Build />
              )
            }
          >
            Create RO
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
