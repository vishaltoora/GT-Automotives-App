import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Typography,
  TextField,
  Grid,
  IconButton,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  SwapHoriz as ConvertIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { quotationService, Quote } from '../../requests/quotation.requests';
import QuoteDialog from '../../components/quotations/QuotationDialog';
import EmailPromptDialog from '../../components/common/EmailPromptDialog';
import { useAuth } from '../../hooks/useAuth';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';
import { useErrorHelpers } from '../../contexts/ErrorContext';

const QuoteList: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { confirmDelete, confirm } = useConfirmationHelpers();
  const { showApiError } = useErrorHelpers();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | undefined>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [quotationForEmail, setQuotationForEmail] = useState<Quote | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const data = await quotationService.getQuotes();
      setQuotes(data);
    } catch (error) {
      showApiError(error, 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const data = await quotationService.searchQuotes({
          customerName: searchTerm,
          quotationNumber: searchTerm,
        });
        setQuotes(data);
      } catch (error) {
        showApiError(error, 'Search failed');
      } finally {
        setLoading(false);
      }
    } else {
      loadQuotations();
    }
  };

  const handleView = (id: string) => {
    const basePath = role === 'admin' ? '/admin' : '/staff';
    navigate(`${basePath}/quotations/${id}`);
  };

  const handleEdit = (id: string) => {
    setEditingQuotationId(id);
    setDialogOpen(true);
  };

  const handleDelete = async (quotation: Quote) => {
    const confirmed = await confirmDelete(`quotation ${quotation.quotationNumber}`);
    if (confirmed) {
      try {
        await quotationService.deleteQuote(quotation.id);
        loadQuotations();
      } catch (error) {
        showApiError(error, 'Failed to delete quotation');
      }
    }
  };

  const handlePrint = async (quotation: Quote) => {
    try {
      // Fetch the full quotation data including items
      const fullQuotation = await quotationService.getQuote(quotation.id);
      quotationService.printQuote(fullQuotation);
    } catch (error) {
      showApiError(error, 'Failed to print quotation');
    }
  };

  const handleConvert = (quotation: Quote) => {
    // Navigate to invoice creation with quotation data
    const basePath = role === 'admin' ? '/admin' : '/staff';
    navigate(`${basePath}/invoices/new?fromQuotation=${quotation.id}`);
  };

  const handleSendEmail = async (quotation: Quote) => {
    // If no email, open dialog to prompt for email
    if (!quotation.email) {
      setQuotationForEmail(quotation);
      setEmailDialogOpen(true);
      return;
    }

    const confirmed = await confirm({
      title: 'Send Quotation Email',
      message: `Send quotation ${quotation.quotationNumber} to ${quotation.email}?\n\nThis will generate a PDF and send it via email to the customer.`,
      confirmText: 'Send Email',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      try {
        await quotationService.sendQuotationEmail(quotation.id);
        await confirm({
          title: 'Quotation Sent Successfully!',
          message: `Quotation ${quotation.quotationNumber} has been emailed to ${quotation.email}`,
          confirmText: 'OK',
          showCancelButton: false,
        });
      } catch (error) {
        showApiError(error, 'Failed to send quotation email');
      }
    }
  };

  const handleEmailPromptSubmit = async (email: string, saveToQuote: boolean) => {
    if (!quotationForEmail) return;

    try {
      const result = await quotationService.sendQuotationEmail(quotationForEmail.id, email, saveToQuote);
      setEmailDialogOpen(false);
      setQuotationForEmail(null);

      // If email was saved to quote, reload quotations to show updated email
      if (saveToQuote) {
        loadQuotations();
      }

      await confirm({
        title: 'Quotation Sent Successfully!',
        message: `Quotation ${quotationForEmail.quotationNumber} has been emailed to ${result.emailUsed || email}`,
        confirmText: 'OK',
        showCancelButton: false,
      });
    } catch (error) {
      showApiError(error, 'Failed to send quotation email');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, quotation: Quote) => {
    setAnchorEl(event.currentTarget);
    setSelectedQuote(quotation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQuote(null);
  };

  const handleMenuAction = (action: string) => {
    if (!selectedQuote) return;

    handleMenuClose();

    switch (action) {
      case 'view':
        handleView(selectedQuote.id);
        break;
      case 'edit':
        handleEdit(selectedQuote.id);
        break;
      case 'print':
        handlePrint(selectedQuote);
        break;
      case 'sendEmail':
        handleSendEmail(selectedQuote);
        break;
      case 'convert':
        handleConvert(selectedQuote);
        break;
      case 'delete':
        handleDelete(selectedQuote);
        break;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  const filteredQuotations = quotes.filter(quotation => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      quotation.quotationNumber.toLowerCase().includes(search) ||
      quotation.customerName.toLowerCase().includes(search) ||
      (quotation.businessName && quotation.businessName.toLowerCase().includes(search))
    );
  });

  return (
    <Box sx={{
      p: {
        xs: theme.custom.spacing.pagePadding.mobile,
        sm: theme.custom.spacing.pagePadding.tablet,
        md: theme.custom.spacing.pagePadding.desktop
      }
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: { xs: 2, sm: 3 }
      }}>
        <Typography variant={isMobile ? "h5" : "h4"}>Quotes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
          onClick={() => {
            setEditingQuotationId(undefined);
            setDialogOpen(true);
          }}
        >
          New Quote
        </Button>
      </Box>

      <Paper sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 } }}>
        {isMobile && (
          <Button
            fullWidth
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ mb: filtersExpanded ? 2 : 0, justifyContent: 'space-between' }}
          >
            Search & Filters
          </Button>
        )}
        <Collapse in={!isMobile || filtersExpanded}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size={isMobile ? "small" : "medium"}
                placeholder="Search by customer name or quote number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Button fullWidth variant="outlined" size={isMobile ? "small" : "medium"} onClick={handleSearch}>
                Search
              </Button>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Button fullWidth variant="outlined" size={isMobile ? "small" : "medium"} onClick={loadQuotations}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

{isMobile ? (
        // Mobile: Card-based layout
        <Box>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading...</Typography>
            </Paper>
          ) : filteredQuotations.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No quotes found</Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredQuotations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((quotation) => (
                  <Card key={quotation.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {quotation.quotationNumber}
                          </Typography>
                          <Chip
                            label={getStatusLabel(quotation.status)}
                            color={getStatusColor(quotation.status)}
                            size="small"
                          />
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, quotation)}
                          sx={{ mt: -1 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {quotation.businessName && (
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          {quotation.businessName}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {quotation.customerName}
                      </Typography>

                      <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Date:
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(quotation.createdAt)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            Valid Until:
                          </Typography>
                          <Typography variant="body2">
                            {quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="body1" fontWeight="bold">
                            Total:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold" color="primary.main">
                            {formatCurrency(quotation.total)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
            </Stack>
          )}

          {/* Mobile Pagination */}
          <Paper sx={{ mt: 2 }}>
            <TablePagination
              component="div"
              count={filteredQuotations.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Per page:"
            />
          </Paper>
        </Box>
      ) : (
        // Desktop: Table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quote #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Valid Until</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No quotes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((quotation) => (
                    <TableRow key={quotation.id} hover>
                      <TableCell>{quotation.quotationNumber}</TableCell>
                      <TableCell>{formatDate(quotation.createdAt)}</TableCell>
                      <TableCell>
                        {quotation.businessName && (
                          <Typography variant="body2" fontWeight="bold">
                            {quotation.businessName}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {quotation.customerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {quotation.validUntil ? formatDate(quotation.validUntil) : 'N/A'}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(quotation.total)}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(quotation.status)}
                          color={getStatusColor(quotation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, quotation)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredQuotations.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      <QuoteDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingQuotationId(undefined);
        }}
        onSuccess={loadQuotations}
        quoteId={editingQuotationId}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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
        <MenuItem onClick={() => handleMenuAction('view')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuAction('edit')}
          disabled={selectedQuote?.status === 'CONVERTED'}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction('print')}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction('sendEmail')}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>

        {selectedQuote?.status !== 'CONVERTED' && (
          <MenuItem onClick={() => handleMenuAction('convert')}>
            <ListItemIcon>
              <ConvertIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Convert to Invoice</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => handleMenuAction('delete')}
          disabled={selectedQuote?.status === 'CONVERTED'}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <EmailPromptDialog
        open={emailDialogOpen}
        onClose={() => {
          setEmailDialogOpen(false);
          setQuotationForEmail(null);
        }}
        onSubmit={handleEmailPromptSubmit}
        customerName={quotationForEmail?.customerName || ''}
        documentType="quotation"
        documentNumber={quotationForEmail?.quotationNumber || ''}
      />
    </Box>
  );
};

export default QuoteList;