import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem as SelectMenuItem,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { colors } from '../../../theme/colors';
import { userService } from '../../../requests/user.requests';
import { jobService } from '../../../requests/job.requests';
import { JobResponseDto, JobStatus, JobType, JobSummaryDto } from '@gt-automotive/data';
import { CreateJobDialog } from '../../../components/payroll/CreateJobDialog';
import { EditJobDialog } from '../../../components/payroll/EditJobDialog';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useConfirmationDialog } from '../../../hooks/useConfirmationDialog';

interface Employee {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role?: {
    name: string;
  };
}

export function EmployeeJobsView() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jobs, setJobs] = useState<JobResponseDto[]>([]);
  const [summary, setSummary] = useState<JobSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<JobResponseDto | null>(null);

  // Filters for jobs view
  const [filters, setFilters] = useState({
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

  const loadEmployeeData = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const users = await userService.getUsers();
      const foundEmployee = users.find(u => u.id === employeeId);

      if (foundEmployee) {
        setEmployee(foundEmployee);
        setError(null);
      } else {
        setError('Employee not found');
        navigate('/admin/jobs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeJobs = async () => {
    if (!employee || !employeeId) return;

    try {
      setLoading(true);
      const filterParams = {
        employeeId: employee.id,
        status: filters.status ? (filters.status as JobStatus) : undefined,
        jobType: filters.jobType ? (filters.jobType as JobType) : undefined,
        startDate: filters.startDate?.toISOString() || undefined,
        endDate: filters.endDate?.toISOString() || undefined,
      };

      const [jobsData, summaryData] = await Promise.all([
        jobService.getJobs(filterParams),
        jobService.getJobSummary(employee.id),
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

  // Fetch employee details and jobs
  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  // Fetch jobs when employee is loaded or filters change
  useEffect(() => {
    if (employee && employeeId) {
      fetchEmployeeJobs();
    }
  }, [employee?.id, employeeId, filters.status, filters.jobType, filters.startDate?.toString(), filters.endDate?.toString()]);

  const handleBackToEmployees = () => {
    navigate('/admin/payroll/jobs');
  };

  const handleCreateJob = async () => {
    await fetchEmployeeJobs();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: JobResponseDto) => {
    setMenuAnchor(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    // Don't clear selectedJob immediately - dialogs might need it
    // It will be cleared when dialogs close
  };

  const handleEditJob = () => {
    if (!selectedJob) return;
    // Close menu first
    setMenuAnchor(null);
    // Wait a tick to ensure menu close completes, then open dialog
    setTimeout(() => {
      setEditDialogOpen(true);
    }, 0);
  };

  const handleEditJobSuccess = async () => {
    await fetchEmployeeJobs();
  };

  const handleMarkComplete = async () => {
    if (!selectedJob) return;

    try {
      await jobService.markJobComplete(selectedJob.id);
      fetchEmployeeJobs();
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
        fetchEmployeeJobs();
        handleMenuClose();
      } catch (err: any) {
        setError(err.message || 'Failed to delete job');
      }
    }
  };

  // const clearFilters = () => {
  //   setFilters({
  //     status: '',
  //     jobType: '',
  //     startDate: null,
  //     endDate: null,
  //   });
  // };

  const getEmployeeName = (emp: Employee) => {
    if (emp.firstName && emp.lastName) {
      return `${emp.firstName} ${emp.lastName}`;
    }
    return emp.username || emp.email;
  };

  const getEmployeeInitials = (emp: Employee) => {
    if (emp.firstName && emp.lastName) {
      return `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
    }
    if (emp.username) {
      return emp.username.substring(0, 2).toUpperCase();
    }
    return emp.email.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorOptions = [
      colors.primary.main,
      colors.semantic.info,
      colors.semantic.success,
      colors.semantic.warning,
    ];
    return colorOptions[hash % colorOptions.length];
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return 'warning';
      case JobStatus.READY:
        return 'info';
      case JobStatus.PAID:
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading && !employee) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Employee not found</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header with Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <MuiLink
              component="button"
              variant="body1"
              onClick={handleBackToEmployees}
              sx={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              Employees
            </MuiLink>
            <Typography color="text.primary">
              {getEmployeeName(employee)}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToEmployees}
                variant="outlined"
              >
                Back to Employees
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: getAvatarColor(employee.email),
                  }}
                >
                  {getEmployeeInitials(employee)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {getEmployeeName(employee)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Jobs and Payments Management
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                px: 3,
                py: 1.5,
              }}
            >
              Create Job
            </Button>
          </Box>
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
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`, color: 'white' }}>
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
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${colors.semantic.warningLight} 0%, ${colors.semantic.warning} 100%)`, color: 'white' }}>
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
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${colors.semantic.successLight} 0%, ${colors.semantic.success} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon />
                    <Typography variant="h6">Completed</Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold">
                    {summary.paidJobs}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${colors.semantic.infoLight} 0%, ${colors.semantic.info} 100%)`, color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon />
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
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                fullWidth
                size="small"
              >
                <SelectMenuItem value="">All Statuses</SelectMenuItem>
                <SelectMenuItem value={JobStatus.PENDING}>Pending</SelectMenuItem>
                <SelectMenuItem value={JobStatus.READY}>Ready</SelectMenuItem>
                <SelectMenuItem value={JobStatus.PAID}>Paid</SelectMenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Job Type"
                value={filters.jobType}
                onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                fullWidth
                size="small"
              >
                <SelectMenuItem value="">All Types</SelectMenuItem>
                <SelectMenuItem value={JobType.REGULAR}>Regular</SelectMenuItem>
                <SelectMenuItem value={JobType.OVERTIME}>Overtime</SelectMenuItem>
                <SelectMenuItem value={JobType.BONUS}>Bonus</SelectMenuItem>
                <SelectMenuItem value={JobType.COMMISSION}>Commission</SelectMenuItem>
                <SelectMenuItem value={JobType.EXPENSE}>Expense</SelectMenuItem>
                <SelectMenuItem value={JobType.OTHER}>Other</SelectMenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.neutral[100] }}>
                <TableCell><strong>Job Title</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Hours</strong></TableCell>
                <TableCell><strong>Rate</strong></TableCell>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <WorkIcon sx={{ fontSize: 48, color: colors.neutral[400], mb: 1 }} />
                    <Typography variant="body1" color="text.secondary">
                      No jobs found for this employee
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">{job.title}</Typography>
                      {job.description && (
                        <Typography variant="caption" color="text.secondary">
                          {job.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={job.jobType} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {job.completedAt ? format(new Date(job.completedAt), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        ${job.payAmount?.toFixed(2) ?? '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
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

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditJob}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Job
          </MenuItem>
          {selectedJob?.status === JobStatus.PENDING && (
            <MenuItem onClick={handleMarkComplete}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Mark Complete
            </MenuItem>
          )}
          <MenuItem onClick={handleDeleteJob} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Job
          </MenuItem>
        </Menu>

        {/* Dialogs */}
        <CreateJobDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={handleCreateJob}
          preselectedEmployeeId={employee.id}
        />

        <EditJobDialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={handleEditJobSuccess}
        />

        <ConfirmationDialog
          open={confirmationOpen}
          title={confirmationData?.title || ''}
          message={confirmationData?.message || ''}
          confirmText={confirmationData?.confirmText}
          severity={confirmationData?.severity}
          onConfirm={confirmationConfirm}
          onClose={confirmationCancel}
        />
      </Box>
    </LocalizationProvider>
  );
}
