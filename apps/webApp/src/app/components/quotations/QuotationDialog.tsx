import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Print as PrintIcon, Close as CloseIcon, RequestQuote as QuoteIcon } from '@mui/icons-material';
import { quotationService, QuoteItem } from '../../services/quotation.service';
import { TireService } from '../../services/tire.service';
import { serviceService } from '../../services/service.service';
import { ServiceDto } from '@gt-automotive/data';
import QuotationFormContent from './QuotationFormContent';
import { useError } from '../../contexts/ErrorContext';
import { colors } from '../../theme/colors';

interface QuoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  quoteId?: string;
}

const QuoteDialog: React.FC<QuoteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  quoteId
}) => {
  const { showError } = useError();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tires, setTires] = useState<any[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  
  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    businessName: '',
    address: '',
    phone: '',
    email: '',
  });

  const [formData, setFormData] = useState({
    gstRate: 0.05,
    pstRate: 0.07,
    notes: '',
    status: 'DRAFT',
    validUntil: '',
  });

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItem, setNewItem] = useState<QuoteItem>({
    itemType: 'TIRE',
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
    if (open) {
      loadData();
    } else {
      resetForm();
    }
  }, [open, quoteId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tires and services
      const [tiresData, servicesData] = await Promise.all([
        TireService.getTires({ page: 1, limit: 100 }),
        serviceService.getAll(),
      ]);
      setTires(tiresData.items || []);
      setServices(servicesData);

      // Load existing quotation if editing
      if (quoteId) {
        const quotation = await quotationService.getQuote(quoteId);
        
        setQuoteForm({
          customerName: quotation.customerName,
          businessName: quotation.businessName || '',
          address: quotation.address || '',
          phone: quotation.phone || '',
          email: quotation.email || '',
        });

        setFormData({
          gstRate: Number(quotation.gstRate) || 0.05,
          pstRate: Number(quotation.pstRate) || 0.07,
          notes: quotation.notes || '',
          status: quotation.status || 'DRAFT',
          validUntil: quotation.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
        });

        setItems(quotation.items);
      }
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuoteForm({
      customerName: '',
      businessName: '',
      address: '',
      phone: '',
      email: '',
    });
    setFormData({
      gstRate: 0.05,
      pstRate: 0.07,
      notes: '',
      status: 'DRAFT',
      validUntil: '',
    });
    setItems([]);
    setNewItem({
      itemType: 'TIRE',
      description: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleTireSelect = (tireId: string) => {
    const tire = tires.find(t => t.id === tireId);
    if (tire) {
      setNewItem({
        ...newItem,
        tireId,
        description: `${tire.brand} - ${tire.size}`,
        unitPrice: parseFloat(tire.price),
        tireName: tire.name || undefined,
      });
    }
  };

  const handleServicesChange = async () => {
    try {
      const servicesData = await serviceService.getAll();
      setServices(servicesData);
    } catch (error) {
      showError('Failed to refresh services');
    }
  };

  const handleAddItem = () => {
    if (newItem.description && newItem.quantity && newItem.unitPrice) {
      setItems([...items, { ...newItem }]);
      setNewItem({
        itemType: 'TIRE',
        description: '',
        quantity: 1,
        unitPrice: 0,
        tireId: undefined,
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async (shouldPrint = false) => {
    if (!quoteForm.customerName) {
      showError('Customer name is required');
      return;
    }

    if (items.length === 0) {
      showError('Please add at least one item');
      return;
    }

    try {
      setSaving(true);
      
      const quoteData = {
        ...quoteForm,
        ...formData,
        validUntil: formData.validUntil ? new Date(formData.validUntil + 'T00:00:00.000Z').toISOString() : undefined,
        items: items.map(({ id, total, ...item }) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          quantity: Number(item.quantity)
        })),
      };

      let savedQuotation;
      if (quoteId) {
        savedQuotation = await quotationService.updateQuote(quoteId, { ...quoteData, status: quoteData.status as any });
      } else {
        savedQuotation = await quotationService.createQuote({ ...quoteData, status: quoteData.status as any });
      }

      // Print the quotation if requested, but don't let print failures affect the save operation
      if (shouldPrint) {
        try {
          quotationService.printQuote(savedQuotation);
        } catch (printError) {
          console.warn('Print failed, but quotation was saved successfully:', printError);
          // Show a warning but don't fail the entire operation
          showError('Quotation saved successfully, but printing failed. You can print it later from the quotations list.');
        }
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      showError(`Failed to ${quoteId ? 'update' : 'create'} quote`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPrint = async () => {
    await handleSave(true);
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
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
          ...(isMobile && {
            flexShrink: 0,
          })
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <QuoteIcon sx={{ fontSize: { xs: 24, sm: 28 }, display: { xs: 'none', sm: 'block' } }} />
          <Box>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              sx={{ fontWeight: 600 }}
            >
              {quoteId ? 'Edit Quote' : 'Create Quote'}
            </Typography>
            {!isMobile && (
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {quoteId ? 'Modify existing quotation details' : 'Generate professional quotations for your customers'}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent
        sx={{
          ...(isMobile && {
            flex: '1 1 auto',
            overflowY: 'auto',
            minHeight: 0,
            p: 0,
          })
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <QuotationFormContent
              tires={tires}
              services={services}
              quotationForm={quoteForm}
              setQuotationForm={setQuoteForm}
              formData={formData}
              setFormData={setFormData}
              items={items}
              setItems={setItems}
              newItem={newItem}
              setNewItem={setNewItem}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onTireSelect={handleTireSelect}
              onServicesChange={handleServicesChange}
            />
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          background: colors.background.light,
          borderTop: `1px solid ${colors.neutral[200]}`,
          gap: 2,
          ...(isMobile && {
            flexShrink: 0,
            backgroundColor: 'white',
          })
        }}
      >
        <Button
          onClick={onClose}
          startIcon={<CloseIcon />}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            borderColor: colors.neutral[400],
            color: colors.text.secondary,
            '&:hover': {
              borderColor: colors.neutral[600],
              background: colors.neutral[50]
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAndPrint}
          disabled={loading || saving}
          fullWidth={isMobile}
          startIcon={saving ? <CircularProgress size={20} /> : <PrintIcon />}
          sx={{
            background: colors.primary.main,
            '&:hover': {
              background: colors.primary.dark
            }
          }}
        >
          {saving
            ? (quoteId ? 'Updating...' : 'Creating...')
            : (quoteId
                ? (isMobile ? 'Update' : 'Update Quote')
                : (isMobile ? 'Create' : 'Create Quote')
              )
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteDialog;

// Legacy export for backward compatibility
export const QuotationDialog = QuoteDialog;