import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { JobResponseDto, JobSummaryDto, JobStatus, JobType } from '@gt-automotive/data';
import { jobService } from '../../services/job.service';
import { CreateJobDialog } from '../../components/payroll/CreateJobDialog';
import { EditJobDialog } from '../../components/payroll/EditJobDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useConfirmationDialog } from '../../hooks/useConfirmationDialog';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { format } from 'date-fns';

export function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobResponseDto[]>([]);
  const [summary, setSummary] = useState<JobSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<JobResponseDto | null>(null);

  const {
    showConfirmation,
    isOpen: confirmationOpen,
    dialogData: confirmationData,
    handleConfirm: confirmationConfirm,
    handleCancel: confirmationCancel
  } = useConfirmationDialog();

  useEffect(() => {
    if (user?.id) {
      fetchMyJobs();
    }
  }, [user?.id]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch only the current staff member's jobs
      const [jobsData, summaryData] = await Promise.all([
        jobService.getJobsByEmployee(user!.id),
        jobService.getJobSummary(user!.id),
      ]);

      setJobs(jobsData);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = () => {
    setCreateDialogOpen(true);
  };

  const handleJobCreated = () => {
    setCreateDialogOpen(false);
    fetchMyJobs();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: JobResponseDto) => {
    setMenuAnchor(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    setEditDialogOpen(true);
  };

  const handleJobUpdated = () => {
    setEditDialogOpen(false);
    setSelectedJob(null);
    fetchMyJobs();
  };

  const handleMarkComplete = async () => {
    if (!selectedJob) return;

    const jobToComplete = selectedJob;
    handleMenuClose();

    const confirmed = await showConfirmation(
      'Mark Job as Complete',
      `Are you sure you want to mark "${jobToComplete.title}" as complete? This will make it ready for payment processing.`,
      'Mark Complete',
      'warning'
    );

    if (confirmed) {
      try {
        await jobService.markJobComplete(jobToComplete.id);
        fetchMyJobs();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to mark job as complete');
      }
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return colors.semantic.warning;
      case 'READY':
        return colors.semantic.info;
      case 'PAID':
        return colors.semantic.success;
      case 'PARTIALLY_PAID':
        return colors.primary.main;
      case 'CANCELLED':
        return colors.neutral[500];
      default:
        return colors.neutral[400];
    }
  };

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return 'In Progress';
      case 'READY':
        return 'Ready for Payment';
      case 'PAID':
        return 'Paid';
      case 'PARTIALLY_PAID':
        return 'Partially Paid';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getJobTypeLabel = (jobType: JobType) => {
    switch (jobType) {
      case 'REGULAR':
        return 'Regular Work';
      case 'OVERTIME':
        return 'Overtime';
      case 'BONUS':
        return 'Bonus';
      case 'COMMISSION':
        return 'Commission';
      case 'EXPENSE':
        return 'Expense';
      default:
        return jobType;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: colors.secondary.main }}>
            My Jobs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your work assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateJob}
          sx={{
            backgroundColor: colors.secondary.main,
            '&:hover': { backgroundColor: colors.secondary.dark },
          }}
        >
          Add Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: colors.primary.lighter + '20',
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 32, color: colors.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.primary.main }}>
                      {summary.totalJobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Jobs
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: colors.semantic.warning + '20',
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <ScheduleIcon sx={{ fontSize: 32, color: colors.semantic.warning }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.semantic.warning }}>
                      {summary.pendingJobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: colors.semantic.info + '20',
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 32, color: colors.semantic.info }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.semantic.info }}>
                      {summary.readyJobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ready for Payment
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: colors.semantic.success + '20',
                      borderRadius: 2,
                      display: 'flex',
                    }}
                  >
                    <MoneyIcon sx={{ fontSize: 32, color: colors.semantic.success }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.semantic.success }}>
                      ${summary.pendingPayAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Payment
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Jobs Table */}
      <Paper elevation={0} sx={{ border: `1px solid ${colors.neutral[200]}` }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.neutral[50] }}>
                <TableCell sx={{ fontWeight: 600 }}>Job #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No jobs found. Click "Add Job" to create your first job entry.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {job.jobNumber.substring(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {job.title}
                      </Typography>
                      {job.description && (
                        <Typography variant="caption" color="text.secondary">
                          {job.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getJobTypeLabel(job.jobType)}
                        size="small"
                        sx={{ backgroundColor: colors.neutral[100] }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${Number(job.payAmount).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(job.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(job.status),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {job.dueDate ? (
                        <Typography variant="body2">
                          {format(new Date(job.dueDate), 'MMM dd, yyyy')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.completedAt ? (
                        <Typography variant="body2" sx={{ color: colors.semantic.success }}>
                          {format(new Date(job.completedAt), 'MMM dd, yyyy')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not completed
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, job)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedJob?.status === 'PENDING' && (
          <MenuItem onClick={handleMarkComplete}>
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            Mark as Complete
          </MenuItem>
        )}
        {selectedJob?.status === 'PENDING' && (
          <MenuItem onClick={handleEdit}>
            Edit Details
          </MenuItem>
        )}
      </Menu>

      {/* Dialogs */}
      <CreateJobDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleJobCreated}
        preselectedEmployeeId={user?.id}
        hideEmployeeSelect={true}
      />

      {selectedJob && (
        <EditJobDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={handleJobUpdated}
          job={selectedJob}
          isStaffView={true}
        />
      )}

      {confirmationData && (
        <ConfirmationDialog
          open={confirmationOpen}
          title={confirmationData.title}
          message={confirmationData.message}
          confirmText={confirmationData.confirmText}
          onConfirm={confirmationConfirm}
          onClose={confirmationCancel}
        />
      )}
    </Box>
  );
}
