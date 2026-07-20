import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  CheckCircleOutline,
  Close as CloseIcon,
  Done as DoneIcon,
  RequestQuote,
} from '@mui/icons-material';
import {
  repairOrderRequests,
  ROService,
  ROServiceApproval,
} from '../../requests/repair-order.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { colors } from '../../theme/colors';

interface ROItemsListProps {
  roId: string;
  services: ROService[];
  canEdit: boolean;
  onChanged: () => Promise<void>;
}

const TYPE_LABEL: Record<string, string> = {
  LABOR: 'Labor',
  PART: 'Part',
  OTHER: 'Other',
};

const APPROVAL_CHIP: Record<
  ROServiceApproval,
  { label: string; color: 'success' | 'error' | 'default' }
> = {
  APPROVED: { label: 'Approved', color: 'success' },
  DECLINED: { label: 'Declined', color: 'error' },
  PENDING: { label: 'Approval pending', color: 'default' },
};

/**
 * Detailed, per-item list of the RO's service/part items with inline controls
 * for completion, customer approval, and quotation flagging. Every mutation
 * re-fetches the RO through onChanged() so the parent stays in sync.
 */
export function ROItemsList({
  roId,
  services,
  canEdit,
  onChanged,
}: ROItemsListProps) {
  const { showApiError } = useErrorHelpers();
  const [savingId, setSavingId] = useState<string | null>(null);

  const mutate = async (
    serviceId: string,
    data: Parameters<typeof repairOrderRequests.updateService>[2]
  ) => {
    setSavingId(serviceId);
    try {
      await repairOrderRequests.updateService(roId, serviceId, data);
      await onChanged();
    } catch (error) {
      showApiError(error, 'Failed to update the item.');
    } finally {
      setSavingId(null);
    }
  };

  if (services.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{ fontStyle: 'italic', py: 2 }}
      >
        No service or part items added yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {services.map((s) => {
        const saving = savingId === s.id;
        const completed = s.status === 'COMPLETED';
        const approval = APPROVAL_CHIP[s.customerApproval];
        return (
          <Paper
            key={s.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderColor: s.isQuotation ? colors.primary.light : undefined,
              bgcolor: completed ? 'action.hover' : undefined,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                gap: 1,
              }}
            >
              {/* Description + meta */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      textDecoration: completed ? 'line-through' : undefined,
                    }}
                  >
                    {s.description}
                  </Typography>
                  <Chip
                    label={TYPE_LABEL[s.type] ?? s.type}
                    size="small"
                    variant="outlined"
                  />
                  {s.isQuotation && (
                    <Chip
                      label="Quotation"
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={<RequestQuote sx={{ fontSize: 14 }} />}
                    />
                  )}
                  <Chip
                    label={approval.label}
                    size="small"
                    color={approval.color}
                    variant={
                      approval.color === 'default' ? 'outlined' : 'filled'
                    }
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {s.quantity} × ${Number(s.unitPrice).toFixed(2)} ={' '}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    ${Number(s.total).toFixed(2)}
                  </Box>
                </Typography>
                {s.technicianNotes && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', whiteSpace: 'pre-wrap', mt: 0.25 }}
                  >
                    {s.technicianNotes}
                  </Typography>
                )}
                {completed && s.completedBy && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    Completed by {s.completedBy.firstName}{' '}
                    {s.completedBy.lastName}
                    {s.completedAt
                      ? ` · ${new Date(s.completedAt).toLocaleDateString()}`
                      : ''}
                  </Typography>
                )}
              </Box>

              {/* Controls */}
              {canEdit && (
                <Stack
                  spacing={0.75}
                  sx={{
                    minWidth: { sm: 200 },
                    alignItems: { xs: 'stretch', sm: 'flex-end' },
                  }}
                >
                  {saving && (
                    <Box sx={{ alignSelf: 'center' }}>
                      <CircularProgress size={16} />
                    </Box>
                  )}
                  <Button
                    size="small"
                    variant={completed ? 'contained' : 'outlined'}
                    color="success"
                    disabled={saving}
                    startIcon={
                      completed ? (
                        <CheckCircle fontSize="small" />
                      ) : (
                        <CheckCircleOutline fontSize="small" />
                      )
                    }
                    onClick={() =>
                      mutate(s.id, {
                        status: completed ? 'PENDING' : 'COMPLETED',
                      })
                    }
                    fullWidth
                  >
                    {completed ? 'Completed' : 'Mark complete'}
                  </Button>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    justifyContent="flex-end"
                  >
                    <Button
                      size="small"
                      variant={
                        s.customerApproval === 'APPROVED'
                          ? 'contained'
                          : 'outlined'
                      }
                      color="success"
                      disabled={saving}
                      startIcon={<DoneIcon fontSize="small" />}
                      onClick={() =>
                        mutate(s.id, { customerApproval: 'APPROVED' })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant={
                        s.customerApproval === 'DECLINED'
                          ? 'contained'
                          : 'outlined'
                      }
                      color="error"
                      disabled={saving}
                      startIcon={<CloseIcon fontSize="small" />}
                      onClick={() =>
                        mutate(s.id, { customerApproval: 'DECLINED' })
                      }
                    >
                      Decline
                    </Button>
                  </Stack>
                  <Chip
                    label={s.isQuotation ? 'On quotation' : 'Add to quotation'}
                    size="small"
                    color={s.isQuotation ? 'primary' : 'default'}
                    variant={s.isQuotation ? 'filled' : 'outlined'}
                    icon={<RequestQuote sx={{ fontSize: 14 }} />}
                    clickable
                    disabled={saving}
                    onClick={() =>
                      mutate(s.id, { isQuotation: !s.isQuotation })
                    }
                  />
                </Stack>
              )}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
