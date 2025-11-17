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
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  SwapHoriz as ConvertIcon,
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { quotationService, Quote } from '../../services/quotation.service';
import { useAuth } from '../../hooks/useAuth';
import { formatPhoneForDisplay } from '../../utils/phone';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import QuotationDialog from '../../components/quotations/QuotationDialog';

const QuotationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { showApiError } = useErrorHelpers();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [quotation, setQuotation] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getQuote(id!);
      setQuotation(data);
    } catch (error) {
      showApiError(error, 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (quotation) {
      quotationService.printQuote(quotation);
    }
  };

  const handleStatusUpdate = async (newStatus: 'SENT' | 'ACCEPTED' | 'REJECTED') => {
    if (!quotation) return;
    
    try {
      await quotationService.updateQuote(quotation.id, { status: newStatus });
      loadQuotation();
    } catch (error) {
      showApiError(error, 'Failed to update status');
    }
  };

  const handleConvert = () => {
    if (!quotation) return;
    const basePath = role === 'admin' ? '/admin' : '/staff';
    navigate(`${basePath}/invoices/new?fromQuotation=${quotation.id}`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handlePrintFromMenu = () => {
    handlePrint();
    handleMenuClose();
  };

  const handleEditFromMenu = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleMarkSentFromMenu = () => {
    handleStatusUpdate('SENT');
    handleMenuClose();
  };

  const handleAcceptFromMenu = () => {
    handleStatusUpdate('ACCEPTED');
    handleMenuClose();
  };

  const handleRejectFromMenu = () => {
    handleStatusUpdate('REJECTED');
    handleMenuClose();
  };

  const handleConvertFromMenu = () => {
    handleConvert();
    handleMenuClose();
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

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'SENT':
        return 'primary';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'EXPIRED':
        return 'warning';
      case 'CONVERTED':
        return 'info';
      case 'DRAFT':
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'CONVERTED':
        return 'Converted to Invoice';
      case 'SENT':
        return 'Sent';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      case 'EXPIRED':
        return 'Expired';
      case 'DRAFT':
        return 'Draft';
      default:
        return status;
    }
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading quotation...</Typography>
      </Box>
    );
  }

  if (!quotation) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Quotation not found</Typography>
        <Button startIcon={<BackIcon />} onClick={() => {
          const basePath = role === 'admin' ? '/admin' : '/staff';
          navigate(`${basePath}/quotations`);
        }} sx={{ mt: 2 }}>
          Back to Quotations
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: {
        xs: theme.custom.spacing.pagePadding.mobile,
        sm: theme.custom.spacing.pagePadding.tablet,
        md: theme.custom.spacing.pagePadding.desktop
      }
    }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button startIcon={<BackIcon />} onClick={() => {
              const basePath = role === 'admin' ? '/admin' : '/staff';
              navigate(`${basePath}/quotations`);
            }}>
              Back
            </Button>
            <IconButton onClick={handleMenuOpen} size="large" edge="end">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handlePrintFromMenu}>
                <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Print</ListItemText>
              </MenuItem>
              {quotation.status !== 'CONVERTED' && (
                <>
                  <MenuItem onClick={handleEditFromMenu}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                  </MenuItem>
                  {quotation.status === 'DRAFT' && (
                    <MenuItem onClick={handleMarkSentFromMenu}>
                      <ListItemIcon><SendIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText>Mark as Sent</ListItemText>
                    </MenuItem>
                  )}
                  {quotation.status === 'SENT' && (
                    <>
                      <MenuItem onClick={handleAcceptFromMenu}>
                        <ListItemIcon><AcceptIcon fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Accept</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleRejectFromMenu}>
                        <ListItemIcon><RejectIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Reject</ListItemText>
                      </MenuItem>
                    </>
                  )}
                  {quotation.status === 'ACCEPTED' && (
                    <MenuItem onClick={handleConvertFromMenu}>
                      <ListItemIcon><ConvertIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText>Convert to Invoice</ListItemText>
                    </MenuItem>
                  )}
                </>
              )}
            </Menu>
          </Box>
        ) : (
          // Desktop: Original layout
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button startIcon={<BackIcon />} onClick={() => {
              const basePath = role === 'admin' ? '/admin' : '/staff';
              navigate(`${basePath}/quotations`);
            }}>
              Back to Quotations
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                Print
              </Button>
              {quotation.status !== 'CONVERTED' && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Edit
                  </Button>
                  {quotation.status === 'DRAFT' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleStatusUpdate('SENT')}
                    >
                      Mark as Sent
                    </Button>
                  )}
                  {quotation.status === 'SENT' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AcceptIcon />}
                        onClick={() => handleStatusUpdate('ACCEPTED')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleStatusUpdate('REJECTED')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {quotation.status === 'ACCEPTED' && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ConvertIcon />}
                      onClick={handleConvert}
                    >
                      Convert to Invoice
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {isExpired(quotation.validUntil) && quotation.status !== 'CONVERTED' && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This quotation has expired. The validity date was {formatDate(quotation.validUntil!)}.
        </Alert>
      )}

      {quotation.status === 'CONVERTED' && quotation.convertedToInvoiceId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This quotation has been converted to an invoice.
        </Alert>
      )}

      <Paper sx={{
        p: {
          xs: 2,
          sm: 3
        }
      }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
              Quotation #{quotation.quotationNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDateTime(quotation.createdAt)}
            </Typography>
            {quotation.validUntil && (
              <Typography variant="body2" color="text.secondary">
                Valid Until: {formatDate(quotation.validUntil)}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Chip
              label={getStatusLabel(quotation.status)}
              color={getStatusColor(quotation.status)}
              size="medium"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Customer Information</Typography>
                {quotation.businessName && (
                  <Typography variant="body1" fontWeight="bold">
                    {quotation.businessName}
                  </Typography>
                )}
                <Typography>{quotation.customerName}</Typography>
                {quotation.phone && <Typography>Phone: {formatPhoneForDisplay(quotation.phone)}</Typography>}
                {quotation.email && <Typography>Email: {quotation.email}</Typography>}
                {quotation.address && <Typography>{quotation.address}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          
          {quotation.vehicleMake && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Vehicle Information</Typography>
                  <Typography>
                    {quotation.vehicleYear} {quotation.vehicleMake} {quotation.vehicleModel}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Items</Typography>
        {isMobile ? (
          // Mobile: Card-based layout
          <Stack spacing={2}>
            {quotation.items.map((item) => {
              const displayTotal = item.total || item.quantity * item.unitPrice;
              return (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip label={item.itemType.replace('_', ' ')} size="small" />
                      <Typography variant="h6" fontWeight="bold">
                        {formatCurrency(displayTotal)}
                      </Typography>
                    </Box>

                    {(item as any).tireName && (
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        {(item as any).tireName}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {item.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Qty:</strong> {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Unit Price:</strong> {formatCurrency(item.unitPrice)}
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
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotation.items.map((item) => (
                  <TableRow key={item.id}>
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
                    <TableCell>{item.itemType.replace('_', ' ')}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.total || item.quantity * item.unitPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ minWidth: { xs: '100%', sm: 300 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatCurrency(quotation.subtotal)}</Typography>
            </Box>
            {quotation.gstAmount !== undefined && quotation.gstAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  GST ({((quotation.gstRate || 0) * 100).toFixed(0)}%):
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(quotation.gstAmount)}
                </Typography>
              </Box>
            )}
            {quotation.pstAmount !== undefined && quotation.pstAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  PST ({((quotation.pstRate || 0) * 100).toFixed(0)}%):
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(quotation.pstAmount)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">{formatCurrency(quotation.total)}</Typography>
            </Box>
          </Box>
        </Box>

        {quotation.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Typography>{quotation.notes}</Typography>
          </>
        )}
      </Paper>

      <QuotationDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={loadQuotation}
        quoteId={quotation.id}
      />
    </Box>
  );
};

export default QuotationDetails;