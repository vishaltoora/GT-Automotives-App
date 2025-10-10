import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Alert,
  Avatar,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  ArrowBack as ArrowBackIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { JobResponseDto, JobSummaryDto, JobStatus, JobType } from '@gt-automotive/data';
import { jobService } from '../../../services/job.service';
import { userService } from '../../../services/user.service';
import { CreateJobDialog } from '../../../components/payroll/CreateJobDialog';
import { EditJobDialog } from '../../../components/payroll/EditJobDialog';
import { ConfirmationDialog } from '../../../components/common/ConfirmationDialog';
import { useConfirmationDialog } from '../../../hooks/useConfirmationDialog';
import { colors } from '../../../theme/colors';
import { format } from 'date-fns';

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: {
    name: string;
  };
}

interface EmployeeJobSummary extends Employee {
  totalJobs: number;
  pendingJobs: number;
  readyJobs: number;
  totalPayAmount: number;
}

export function JobsManagement() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeJobSummary[]>([]);
  const [jobs, setJobs] = useState<JobResponseDto[]>([]);
  const [summary, setSummary] = useState<JobSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<JobResponseDto | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

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

  // Fetch employee summaries when no employeeId in URL
  useEffect(() => {
    if (!employeeId) {
      fetchEmployeeSummaries();
    }
  }, [employeeId]);

  // Fetch employee details and jobs when employeeId is in URL
  useEffect(() => {
    if (employeeId) {
      const loadEmployeeData = async () => {
        try {
          setLoading(true);
          const users = await userService.getUsers();
          const employee = users.find(u => u.id === employeeId);

          if (employee) {
            setSelectedEmployee(employee);
            setError(null);
          } else {
            setError('Employee not found');
            navigate('/admin/payroll/jobs');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch employee details');
        } finally {
          setLoading(false);
        }
      };

      loadEmployeeData();
    } else {
      setSelectedEmployee(null);
    }
  }, [employeeId, navigate]);

  // Fetch jobs when selectedEmployee is set or filters change
  useEffect(() => {
    if (selectedEmployee && employeeId) {
      fetchEmployeeJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee?.id, employeeId, filters.status, filters.jobType, filters.startDate?.toString(), filters.endDate?.toString()]);

  const fetchEmployeeSummaries = async () => {
    try {
      setLoading(true);
      const users = await userService.getUsers();
      const staffAndAdmins = users.filter(u =>
        u.role?.name === 'STAFF' || u.role?.name === 'ADMIN'
      );

      // Fetch job summaries for each employee
      const summaries = await Promise.all(
        staffAndAdmins.map(async (employee) => {
          const summary = await jobService.getJobSummary(employee.id);
          return {
            ...employee,
            ...summary,
          };
        })
      );

      setEmployeeSummaries(summaries);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeJobs = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const filterParams = {
        employeeId: selectedEmployee.id,
        status: filters.status ? (filters.status as JobStatus) : undefined,
        jobType: filters.jobType ? (filters.jobType as JobType) : undefined,
        startDate: filters.startDate?.toISOString() || undefined,
        endDate: filters.endDate?.toISOString() || undefined,
      };

      const [jobsData, summaryData] = await Promise.all([
        jobService.getJobs(filterParams),
        jobService.getJobSummary(selectedEmployee.id),
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

  const handleEmployeeClick = (employee: Employee) => {
    navigate(`/admin/jobs/${employee.id}`);
  };

  const handleBackToEmployees = () => {
    setSelectedEmployee(null);
    clearFilters();
    navigate('/admin/jobs');
  };

  const handleCreateJob = async (newJob: JobResponseDto) => {
    if (employeeId && selectedEmployee) {
      await fetchEmployeeJobs();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, job: JobResponseDto) => {
    console.log('🔵 JobsManagement - Opening menu for job:', job);
    setMenuAnchor(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    // Don't clear selectedJob immediately - dialogs might need it
    // It will be cleared when dialogs close
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
        handleMenuClose();

        setTimeout(async () => {
          await fetchEmployeeJobs();
        }, 100);

      } catch (err: any) {
        console.error('Delete error:', err);
        if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          setError('Job not found. It may have already been deleted. Refreshing the list...');
          await fetchEmployeeJobs();
        } else {
          setError(err.message || 'Failed to delete job');
        }
        handleMenuClose();
      }
    }
  };

  const handleEditJob = () => {
    console.log('✏️ JobsManagement - Edit job clicked, selectedJob:', selectedJob);
    if (!selectedJob) {
      console.log('⚠️ JobsManagement - No job selected, cannot edit!');
      return;
    }
    console.log('✏️ JobsManagement - Opening edit dialog with job:', selectedJob.id, selectedJob.title);
    // Close menu first (this triggers handleMenuClose)
    setMenuAnchor(null);
    // Wait a tick to ensure menu close completes, then open dialog
    setTimeout(() => {
      setEditDialogOpen(true);
    }, 0);
  };

  const handleEditJobSuccess = async (updatedJob: JobResponseDto) => {
    await fetchEmployeeJobs();
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

  const getEmployeeInitials = (employee: Employee) => {
    const firstInitial = employee.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = employee.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || employee.email.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      '#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2',
      '#00796b', '#c2185b', '#5d4037', '#616161', '#e64a19'
    ];
    const charCode = email.charCodeAt(0) + email.charCodeAt(email.length - 1);
    return colors[charCode % colors.length];
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      jobType: '',
      startDate: null,
      endDate: null,
    });
  };

  const toggleCardExpanded = (employeeId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Loading states */}
        {loading && !employeeId && !employeeSummaries.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography>Loading employees...</Typography>
          </Box>
        )}

        {employeeId && (!selectedEmployee || loading) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <Typography>Loading employee details...</Typography>
          </Box>
        )}

        {/* Employee List View */}
        {!employeeId && !loading && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon sx={{ fontSize: 32, color: colors.primary.main }} />
                <Typography variant="h4" fontWeight="bold">
                  Employee Jobs & Payments
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select an employee to view and manage their jobs and payments
            </Typography>

            <Grid container spacing={2}>
              {employeeSummaries.map((employee) => {
                const isExpanded = expandedCards.has(employee.id);
                const completedJobs = employee.totalJobs - employee.pendingJobs - employee.readyJobs;
                return (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={employee.id}>
                    <Card
                      sx={{
                        transition: 'all 0.2s ease-in-out',
                        border: `1px solid ${colors.neutral[200]}`,
                        '&:hover': {
                          borderColor: colors.primary.main,
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, pb: 1.5 }}>
                        {/* Compact Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: getAvatarColor(employee.email),
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            {getEmployeeInitials(employee)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => handleEmployeeClick(employee)}>
                            <Typography variant="subtitle1" fontWeight="600" noWrap>
                              {getEmployeeName(employee)}
                            </Typography>
                            <Chip
                              label={employee.role?.name || 'STAFF'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: colors.neutral[100],
                                border: `1px solid ${colors.neutral[300]}`,
                              }}
                            />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpanded(employee.id);
                            }}
                            sx={{ ml: 'auto' }}
                          >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>

                        {/* Key Metrics - Always Visible */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.5,
                              bgcolor: colors.primary.light + '15',
                              border: `1px solid ${colors.primary.light}`,
                              borderRadius: 1,
                              textAlign: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.5 }}>
                              Total Earnings
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                              ${employee.totalPayAmount.toFixed(0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.totalJobs} jobs
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              p: 1.5,
                              bgcolor: colors.semantic.infoLight + '15',
                              border: `1px solid ${colors.semantic.infoLight}`,
                              borderRadius: 1,
                              textAlign: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEmployeeClick(employee)}
                          >
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.5 }}>
                              Ready to Pay
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="info.main">
                              {employee.readyJobs}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              jobs ready
                            </Typography>
                          </Box>
                        </Box>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
                            {/* Job Status Counts */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mb: 2 }}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.neutral[50], borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                  {employee.totalJobs}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Total
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.warningLight + '10', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color="warning.main">
                                  {employee.pendingJobs}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Pending
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: colors.semantic.successLight + '10', borderRadius: 1 }}>
                                <Typography variant="h6" fontWeight="bold" color="success.main">
                                  {completedJobs}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Completed
                                </Typography>
                              </Box>
                            </Box>

                            {/* Average Per Job */}
                            <Box
                              sx={{
                                p: 1.5,
                                bgcolor: colors.neutral[50],
                                borderRadius: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" fontWeight="600">
                                Average per Job
                              </Typography>
                              <Typography variant="h6" fontWeight="bold" color="success.main">
                                ${employee.totalJobs > 0 ? (employee.totalPayAmount / employee.totalJobs).toFixed(2) : '0.00'}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* View Jobs Button */}
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          onClick={() => handleEmployeeClick(employee)}
                          sx={{
                            mt: 1.5,
                            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                            fontWeight: 600,
                          }}
                        >
                          View Jobs
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {employeeSummaries.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 64, color: colors.neutral[400], mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No employees found
                </Typography>
              </Paper>
            )}
          </>
        )}

        {/* Employee Jobs View */}
        {employeeId && selectedEmployee && !loading && (
          <>
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
              {selectedEmployee ? getEmployeeName(selectedEmployee) : 'Jobs'}
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
                    bgcolor: selectedEmployee ? getAvatarColor(selectedEmployee.email) : colors.primary.main,
                  }}
                >
                  {selectedEmployee ? getEmployeeInitials(selectedEmployee) : '?'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedEmployee ? getEmployeeName(selectedEmployee) : 'Employee Jobs'}
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
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${colors.semantic.infoLight} 0%, ${colors.semantic.info} 100%)`, color: 'white' }}>
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
              <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${colors.semantic.successLight} 0%, ${colors.semantic.success} 100%)`, color: 'white' }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                      {job.completedAt ? format(new Date(job.completedAt), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        ${job.payAmount.toFixed(2)}
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
              preselectedEmployeeId={selectedEmployee?.id}
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
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
}
