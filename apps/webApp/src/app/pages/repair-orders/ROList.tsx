import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Build as BuildIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  repairOrderRequests,
  RepairOrder,
  ROStatus,
} from '../../requests/repair-order.requests';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

const STATUS_META: Record<
  ROStatus,
  {
    label: string;
    color:
      | 'default'
      | 'info'
      | 'warning'
      | 'success'
      | 'error'
      | 'primary'
      | 'secondary';
  }
> = {
  OPEN: { label: 'Open', color: 'info' },
  IN_PROGRESS: { label: 'In Progress', color: 'primary' },
  WAITING_FOR_PARTS: { label: 'Waiting for Parts', color: 'warning' },
  READY: { label: 'Ready', color: 'success' },
  CLOSED: { label: 'Closed', color: 'default' },
  INVOICED: { label: 'Invoiced', color: 'secondary' },
};

const ALL_STATUSES: ROStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_PARTS',
  'READY',
  'CLOSED',
  'INVOICED',
];

function customerName(ro: RepairOrder) {
  if (ro.customer.businessName) return ro.customer.businessName;
  return `${ro.customer.firstName} ${ro.customer.lastName}`.trim();
}

function vehicleLabel(ro: RepairOrder) {
  const v = ro.vehicle;
  if (!v) return '—';
  return `${v.year} ${v.make} ${v.model}`;
}

function techNames(ro: RepairOrder) {
  if (!ro.employees?.length) return '—';
  return ro.employees
    .map((e) => `${e.user.firstName} ${e.user.lastName}`)
    .join(', ');
}

export function ROList() {
  const navigate = useNavigate();
  const location = useLocation();
  useAuth();

  const [ros, setRos] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ROStatus | 'ALL'>('ALL');

  const baseRoute = location.pathname.startsWith('/staff')
    ? '/staff'
    : location.pathname.startsWith('/supervisor')
    ? '/supervisor'
    : location.pathname.startsWith('/foreman')
    ? '/foreman'
    : '/admin';

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    repairOrderRequests
      .getAll(params)
      .then(setRos)
      .catch(() => setError('Failed to load repair orders'))
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  const handleRowClick = (id: string) => {
    navigate(`${baseRoute}/repair-orders/${id}`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <BuildIcon sx={{ color: colors.primary.main, fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600}>
          Repair Orders
        </Typography>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search RO# or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="ro-status-filter-label">Status</InputLabel>
          <Select
            labelId="ro-status-filter-label"
            label="Status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ROStatus | 'ALL')
            }
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                <Chip
                  label={STATUS_META[s].label}
                  size="small"
                  color={STATUS_META[s].color}
                  sx={{ pointerEvents: 'none' }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>
                  <strong>RO #</strong>
                </TableCell>
                <TableCell>
                  <strong>Customer</strong>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <strong>Vehicle</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <strong>Technician(s)</strong>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <strong>Opened</strong>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                >
                  <strong>Est. Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ros.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 6, color: 'text.disabled' }}
                  >
                    No repair orders found
                  </TableCell>
                </TableRow>
              ) : (
                ros.map((ro) => {
                  const total =
                    ro.services?.reduce(
                      (sum, s) => sum + Number(s.total ?? 0),
                      0
                    ) ?? 0;
                  const meta = STATUS_META[ro.status];
                  return (
                    <TableRow
                      key={ro.id}
                      hover
                      onClick={() => handleRowClick(ro.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: colors.primary.main }}
                        >
                          {ro.roNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {customerName(ro)}
                        </Typography>
                        {ro.customer.phone && (
                          <Typography variant="caption" color="text.secondary">
                            {ro.customer.phone}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', md: 'table-cell' } }}
                      >
                        <Typography variant="body2">
                          {vehicleLabel(ro)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={meta.label}
                          size="small"
                          color={meta.color}
                        />
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {techNames(ro)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', md: 'table-cell' } }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {new Date(ro.openedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        <Typography variant="body2">
                          ${total.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
