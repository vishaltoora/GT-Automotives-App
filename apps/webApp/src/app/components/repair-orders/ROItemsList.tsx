import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  CheckCircleOutline,
  Delete as DeleteIcon,
  RequestQuote,
  ThumbDown,
  ThumbDownOffAlt,
  ThumbUp,
  ThumbUpOffAlt,
} from '@mui/icons-material';
import {
  repairOrderRequests,
  ROService,
} from '../../requests/repair-order.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { colors } from '../../theme/colors';

interface ROItemsListProps {
  roId: string;
  services: ROService[];
  canEdit: boolean;
  canDelete?: boolean;
  onChanged: () => Promise<void>;
}

const TYPE_LABEL: Record<string, string> = {
  LABOR: 'Labor',
  PART: 'Part',
  OTHER: 'Other',
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
  canDelete = false,
  onChanged,
}: ROItemsListProps) {
  const { showApiError } = useErrorHelpers();
  const { confirm } = useConfirmationHelpers();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (s: ROService) => {
    const ok = await confirm({
      title: 'Delete Item',
      message: `Delete "${s.description}"? This cannot be undone.`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!ok) return;
    setDeletingId(s.id);
    try {
      await repairOrderRequests.removeService(roId, s.id);
      await onChanged();
    } catch (error) {
      showApiError(error, 'Failed to delete the item.');
    } finally {
      setDeletingId(null);
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
        const approved = s.customerApproval === 'APPROVED';
        const declined = s.customerApproval === 'DECLINED';
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

                  {/* Customer approval — thumbs up/down toggle. Clicking the
                      active one clears back to pending. Once completed, an
                      approved item stays approved (can't be cleared). */}
                  <Tooltip
                    title={
                      completed && approved
                        ? 'Completed items stay approved'
                        : approved
                        ? 'Approved — tap to clear'
                        : 'Approve'
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        color="success"
                        // Keep the green tint even when locked (disabled).
                        sx={
                          approved
                            ? { '&.Mui-disabled': { color: 'success.main' } }
                            : undefined
                        }
                        disabled={!canEdit || saving || (completed && approved)}
                        onClick={() =>
                          mutate(s.id, {
                            customerApproval: approved ? 'PENDING' : 'APPROVED',
                          })
                        }
                      >
                        {approved ? (
                          <ThumbUp fontSize="small" />
                        ) : (
                          <ThumbUpOffAlt fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      completed
                        ? 'Completed items cannot be declined'
                        : declined
                        ? 'Declined — tap to clear'
                        : 'Decline'
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        // Keep the red tint even when locked (disabled).
                        sx={
                          declined
                            ? { '&.Mui-disabled': { color: 'error.main' } }
                            : undefined
                        }
                        disabled={!canEdit || saving || completed}
                        onClick={() =>
                          mutate(
                            s.id,
                            declined
                              ? { customerApproval: 'PENDING' }
                              : // Declining takes the item off the quotation.
                                {
                                  customerApproval: 'DECLINED',
                                  isQuotation: false,
                                }
                          )
                        }
                      >
                        {declined ? (
                          <ThumbDown fontSize="small" />
                        ) : (
                          <ThumbDownOffAlt fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>

                  {/* Quotation flag — chip toggles select/deselect. A completed
                      or declined item can't be on a quotation. */}
                  {canEdit ? (
                    <Chip
                      label={
                        s.isQuotation ? 'On quotation' : 'Add to quotation'
                      }
                      size="small"
                      color={s.isQuotation ? 'primary' : 'default'}
                      variant={s.isQuotation ? 'filled' : 'outlined'}
                      icon={<RequestQuote sx={{ fontSize: 14 }} />}
                      clickable
                      disabled={saving || completed || declined}
                      onClick={() =>
                        mutate(s.id, { isQuotation: !s.isQuotation })
                      }
                    />
                  ) : (
                    s.isQuotation && (
                      <Chip
                        label="Quotation"
                        size="small"
                        color="primary"
                        variant="outlined"
                        icon={<RequestQuote sx={{ fontSize: 14 }} />}
                      />
                    )
                  )}
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
                    minWidth: { sm: 150 },
                    alignItems: { xs: 'stretch', sm: 'flex-end' },
                  }}
                >
                  {saving && (
                    <Box sx={{ alignSelf: 'center' }}>
                      <CircularProgress size={16} />
                    </Box>
                  )}
                  {/* A declined service isn't worked on, so hide completion. */}
                  {!declined && (
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
                        mutate(
                          s.id,
                          completed
                            ? { status: 'PENDING' }
                            : // Completing takes the item off the quotation.
                              { status: 'COMPLETED', isQuotation: false }
                        )
                      }
                      fullWidth
                    >
                      {completed ? 'Completed' : 'Mark complete'}
                    </Button>
                  )}
                  {canDelete && (
                    <Tooltip title="Delete item">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deletingId === s.id}
                          onClick={() => handleDelete(s)}
                        >
                          {deletingId === s.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </Stack>
              )}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}
