import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  CircularProgress,
  Typography,
  Stack,
  InputAdornment,
} from '@mui/material';
import { DirectionsCar, Search } from '@mui/icons-material';
import {
  vehicleService,
  Vehicle,
  VehicleMakeWithModels,
} from '../../requests/vehicle.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { NumberInput } from '../common';

const CURRENT_YEAR = new Date().getFullYear() + 1;
const YEARS = Array.from({ length: 60 }, (_, i) => CURRENT_YEAR - i);

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const normalizeVin = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, '')
    .slice(0, 17);

interface AddVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  onAdded: (vehicle: Vehicle) => void;
  /**
   * When true (default) a valid 17-character VIN and mileage are required –
   * the behaviour used when adding a vehicle for a repair order.
   * Pass false for lighter-weight flows (e.g. appointment booking) where the
   * VIN can be captured later and mileage is optional.
   */
  requireVin?: boolean;
  /**
   * When provided the dialog edits this existing vehicle instead of creating a
   * new one. The same form is reused; on save the vehicle is updated.
   */
  vehicle?: Vehicle | null;
}

export function AddVehicleDialog({
  open,
  onClose,
  customerId,
  customerName,
  onAdded,
  requireVin = true,
  vehicle: editVehicle = null,
}: AddVehicleDialogProps) {
  const isEdit = !!editVehicle;
  const { showApiError, showValidationError } = useErrorHelpers();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [vin, setVin] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');
  const [engineType, setEngineType] = useState('');
  const [saving, setSaving] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [makesData, setMakesData] = useState<VehicleMakeWithModels[]>([]);

  // Load the makes/models reference list once the dialog opens.
  useEffect(() => {
    if (!open || makesData.length > 0) return;
    vehicleService
      .getMakesWithModels()
      .then(setMakesData)
      .catch(() => setMakesData([]));
  }, [open, makesData.length]);

  // When opened for editing, prefill the form from the existing vehicle.
  useEffect(() => {
    if (!open) return;
    if (editVehicle) {
      setMake(editVehicle.make ?? '');
      setModel(editVehicle.model ?? '');
      setYear(editVehicle.year ?? new Date().getFullYear());
      setVin(editVehicle.vin ? normalizeVin(editVehicle.vin) : '');
      setLicensePlate(editVehicle.licensePlate ?? '');
      setColor(editVehicle.color ?? '');
      setMileage(
        editVehicle.mileage != null ? String(editVehicle.mileage) : ''
      );
      setEngineType(editVehicle.engineType ?? '');
    } else {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editVehicle?.id]);

  const makeOptions = useMemo(() => makesData.map((m) => m.name), [makesData]);
  const modelOptions = useMemo(
    () =>
      makesData.find((m) => m.name.toLowerCase() === make.trim().toLowerCase())
        ?.models ?? [],
    [makesData, make]
  );

  const reset = () => {
    setMake('');
    setModel('');
    setYear(new Date().getFullYear());
    setVin('');
    setLicensePlate('');
    setColor('');
    setMileage('');
    setEngineType('');
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
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
      if (decoded.make) setMake(decoded.make);
      if (decoded.model) setModel(decoded.model);
      if (decoded.year) setYear(decoded.year);
      if (decoded.engine) setEngineType(decoded.engine);
    } catch (error) {
      showApiError(error, 'Failed to decode VIN.');
    } finally {
      setDecoding(false);
    }
  };

  const handleSave = async () => {
    if (!make.trim() || !model.trim() || !year) {
      showValidationError('Make, model, and year are required.');
      return;
    }
    if (requireVin && !VIN_PATTERN.test(vin)) {
      showValidationError(
        'A valid 17-character VIN is required. VINs cannot contain I, O, or Q.'
      );
      return;
    }
    // If a VIN is supplied it must always be valid, even when optional.
    if (vin && !VIN_PATTERN.test(vin)) {
      showValidationError(
        'Enter a valid 17-character VIN, or leave it blank. VINs cannot contain I, O, or Q.'
      );
      return;
    }
    if (requireVin && (!mileage || Number(mileage) <= 0)) {
      showValidationError('Mileage is required.');
      return;
    }
    setSaving(true);
    try {
      let vehicle: Vehicle;
      if (editVehicle) {
        vehicle = await vehicleService.updateVehicle(editVehicle.id, {
          make: make.trim(),
          model: model.trim(),
          year: Number(year),
          vin: vin.trim() || null,
          licensePlate: licensePlate.trim() || null,
          color: color.trim() || undefined,
          mileage: mileage ? Number(mileage) : undefined,
          engineType: engineType.trim() || undefined,
        });
      } else {
        vehicle = await vehicleService.createVehicle({
          customerId,
          make: make.trim(),
          model: model.trim(),
          year: Number(year),
          vin: vin.trim() || undefined,
          licensePlate: licensePlate.trim() || undefined,
          color: color.trim() || undefined,
          mileage: mileage ? Number(mileage) : undefined,
          engineType: engineType.trim() || undefined,
        });
      }
      onAdded(vehicle);
      reset();
    } catch (error) {
      showApiError(
        error,
        isEdit ? 'Failed to update vehicle.' : 'Failed to add vehicle.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DirectionsCar color="action" />{' '}
        {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isEdit ? 'Editing a vehicle for ' : 'Adding a vehicle for '}
          <strong>{customerName}</strong>.
        </Typography>

        <Stack spacing={2}>
          {/* VIN + decode */}
          <TextField
            label={requireVin ? 'VIN' : 'VIN (optional)'}
            required={requireVin}
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

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete
              freeSolo
              options={makeOptions}
              value={make}
              onChange={(_, v) => setMake(v ?? '')}
              onInputChange={(_, v) => setMake(v)}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField {...params} label="Make" size="small" required />
              )}
            />
            <Autocomplete
              freeSolo
              options={modelOptions}
              value={model}
              onChange={(_, v) => setModel(v ?? '')}
              onInputChange={(_, v) => setModel(v)}
              disabled={!make.trim()}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Model"
                  size="small"
                  required
                  placeholder={
                    make.trim()
                      ? 'Select or type a model'
                      : 'Choose a make first'
                  }
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Year"
              size="small"
              sx={{ width: 120 }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
            >
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Color (optional)"
              size="small"
              sx={{ flex: 1 }}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="License Plate (optional)"
              size="small"
              sx={{ flex: 1 }}
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
            <NumberInput
              label={requireVin ? 'Mileage' : 'Mileage (optional)'}
              required={requireVin}
              size="small"
              sx={{ flex: 1 }}
              value={mileage}
              onChange={(v) => setMileage(v === undefined ? '' : String(v))}
              min={0}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">km</InputAdornment>
                ),
              }}
            />
          </Box>

          <TextField
            label="Engine Type (optional)"
            size="small"
            fullWidth
            value={engineType}
            onChange={(e) => setEngineType(e.target.value)}
            placeholder="Auto-filled from VIN decode, e.g. 2.0L L4"
            helperText="Populated automatically when you decode a VIN; you can also enter it manually."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        {(() => {
          const vinOk = requireVin
            ? VIN_PATTERN.test(vin)
            : !vin || VIN_PATTERN.test(vin);
          const mileageOk = requireVin
            ? Boolean(mileage) && Number(mileage) > 0
            : true;
          const addDisabled =
            saving || !make.trim() || !model.trim() || !vinOk || !mileageOk;
          return (
            <Button
              variant={addDisabled ? 'outlined' : 'contained'}
              onClick={handleSave}
              disabled={addDisabled}
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DirectionsCar />
                )
              }
            >
              {isEdit ? 'Save Vehicle' : 'Add Vehicle'}
            </Button>
          );
        })()}
      </DialogActions>
    </Dialog>
  );
}
