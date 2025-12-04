import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Email as EmailIcon } from '@mui/icons-material';

interface EmailPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, saveToCustomer: boolean) => Promise<void>;
  customerName: string;
  customerId?: string;
  documentType: 'invoice' | 'quotation';
  documentNumber: string;
}

export const EmailPromptDialog: React.FC<EmailPromptDialogProps> = ({
  open,
  onClose,
  onSubmit,
  customerName,
  customerId,
  documentType,
  documentNumber,
}) => {
  const [email, setEmail] = useState('');
  const [saveToCustomer, setSaveToCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(email, saveToCustomer && !!customerId);
      handleClose();
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSaveToCustomer(true);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon />
          Send {documentType === 'invoice' ? 'Invoice' : 'Quotation'}
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customer <strong>{customerName}</strong> does not have an email on file.
            Please enter an email address to send {documentType} <strong>{documentNumber}</strong>.
          </Typography>

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            placeholder="customer@example.com"
            autoFocus
            autoComplete="off"
          />

          {customerId && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveToCustomer}
                  onChange={(e) => setSaveToCustomer(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Save this email to {customerName}'s profile for future use
                </Typography>
              }
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !email.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <EmailIcon />}
        >
          {loading ? 'Sending...' : 'Send Email'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailPromptDialog;
