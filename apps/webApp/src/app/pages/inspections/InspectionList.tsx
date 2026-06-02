import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  AssignmentTurnedIn as InspectionIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Visibility as OpenIcon,
} from '@mui/icons-material';
import { customerService, Customer } from '../../requests/customer.requests';
import { vehicleService, Vehicle } from '../../requests/vehicle.requests';
import {
  Inspection,
  InspectionTemplate,
  inspectionService,
} from '../../requests/inspection.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

const statusColor = (status: string) => {
  if (status === 'COMPLETED' || status === 'FINALIZED') return 'success';
  if (status === 'CANCELLED') return 'default';
  return 'warning';
};

export function InspectionList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showApiError, showValidationError } = useErrorHelpers();
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [roNumber, setRoNumber] = useState('');
  const [mileage, setMileage] = useState('');
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [actionInspectionId, setActionInspectionId] = useState<string | null>(null);

  const routePrefix = location.pathname.match(/^\/(admin|staff|supervisor)(?=\/)/)?.[0] || '/staff';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const peaceOfMind = templates.find((template) => template.type === 'PEACE_OF_MIND');
    if (peaceOfMind && !selectedTemplateId) {
      setSelectedTemplateId(peaceOfMind.id);
    }
  }, [templates, selectedTemplateId]);

  const customerVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.customerId === selectedCustomerId),
    [vehicles, selectedCustomerId]
  );
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );
  const actionInspection = useMemo(
    () => inspections.find((inspection) => inspection.id === actionInspectionId) || null,
    [inspections, actionInspectionId]
  );
  const canPrintActionInspection = actionInspection?.status === 'COMPLETED' || actionInspection?.status === 'FINALIZED';
  const canStartInspection = Boolean(selectedTemplateId && selectedCustomerId && selectedVehicleId);
  const startInspectionHint = !selectedTemplateId
    ? 'Choose an inspection template.'
    : !selectedCustomerId
      ? 'Choose a customer.'
      : !selectedVehicleId
        ? 'Choose a vehicle.'
        : '';

  const loadData = async () => {
    try {
      setLoading(true);
      const [templateData, inspectionData, customerData, vehicleData] = await Promise.all([
        inspectionService.getTemplates(),
        inspectionService.getInspections(),
        customerService.getCustomersSimple(),
        vehicleService.getAllVehicles(),
      ]);
      setTemplates(templateData);
      setInspections(inspectionData);
      setCustomers(customerData);
      setVehicles(vehicleData);
    } catch (error) {
      showApiError(error, 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async () => {
    if (!canStartInspection) {
      showValidationError(startInspectionHint || 'Complete the required fields before starting an inspection.');
      return;
    }

    try {
      setCreating(true);
      const inspection = await inspectionService.createInspection({
        templateId: selectedTemplateId,
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId || undefined,
        roNumber: roNumber.trim() || undefined,
        mileage: mileage ? Number(mileage) : undefined,
      });
      navigate(`${routePrefix}/inspections/${inspection.id}`);
    } catch (error) {
      showApiError(error, 'Failed to create inspection');
    } finally {
      setCreating(false);
    }
  };

  const handlePrintInspection = async (inspectionId: string) => {
    try {
      await inspectionService.printInspection(inspectionId);
    } catch (error) {
      showApiError(error, 'Failed to print inspection');
    }
  };

  const openActionMenu = (event: React.MouseEvent<HTMLElement>, inspectionId: string) => {
    setActionAnchorEl(event.currentTarget);
    setActionInspectionId(inspectionId);
  };

  const closeActionMenu = () => {
    setActionAnchorEl(null);
    setActionInspectionId(null);
  };

  const handleAction = (action: 'open' | 'edit' | 'print') => {
    if (!actionInspectionId) return;

    if (action === 'print') {
      if (!canPrintActionInspection) {
        closeActionMenu();
        return;
      }
      void handlePrintInspection(actionInspectionId);
    } else {
      navigate(`${routePrefix}/inspections/${actionInspectionId}`);
    }

    closeActionMenu();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 1, md: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>Inspections</Typography>
          <Typography color="text.secondary">Start and review digital vehicle inspection reports.</Typography>
        </Box>
        <Chip icon={<InspectionIcon />} label="Peace of Mind first draft" color="primary" variant="outlined" />
      </Stack>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Template</InputLabel>
                <Select label="Template" value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Autocomplete
                fullWidth
                options={customers}
                value={selectedCustomer}
                getOptionLabel={(customer) =>
                  [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.businessName || customer.phone || customer.email || 'Unnamed customer'
                }
                filterOptions={(options, state) => {
                  const search = state.inputValue.trim().toLowerCase();
                  if (!search) return options;

                  return options.filter((customer) => {
                    const searchable = [
                      customer.firstName,
                      customer.lastName,
                      customer.businessName,
                      customer.phone,
                      customer.email,
                    ].filter(Boolean).join(' ').toLowerCase();
                    return searchable.includes(search);
                  });
                }}
                onChange={(_, customer) => {
                  setSelectedCustomerId(customer?.id || '');
                  setSelectedVehicleId('');
                }}
                renderOption={(props, customer) => (
                  <Box component="li" {...props} key={customer.id}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.businessName || 'Unnamed customer'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[customer.phone, customer.email].filter(Boolean).join(' | ') || 'No phone or email'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Customer" placeholder="Search name or phone" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth disabled={!selectedCustomerId}>
                <InputLabel>Vehicle</InputLabel>
                <Select label="Vehicle" value={selectedVehicleId} onChange={(event) => setSelectedVehicleId(event.target.value)}>
                  <MenuItem value="">Select a vehicle</MenuItem>
                  {customerVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField fullWidth label="RO #" value={roNumber} onChange={(event) => setRoNumber(event.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, md: 1.5 }}>
              <TextField fullWidth label="Mileage" type="number" value={mileage} onChange={(event) => setMileage(event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button
                variant={canStartInspection ? 'contained' : 'outlined'}
                color={canStartInspection ? 'primary' : 'inherit'}
                fullWidth
                startIcon={creating ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                onClick={createInspection}
                disabled={creating || !canStartInspection}
                sx={{
                  minHeight: 48,
                  ...(!canStartInspection && {
                    color: 'text.disabled',
                    borderColor: 'grey.400',
                    backgroundColor: 'transparent',
                    '&.Mui-disabled': {
                      color: 'text.disabled',
                      borderColor: 'grey.400',
                      backgroundColor: 'transparent',
                    },
                  }),
                }}
              >
                Start Inspection
              </Button>
              {startInspectionHint && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {startInspectionHint}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {inspections.length === 0 ? (
        <Alert severity="info">No inspections have been started yet.</Alert>
      ) : (
        <>
        <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
          {inspections.map((inspection) => (
            <Card key={inspection.id} variant="outlined" sx={{ borderRadius: 1 }}>
              <CardContent>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography
                        component="button"
                        onClick={() => navigate(`${routePrefix}/inspections/${inspection.id}`)}
                        sx={{
                          p: 0,
                          border: 0,
                          background: 'transparent',
                          color: 'primary.main',
                          font: 'inherit',
                          fontWeight: 700,
                          textAlign: 'left',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {inspection.template?.name || 'Inspection'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">RO: {inspection.roNumber || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Chip size="small" label={inspection.status.replace('_', ' ')} color={statusColor(inspection.status) as any} />
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(event) => openActionMenu(event, inspection.id)}
                          aria-label="Inspection actions"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Customer</Typography>
                    <Typography>
                      {[inspection.customer?.firstName, inspection.customer?.lastName].filter(Boolean).join(' ') || inspection.customer?.businessName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Vehicle</Typography>
                    <Typography>
                      {inspection.vehicle ? `${inspection.vehicle.year} ${inspection.vehicle.make} ${inspection.vehicle.model}` : '-'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Inspection</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow key={inspection.id} hover>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography
                        component="button"
                        onClick={() => navigate(`${routePrefix}/inspections/${inspection.id}`)}
                        sx={{
                          p: 0,
                          border: 0,
                          background: 'transparent',
                          color: 'primary.main',
                          font: 'inherit',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {inspection.template?.name || 'Inspection'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">RO: {inspection.roNumber || '-'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {[inspection.customer?.firstName, inspection.customer?.lastName].filter(Boolean).join(' ') || inspection.customer?.businessName}
                  </TableCell>
                  <TableCell>
                    {inspection.vehicle ? `${inspection.vehicle.year} ${inspection.vehicle.make} ${inspection.vehicle.model}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={inspection.status.replace('_', ' ')} color={statusColor(inspection.status) as any} />
                  </TableCell>
                  <TableCell>{new Date(inspection.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actions">
                      <IconButton
                        size="small"
                        onClick={(event) => openActionMenu(event, inspection.id)}
                        aria-label="Inspection actions"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Menu
          anchorEl={actionAnchorEl}
          open={Boolean(actionAnchorEl)}
          onClose={closeActionMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleAction('open')}>
            <ListItemIcon>
              <OpenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('edit')}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          {canPrintActionInspection && (
            <MenuItem onClick={() => handleAction('print')}>
              <ListItemIcon>
                <PrintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print</ListItemText>
            </MenuItem>
          )}
        </Menu>
        </>
      )}
    </Box>
  );
}
