import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  Delete,
  Edit,
  MoreVert,
  TimerOff as AutoCloseIcon,
  Undo,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { TimeEntryDto, TimeEntryStatus } from '@gt-automotive/data';
import { colors } from '../../theme/colors';

const formatEntryHours = (minutes: number) =>
  `${(minutes / 60).toFixed(2)} hrs`;

const formatBreak = (minutes: number) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatStatus = (status: TimeEntryStatus) => {
  if (status === TimeEntryStatus.PROCESSED) return 'Paid';
  if (status === TimeEntryStatus.OPEN) return 'Clocked In';
  if (status === TimeEntryStatus.ON_BREAK) return 'On Break';
  if (status === TimeEntryStatus.CLOCKED_OUT) return 'Clocked Out';
  return status.replace('_', ' ');
};

const getStatusColor = (
  status: TimeEntryStatus
):
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error' => {
  if (status === TimeEntryStatus.PROCESSED) return 'primary'; // paid out — final
  if (status === TimeEntryStatus.APPROVED) return 'success'; // green
  if (status === TimeEntryStatus.OPEN) return 'info'; // blue - actively clocked in
  if (status === TimeEntryStatus.ON_BREAK) return 'warning'; // amber
  if (status === TimeEntryStatus.CLOCKED_OUT) return 'secondary'; // purple
  if (status === TimeEntryStatus.VOIDED) return 'error'; // red
  return 'default';
};

/**
 * What a viewer may do to an entry. Omitted entirely for read-only viewers —
 * the accountant verifies hours but never approves or adjusts them, so their
 * view has no action column at all rather than a column of disabled buttons.
 */
export interface TimeEntryActions {
  saving: boolean;
  onEdit: (entry: TimeEntryDto) => void;
  onApprove: (entry: TimeEntryDto) => void;
  onUnapprove: (entry: TimeEntryDto) => void;
  onDelete: (entry: TimeEntryDto) => void;
}

/**
 * Marks a shift the closing-time job ended because nobody clocked out.
 *
 * A badge rather than a note buried in the reason text: the clock-out time on
 * these is a guess about when the employee actually left, and it has to be
 * obvious at a glance which rows need checking before payroll runs.
 */
function AutoClockedOutChip({ entry }: { entry: TimeEntryDto }) {
  if (!entry.autoClockedOut) return null;
  return (
    <Tooltip title={entry.adjustmentReason || 'Automatically clocked out'}>
      <Chip
        size="small"
        variant="outlined"
        color="warning"
        icon={<AutoCloseIcon />}
        label="Auto clock-out"
      />
    </Tooltip>
  );
}

interface TimeEntriesTableProps {
  entries: TimeEntryDto[];
  actions?: TimeEntryActions;
  emptyMessage?: string;
  /** Hidden when the list is already scoped to one person. */
  showEmployee?: boolean;
}

/** A processed entry is the record behind money that has already gone out. */
const isFinal = (entry: TimeEntryDto) => Boolean(entry.payrollProcessedAt);

/**
 * The time entries behind a set of hours, as a table on desktop and cards on
 * narrow screens.
 *
 * Shared by everyone who looks at entries — admin, foreman, supervisor and
 * accountant — so the status vocabulary and the rules about what may still be
 * changed are stated once instead of drifting between views.
 */
export function TimeEntriesTable({
  entries,
  actions,
  emptyMessage = 'No time entries found for this pay period',
  showEmployee = true,
}: TimeEntriesTableProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuEntry, setMenuEntry] = useState<TimeEntryDto | null>(null);

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuEntry(null);
  };

  const canEdit = (entry: TimeEntryDto) =>
    entry.status !== TimeEntryStatus.APPROVED && !isFinal(entry);
  const canApprove = (entry: TimeEntryDto) =>
    Boolean(entry.clockOutAt) &&
    entry.status !== TimeEntryStatus.APPROVED &&
    !isFinal(entry);
  const canUnapprove = (entry: TimeEntryDto) =>
    entry.status === TimeEntryStatus.APPROVED && !isFinal(entry);

  if (entries.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}
      >
        {emptyMessage}
      </Paper>
    );
  }

  return (
    <>
      {/* Cards on narrow screens — a row of eight columns is unreadable on a
          phone, and the shop floor uses phones. */}
      <Box sx={{ display: { xs: 'grid', lg: 'none' }, gap: 1.5 }}>
        {entries.map((entry) => (
          <Card
            key={entry.id}
            elevation={0}
            sx={{ border: `1px solid ${colors.neutral[200]}` }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  mb: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  {showEmployee && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {entry.employee?.firstName} {entry.employee?.lastName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(entry.clockInAt), 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >
                  <AutoClockedOutChip entry={entry} />
                  <Chip
                    size="small"
                    variant="outlined"
                    color={getStatusColor(entry.status)}
                    label={formatStatus(entry.status)}
                  />
                </Box>
              </Box>

              <Grid container spacing={1.5} sx={{ mb: actions ? 1.5 : 0 }}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Clock In
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {format(new Date(entry.clockInAt), 'h:mm a')}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Clock Out
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {entry.clockOutAt
                      ? format(new Date(entry.clockOutAt), 'h:mm a')
                      : 'Open'}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Break
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatBreak(entry.unpaidBreakMinutes)}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary">
                    Paid Hours
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatEntryHours(entry.paidMinutes)}
                  </Typography>
                </Grid>
              </Grid>

              {actions && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => actions.onEdit(entry)}
                    disabled={actions.saving || !canEdit(entry)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => actions.onDelete(entry)}
                    disabled={actions.saving || isFinal(entry)}
                  >
                    Delete
                  </Button>
                  {canApprove(entry) && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => actions.onApprove(entry)}
                      disabled={actions.saving}
                    >
                      Approve
                    </Button>
                  )}
                  {canUnapprove(entry) && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<Undo />}
                      onClick={() => actions.onUnapprove(entry)}
                      disabled={actions.saving}
                    >
                      Unapprove
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ display: { xs: 'none', lg: 'block' } }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {showEmployee && <TableCell>Employee</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Clock In</TableCell>
              <TableCell>Clock Out</TableCell>
              <TableCell align="right">Break</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Paid Hours</TableCell>
              {actions && <TableCell align="right">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                {showEmployee && (
                  <TableCell>
                    {entry.employee?.firstName} {entry.employee?.lastName}
                  </TableCell>
                )}
                <TableCell>
                  {format(new Date(entry.clockInAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(entry.clockInAt), 'h:mm a')}
                </TableCell>
                <TableCell>
                  {entry.clockOutAt
                    ? format(new Date(entry.clockOutAt), 'h:mm a')
                    : '-'}
                </TableCell>
                <TableCell align="right">
                  {formatBreak(entry.unpaidBreakMinutes)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={getStatusColor(entry.status)}
                      label={formatStatus(entry.status)}
                    />
                    <AutoClockedOutChip entry={entry} />
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={formatEntryHours(entry.paidMinutes)}
                    color={entry.paidMinutes > 540 ? 'warning' : 'success'}
                    sx={{ fontSize: '0.95rem', fontWeight: 700, height: 32 }}
                  />
                </TableCell>
                {actions && (
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="Entry actions"
                      onClick={(event) => {
                        setMenuAnchor(event.currentTarget);
                        setMenuEntry(entry);
                      }}
                      disabled={actions.saving}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {actions && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {menuEntry && [
            <MenuItem
              key="edit"
              disabled={actions.saving || !canEdit(menuEntry)}
              onClick={() => {
                const entry = menuEntry;
                closeMenu();
                actions.onEdit(entry);
              }}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>,
            canApprove(menuEntry) ? (
              <MenuItem
                key="approve"
                disabled={actions.saving}
                onClick={() => {
                  const entry = menuEntry;
                  closeMenu();
                  actions.onApprove(entry);
                }}
              >
                <ListItemIcon>
                  <CheckCircle fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Approve</ListItemText>
              </MenuItem>
            ) : null,
            canUnapprove(menuEntry) ? (
              <MenuItem
                key="unapprove"
                disabled={actions.saving}
                onClick={() => {
                  const entry = menuEntry;
                  closeMenu();
                  actions.onUnapprove(entry);
                }}
              >
                <ListItemIcon>
                  <Undo fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText>Unapprove</ListItemText>
              </MenuItem>
            ) : null,
            <MenuItem
              key="delete"
              disabled={actions.saving || isFinal(menuEntry)}
              onClick={() => {
                const entry = menuEntry;
                closeMenu();
                actions.onDelete(entry);
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText
                secondary={
                  isFinal(menuEntry)
                    ? 'Already processed for payroll'
                    : undefined
                }
              >
                Delete
              </ListItemText>
            </MenuItem>,
          ]}
        </Menu>
      )}
    </>
  );
}

export default TimeEntriesTable;
