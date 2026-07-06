import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { invoiceService, Invoice } from '../../requests/invoice.requests';
import { quotationService } from '../../requests/quotation.requests';
import { useAuth } from '../../hooks/useAuth';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import InvoiceDialog from '../../components/invoices/InvoiceDialog';
import PaymentMethodDialog, {
  PaymentEntryInput,
} from '../../components/invoices/PaymentMethodDialog';
import { SquarePaymentForm } from '../../components/payments/SquarePaymentForm';

const getCustomerName = (invoice: Invoice) => {
  const customer = invoice.customer;

  if (customer?.firstName || customer?.lastName) {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  }

  return customer?.name || 'Customer';
};

const getVehicleDescription = (invoice: Invoice) => {
  const vehicle = invoice.vehicle;
  return [vehicle?.year, vehicle?.make, vehicle?.model]
    .filter(Boolean)
    .join(' ');
};

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, isStaff, isAdmin } = useAuth();
  const { confirmCancel } = useConfirmationHelpers();
  const { showApiError } = useErrorHelpers();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  // Payment-method dialog for recording a manual payment (cash, card, etc.).
  const [payMethodOpen, setPayMethodOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if this is a "new" invoice creation route
  const isNewInvoice = id === 'new';
  const quotationId = searchParams.get('fromQuotation');

  useEffect(() => {
    if (isNewInvoice) {
      // Open the create dialog when route is /invoices/new
      setCreateDialogOpen(true);
      setLoading(false);
    } else if (id) {
      loadInvoice();
    }
  }, [id, isNewInvoice]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(id!);
      setInvoice(data);
    } catch (error) {
      // TODO: Replace with error notification
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    // Navigate back to invoices list
    const basePath =
      role === 'admin'
        ? '/admin'
        : role === 'supervisor'
        ? '/supervisor'
        : role === 'staff'
        ? '/staff'
        : role === 'accountant'
        ? '/accountant'
        : '/customer';
    navigate(`${basePath}/invoices`);
  };

  const handleCreateSuccess = async (newInvoice: Invoice) => {
    // If this invoice was created from a quotation, mark the quotation as converted
    if (quotationId) {
      try {
        await quotationService.updateQuote(quotationId, {
          status: 'CONVERTED',
          convertedToInvoiceId: newInvoice.id,
        });
      } catch (error) {
        console.error('Error updating quotation status:', error);
        // Continue anyway - invoice was created successfully
      }
    }

    // Navigate to the newly created invoice
    const basePath =
      role === 'admin'
        ? '/admin'
        : role === 'supervisor'
        ? '/supervisor'
        : role === 'staff'
        ? '/staff'
        : role === 'accountant'
        ? '/accountant'
        : '/customer';
    navigate(`${basePath}/invoices/${newInvoice.id}`);
  };

  // Handle invoice creation route
  if (isNewInvoice) {
    return (
      <Box sx={{ p: 3 }}>
        <InvoiceDialog
          open={createDialogOpen}
          onClose={handleCreateDialogClose}
          onSuccess={handleCreateSuccess}
          quotationId={quotationId || undefined}
        />
      </Box>
    );
  }

  const handlePrint = () => {
    if (invoice) {
      invoiceService.printInvoice(invoice);
    }
  };

  const handleProcessPayment = () => {
    if (!invoice) return;
    setMenuAnchorEl(null);
    setPayMethodOpen(true);
  };

  const handlePaymentConfirm = async (entries: PaymentEntryInput[]) => {
    if (!invoice) return;
    try {
      await invoiceService.recordInvoicePayments(invoice.id, entries);
      setPayMethodOpen(false);
      loadInvoice();
    } catch (error) {
      showApiError(error, 'Failed to record payment');
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;

    setMenuAnchorEl(null); // Close menu

    const confirmed = await confirmCancel(`invoice ${invoice.invoiceNumber}`);
    if (confirmed) {
      try {
        await invoiceService.deleteInvoice(invoice.id);
        loadInvoice();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handlePrintFromMenu = () => {
    setMenuAnchorEl(null);
    handlePrint();
  };

  const handleProcessPaymentFromMenu = () => {
    setMenuAnchorEl(null);
    handleProcessPayment();
  };

  const handlePayWithSquare = () => {
    setPaymentDialogOpen(true);
    setMenuAnchorEl(null);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setPaymentDialogOpen(false);
    // Reload invoice to show updated payment status
    loadInvoice();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'DRAFT':
        return 'default';
      case 'REFUNDED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const canManageInvoice = isStaff || isAdmin;
  // An invoice can take a payment until it's fully paid, cancelled, or refunded.
  const isPayable =
    canManageInvoice &&
    !!invoice &&
    ['DRAFT', 'PENDING', 'PARTIALLY_PAID'].includes(invoice.status);

  if (loading) {
    return (
      <Box
        sx={{
          p: {
            xs: theme.custom.spacing.pagePadding.mobile,
            sm: theme.custom.spacing.pagePadding.tablet,
            md: theme.custom.spacing.pagePadding.desktop,
          },
        }}
      >
        <Typography>Loading invoice...</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box
        sx={{
          p: {
            xs: theme.custom.spacing.pagePadding.mobile,
            sm: theme.custom.spacing.pagePadding.tablet,
            md: theme.custom.spacing.pagePadding.desktop,
          },
        }}
      >
        <Typography>Invoice not found</Typography>
        <Button
          startIcon={<BackIcon />}
          onClick={() => {
            const basePath =
              role === 'admin'
                ? '/admin'
                : role === 'supervisor'
                ? '/supervisor'
                : role === 'staff'
                ? '/staff'
                : role === 'accountant'
                ? '/accountant'
                : '/customer';
            navigate(`${basePath}/invoices`);
          }}
          sx={{ mt: 2 }}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: {
          xs: theme.custom.spacing.pagePadding.mobile,
          sm: theme.custom.spacing.pagePadding.tablet,
          md: theme.custom.spacing.pagePadding.desktop,
        },
      }}
    >
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <Box className="no-print" sx={{ mb: { xs: 1, sm: 2 } }}>
        {isMobile ? (
          // Mobile: Back button + Menu
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button
              startIcon={<BackIcon />}
              onClick={() => {
                const basePath =
                  role === 'admin'
                    ? '/admin'
                    : role === 'supervisor'
                    ? '/supervisor'
                    : role === 'staff'
                    ? '/staff'
                    : role === 'accountant'
                    ? '/accountant'
                    : '/customer';
                navigate(`${basePath}/invoices`);
              }}
            >
              Back
            </Button>
            <IconButton onClick={handleMenuOpen} size="large" edge="end">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handlePrintFromMenu}>
                <ListItemIcon>
                  <PrintIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Print</ListItemText>
              </MenuItem>
              {invoice.status === 'PENDING' && (
                <MenuItem onClick={handlePayWithSquare}>
                  <ListItemIcon>
                    <PaymentIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText>Pay with Card</ListItemText>
                </MenuItem>
              )}
              {isPayable && (
                <>
                  <MenuItem onClick={handleProcessPaymentFromMenu}>
                    <ListItemIcon>
                      <PaymentIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText>Process Payment</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleCancel}>
                    <ListItemIcon>
                      <CancelIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Cancel Invoice</ListItemText>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        ) : (
          // Desktop: Original layout with all buttons
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              startIcon={<BackIcon />}
              onClick={() => {
                const basePath =
                  role === 'admin'
                    ? '/admin'
                    : role === 'supervisor'
                    ? '/supervisor'
                    : role === 'staff'
                    ? '/staff'
                    : role === 'accountant'
                    ? '/accountant'
                    : '/customer';
                navigate(`${basePath}/invoices`);
              }}
            >
              Back
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
              {invoice.status === 'PENDING' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={handlePayWithSquare}
                >
                  Pay with Card
                </Button>
              )}
              {isPayable && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PaymentIcon />}
                    onClick={handleProcessPayment}
                  >
                    Process Payment
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel Invoice
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        )}
      </Box>

      <Paper
        sx={{
          p: {
            xs: theme.custom.spacing.pagePadding.mobile,
            sm: theme.custom.spacing.pagePadding.tablet,
            md: theme.custom.spacing.pagePadding.desktop,
          },
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
              Invoice #{invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date:{' '}
              {new Date(
                invoice.invoiceDate || invoice.createdAt
              ).toLocaleDateString('en-US', { timeZone: 'UTC' })}
            </Typography>
            {invoice.repairOrder?.roNumber && (
              <Typography variant="body2" color="text.secondary">
                Repair Order: {invoice.repairOrder.roNumber}
              </Typography>
            )}
          </Grid>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ textAlign: { xs: 'left', md: 'right' } }}
          >
            <Box sx={{ mb: 1 }}>
              <Chip
                label={invoice.status}
                color={getStatusColor(invoice.status)}
                size="medium"
              />
            </Box>
            {invoice.paymentMethod && (
              <Typography variant="body2">
                Payment: {invoice.paymentMethod.replace(/_/g, ' ')}
              </Typography>
            )}
            {invoice.paidAt && (
              <Typography variant="body2">
                Paid: {formatDateTime(invoice.paidAt)}
              </Typography>
            )}
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Typography variant="body1">
                  {getCustomerName(invoice)}
                </Typography>
                {invoice.customer?.email && (
                  <Typography variant="body2" color="text.secondary">
                    Email: {invoice.customer.email}
                  </Typography>
                )}
                {invoice.customer?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Phone: {invoice.customer.phone}
                  </Typography>
                )}
                {invoice.customer?.address && (
                  <Typography variant="body2" color="text.secondary">
                    Address: {invoice.customer.address}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vehicle Information
                </Typography>
                {invoice.vehicle ? (
                  <>
                    <Typography variant="body1">
                      {getVehicleDescription(invoice)}
                    </Typography>
                    {invoice.vehicle.vin && (
                      <Typography variant="body2" color="text.secondary">
                        VIN Number: {invoice.vehicle.vin}
                      </Typography>
                    )}
                    {invoice.vehicle.licensePlate && (
                      <Typography variant="body2" color="text.secondary">
                        License Plate: {invoice.vehicle.licensePlate}
                      </Typography>
                    )}
                    {invoice.vehicle.mileage && (
                      <Typography variant="body2" color="text.secondary">
                        Mileage:{' '}
                        {Number(invoice.vehicle.mileage).toLocaleString()} km
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No vehicle selected for this invoice.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Invoice Items
            </Typography>
            {isMobile ? (
              // Mobile: Card-based layout
              <Stack spacing={2}>
                {invoice.items?.map((item) => {
                  // Calculate display total - handle DISCOUNT_PERCENTAGE items
                  let displayTotal =
                    item.total || item.quantity * Number(item.unitPrice);
                  if (
                    String(item.itemType).toUpperCase() ===
                    'DISCOUNT_PERCENTAGE'
                  ) {
                    const otherItemsSubtotal = (invoice.items || [])
                      .filter(
                        (i) =>
                          String(i.itemType).toUpperCase() !== 'DISCOUNT' &&
                          String(i.itemType).toUpperCase() !==
                            'DISCOUNT_PERCENTAGE'
                      )
                      .reduce(
                        (sum, i) =>
                          sum +
                          (Number(i.total) || i.quantity * Number(i.unitPrice)),
                        0
                      );
                    displayTotal =
                      -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
                  } else if (
                    String(item.itemType).toUpperCase() === 'DISCOUNT'
                  ) {
                    displayTotal = -Math.abs(displayTotal);
                  }

                  return (
                    <Card key={item.id} variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Chip label={item.itemType} size="small" />
                          <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(displayTotal)}
                          </Typography>
                        </Box>
                        {(item as any).tireName && (
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            gutterBottom
                          >
                            {(item as any).tireName}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {item.description}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Unit Price:{' '}
                            {String(item.itemType).toUpperCase() ===
                            'DISCOUNT_PERCENTAGE'
                              ? `${Number(item.unitPrice)}%`
                              : formatCurrency(item.unitPrice)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              // Desktop: Table layout
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items?.map((item) => {
                      // Calculate display total - handle DISCOUNT_PERCENTAGE items
                      let displayTotal =
                        item.total || item.quantity * Number(item.unitPrice);
                      if (
                        String(item.itemType).toUpperCase() ===
                        'DISCOUNT_PERCENTAGE'
                      ) {
                        // Recalculate percentage discount based on other items
                        const otherItemsSubtotal = (invoice.items || [])
                          .filter(
                            (i) =>
                              String(i.itemType).toUpperCase() !== 'DISCOUNT' &&
                              String(i.itemType).toUpperCase() !==
                                'DISCOUNT_PERCENTAGE'
                          )
                          .reduce(
                            (sum, i) =>
                              sum +
                              (Number(i.total) ||
                                i.quantity * Number(i.unitPrice)),
                            0
                          );
                        displayTotal =
                          -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
                      } else if (
                        String(item.itemType).toUpperCase() === 'DISCOUNT'
                      ) {
                        // Ensure discount is negative
                        displayTotal = -Math.abs(displayTotal);
                      }

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Chip label={item.itemType} size="small" />
                          </TableCell>
                          <TableCell>
                            {(item as any).tireName && (
                              <Typography variant="body2" fontWeight="medium">
                                {(item as any).tireName}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              color={
                                (item as any).tireName
                                  ? 'text.secondary'
                                  : 'inherit'
                              }
                            >
                              {item.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {String(item.itemType).toUpperCase() ===
                            'DISCOUNT_PERCENTAGE'
                              ? `${Number(item.unitPrice)}%`
                              : formatCurrency(item.unitPrice)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(displayTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {invoice.notes && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">{invoice.notes}</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ textAlign: 'right' }}>
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Typography variant="body1">Subtotal:</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="body1">
                        {formatCurrency(invoice.subtotal)}
                      </Typography>
                    </Grid>
                    {invoice.gstRate != null && invoice.gstRate > 0 && (
                      <>
                        <Grid size={6}>
                          <Typography variant="body1">
                            GST ({(invoice.gstRate * 100).toFixed(2)}%):
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="body1">
                            {formatCurrency(invoice.gstAmount || 0)}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {invoice.pstRate != null && invoice.pstRate > 0 && (
                      <>
                        <Grid size={6}>
                          <Typography variant="body1">
                            PST ({(invoice.pstRate * 100).toFixed(2)}%):
                          </Typography>
                        </Grid>
                        <Grid size={6}>
                          <Typography variant="body1">
                            {formatCurrency(invoice.pstAmount || 0)}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {(invoice.gstRate == null || invoice.gstRate === 0) &&
                      (invoice.pstRate == null || invoice.pstRate === 0) && (
                        <>
                          <Grid size={6}>
                            <Typography variant="body1">
                              Tax ({(invoice.taxRate * 100).toFixed(2)}%):
                            </Typography>
                          </Grid>
                          <Grid size={6}>
                            <Typography variant="body1">
                              {formatCurrency(invoice.taxAmount)}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="h6">Total:</Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="h6">
                        {formatCurrency(invoice.total)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Square Online Payment Form */}
      {invoice && (
        <SquarePaymentForm
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          amount={invoice.total}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Manual payment (cash, card, cheque, e-transfer, …) */}
      {invoice && (
        <PaymentMethodDialog
          open={payMethodOpen}
          onClose={() => setPayMethodOpen(false)}
          onConfirm={handlePaymentConfirm}
          invoiceNumber={invoice.invoiceNumber}
          invoiceId={invoice.id}
          total={Number(invoice.total)}
          amountPaid={Number((invoice as any).amountPaid ?? 0)}
          hasTax={Number(invoice.taxAmount) > 0}
        />
      )}
    </Box>
  );
};

export default InvoiceDetails;
