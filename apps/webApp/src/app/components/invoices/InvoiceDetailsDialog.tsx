import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Slide,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { invoiceService, Invoice } from '../../requests/invoice.requests';
import { useAuth } from '../../hooks/useAuth';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { SquarePaymentForm } from '../payments/SquarePaymentForm';
import { colors } from '../../theme/colors';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface InvoiceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  onInvoiceUpdate?: () => void;
}

export const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  open,
  onClose,
  invoiceId,
  onInvoiceUpdate,
}) => {
  const { isStaff, isAdmin } = useAuth();
  const { confirmCancel } = useConfirmationHelpers();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open && invoiceId) {
      loadInvoice();
    }
  }, [open, invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoiceService.getInvoice(invoiceId);
      setInvoice(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice');
      console.error('Error loading invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (invoice) {
      invoiceService.printInvoice(invoice);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice) return;

    const paymentMethod = prompt('Enter payment method (CASH, CREDIT_CARD, DEBIT_CARD, CHECK, E_TRANSFER, FINANCING):');
    if (paymentMethod) {
      try {
        await invoiceService.markInvoiceAsPaid(invoice.id, paymentMethod as any);
        loadInvoice();
        onInvoiceUpdate?.();
      } catch (err) {
        console.error('Error marking invoice as paid:', err);
      }
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;

    setMenuAnchorEl(null);

    const confirmed = await confirmCancel(`invoice ${invoice.invoiceNumber}`);
    if (confirmed) {
      try {
        await invoiceService.deleteInvoice(invoice.id);
        loadInvoice();
        onInvoiceUpdate?.();
      } catch (err) {
        console.error('Error cancelling invoice:', err);
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

  const handleMarkAsPaidFromMenu = () => {
    setMenuAnchorEl(null);
    handleMarkAsPaid();
  };

  const handlePayWithSquare = () => {
    setPaymentDialogOpen(true);
    setMenuAnchorEl(null);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setPaymentDialogOpen(false);
    loadInvoice();
    onInvoiceUpdate?.();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? '100vh' : '90vh',
            ...(isMobile && {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
            })
          }
        }}
      >
        <DialogTitle
          sx={{
            background: colors.gradients.primary,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <ReceiptIcon sx={{ fontSize: { xs: 20, sm: 28 } }} />
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
              Invoice Details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!loading && invoice && (
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            )}
            <IconButton
              onClick={onClose}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

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
          {invoice?.status === 'PENDING' && (
            <MenuItem onClick={handlePayWithSquare}>
              <ListItemIcon>
                <PaymentIcon fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText>Pay with Card</ListItemText>
            </MenuItem>
          )}
          {canManageInvoice && invoice?.status === 'PENDING' && (
            <>
              <MenuItem onClick={handleMarkAsPaidFromMenu}>
                <ListItemIcon>
                  <PaymentIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText>Mark as Paid</ListItemText>
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

        <DialogContent
          sx={{
            p: 0,
            overflow: 'auto',
            flex: '1 1 auto',
            minHeight: 0,
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : invoice ? (
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
                    Invoice #{invoice.invoiceNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
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
                        {invoice.customer?.firstName} {invoice.customer?.lastName}
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

                {invoice.vehicle && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Vehicle Information
                        </Typography>
                        <Typography variant="body1">
                          {invoice.vehicle.year} {invoice.vehicle.make} {invoice.vehicle.model}
                        </Typography>
                        {invoice.vehicle.vin && (
                          <Typography variant="body2" color="text.secondary">
                            VIN: {invoice.vehicle.vin}
                          </Typography>
                        )}
                        {invoice.vehicle.licensePlate && (
                          <Typography variant="body2" color="text.secondary">
                            License Plate: {invoice.vehicle.licensePlate}
                          </Typography>
                        )}
                        {invoice.vehicle.mileage && (
                          <Typography variant="body2" color="text.secondary">
                            Mileage: {invoice.vehicle.mileage.toLocaleString()} km
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid size={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Invoice Items
                  </Typography>
                  {isMobile ? (
                    <Stack spacing={2}>
                      {invoice.items?.map((item) => {
                        let displayTotal = item.total || item.quantity * Number(item.unitPrice);
                        if (String(item.itemType).toUpperCase() === 'DISCOUNT_PERCENTAGE') {
                          const otherItemsSubtotal = (invoice.items || [])
                            .filter(i => String(i.itemType).toUpperCase() !== 'DISCOUNT' && String(i.itemType).toUpperCase() !== 'DISCOUNT_PERCENTAGE')
                            .reduce((sum, i) => sum + (Number(i.total) || i.quantity * Number(i.unitPrice)), 0);
                          displayTotal = -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
                        } else if (String(item.itemType).toUpperCase() === 'DISCOUNT') {
                          displayTotal = -Math.abs(displayTotal);
                        }

                        return (
                          <Card key={item.id} variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Chip label={item.itemType} size="small" />
                                <Typography variant="h6" fontWeight="bold">
                                  {formatCurrency(displayTotal)}
                                </Typography>
                              </Box>
                              {(item as any).tireName && (
                                <Typography variant="body1" fontWeight="medium" gutterBottom>
                                  {(item as any).tireName}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {item.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Qty: {item.quantity}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Unit Price: {String(item.itemType).toUpperCase() === 'DISCOUNT_PERCENTAGE'
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
                    <TableContainer component={Paper} variant="outlined">
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
                            let displayTotal = item.total || item.quantity * Number(item.unitPrice);
                            if (String(item.itemType).toUpperCase() === 'DISCOUNT_PERCENTAGE') {
                              const otherItemsSubtotal = (invoice.items || [])
                                .filter(i => String(i.itemType).toUpperCase() !== 'DISCOUNT' && String(i.itemType).toUpperCase() !== 'DISCOUNT_PERCENTAGE')
                                .reduce((sum, i) => sum + (Number(i.total) || i.quantity * Number(i.unitPrice)), 0);
                              displayTotal = -(otherItemsSubtotal * Number(item.unitPrice)) / 100;
                            } else if (String(item.itemType).toUpperCase() === 'DISCOUNT') {
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
                                  <Typography variant="body2" color={(item as any).tireName ? "text.secondary" : "inherit"}>
                                    {item.description}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">
                                  {String(item.itemType).toUpperCase() === 'DISCOUNT_PERCENTAGE'
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
                            <Typography variant="body1">{formatCurrency(invoice.subtotal)}</Typography>
                          </Grid>
                          {invoice.gstRate != null && invoice.gstRate > 0 && (
                            <>
                              <Grid size={6}>
                                <Typography variant="body1">
                                  GST ({(invoice.gstRate * 100).toFixed(2)}%):
                                </Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="body1">{formatCurrency(invoice.gstAmount || 0)}</Typography>
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
                                <Typography variant="body1">{formatCurrency(invoice.pstAmount || 0)}</Typography>
                              </Grid>
                            </>
                          )}
                          {(invoice.gstRate == null || invoice.gstRate === 0) && (invoice.pstRate == null || invoice.pstRate === 0) && (
                            <>
                              <Grid size={6}>
                                <Typography variant="body1">
                                  Tax ({(invoice.taxRate * 100).toFixed(2)}%):
                                </Typography>
                              </Grid>
                              <Grid size={6}>
                                <Typography variant="body1">{formatCurrency(invoice.taxAmount)}</Typography>
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
                            <Typography variant="h6">{formatCurrency(invoice.total)}</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.neutral[200]}` }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
          {invoice && (
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Print Invoice
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default InvoiceDetailsDialog;
