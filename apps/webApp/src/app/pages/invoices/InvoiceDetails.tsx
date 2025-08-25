import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { invoiceService, Invoice } from '../../services/invoice.service';
import { useAuth } from '../../hooks/useAuth';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(id!);
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
      alert('Error loading invoice');
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
      } catch (error) {
        console.error('Error marking invoice as paid:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    
    if (window.confirm(`Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`)) {
      try {
        await invoiceService.cancelInvoice(invoice.id);
        loadInvoice();
      } catch (error) {
        console.error('Error cancelling invoice:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
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

  const canManageInvoice = user?.role === 'STAFF' || user?.role === 'ADMIN';

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading invoice...</Typography>
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Invoice not found</Typography>
        <Button startIcon={<BackIcon />} onClick={() => {
          const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
          navigate(`${basePath}/invoices`);
        }} sx={{ mt: 2 }}>
          Back to Invoices
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
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
      <Box className="no-print" sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => {
          const basePath = role === 'admin' ? '/admin' : role === 'staff' ? '/staff' : '/customer';
          navigate(`${basePath}/invoices`);
        }}>
          Back to Invoices
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print
          </Button>
          {canManageInvoice && invoice.status === 'PENDING' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<PaymentIcon />}
                onClick={handleMarkAsPaid}
              >
                Mark as Paid
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
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" gutterBottom>
              Invoice #{invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDateTime(invoice.createdAt)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'right' }}>
            <Chip
              label={invoice.status}
              color={getStatusColor(invoice.status)}
              size="large"
              sx={{ mb: 1 }}
            />
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
                  {invoice.customer?.user?.firstName} {invoice.customer?.user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {invoice.customer?.user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {invoice.customer?.phone}
                </Typography>
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
                      Mileage: {invoice.vehicle.mileage.toLocaleString()} miles
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
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Chip label={item.itemType} size="small" />
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.total || item.quantity * item.unitPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
      </Paper>
    </Box>
  );
};

export default InvoiceDetails;