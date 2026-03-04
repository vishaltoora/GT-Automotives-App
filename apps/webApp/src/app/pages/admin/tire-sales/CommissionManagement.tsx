import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  TireRepair as TireIcon,
  PlayArrow as ProcessIcon,
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { colors } from '../../../theme/colors';
import {
  TireSaleService,
  CommissionReport,
  EmployeeCommissionSummary,
} from '../../../requests/tire-sale.requests';

export function CommissionManagement() {
  const navigate = useNavigate();
  const [report, setReport] = useState<CommissionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEmployee, setProcessingEmployee] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState<string | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    employee: EmployeeCommissionSummary | null;
  }>({ open: false, employee: null });

  // Current month dates
  const currentMonth = new Date();
  const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthName = format(currentMonth, 'MMMM yyyy');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TireSaleService.getCommissionReport({
        startDate,
        endDate,
      });
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load commission report:', err);
      setError(err.response?.data?.message || 'Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const getCommissionTier = (tireCount: number) => {
    if (tireCount >= 71) return { tier: 'Platinum', rate: 7, color: '#E5E4E2' };
    if (tireCount >= 51) return { tier: 'Gold', rate: 5, color: '#FFD700' };
    if (tireCount >= 31) return { tier: 'Silver', rate: 4, color: '#C0C0C0' };
    return { tier: 'Bronze', rate: 3, color: '#CD7F32' };
  };

  const handleCardClick = (employeeId: string) => {
    navigate(`/admin/tire-sales?employeeId=${employeeId}`);
  };

  const handleProcessClick = (emp: EmployeeCommissionSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({ open: true, employee: emp });
  };

  const handleConfirmProcess = async () => {
    const emp = confirmDialog.employee;
    if (!emp) return;

    try {
      setConfirmDialog({ open: false, employee: null });
      setProcessingEmployee(emp.employeeId);
      setError(null);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const result = await TireSaleService.processEmployeeCommissions(
        emp.employeeId,
        year,
        month
      );

      setProcessSuccess(
        `Successfully processed $${result.totalAmount.toFixed(2)} commission for ${emp.employeeName} (${result.salesCount} sales). Job ID: ${result.jobId}`
      );

      // Reload the report
      await loadReport();
    } catch (err: any) {
      console.error('Failed to process commission:', err);
      setError(err.response?.data?.message || 'Failed to process commission');
    } finally {
      setProcessingEmployee(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
          Tire Sale Commissions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {monthName} - Click on an employee card to view their sales
        </Typography>
      </Box>

      {/* Commission Tiers Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Commission Tiers (Per Month - Retroactive)
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

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {processSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProcessSuccess(null)}>
          {processSuccess}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Summary Cards */}
      {!loading && report && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PeopleIcon sx={{ fontSize: 28, color: colors.primary.main, mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {report.employees.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <TireIcon sx={{ fontSize: 28, color: colors.secondary.main, mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="bold">
                    {report.totals.totalTiresSold}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tires Sold
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <MoneyIcon sx={{ fontSize: 28, color: 'warning.main', mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="bold">
                    ${report.totals.pendingCommission.toFixed(0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: colors.semantic.success, color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <PaidIcon sx={{ fontSize: 28, mb: 0.5 }} />
                  <Typography variant="h5" fontWeight="bold">
                    ${report.totals.paidCommission.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">
                    Paid
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Employee Cards */}
          {report.employees.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No tire sales data for {monthName}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {report.employees.map((emp) => {
                const tier = getCommissionTier(emp.totalTiresSold);
                const isProcessing = processingEmployee === emp.employeeId;
                const hasPending = emp.pendingCommission > 0;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={emp.employeeId}>
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        border: hasPending ? `2px solid ${colors.semantic.warning}` : undefined,
                      }}
                    >
                      {isProcessing && (
                        <LinearProgress
                          sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
                        />
                      )}
                      <CardActionArea
                        onClick={() => handleCardClick(emp.employeeId)}
                        disabled={isProcessing}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          {/* Header with name and tier */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {emp.employeeName}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: tier.color,
                                  }}
                                />
                                <Typography variant="caption" fontWeight="bold" sx={{ color: tier.color }}>
                                  {tier.tier} Tier
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={`$${tier.rate}/tire`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </Box>

                          {/* Stats */}
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid size={6}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  {emp.totalTiresSold}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Tires Sold
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={6}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                  ${emp.totalCommission.toFixed(0)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Total Commission
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Pending vs Paid */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2" color="warning.main" fontWeight="bold">
                                ${emp.pendingCommission.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Pending
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                ${emp.paidCommission.toFixed(2)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Paid
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </CardActionArea>

                      {/* Action buttons outside CardActionArea */}
                      <Box sx={{ px: 2, pb: 2 }}>
                        {hasPending && (
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<ProcessIcon />}
                            onClick={(e) => handleProcessClick(emp, e)}
                            disabled={isProcessing}
                          >
                            Process ${emp.pendingCommission.toFixed(2)}
                          </Button>
                        )}

                        {!hasPending && emp.paidCommission > 0 && (
                          <Chip
                            icon={<PaidIcon />}
                            label="All Commissions Paid"
                            color="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                          />
                        )}
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, employee: null })}
      >
        <DialogTitle>Process Commission</DialogTitle>
        <DialogContent>
          {confirmDialog.employee && (
            <Typography>
              Are you sure you want to process{' '}
              <strong>${confirmDialog.employee.pendingCommission.toFixed(2)}</strong> commission
              for <strong>{confirmDialog.employee.employeeName}</strong>?
              <br /><br />
              This will create a job entry for the commission payment.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, employee: null })}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmProcess}>
            Process Commission
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CommissionManagement;
