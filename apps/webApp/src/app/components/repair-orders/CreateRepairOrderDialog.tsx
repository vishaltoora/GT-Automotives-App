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
import { userService, User } from '../../requests/user.requests';
import { EmployeeChipSelector } from '../appointments/EmployeeChipSelector';

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
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<User[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

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

  // Load assignable employees and pre-select the ones already on the
  // appointment so the user can confirm or change the RO's crew on creation.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setEmployeesLoading(true);
      try {
        const allUsers = await userService.getUsers();
        const assignable = allUsers.filter(
          (user) =>
            (user.role?.name === 'STAFF' ||
              user.role?.name === 'ADMIN' ||
              user.role?.name === 'SUPERVISOR' ||
              user.role?.name === 'FOREMAN') &&
            user.isActive
        );
        const uniqueUsers = assignable.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
        );
        if (cancelled) return;
        setEmployees(uniqueUsers);

        // Pre-select from the appointment's assigned employees (new multi-assign
        // shape, falling back to the legacy single employee).
        const preIds: string[] =
          appointment?.employees && appointment.employees.length > 0
            ? appointment.employees.map((ae: any) => ae.employee.id)
            : appointment?.employee
            ? [appointment.employee.id]
            : [];
        setSelectedEmployees(uniqueUsers.filter((u) => preIds.includes(u.id)));
      } catch (error) {
        if (!cancelled) showApiError(error, 'Failed to load employees.');
      } finally {
        if (!cancelled) setEmployeesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id]);

  const handleEmployeeToggle = (employee: User) => {
    setSelectedEmployees((prev) =>
      prev.some((e) => e.id === employee.id)
        ? prev.filter((e) => e.id !== employee.id)
        : [...prev, employee]
    );
  };

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
    // A VIN is only required when the appointment already has a vehicle linked.
    // With no vehicle (e.g. loose tires) the RO is created vehicle-less and a
    // vehicle can be added — or the RO marked as no-vehicle — on the RO detail.
    if (vehicle && !VIN_PATTERN.test(vin)) {
      showValidationError(
        'A valid 17-character VIN is required to create a repair order.'
      );
      return;
    }
    setSaving(true);
    try {
      // Persist VIN (and any decoded engine type) to the vehicle if it changed.
      if (
        vehicle &&
        (vin !== (vehicle.vin || '') ||
          (engineType && engineType !== (vehicle.engineType || '')))
      ) {
        await vehicleService.updateVehicle(vehicle.id, {
          vin,
          ...(engineType ? { engineType } : {}),
        });
      }

      const employeeIds: string[] = selectedEmployees.map((e) => e.id);

      const ro = await repairOrderRequests.create({
        appointmentId: appointment.id,
        customerId: appointment.customer.id,
        vehicleId: vehicle ? vehicle.id : undefined,
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

  const createDisabled = saving || (!!vehicle && !VIN_PATTERN.test(vin));

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
          <Alert severity="info">
            This appointment has no vehicle linked. You can still create the
            repair order — add a vehicle (VIN required) or mark it as no-vehicle
            on the repair order afterward (e.g. loose tires, battery recharge,
            or other counter service).
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

        {/* Assign one or more employees to this repair order. Pre-filled from the
            appointment's crew; can be confirmed or changed here. */}
        <Box sx={{ mt: 3 }}>
          <EmployeeChipSelector
            employees={employees}
            selectedEmployees={selectedEmployees}
            availableSlots={[]}
            scheduledTime=""
            onEmployeeToggle={handleEmployeeToggle}
            loading={employeesLoading}
          />
        </Box>
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
