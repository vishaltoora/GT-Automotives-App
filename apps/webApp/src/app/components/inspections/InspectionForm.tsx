import { ReactElement, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AssignmentTurnedIn as CompleteIcon,
  CheckCircle as GoodIcon,
  ErrorOutline as FairIcon,
  ReportProblem as PoorIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Inspection,
  InspectionItem,
  InspectionItemStatus,
  InspectionResult,
  inspectionService,
} from '../../requests/inspection.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

const statusOptions: Array<{ value: InspectionItemStatus; label: string; icon: ReactElement }> = [
  { value: 'GOOD', label: 'Good', icon: <GoodIcon fontSize="small" /> },
  { value: 'FAIR', label: 'Fair', icon: <FairIcon fontSize="small" /> },
  { value: 'POOR', label: 'Poor', icon: <PoorIcon fontSize="small" /> },
];

const statusColor = (status?: InspectionItemStatus | null) => {
  if (status === 'GOOD') return 'success';
  if (status === 'FAIR') return 'warning';
  if (status === 'POOR') return 'error';
  return 'primary';
};

interface InspectionFormProps {
  inspection: Inspection;
  onInspectionChange: (inspection: Inspection) => void;
  /** Compact layout for use inside a dialog (no fixed footer / dark hero). */
  embedded?: boolean;
  /** Called after a successful Complete or Save. */
  onDone?: () => void;
}

export function InspectionForm({ inspection, onInspectionChange, embedded, onDone }: InspectionFormProps) {
  const { showApiError, showSuccess } = useErrorHelpers();
  const [savingResultId, setSavingResultId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  const resultByItem = useMemo(() => {
    const grouped = new Map<string, InspectionResult[]>();
    for (const result of inspection?.results || []) {
      grouped.set(result.itemId, [...(grouped.get(result.itemId) || []), result]);
    }
    return grouped;
  }, [inspection]);

  const progress = useMemo(() => {
    const results = inspection?.results || [];
    const completed = results.filter((result) => result.status || result.value || result.selectedOptions.length > 0).length;
    return { completed, total: results.length };
  }, [inspection]);

  const updateResult = async (result: InspectionResult, data: Partial<InspectionResult>) => {
    try {
      setSavingResultId(result.id);
      const updated = await inspectionService.updateResult(inspection.id, result.id, {
        status: data.status,
        value: data.value,
        notes: data.notes,
        selectedOptions: data.selectedOptions,
      });
      onInspectionChange(updated);
    } catch (error) {
      showApiError(error, 'Failed to update inspection item');
    } finally {
      setSavingResultId(null);
    }
  };

  const completeInspection = async () => {
    try {
      setCompleting(true);
      const updated = await inspectionService.completeInspection(inspection.id);
      onInspectionChange(updated);
      showSuccess('Inspection completed.', onDone);
    } catch (error) {
      showApiError(error, 'Failed to complete inspection');
    } finally {
      setCompleting(false);
    }
  };

  const saveCompletedInspection = async () => {
    try {
      setSavingReport(true);
      let updatedInspection = inspection;
      for (const result of inspection.results) {
        updatedInspection = await inspectionService.updateResult(inspection.id, result.id, {
          status: result.status,
          value: result.value,
          notes: result.notes,
          selectedOptions: result.selectedOptions,
        });
      }
      onInspectionChange(updatedInspection);
      showSuccess('Inspection report saved.', onDone);
    } catch (error) {
      showApiError(error, 'Failed to save inspection report');
    } finally {
      setSavingReport(false);
    }
  };

  const renderStatusButtons = (result: InspectionResult) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
      {statusOptions.map((option) => {
        const selected = result.status === option.value;
        return (
          <Button
            key={option.value}
            startIcon={option.icon}
            color={selected ? (statusColor(option.value) as any) : 'primary'}
            variant={selected ? 'contained' : 'outlined'}
            onClick={() => updateResult(result, {
              status: option.value,
              notes: option.value === 'GOOD' ? null : result.notes,
              selectedOptions: option.value === 'GOOD' ? [] : result.selectedOptions,
            })}
            sx={{
              borderRadius: 1,
              minHeight: { xs: 44, sm: 48 },
              px: { xs: 0.5, sm: 1.5 },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              '& .MuiButton-startIcon': { mr: { xs: 0.25, sm: 0.75 } },
            }}
          >
            {option.label}
          </Button>
        );
      })}
    </Box>
  );

  const renderQuickValues = (item: InspectionItem, result: InspectionResult) => {
    const values = item.options?.values || [];
    if (values.length === 0) return null;

    return (
      <Grid container spacing={1}>
        {values.map((value) => {
          const selected = result.value === value || result.selectedOptions.includes(value);
          return (
            <Grid key={value} size={{ xs: 3, sm: 2, md: 1.2 }}>
              <Button
                fullWidth
                variant={selected ? 'contained' : 'outlined'}
                onClick={() => {
                  if (item.kind === 'MULTI_SELECT') {
                    const next = selected
                      ? result.selectedOptions.filter((option) => option !== value)
                      : [...result.selectedOptions, value];
                    updateResult(result, { selectedOptions: next });
                  } else {
                    updateResult(result, { value });
                  }
                }}
                sx={{ minHeight: { xs: 40, sm: 42 }, px: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                {value}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderAffectedPartSelect = (item: InspectionItem, result: InspectionResult) => {
    const affectedParts = item.options?.affectedParts || [];
    if (affectedParts.length === 0 || (result.status !== 'FAIR' && result.status !== 'POOR')) {
      return null;
    }

    return (
      <Autocomplete
        multiple
        options={affectedParts}
        value={result.selectedOptions.filter((option) => affectedParts.includes(option))}
        onChange={(_, value) => updateResult(result, { selectedOptions: value })}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Affected part(s)" placeholder="Select parts" />
        )}
        ChipProps={{ size: 'small' }}
        sx={{ '& .MuiAutocomplete-inputRoot': { alignItems: 'flex-start' } }}
      />
    );
  };

  const renderResult = (item: InspectionItem, result: InspectionResult) => {
    const showPosition = result.position !== 'GENERAL';
    return (
      <Box key={result.id} sx={{ mb: { xs: 2, sm: 2.5 } }}>
        {showPosition && (
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            {result.position}{item.isRequired ? ' *' : ''}
          </Typography>
        )}
        <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
          {(item.kind === 'MEASUREMENT' || item.kind === 'TEXT') && (
            <TextField
              fullWidth
              size="small"
              label={item.unit ? `Value (${item.unit})` : 'Value'}
              value={result.value || ''}
              onChange={(event) => {
                onInspectionChange({
                  ...inspection,
                  results: inspection.results.map((existing) => existing.id === result.id ? { ...existing, value: event.target.value } : existing),
                });
              }}
              onBlur={(event) => updateResult(result, { value: event.target.value })}
              required={item.isRequired}
            />
          )}

          {renderStatusButtons(result)}
          {renderQuickValues(item, result)}
          {renderAffectedPartSelect(item, result)}

          {(result.status === 'FAIR' || result.status === 'POOR') && (
            <TextField
              fullWidth
              size="small"
              label={result.status === 'POOR' ? 'Required repair note' : 'Attention note'}
              value={result.notes || ''}
              onChange={(event) => {
                onInspectionChange({
                  ...inspection,
                  results: inspection.results.map((existing) => existing.id === result.id ? { ...existing, notes: event.target.value } : existing),
                });
              }}
              onBlur={(event) => updateResult(result, { notes: event.target.value })}
              multiline
              minRows={2}
            />
          )}

          {savingResultId === result.id && (
            <Typography variant="caption" color="text.secondary">Saving...</Typography>
          )}
        </Stack>
      </Box>
    );
  };

  const renderItem = (item: InspectionItem) => {
    const results = resultByItem.get(item.id) || [];
    return (
      <Card key={item.id} variant="outlined" sx={{ borderRadius: 1, mb: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, fontSize: { xs: '0.98rem', sm: '1rem' }, lineHeight: 1.25 }}>
            {item.label}{item.isRequired && results.length === 1 ? ' *' : ''}
          </Typography>
          {results.map((result) => renderResult(item, result))}
        </CardContent>
      </Card>
    );
  };

  const vehicleLabel = inspection.vehicle
    ? `${inspection.vehicle.year} ${inspection.vehicle.make} ${inspection.vehicle.model}`
    : 'No vehicle selected';

  const actionButton = inspection.status === 'COMPLETED' ? (
    <Button
      fullWidth
      size="large"
      variant="contained"
      startIcon={savingReport ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
      onClick={saveCompletedInspection}
      disabled={savingReport || Boolean(savingResultId)}
      sx={{ minHeight: 56 }}
    >
      {savingReport ? 'Saving...' : 'Save Changes'}
    </Button>
  ) : (
    <Button
      fullWidth
      size="large"
      variant="contained"
      startIcon={completing ? <CircularProgress size={18} color="inherit" /> : <CompleteIcon />}
      onClick={completeInspection}
      disabled={completing}
      sx={{ minHeight: 56 }}
    >
      Complete Inspection
    </Button>
  );

  return (
    <Box sx={{ pb: embedded ? 0 : { xs: 10, sm: 11 } }}>
      {/* Summary header */}
      <Box
        sx={{
          bgcolor: '#10264a',
          color: 'white',
          p: { xs: 1.25, sm: 2 },
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2">Status: {inspection.status.replace('_', ' ')}</Typography>
            <Typography variant="h6" fontWeight={800} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              RO: {inspection.roNumber || inspection.id.slice(0, 8)}
            </Typography>
          </Box>
          <Chip label={`${progress.completed}/${progress.total}`} sx={{ bgcolor: 'white', fontWeight: 700 }} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Typography fontWeight={600} sx={{ lineHeight: 1.25 }}>{vehicleLabel}</Typography>
          <Typography sx={{ opacity: 0.85 }}>
            {[inspection.customer.firstName, inspection.customer.lastName].filter(Boolean).join(' ') || inspection.customer.businessName}
          </Typography>
        </Stack>
      </Box>

      {/* Sections */}
      <Stack spacing={{ xs: 2.5, sm: 3 }}>
        {inspection.template.sections.map((section) => (
          <Box key={section.id}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
              {section.title}
            </Typography>
            {section.items.map(renderItem)}
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Stack>

      {/* Action */}
      {embedded ? (
        <Box sx={{ mt: 2 }}>{actionButton}</Box>
      ) : (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            left: { xs: 8, md: 'auto' },
            right: 8,
            bottom: 8,
            p: 1,
            zIndex: 3,
            borderRadius: 1,
            width: { xs: 'calc(100% - 16px)', md: 520 },
          }}
        >
          {actionButton}
        </Paper>
      )}
    </Box>
  );
}
