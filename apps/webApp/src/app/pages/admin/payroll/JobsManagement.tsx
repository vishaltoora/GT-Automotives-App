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
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { JobResponseDto, JobSummaryDto } from '@gt-automotive/data';
import { JobStatus, JobType } from '@prisma/client';
import { jobService } from '../../../services/job.service';
import { userService } from '../../../services/user.service';
import { CreateJobDialog } from '../../../components/payroll/CreateJobDialog';
import { EditJobDialog } from '../../../components/payroll/EditJobDialog';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useConfirmationDialog } from '../../../hooks/useConfirmationDialog';
import { colors } from '../../../theme/colors';
import { format } from 'date-fns';

export function JobsManagement() {
  const [jobs, setJobs] = useState<JobResponseDto[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [summary, setSummary] = useState<JobSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<JobResponseDto | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
    jobType: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const {
    showConfirmation,
    isOpen: confirmationOpen,
    dialogData: confirmationData,
    handleConfirm: confirmationConfirm,
    handleCancel: confirmationCancel
  } = useConfirmationDialog();

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const filterParams = {
        employeeId: filters.employeeId || undefined,
        status: filters.status as JobStatus || undefined,
        jobType: filters.jobType as JobType || undefined,
        startDate: filters.startDate?.toISOString() || undefined,
        endDate: filters.endDate?.toISOString() || undefined,
      };

      const [jobsData, summaryData] = await Promise.all([
        jobService.getJobs(filterParams),
        jobService.getJobSummary(filters.employeeId || undefined),
      ]);

      setJobs(jobsData);
      setSummary(summaryData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const users = await userService.getUsers();
      const staffMembers = users.filter(u => u.role?.name === 'STAFF');
      setEmployees(staffMembers);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleCreateJob = async (newJob: JobResponseDto) => {
    await fetchData();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: JobResponseDto) => {
    setMenuAnchor(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedJob(null);
  };

  const handleMarkComplete = async () => {
    if (!selectedJob) return;

    try {
      await jobService.markJobComplete(selectedJob.id);
      fetchData();
      handleMenuClose();
    } catch (err: any) {
      setError(err.message || 'Failed to mark job as complete');
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;

    const confirmed = await showConfirmation(
      'Delete Job',
      `Are you sure you want to delete the job "${selectedJob.title}"? This action cannot be undone.`,
      'Delete',
      'error'
    );

    if (confirmed) {
      try {
        await jobService.deleteJob(selectedJob.id);
        handleMenuClose();

        // Force a small delay to ensure backend state is updated
        setTimeout(async () => {
          await fetchData();
        }, 100);

      } catch (err: any) {
        console.error('Delete error:', err);
        if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          setError('Job not found. It may have already been deleted. Refreshing the list...');
          await fetchData(); // Refresh the list to show current state
        } else {
          setError(err.message || 'Failed to delete job');
        }
        handleMenuClose();
      }
    }
  };

  const handleEditJob = () => {
    if (!selectedJob) return;
    setEditDialogOpen(true);
    // Don't close menu/clear selectedJob until after dialog opens
    setMenuAnchor(null); // Just close the menu, keep selectedJob
  };

  const handleEditJobSuccess = async (updatedJob: JobResponseDto) => {
    await fetchData();
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return 'warning';
      case JobStatus.READY: return 'info';
      case JobStatus.PAID: return 'success';
      case JobStatus.CANCELLED: return 'error';
      case JobStatus.PARTIALLY_PAID: return 'secondary';
      default: return 'default';
    }
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unknown';
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      status: '',
      jobType: '',
      startDate: null,
      endDate: null,
    });
  };

  if (loading && !jobs.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>Loading jobs...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkIcon sx={{ fontSize: 32, color: colors.primary.main }} />
            <Typography variant="h4" fontWeight="bold">
              Jobs Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
              px: 3,
              py: 1.5,
              marginLeft: 'auto',
            }}
          >
            Create Job
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon />
                    <Typography variant="h6">Total Jobs</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.totalJobs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.warningLight} 0%, ${colors.semantic.warning} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    <Typography variant="h6">Pending</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.pendingJobs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.infoLight} 0%, ${colors.semantic.info} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon />
                    <Typography variant="h6">Ready</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.readyJobs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ background: `linear-gradient(135deg, ${colors.semantic.successLight} 0%, ${colors.semantic.success} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    <Typography variant="h6">Total Pay</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    ${summary.totalPayAmount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FilterIcon sx={{ color: colors.primary.main }} />
            <Typography variant="h6">Filters</Typography>
            <Button size="small" onClick={clearFilters}>Clear All</Button>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={filters.employeeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                  label="Employee"
                >
                  <MenuItem value="">All Employees</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {getEmployeeName(employee)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.values(JobStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filters.jobType}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                  label="Job Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  {Object.values(JobType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Jobs Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.neutral[50] }}>
                  <TableCell fontWeight="bold">Job</TableCell>
                  <TableCell fontWeight="bold">Employee</TableCell>
                  <TableCell fontWeight="bold">Type</TableCell>
                  <TableCell fontWeight="bold">Amount</TableCell>
                  <TableCell fontWeight="bold">Status</TableCell>
                  <TableCell fontWeight="bold">Due Date</TableCell>
                  <TableCell fontWeight="bold">Created</TableCell>
                  <TableCell fontWeight="bold" align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        No jobs found. Create your first job to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Box>
                          <Typography fontWeight="medium">{job.title}</Typography>
                          {job.description && (
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {job.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: colors.neutral[500] }} />
                          {getEmployeeName(job.employee)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.jobType.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          ${job.payAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.status.replace('_', ' ')}
                          color={getStatusColor(job.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {job.dueDate ? format(new Date(job.dueDate), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell align="center">
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
          {selectedJob?.status === JobStatus.PENDING && (
            <MenuItem onClick={handleMarkComplete}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Mark Complete
            </MenuItem>
          )}
          <MenuItem onClick={handleEditJob}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          {selectedJob?.status !== JobStatus.PAID && (
            <MenuItem onClick={handleDeleteJob} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          )}
        </Menu>

        {/* Create Job Dialog */}
        <CreateJobDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={handleCreateJob}
        />

        {/* Edit Job Dialog */}
        <EditJobDialog
          open={editDialogOpen}
          job={selectedJob}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedJob(null); // Clear selected job when dialog closes
          }}
          onSuccess={handleEditJobSuccess}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmationOpen}
          onClose={confirmationCancel}
          onConfirm={confirmationConfirm}
          title={confirmationData?.title || ''}
          message={confirmationData?.message || ''}
          confirmText={confirmationData?.confirmText}
          severity={confirmationData?.severity}
        />
      </Box>
    </LocalizationProvider>
  );
}