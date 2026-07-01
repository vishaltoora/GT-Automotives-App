import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  Alert,
} from '@mui/material';
import { Assignment } from '@mui/icons-material';
import {
  inspectionService,
  InspectionTemplate,
  Inspection,
} from '../../requests/inspection.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { InspectionForm } from '../inspections/InspectionForm';
import { NumberInput } from '../common';

interface InspectVehicleDialogProps {
  open: boolean;
  onClose: () => void;
  repairOrderId: string;
  customerId: string;
  vehicleId?: string;
  roNumber: string;
  customerName: string;
  vehicleLabel?: string | null;
  defaultMileage?: number;
  /** When set, the dialog opens straight into this existing inspection (view/edit). */
  existingInspectionId?: string;
  /** Notify parent that inspections changed (created/completed) so it can refresh. */
  onChanged?: () => void;
}

export function InspectVehicleDialog({
  open,
  onClose,
  repairOrderId,
  customerId,
  vehicleId,
  roNumber,
  customerName,
  vehicleLabel,
  defaultMileage,
  existingInspectionId,
  onChanged,
}: InspectVehicleDialogProps) {
  const { showApiError } = useErrorHelpers();
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [mileage, setMileage] = useState('');
  const [creating, setCreating] = useState(false);
  const [inspection, setInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    if (!open) return;
    setInspection(null);

    // View/edit an existing inspection: load it and skip template selection.
    if (existingInspectionId) {
      setLoading(true);
      inspectionService
        .getInspection(existingInspectionId)
        .then(setInspection)
        .catch((error) => showApiError(error, 'Failed to load inspection.'))
        .finally(() => setLoading(false));
      return;
    }

    // Otherwise start a new inspection from the template-selection step.
    setMileage(defaultMileage ? String(defaultMileage) : '');
    setLoading(true);
    inspectionService
      .getTemplates()
      .then((list) => {
        setTemplates(list);
        if (list.length > 0) setTemplateId((prev) => prev || list[0].id);
      })
      .catch((error) =>
        showApiError(error, 'Failed to load inspection templates.')
      )
      .finally(() => setLoading(false));
  }, [open, existingInspectionId, defaultMileage]);

  const handleStart = async () => {
    if (!templateId) return;
    setCreating(true);
    try {
      const created = await inspectionService.createInspection({
        templateId,
        customerId,
        vehicleId: vehicleId || undefined,
        repairOrderId,
        roNumber,
        mileage: mileage ? Number(mileage) : undefined,
      });
      setInspection(created);
      onChanged?.();
    } catch (error) {
      showApiError(error, 'Failed to start inspection.');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (creating) return;
    onChanged?.();
    onClose();
  };

  const inspecting = Boolean(inspection);
  const fullView = inspecting || Boolean(existingInspectionId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={fullView ? 'md' : 'sm'}
      PaperProps={fullView ? { sx: { height: '90vh' } } : undefined}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assignment color="action" />{' '}
        {fullView ? 'Vehicle Inspection' : 'Inspect Vehicle'}
      </DialogTitle>

      <DialogContent dividers={fullView}>
        {inspection ? (
          <InspectionForm
            inspection={inspection}
            onInspectionChange={setInspection}
            embedded
            onDone={handleClose}
          />
        ) : existingInspectionId ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Inspection for <strong>{customerName}</strong>
              {vehicleLabel ? <> · {vehicleLabel}</> : null} · {roNumber}
            </Typography>

            {!vehicleId && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No vehicle is linked to this repair order. You can still
                inspect, but adding a vehicle first is recommended.
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Inspection Type
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : templates.length === 0 ? (
              <Alert severity="warning">
                No inspection templates are configured.
              </Alert>
            ) : (
              <List
                dense
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {templates.map((t) => (
                  <ListItemButton
                    key={t.id}
                    selected={templateId === t.id}
                    onClick={() => setTemplateId(t.id)}
                  >
                    <Radio
                      edge="start"
                      checked={templateId === t.id}
                      tabIndex={-1}
                      size="small"
                    />
                    <ListItemText
                      primary={t.name}
                      secondary={t.description}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}

            <NumberInput
              label="Mileage (optional)"
              size="small"
              fullWidth
              value={mileage}
              onChange={(v) => setMileage(v === undefined ? '' : String(v))}
              min={0}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">km</InputAdornment>
                ),
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        {fullView ? (
          <Button onClick={handleClose}>Close</Button>
        ) : (
          <>
            <Button onClick={onClose} disabled={creating}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleStart}
              disabled={creating || !templateId}
              startIcon={
                creating ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Assignment />
                )
              }
            >
              Start Inspection
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
