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
  Alert,
  IconButton,
} from '@mui/material';
import { Save as SaveIcon, Print as PrintIcon, Close as CloseIcon, RequestQuote as QuoteIcon } from '@mui/icons-material';
import { quotationService, QuoteItem } from '../../services/quotation.service';
import { TireService } from '../../services/tire.service';
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tires, setTires] = useState<any[]>([]);
  
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
      
      // Load tires
      const tiresData = await TireService.getTires();
      setTires(tiresData.items);

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
      showError('Failed to load data', error);
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
      });
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
        savedQuotation = await quotationService.updateQuote(quoteId, quoteData);
      } else {
        savedQuotation = await quotationService.createQuote(quoteData);
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
      showError(`Failed to ${quoteId ? 'update' : 'create'} quote`, error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPrint = async () => {
    await handleSave(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle
        sx={{
          background: colors.gradients.primary,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QuoteIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {quoteId ? 'Edit Quote' : 'Create New Quote'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {quoteId ? 'Modify existing quotation details' : 'Generate professional quotations for your customers'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <QuotationFormContent
              tires={tires}
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
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAndPrint}
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={20} /> : <PrintIcon />}
        >
          {saving ? 'Saving...' : 'Save & Print'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteDialog;

// Legacy export for backward compatibility
export const QuotationDialog = QuoteDialog;