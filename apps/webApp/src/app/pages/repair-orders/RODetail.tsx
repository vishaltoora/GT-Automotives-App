import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Assignment as InspectIcon,
  Build as ServicesIcon,
  Chat as ChatIcon,
  DirectionsCar,
  Edit,
  Email as EmailIcon,
  LockOpen,
  People as PeopleIcon,
  Print as PrintIcon,
  ReceiptLong,
  RequestQuote,
  Save,
} from '@mui/icons-material';
import {
  repairOrderRequests,
  RepairOrder,
  ROStatus,
} from '../../requests/repair-order.requests';
import { ServiceDrawer } from '../../components/repair-orders/ServiceDrawer';
import { AddVehicleDialog } from '../../components/repair-orders/AddVehicleDialog';
import { InspectVehicleDialog } from '../../components/repair-orders/InspectVehicleDialog';
import { ROPhotoSection } from '../../components/repair-orders/ROPhotoSection';
import { PreInspectionSection } from '../../components/repair-orders/PreInspectionSection';
import EmailPromptDialog from '../../components/common/EmailPromptDialog';
import { AssignEmployeesDialog } from '../../components/repair-orders/AssignEmployeesDialog';
import { ROItemsList } from '../../components/repair-orders/ROItemsList';
import { useAuth } from '../../hooks/useAuth';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { companyService, Company } from '../../requests/company.requests';
import { vehicleService, Vehicle } from '../../requests/vehicle.requests';
import {
  inspectionService,
  InspectionFeeItem,
} from '../../requests/inspection.requests';
import { invoiceService } from '../../requests/invoice.requests';
import {
  PAYMENT_METHOD_SELECT_OPTIONS,
  resolvePaymentMethod,
  PaymentMethodValue,
} from '../../constants/payment-methods';
import { colors } from '../../theme/colors';

// ---- Status config ----

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

const STATUS_TRANSITIONS: Record<ROStatus, ROStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_PARTS', 'READY'],
  WAITING_FOR_PARTS: ['IN_PROGRESS', 'READY'],
  READY: ['IN_PROGRESS'],
  CLOSED: [],
  INVOICED: [],
};

// ---- Helpers ----

function customerFullName(ro: RepairOrder) {
  if (ro.customer.businessName) return ro.customer.businessName;
  return `${ro.customer.firstName} ${ro.customer.lastName}`.trim();
}

function vehicleLabel(ro: RepairOrder) {
  const v = ro.vehicle;
  if (!v) return null;
  return [v.year, v.make, v.model].join(' ');
}

// ---- Current tab ----

function CurrentTab({
  ro,
  onROChange,
  canEdit,
  canClose,
  isAdmin,
  currentUserId,
  baseRoute,
}: {
  ro: RepairOrder;
  onROChange: (updated: RepairOrder) => void;
  canEdit: boolean;
  canClose: boolean;
  isAdmin: boolean;
  currentUserId: string;
  baseRoute: string;
}) {
  const navigate = useNavigate();
  const { showApiError, showValidationError } = useErrorHelpers();
  const { confirm } = useConfirmationHelpers();
  const [serviceDrawerOpen, setServiceDrawerOpen] = useState(false);
  const [editingConcern, setEditingConcern] = useState(false);
  const [concern, setConcern] = useState(ro.customerConcern ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(ro.technicianNotes ?? '');
  const [savingConcern, setSavingConcern] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [feeItems, setFeeItems] = useState<InspectionFeeItem[]>([]);
  const [selectedFeeItemId, setSelectedFeeItemId] = useState('');
  // Optional payment method tagged onto the generated invoice. The invoice is
  // saved as PENDING (not marked paid) — payment is recorded later through the
  // invoice flow. CASH_NO_TAX drops GST/PST from the invoice total.
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  // After a successful close, the dialog switches to a print-actions state.
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState('');
  const [invoicedInspectionId, setInvoicedInspectionId] = useState<
    string | null
  >(null);
  const [printing, setPrinting] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [viewInspectionId, setViewInspectionId] = useState<string | undefined>(
    undefined
  );
  const [linkingVehicle, setLinkingVehicle] = useState(false);
  const [changingVehicle, setChangingVehicle] = useState(false);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [assignEmployeesOpen, setAssignEmployeesOpen] = useState(false);
  const [creatingQuotation, setCreatingQuotation] = useState(false);
  const [createdQuotationId, setCreatedQuotationId] = useState<string | null>(
    null
  );
  const [estimateEmailOpen, setEstimateEmailOpen] = useState(false);

  // Re-fetch the RO after item-level mutations so the detail view stays in sync.
  const refetchRO = async () => {
    const refreshed = await repairOrderRequests.getById(ro.id);
    onROChange(refreshed);
  };

  // Sends the customer an estimate (quotation PDF + pre-inspection photos PDF).
  // Re-throws on failure so EmailPromptDialog stays open for a retry.
  const handleSendEstimate = async (emails: string[]) => {
    try {
      const result = await repairOrderRequests.sendEstimateEmail(ro.id, emails);
      setEstimateEmailOpen(false);
      await confirm({
        title: 'Estimate Sent',
        message: `The estimate for ${ro.roNumber} was emailed to ${
          result.emailUsed || emails.join(', ')
        }.`,
        confirmText: 'OK',
        showCancelButton: false,
      });
    } catch (error) {
      showApiError(error, 'Failed to send the estimate email.');
      throw error;
    }
  };

  const hasQuotationItems = ro.services?.some((s) => s.isQuotation) ?? false;

  const handleCreateQuotation = async () => {
    setCreatingQuotation(true);
    try {
      const quotation = await repairOrderRequests.createQuotation(ro.id);
      await refetchRO();
      setCreatedQuotationId(quotation?.id ?? null);
    } catch (error) {
      showApiError(error, 'Failed to create quotation from repair order.');
    } finally {
      setCreatingQuotation(false);
    }
  };

  // Hide the picker once a vehicle is linked OR the RO is marked no-vehicle
  // (loose tires), unless the user explicitly chose to change the vehicle.
  const showVehiclePicker = (!ro.vehicle && !ro.noVehicle) || changingVehicle;

  useEffect(() => {
    if (!showVehiclePicker || !ro.customerId) return;
    vehicleService
      .getCustomerVehicles(ro.customerId)
      .then(setCustomerVehicles)
      .catch(() => setCustomerVehicles([]));
  }, [showVehiclePicker, ro.customerId]);

  const completedServices =
    ro.services?.filter((s) => s.status === 'COMPLETED') ?? [];
  // All completed items are billed (a declined item can't be marked complete).
  const billableServices =
    ro.services?.filter((s) => s.status === 'COMPLETED') ?? [];
  const totalServices = ro.services?.length ?? 0;

  // A completed, not-yet-invoiced inspection lets us bill its fee even when the
  // RO itself has no service items (the inspection IS the billable work).
  const invoiceableInspection = ro.inspections?.find(
    (i) =>
      (i.status === 'COMPLETED' || i.status === 'FINALIZED') && !i.invoiceId
  );
  const selectedFeeItem = feeItems.find((f) => f.id === selectedFeeItemId);
  const hasInvoiceableWork =
    billableServices.length > 0 || Boolean(invoiceableInspection);

  // Validation gating: work can begin once the vehicle question is resolved —
  // either a vehicle is linked, or the RO is explicitly marked no-vehicle
  // (loose tires / counter sale). Vehicle-based ROs still require at least one
  // photo before inspecting or adding services; no-vehicle ROs waive photos.
  const hasVehicle = !!ro.vehicle;
  const isNoVehicle = !!ro.noVehicle;
  const vehicleResolved = hasVehicle || isNoVehicle;
  const hasPhotos = (ro.media?.length ?? 0) > 0;
  const actionsEnabled = vehicleResolved && (isNoVehicle || hasPhotos);
  const actionDisabledReason = !vehicleResolved
    ? 'Add a vehicle to this repair order, or mark it as no-vehicle'
    : !isNoVehicle && !hasPhotos
    ? 'Add at least one photo first'
    : '';
  // Pre-inspection only needs the vehicle question resolved — a photo is NOT
  // required first (the technician inspects the vehicle, then documents it).
  const inspectionEnabled = vehicleResolved;
  const inspectionDisabledReason = vehicleResolved
    ? ''
    : 'Add a vehicle to this repair order, or mark it as no-vehicle';
  // The running estimate excludes customer-declined items.
  const estimatedTotal =
    ro.services
      ?.filter((s) => s.customerApproval !== 'DECLINED')
      .reduce((sum, s) => sum + Number(s.total ?? 0), 0) ?? 0;
  const completedSubtotal = billableServices.reduce(
    (sum, s) => sum + Number(s.total ?? 0),
    0
  );

  // Estimate mirrors what the invoice will bill. Shop supplies (4%) and the
  // fleet discount (10%) are computed off the SERVICE-item base (parts excluded)
  // and applied before tax — matching buildAdjustmentItems() on the server. GST
  // is always 5%; PST is 7% unless the customer is PST-exempt (a customer-profile
  // setting the server gate enforces).
  const GST_RATE = 0.05;
  const SHOP_SUPPLIES_RATE = 0.04;
  const FLEET_DISCOUNT_RATE = 0.1;
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const pstExempt = !!ro.customer?.pstExempt;
  const pstRate = pstExempt ? 0 : 0.07;

  const serviceBase = (ro.services ?? [])
    .filter((s) => s.type !== 'PART' && s.customerApproval !== 'DECLINED')
    .reduce((sum, s) => sum + Number(s.total ?? 0), 0);
  const shopSupplies =
    serviceBase > 0 ? round2(serviceBase * SHOP_SUPPLIES_RATE) : 0;
  const fleetDiscount =
    ro.customer?.fleetDiscount && serviceBase > 0
      ? round2(serviceBase * FLEET_DISCOUNT_RATE)
      : 0;

  // CASH_NO_TAX is an untaxed cash sale — drop GST/PST from the estimate/total.
  const noTaxSelected = selectedPaymentMethod === 'CASH_NO_TAX';
  const estimatedSubtotal = estimatedTotal + shopSupplies - fleetDiscount;
  const estimatedGst = noTaxSelected ? 0 : estimatedSubtotal * GST_RATE;
  const estimatedPst = noTaxSelected ? 0 : estimatedSubtotal * pstRate;
  const estimatedGrandTotal = estimatedSubtotal + estimatedGst + estimatedPst;

  const handleStatusChange = async (status: ROStatus) => {
    setSavingStatus(true);
    try {
      const updated = await repairOrderRequests.update(ro.id, { status });
      onROChange({ ...ro, ...updated });
    } finally {
      setSavingStatus(false);
    }
  };

  // A closed/invoiced RO can be reopened (e.g. it was closed by accident) as long
  // as no payment has landed on its invoice. Reopening rebuilds the invoice on
  // the next close, so it stays in sync with any edits made in between.
  const canReopen =
    canClose &&
    (ro.status === 'CLOSED' || ro.status === 'INVOICED') &&
    (!ro.invoice ||
      (ro.invoice.status !== 'PAID' && ro.invoice.status !== 'PARTIALLY_PAID'));

  const handleReopen = async () => {
    setReopening(true);
    try {
      const updated = await repairOrderRequests.reopen(ro.id);
      onROChange({ ...ro, ...updated });
    } catch (error) {
      showApiError(error, 'Failed to reopen repair order.');
    } finally {
      setReopening(false);
    }
  };

  const handleSaveConcern = async () => {
    setSavingConcern(true);
    try {
      const updated = await repairOrderRequests.update(ro.id, {
        customerConcern: concern,
      });
      onROChange({ ...ro, ...updated });
      setEditingConcern(false);
    } finally {
      setSavingConcern(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const updated = await repairOrderRequests.update(ro.id, {
        technicianNotes: notes,
      });
      onROChange({ ...ro, ...updated });
      setEditingNotes(false);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleOpenCloseDialog = async () => {
    setCloseDialogOpen(true);
    setCompaniesLoading(true);
    try {
      const requests: [Promise<Company[]>, Promise<InspectionFeeItem[]>] = [
        companyService.getCompanies(),
        invoiceableInspection
          ? inspectionService.getFeeItems()
          : Promise.resolve([] as InspectionFeeItem[]),
      ];
      const [list, fees] = await Promise.all(requests);
      setCompanies(list);
      const preset = list.find((c) => c.isDefault) ?? list[0];
      if (preset) setSelectedCompanyId(preset.id);

      if (invoiceableInspection) {
        const activeFees = fees.filter((f) => f.isActive);
        setFeeItems(activeFees);
        const inspType = invoiceableInspection.template?.type;
        const match = activeFees.find((f) => f.type && f.type === inspType);
        setSelectedFeeItemId(match?.id ?? activeFees[0]?.id ?? '');
      }
    } catch (error) {
      showApiError(error, 'Failed to load companies.');
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!selectedCompanyId) return;
    if (invoiceableInspection && !selectedFeeItemId) {
      showValidationError('Select an inspection fee to invoice.');
      return;
    }
    // Captured before the refresh clears the "invoiceable" inspection.
    const inspectionToPrint = invoiceableInspection?.id ?? null;
    setClosing(true);
    try {
      await repairOrderRequests.close(
        ro.id,
        selectedCompanyId,
        invoiceableInspection ? selectedFeeItemId : undefined,
        // A Square Terminal choice resolves to its real Credit/Debit method —
        // the RO close only tags the invoice, it doesn't run a card-reader charge.
        selectedPaymentMethod
          ? resolvePaymentMethod(selectedPaymentMethod as PaymentMethodValue)
          : undefined
      );
      const refreshed = await repairOrderRequests.getById(ro.id);
      onROChange(refreshed);
      // Switch the dialog into a print-actions state instead of closing it.
      setCreatedInvoiceId(refreshed.invoice?.id ?? null);
      setCreatedInvoiceNumber(refreshed.invoice?.invoiceNumber ?? '');
      setInvoicedInspectionId(inspectionToPrint);
    } catch (error) {
      showApiError(error, 'Failed to close repair order and create invoice.');
    } finally {
      setClosing(false);
    }
  };

  const handleCloseDialogDismiss = () => {
    setCloseDialogOpen(false);
    setCreatedInvoiceId(null);
    setCreatedInvoiceNumber('');
    setInvoicedInspectionId(null);
    setSelectedFeeItemId('');
  };

  const handlePrintCreatedInvoice = async () => {
    if (!createdInvoiceId) return;
    setPrinting(true);
    try {
      const invoice = await invoiceService.getInvoice(createdInvoiceId);
      invoiceService.printInvoice(invoice);
    } catch (error) {
      showApiError(error, 'Failed to print invoice.');
    } finally {
      setPrinting(false);
    }
  };

  const handlePrintInvoicedInspection = async () => {
    if (!invoicedInspectionId) return;
    setPrinting(true);
    try {
      await inspectionService.printInspection(invoicedInspectionId);
    } catch (error) {
      showApiError(error, 'Failed to print inspection report.');
    } finally {
      setPrinting(false);
    }
  };

  const handleVehicleAdded = async (vehicle: { id: string }) => {
    if (vehicle.id === ro.vehicle?.id) {
      setChangingVehicle(false);
      return;
    }
    setLinkingVehicle(true);
    try {
      const updated = await repairOrderRequests.update(ro.id, {
        vehicleId: vehicle.id,
      });
      onROChange(updated);
      setAddVehicleOpen(false);
      setChangingVehicle(false);
    } catch (error) {
      showApiError(
        error,
        'Vehicle was created but could not be linked to this repair order.'
      );
    } finally {
      setLinkingVehicle(false);
    }
  };

  // Toggle the "no vehicle" flag (loose tires, battery, or other counter
  // service). Marking it on clears any linked vehicle; turning it off reopens
  // the vehicle picker.
  const handleSetNoVehicle = async (noVehicle: boolean) => {
    setLinkingVehicle(true);
    try {
      const updated = await repairOrderRequests.update(ro.id, { noVehicle });
      onROChange(updated);
      setChangingVehicle(false);
    } catch (error) {
      showApiError(error, 'Failed to update the repair order.');
    } finally {
      setLinkingVehicle(false);
    }
  };

  const transitions = [...STATUS_TRANSITIONS[ro.status]];
  // Admin-only manual override: bump a closed RO to INVOICED. Normally an RO
  // flips to INVOICED automatically once its invoice is created/paid, but for
  // older ROs where that didn't happen, admin can set it manually.
  if (
    isAdmin &&
    ro.status === 'CLOSED' &&
    !!ro.invoice &&
    !transitions.includes('INVOICED')
  ) {
    transitions.push('INVOICED');
  }

  return (
    <Box>
      {/* Assigned Employees + Status cards, side by side */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ flexGrow: 1 }}
              >
                Assigned Employees
              </Typography>
              {canEdit && (
                <IconButton
                  size="small"
                  onClick={() => setAssignEmployeesOpen(true)}
                  aria-label="Edit assigned employees"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
            </Box>
            {ro.employees?.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {ro.employees.map((e) => (
                  <Chip
                    key={e.id}
                    label={
                      e.role
                        ? `${e.user.firstName} ${e.user.lastName} · ${e.role}`
                        : `${e.user.firstName} ${e.user.lastName}`
                    }
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ fontStyle: 'italic' }}
              >
                No employees assigned
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              {canEdit && transitions.length > 0 ? (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="ro-status-label">Status</InputLabel>
                  <Select
                    labelId="ro-status-label"
                    label="Status"
                    value={ro.status}
                    disabled={savingStatus}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as ROStatus)
                    }
                    renderValue={(value) => (
                      <Chip
                        label={STATUS_META[value as ROStatus].label}
                        color={STATUS_META[value as ROStatus].color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  >
                    {[ro.status, ...transitions].map((s) => (
                      <MenuItem key={s} value={s}>
                        {STATUS_META[s].label}
                        {s === ro.status ? ' (current)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Chip
                  label={STATUS_META[ro.status].label}
                  color={STATUS_META[ro.status].color}
                  sx={{ fontWeight: 600 }}
                />
              )}
              {savingStatus && <CircularProgress size={18} />}
              {canReopen && (
                <Chip
                  label={reopening ? 'Reopening…' : 'Reopen RO'}
                  size="small"
                  variant="outlined"
                  color="warning"
                  clickable
                  disabled={reopening}
                  onClick={handleReopen}
                  icon={<LockOpen fontSize="small" />}
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Opened {new Date(ro.openedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Customer & vehicle info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Customer
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {customerFullName(ro)}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
          {ro.customer.phone && (
            <Typography variant="body2" color="text.secondary">
              {ro.customer.phone}
            </Typography>
          )}
          {ro.customer.email && (
            <Typography variant="body2" color="text.secondary">
              {ro.customer.email}
            </Typography>
          )}
        </Stack>

        {ro.vehicle && !changingVehicle && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar fontSize="small" color="action" />
              <Typography variant="body1" fontWeight={500} sx={{ flexGrow: 1 }}>
                {vehicleLabel(ro)}
              </Typography>
              {canEdit && (
                <Button
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => setChangingVehicle(true)}
                >
                  Change
                </Button>
              )}
            </Box>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
              {ro.vehicle.licensePlate && (
                <Typography variant="body2" color="text.secondary">
                  Plate: {ro.vehicle.licensePlate}
                </Typography>
              )}
              {ro.vehicle.vin && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 11 }}
                >
                  VIN: {ro.vehicle.vin}
                </Typography>
              )}
              {ro.mileageIn != null && (
                <Typography variant="body2" color="text.secondary">
                  Mileage in: {ro.mileageIn.toLocaleString()} km
                </Typography>
              )}
              {ro.mileageOut != null && (
                <Typography variant="body2" color="text.secondary">
                  Mileage out: {ro.mileageOut.toLocaleString()} km
                </Typography>
              )}
            </Stack>
          </>
        )}

        {ro.noVehicle && !changingVehicle && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar fontSize="small" color="action" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" fontWeight={500}>
                  No vehicle
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Loose tires, battery, or other counter service
                </Typography>
              </Box>
              {canEdit && (
                <Button
                  size="small"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => setChangingVehicle(true)}
                >
                  Add vehicle
                </Button>
              )}
            </Box>
          </>
        )}

        {showVehiclePicker && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: canEdit ? 1.5 : 0,
              }}
            >
              <DirectionsCar fontSize="small" color="disabled" />
              <Typography variant="body2" color="text.disabled">
                {changingVehicle
                  ? 'Select a different vehicle for this repair order.'
                  : 'No vehicle on this repair order.'}
              </Typography>
            </Box>
            {canEdit && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                {customerVehicles.length > 0 && (
                  <Autocomplete
                    size="small"
                    sx={{ flex: 1, minWidth: 240 }}
                    options={customerVehicles}
                    disabled={linkingVehicle}
                    getOptionDisabled={(v) => v.id === ro.vehicle?.id}
                    getOptionLabel={(v) =>
                      [
                        `${v.year} ${v.make} ${v.model}`.trim(),
                        v.licensePlate ? `(${v.licensePlate})` : '',
                        v.id === ro.vehicle?.id ? '— current' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                    onChange={(_, v) => v && handleVehicleAdded(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select existing vehicle"
                        placeholder="Choose from customer's vehicles"
                      />
                    )}
                  />
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={
                    linkingVehicle ? (
                      <CircularProgress size={14} />
                    ) : (
                      <DirectionsCar />
                    )
                  }
                  onClick={() => setAddVehicleOpen(true)}
                  disabled={linkingVehicle}
                >
                  Add New
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSetNoVehicle(true)}
                  disabled={linkingVehicle}
                >
                  No vehicle needed
                </Button>
                {changingVehicle && (
                  <Button
                    size="small"
                    onClick={() => setChangingVehicle(false)}
                    disabled={linkingVehicle}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            )}
          </>
        )}

        {ro.appointment && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              Appointment:{' '}
              {new Date(ro.appointment.scheduledDate).toLocaleDateString()} @{' '}
              {ro.appointment.scheduledTime} · {ro.appointment.serviceType}
            </Typography>
          </>
        )}
      </Paper>

      {/* Customer concern */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            Customer Concern
          </Typography>
          {canEdit && !editingConcern && (
            <IconButton size="small" onClick={() => setEditingConcern(true)}>
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
        {editingConcern ? (
          <Box>
            <TextField
              multiline
              rows={3}
              fullWidth
              size="small"
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              placeholder="What is the customer reporting?"
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveConcern}
                disabled={savingConcern}
              >
                {savingConcern ? (
                  <CircularProgress size={16} />
                ) : (
                  <Save fontSize="small" />
                )}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setEditingConcern(false);
                  setConcern(ro.customerConcern ?? '');
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography
            variant="body2"
            color={concern ? 'text.primary' : 'text.disabled'}
            sx={{
              fontStyle: concern ? 'normal' : 'italic',
              cursor: canEdit ? 'pointer' : undefined,
            }}
            onClick={() => canEdit && setEditingConcern(true)}
          >
            {concern ||
              (canEdit ? 'Tap to add customer concern…' : 'Not recorded')}
          </Typography>
        )}
      </Paper>

      {/* Arrival photos */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Photos
        </Typography>
        <ROPhotoSection
          roId={ro.id}
          photos={ro.media ?? []}
          onPhotosChange={(media) => onROChange({ ...ro, media })}
          canDelete={canEdit}
          canUpload={canEdit && (hasVehicle || isNoVehicle)}
          uploadDisabledHint="Add a vehicle to this repair order first"
        />
      </Paper>

      {/* Pre-inspection: defective-part photos + notes (feeds the estimate) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <PreInspectionSection
          roId={ro.id}
          photos={ro.media ?? []}
          onPhotosChange={(media) => onROChange({ ...ro, media })}
          canEdit={canEdit}
        />
      </Paper>

      {/* Action buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        {ro.inspections?.length > 0 ? (
          <Button
            variant="outlined"
            startIcon={<InspectIcon />}
            onClick={() => {
              setViewInspectionId(ro.inspections[0].id);
              setInspectOpen(true);
            }}
          >
            View Inspection ({ro.inspections.length})
          </Button>
        ) : (
          <Tooltip
            title={
              inspectionEnabled
                ? 'Create a digital vehicle inspection linked to this RO'
                : inspectionDisabledReason
            }
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<InspectIcon />}
                onClick={() => {
                  setViewInspectionId(undefined);
                  setInspectOpen(true);
                }}
                disabled={!inspectionEnabled}
              >
                Inspect Vehicle
              </Button>
            </span>
          </Tooltip>
        )}

        <Tooltip
          title={
            actionsEnabled || totalServices > 0 ? '' : actionDisabledReason
          }
        >
          <span>
            <Button
              variant={
                !actionsEnabled && totalServices === 0
                  ? 'outlined'
                  : 'contained'
              }
              startIcon={<ServicesIcon />}
              onClick={() => setServiceDrawerOpen(true)}
              disabled={!actionsEnabled && totalServices === 0}
            >
              Services{' '}
              {totalServices > 0
                ? `(${completedServices.length}/${totalServices} done)`
                : ''}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      {/* Technician notes */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            Technician Notes
          </Typography>
          {canEdit && !editingNotes && (
            <IconButton size="small" onClick={() => setEditingNotes(true)}>
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
        {editingNotes ? (
          <Box>
            <TextField
              multiline
              rows={3}
              fullWidth
              size="small"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Findings, measurements, technician observations…"
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleSaveNotes}
                disabled={savingNotes}
              >
                {savingNotes ? (
                  <CircularProgress size={16} />
                ) : (
                  <Save fontSize="small" />
                )}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setEditingNotes(false);
                  setNotes(ro.technicianNotes ?? '');
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Box>
        ) : (
          <Typography
            variant="body2"
            color={notes ? 'text.primary' : 'text.disabled'}
            sx={{
              fontStyle: notes ? 'normal' : 'italic',
              cursor: canEdit ? 'pointer' : undefined,
              whiteSpace: 'pre-wrap',
            }}
            onClick={() => canEdit && setEditingNotes(true)}
          >
            {notes || (canEdit ? 'Tap to add technician notes…' : 'No notes')}
          </Typography>
        )}
      </Paper>

      {/* GA-43/GA-44: Service & part items with per-item controls + quotation */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            mb: 1.5,
          }}
        >
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            Services &amp; Parts
          </Typography>
          {ro.quotation && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RequestQuote fontSize="small" />}
              onClick={() =>
                navigate(`${baseRoute}/quotations/${ro.quotation!.id}`)
              }
            >
              View Quotation
            </Button>
          )}
          {canEdit && (
            <Tooltip
              title={
                hasQuotationItems
                  ? ''
                  : 'Flag at least one item as "On quotation" first'
              }
            >
              <span>
                <Button
                  size="small"
                  variant={ro.quotation ? 'contained' : 'outlined'}
                  startIcon={
                    creatingQuotation ? (
                      <CircularProgress size={14} />
                    ) : (
                      <RequestQuote fontSize="small" />
                    )
                  }
                  onClick={handleCreateQuotation}
                  disabled={!hasQuotationItems || creatingQuotation}
                >
                  {ro.quotation ? 'Update Quotation' : 'Create Quotation'}
                </Button>
              </span>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip
              title={
                ro.quotation
                  ? 'Email the customer the quotation + pre-inspection photos'
                  : 'Create a quotation first'
              }
            >
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<EmailIcon fontSize="small" />}
                  onClick={() => setEstimateEmailOpen(true)}
                  disabled={!ro.quotation}
                >
                  Send Estimate
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
        <ROItemsList
          roId={ro.id}
          services={ro.services ?? []}
          canEdit={canEdit && ro.status !== 'INVOICED'}
          canDelete={canClose && ro.status !== 'INVOICED'}
          onChanged={refetchRO}
        />
      </Paper>

      {/* Footer: totals + tax + close */}
      {ro.status !== 'INVOICED' && ro.status !== 'CLOSED' && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ maxWidth: 320, ml: 'auto' }}>
            <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={selectedPaymentMethod}
                label="Payment Method"
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <MenuItem value="">None (unpaid)</MenuItem>
                {PAYMENT_METHOD_SELECT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2">
                ${estimatedTotal.toFixed(2)}
              </Typography>
            </Box>
            {shopSupplies > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Shop Supplies (4%)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ${shopSupplies.toFixed(2)}
                </Typography>
              </Box>
            )}
            {fleetDiscount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Fleet Discount (10% on services)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  -${fleetDiscount.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {noTaxSelected ? 'GST (no tax)' : 'GST (5%)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${estimatedGst.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {noTaxSelected
                  ? 'PST (no tax)'
                  : pstExempt
                  ? 'PST (exempt)'
                  : 'PST (7%)'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ${estimatedPst.toFixed(2)}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" fontWeight={700}>
                Estimated Total
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                ${estimatedGrandTotal.toFixed(2)}
              </Typography>
            </Box>
          </Box>
          {canClose && (
            <Box
              sx={{
                mt: 1.5,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Tooltip
                title={
                  hasInvoiceableWork
                    ? ''
                    : 'Mark a service item complete or complete an inspection first'
                }
              >
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ReceiptLong />}
                    onClick={handleOpenCloseDialog}
                    disabled={closing || !hasInvoiceableWork}
                  >
                    Close & Invoice
                  </Button>
                </span>
              </Tooltip>
            </Box>
          )}
        </Paper>
      )}

      {ro.invoice && (
        <Paper
          variant="outlined"
          sx={{ p: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <ReceiptLong color="success" />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Invoice Created
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {ro.invoice.invoiceNumber}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`${baseRoute}/invoices/${ro.invoice!.id}`)}
          >
            View Invoice
          </Button>
        </Paper>
      )}

      {/* Close & Invoice dialog */}
      <Dialog
        open={closeDialogOpen}
        onClose={() => !closing && !printing && handleCloseDialogDismiss()}
        fullWidth
        maxWidth="xs"
      >
        {createdInvoiceId ? (
          <>
            <DialogTitle>Invoice Created</DialogTitle>
            <DialogContent>
              <Alert severity="success" sx={{ mb: 2 }}>
                Invoice {createdInvoiceNumber} was created from {ro.roNumber}.
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Print the documents you need
                {invoicedInspectionId
                  ? ' — the invoice and the inspection report print as separate documents.'
                  : '.'}
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintCreatedInvoice}
                  disabled={printing}
                  fullWidth
                >
                  Print Invoice
                </Button>
                {invoicedInspectionId && (
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintInvoicedInspection}
                    disabled={printing}
                    fullWidth
                  >
                    Print Inspection Report
                  </Button>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  navigate(`${baseRoute}/invoices/${createdInvoiceId}`)
                }
                disabled={printing}
              >
                View Invoice
              </Button>
              <Button
                variant="contained"
                onClick={handleCloseDialogDismiss}
                disabled={printing}
              >
                Done
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle>Close & Invoice {ro.roNumber}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {invoiceableInspection
                  ? `A draft invoice will be created from the inspection fee${
                      billableServices.length > 0
                        ? ` plus ${billableServices.length} completed item(s)`
                        : ''
                    }. Select the inspection fee and company to invoice under.`
                  : `A draft invoice will be created from the ${billableServices.length} completed item(s). Select the company to invoice under.`}
              </Typography>
              {companiesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Stack spacing={2}>
                  {invoiceableInspection && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Inspection Fee</InputLabel>
                      <Select
                        value={selectedFeeItemId}
                        label="Inspection Fee"
                        onChange={(e) => setSelectedFeeItemId(e.target.value)}
                      >
                        {feeItems.length === 0 && (
                          <MenuItem value="" disabled>
                            No active inspection fee items — add them under
                            Inspection Items &amp; Pricing
                          </MenuItem>
                        )}
                        {feeItems.map((f) => (
                          <MenuItem key={f.id} value={f.id}>
                            {f.name} — ${Number(f.price).toFixed(2)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <FormControl fullWidth size="small">
                    <InputLabel>Company</InputLabel>
                    <Select
                      value={selectedCompanyId}
                      label="Company"
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                    >
                      {companies.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name.replace(/[()]/g, '')}
                          {c.isDefault ? ' (default)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={selectedPaymentMethod}
                      label="Payment Method"
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                      <MenuItem value="">None (unpaid)</MenuItem>
                      {PAYMENT_METHOD_SELECT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              )}
              {(() => {
                const feePrice = selectedFeeItem
                  ? Number(selectedFeeItem.price)
                  : 0;
                const rawBase = completedSubtotal + feePrice;
                // The inspection fee bills as a SERVICE, so it's part of the base
                // shop supplies / fleet discount are computed from.
                const completedServiceBase =
                  billableServices
                    .filter((s) => s.type !== 'PART')
                    .reduce((sum, s) => sum + Number(s.total ?? 0), 0) +
                  feePrice;
                const previewShop =
                  completedServiceBase > 0
                    ? round2(completedServiceBase * SHOP_SUPPLIES_RATE)
                    : 0;
                const previewFleet =
                  ro.customer?.fleetDiscount && completedServiceBase > 0
                    ? round2(completedServiceBase * FLEET_DISCOUNT_RATE)
                    : 0;
                const previewSubtotal = rawBase + previewShop - previewFleet;
                // CASH_NO_TAX is an untaxed cash sale — drop GST/PST from the total.
                const noTax = selectedPaymentMethod === 'CASH_NO_TAX';
                const previewGst = noTax ? 0 : previewSubtotal * GST_RATE;
                const previewPst = noTax ? 0 : previewSubtotal * pstRate;
                return (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Subtotal
                      </Typography>
                      <Typography variant="body2">
                        ${rawBase.toFixed(2)}
                      </Typography>
                    </Box>
                    {previewShop > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Shop Supplies (4%)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${previewShop.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {previewFleet > 0 && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Fleet Discount (10% on services)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          -${previewFleet.toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {noTax ? 'GST (no tax)' : 'GST (5%)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${previewGst.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {noTax
                          ? 'PST (no tax)'
                          : pstExempt
                          ? 'PST (exempt)'
                          : 'PST (7%)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${previewPst.toFixed(2)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 0.75 }} />
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        Invoice Total
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        $
                        {(previewSubtotal + previewGst + previewPst).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })()}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialogDismiss} disabled={closing}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={
                  closing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ReceiptLong />
                  )
                }
                onClick={handleConfirmClose}
                disabled={
                  closing ||
                  !selectedCompanyId ||
                  (Boolean(invoiceableInspection) && !selectedFeeItemId)
                }
              >
                Create Invoice
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add vehicle dialog */}
      <AddVehicleDialog
        open={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
        customerId={ro.customerId}
        customerName={customerFullName(ro)}
        onAdded={handleVehicleAdded}
      />

      {/* Inspect vehicle dialog */}
      <InspectVehicleDialog
        open={inspectOpen}
        onClose={() => {
          setInspectOpen(false);
          setViewInspectionId(undefined);
        }}
        repairOrderId={ro.id}
        customerId={ro.customerId}
        vehicleId={ro.vehicle?.id}
        roNumber={ro.roNumber}
        customerName={customerFullName(ro)}
        vehicleLabel={vehicleLabel(ro)}
        defaultMileage={ro.vehicle?.mileage ?? ro.mileageIn}
        existingInspectionId={viewInspectionId}
        onChanged={() => {
          repairOrderRequests
            .getById(ro.id)
            .then(onROChange)
            .catch(() => {});
        }}
      />

      {/* Assign employees dialog */}
      <AssignEmployeesDialog
        open={assignEmployeesOpen}
        onClose={() => setAssignEmployeesOpen(false)}
        roId={ro.id}
        currentEmployees={ro.employees ?? []}
        onSaved={(updated) => onROChange({ ...ro, ...updated })}
      />

      {/* Quotation created success dialog */}
      <Dialog
        open={Boolean(createdQuotationId)}
        onClose={() => setCreatedQuotationId(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Quotation Created</DialogTitle>
        <DialogContent>
          <Alert severity="success">
            A quotation was created from the flagged items on {ro.roNumber}.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatedQuotationId(null)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<RequestQuote />}
            onClick={() => {
              const quotationId = createdQuotationId;
              setCreatedQuotationId(null);
              if (quotationId) {
                navigate(`${baseRoute}/quotations/${quotationId}`);
              }
            }}
          >
            View Quotation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Service drawer */}
      <ServiceDrawer
        open={serviceDrawerOpen}
        onClose={() => setServiceDrawerOpen(false)}
        roId={ro.id}
        services={ro.services ?? []}
        onServicesChange={(services) => onROChange({ ...ro, services })}
        canEdit={canEdit && ro.status !== 'INVOICED'}
        canDelete={canEdit}
        currentUserId={currentUserId}
      />

      {/* Send estimate email (quotation PDF + pre-inspection photos PDF) */}
      <EmailPromptDialog
        open={estimateEmailOpen}
        onClose={() => setEstimateEmailOpen(false)}
        multiple
        onSubmit={async () => undefined}
        onSubmitMultiple={handleSendEstimate}
        availableEmails={[
          ...(ro.customer?.email ? [ro.customer.email] : []),
          ...((ro.customer as any)?.additionalEmails ?? []),
        ]}
        customerName={customerFullName(ro)}
        customerId={ro.customerId}
        documentType="quotation"
        documentNumber={ro.quotation?.quotationNumber || ro.roNumber}
      />
    </Box>
  );
}

// ---- History tab ----

function HistoryTab({ ro, baseRoute }: { ro: RepairOrder; baseRoute: string }) {
  const navigate = useNavigate();
  const [pastROs, setPastROs] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ro.vehicle?.id && !ro.customerId) {
      setLoading(false);
      return;
    }

    const fetch = ro.vehicle?.id
      ? repairOrderRequests.getByVehicle(ro.vehicle.id)
      : repairOrderRequests.getAll({ customerId: ro.customerId });

    fetch
      .then((all) => setPastROs(all.filter((r: RepairOrder) => r.id !== ro.id)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ro.id, ro.vehicle?.id, ro.customerId]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        {ro.vehicle
          ? `Previous ROs for this vehicle`
          : `Previous ROs for this customer`}
      </Typography>

      {pastROs.length === 0 ? (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ py: 4, textAlign: 'center' }}
        >
          No previous repair orders found.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>
                  <strong>RO #</strong>
                </TableCell>
                <TableCell>
                  <strong>Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Services</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastROs.map((r) => {
                const total =
                  r.services?.reduce(
                    (sum, s) => sum + Number(s.total ?? 0),
                    0
                  ) ?? 0;
                const meta = STATUS_META[r.status];
                return (
                  <TableRow
                    key={r.id}
                    hover
                    onClick={() =>
                      navigate(`${baseRoute}/repair-orders/${r.id}`)
                    }
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: colors.primary.main }}
                      >
                        {r.roNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(r.openedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={meta.label}
                        size="small"
                        color={meta.color}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {r.services?.length ?? 0} item(s)
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${total.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// ---- Chat tab (placeholder) ----

function ChatTab() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <ChatIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">
        Chat coming soon
      </Typography>
      <Typography variant="body2" color="text.disabled" textAlign="center">
        Internal messaging between service advisors and technicians will appear
        here.
      </Typography>
    </Box>
  );
}

// ---- Main RODetail component ----

export function RODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isSupervisor, isStaff, isForeman } = useAuth();

  const [ro, setRo] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  const baseRoute = location.pathname.startsWith('/staff')
    ? '/staff'
    : location.pathname.startsWith('/supervisor')
    ? '/supervisor'
    : location.pathname.startsWith('/foreman')
    ? '/foreman'
    : '/admin';

  const canEdit = isAdmin || isSupervisor || isStaff || isForeman;
  const canClose = isAdmin || isSupervisor || isForeman;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    repairOrderRequests
      .getById(id)
      .then(setRo)
      .catch(() => setError('Failed to load repair order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ro) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error ?? 'Repair order not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%' }}>
      {/* Back + header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton
          size="small"
          onClick={() => navigate(`${baseRoute}/repair-orders`)}
        >
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: colors.primary.main }}
          >
            {ro.roNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {customerFullName(ro)}
            {ro.vehicle ? ` · ${vehicleLabel(ro)}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Current" />
        <Tab label="History" />
        <Tab
          label="Chat"
          icon={<ChatIcon fontSize="small" />}
          iconPosition="end"
        />
      </Tabs>

      {tab === 0 && (
        <CurrentTab
          ro={ro}
          onROChange={setRo}
          canEdit={canEdit}
          canClose={canClose}
          isAdmin={isAdmin}
          currentUserId={user?.id ?? ''}
          baseRoute={baseRoute}
        />
      )}
      {tab === 1 && <HistoryTab ro={ro} baseRoute={baseRoute} />}
      {tab === 2 && <ChatTab />}
    </Box>
  );
}
