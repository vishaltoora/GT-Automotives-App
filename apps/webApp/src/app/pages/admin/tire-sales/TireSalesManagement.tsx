import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  TireRepair as TireIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { colors } from '../../../theme/colors';
import { QuickTireSaleDialog } from '../../../components/tire-sales';
import {
  TireSaleService,
  TireSale,
  TireSaleFilters,
  MonthlyStats,
} from '../../../requests/tire-sale.requests';
import { PaymentMethod, CommissionStatus } from '../../../../enums';
import { userService, User } from '../../../requests/user.requests';

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CREDIT_CARD]: 'Credit Card',
  [PaymentMethod.DEBIT_CARD]: 'Debit Card',
  [PaymentMethod.E_TRANSFER]: 'E-Transfer',
  [PaymentMethod.CHECK]: 'Check',
  [PaymentMethod.FINANCING]: 'Financing',
  [PaymentMethod.BANK_DEPOSIT]: 'Bank Deposit',
};

const COMMISSION_STATUS_COLORS: Record<CommissionStatus, 'default' | 'warning' | 'success' | 'error'> = {
  [CommissionStatus.PENDING]: 'warning',
  [CommissionStatus.APPROVED]: 'default',
  [CommissionStatus.PAID]: 'success',
  [CommissionStatus.CANCELLED]: 'error',
};

// Tier colors based on tires sold
const getTierInfo = (tireCount: number) => {
  if (tireCount >= 71) return { tier: 'Platinum', color: '#E5E4E2', textColor: '#000' };
  if (tireCount >= 51) return { tier: 'Gold', color: '#FFD700', textColor: '#000' };
  if (tireCount >= 31) return { tier: 'Silver', color: '#C0C0C0', textColor: '#000' };
  return { tier: 'Bronze', color: '#CD7F32', textColor: '#fff' };
};

export function TireSalesManagement() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const employeeIdFromUrl = searchParams.get('employeeId');

  // State
  const [sales, setSales] = useState<TireSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);

  // Edit salesperson dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<TireSale | null>(null);
  const [newSalespersonId, setNewSalespersonId] = useState('');
  const [employees, setEmployees] = useState<User[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState<TireSaleFilters>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [commissionStatus, setCommissionStatus] = useState('');

  // Load employee name if filtering by employee
  useEffect(() => {
    if (employeeIdFromUrl) {
      userService.getUsers().then((users: User[]) => {
        const emp = users.find((u) => u.id === employeeIdFromUrl);
        if (emp) {
          setEmployeeName(`${emp.firstName || ''} ${emp.lastName || ''}`.trim());
        }
      }).catch(() => {});
    } else {
      setEmployeeName(null);
    }
  }, [employeeIdFromUrl]);

  // Apply employee filter from URL
  useEffect(() => {
    if (employeeIdFromUrl) {
      setFilters((prev) => ({ ...prev, soldById: employeeIdFromUrl }));
    }
  }, [employeeIdFromUrl]);

  useEffect(() => {
    loadSales();
    loadMonthlyStats();
  }, [page, rowsPerPage, filters, employeeIdFromUrl]);

  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await TireSaleService.getAll({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
      });

      setSales(response.items);
      setTotal(response.total);
    } catch (err: any) {
      console.error('Failed to load tire sales:', err);
      setError(err.response?.data?.message || 'Failed to load tire sales');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      // If viewing a specific employee's sales, get their stats
      // Otherwise get the current user's stats
      const stats = employeeIdFromUrl
        ? await TireSaleService.getEmployeeStats(employeeIdFromUrl)
        : await TireSaleService.getMyStats();
      setMonthlyStats(stats);
    } catch (err) {
      console.error('Failed to load monthly stats:', err);
    }
  };

  const applyFilters = () => {
    const newFilters: TireSaleFilters = {};
    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    if (paymentMethod) newFilters.paymentMethod = paymentMethod as PaymentMethod;
    if (commissionStatus) newFilters.commissionStatus = commissionStatus as CommissionStatus;
    setFilters(newFilters);
    setPage(0);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentMethod('');
    setCommissionStatus('');
    setFilters({});
    setPage(0);
  };

  const getTotalTiresInSale = (sale: TireSale) => {
    return sale.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Load employees for edit dialog
  useEffect(() => {
    userService.getUsers().then((users: User[]) => {
      const staffUsers = users.filter((u) =>
        u.role?.name && ['STAFF', 'SUPERVISOR', 'ADMIN'].includes(u.role.name.toUpperCase())
      );
      setEmployees(staffUsers);
    }).catch(() => {});
  }, []);

  const handleEditClick = (sale: TireSale) => {
    setEditingSale(sale);
    setNewSalespersonId(sale.soldBy.id);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingSale || !newSalespersonId) return;

    try {
      setEditLoading(true);
      await TireSaleService.update(editingSale.id, { soldById: newSalespersonId });
      setEditDialogOpen(false);
      setEditingSale(null);
      loadSales(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to update tire sale:', err);
      setError(err.response?.data?.message || 'Failed to update salesperson');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {employeeIdFromUrl && (
            <IconButton onClick={() => navigate('/admin/tire-commissions')} sx={{ mr: 1 }}>
              <BackIcon />
            </IconButton>
          )}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
              {employeeName ? `${employeeName}'s Tire Sales` : 'Tire Sales'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employeeName ? `Viewing tire sales for ${employeeName}` : 'Track and manage tire sales and commissions'}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Quick Tire Sale
        </Button>
      </Box>

      {/* Monthly Stats Card */}
      {monthlyStats && (() => {
        const tierInfo = getTierInfo(monthlyStats.totalTiresSold);
        return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: tierInfo.color, color: tierInfo.textColor }}>
              <CardContent>
                <Typography variant="overline">{tierInfo.tier}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {monthlyStats.totalTiresSold} Tires
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: colors.semantic.success, color: 'white' }}>
              <CardContent>
                <Typography variant="overline">MTD Commission</Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${(monthlyStats.totalTiresSold * monthlyStats.currentRate).toFixed(0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Current Rate</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  ${monthlyStats.currentRate}/tire
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          {monthlyStats.nextThreshold && (
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Next Tier</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {monthlyStats.tiresToNextThreshold} more needed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      );
      })()}

      {/* Commission Tiers Banner */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Commission Tiers (Per Month)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#CD7F32' }} />
              <Typography variant="body2">
                <strong>Bronze:</strong> 1-30 tires = $3/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#C0C0C0' }} />
              <Typography variant="body2">
                <strong>Silver:</strong> 31-50 tires = $4/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFD700' }} />
              <Typography variant="body2">
                <strong>Gold:</strong> 51-70 tires = $5/tire
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#E5E4E2' }} />
              <Typography variant="body2">
                <strong>Platinum:</strong> 71+ tires = $7/tire
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="">All</MenuItem>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Commission Status</InputLabel>
              <Select
                value={commissionStatus}
                onChange={(e) => setCommissionStatus(e.target.value)}
                label="Commission Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={applyFilters}
                startIcon={<FilterIcon />}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Sales Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sale #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Sold By</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="center">Tires</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell align="right">Commission</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <TireIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">No tire sales found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{sale.saleNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(sale.saleDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {sale.soldBy.firstName} {sale.soldBy.lastName}
                    </TableCell>
                    <TableCell>
                      {sale.customer
                        ? `${sale.customer.firstName} ${sale.customer.lastName}`
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getTotalTiresInSale(sale)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PAYMENT_METHOD_LABELS[sale.paymentMethod]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${sale.commissionAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sale.commissionStatus}
                        size="small"
                        color={COMMISSION_STATUS_COLORS[sale.commissionStatus]}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Change Salesperson">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(sale)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* Quick Tire Sale Dialog */}
      <QuickTireSaleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          loadSales();
          loadMonthlyStats();
        }}
      />

      {/* Edit Salesperson Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change Salesperson</DialogTitle>
        <DialogContent>
          {editingSale && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sale: <strong>{editingSale.saleNumber}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current: <strong>{editingSale.soldBy.firstName} {editingSale.soldBy.lastName}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>New Salesperson</InputLabel>
                <Select
                  value={newSalespersonId}
                  onChange={(e) => setNewSalespersonId(e.target.value)}
                  label="New Salesperson"
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={editLoading || !newSalespersonId}
          >
            {editLoading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TireSalesManagement;
