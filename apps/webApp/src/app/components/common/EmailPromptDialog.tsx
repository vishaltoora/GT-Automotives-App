import React, { useEffect, useMemo, useState } from 'react';
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
  List,
  ListItem,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface EmailPromptDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, saveToCustomer: boolean) => Promise<void>;
  /** Multi-recipient submit handler. Used when `multiple` is true. */
  onSubmitMultiple?: (
    emails: string[],
    saveToCustomer: boolean
  ) => Promise<void>;
  /** Known emails for the recipient (primary + additional). Enables checkbox selection. */
  availableEmails?: string[];
  /** Enable multi-recipient mode (checkboxes + add-more). */
  multiple?: boolean;
  customerName: string;
  customerId?: string;
  documentType: 'invoice' | 'quotation' | 'inspection';
  documentNumber: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const EmailPromptDialog: React.FC<EmailPromptDialogProps> = ({
  open,
  onClose,
  onSubmit,
  onSubmitMultiple,
  availableEmails,
  multiple = false,
  customerName,
  customerId,
  documentType,
  documentNumber,
}) => {
  const theme = useTheme();

  // Single-email mode state
  const [email, setEmail] = useState('');

  // Multi-email mode state
  const knownEmails = useMemo(
    () => Array.from(new Set((availableEmails ?? []).filter((e) => !!e))),
    [availableEmails]
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const [saveToCustomer, setSaveToCustomer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setEmail('');
      setExtraEmails([]);
      setNewEmail('');
      // Pre-select all known emails (or the first one if many) when opening
      setSelected(knownEmails);
      setSaveToCustomer(true);
      setError('');
    }
  }, [open, knownEmails]);

  const toggleSelected = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
    setError('');
  };

  const handleAddEmail = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;
    if (!validateEmail(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    if ([...knownEmails, ...extraEmails].includes(trimmed)) {
      setError('That email is already in the list');
      return;
    }
    setExtraEmails((prev) => [...prev, trimmed]);
    setSelected((prev) => [...prev, trimmed]);
    setNewEmail('');
    setError('');
  };

  const handleRemoveExtra = (value: string) => {
    setExtraEmails((prev) => prev.filter((e) => e !== value));
    setSelected((prev) => prev.filter((e) => e !== value));
  };

  const handleSubmitMultiple = async () => {
    const recipients = selected.filter((e) => !!e);
    if (recipients.length === 0) {
      setError('Select at least one email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmitMultiple?.(recipients, saveToCustomer && !!customerId);
      handleClose();
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSingle = async () => {
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
    setSelected([]);
    setExtraEmails([]);
    setNewEmail('');
    setSaveToCustomer(true);
    setError('');
    onClose();
  };

  const docLabel =
    documentType === 'invoice'
      ? 'Invoice'
      : documentType === 'inspection'
      ? 'Inspection Report'
      : 'Quotation';
  const canSubmit = multiple ? selected.length > 0 : !!email.trim();

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
    >
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
          Send {docLabel}
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'white' }}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {loading ? (
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              py: 6,
            }}
          >
            {/* Spinning gradient ring with a pulsing paper-plane icon */}
            <Box
              sx={{
                position: 'relative',
                width: 72,
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: `conic-gradient(from 90deg, ${theme.palette.primary.main}00, ${theme.palette.primary.main})`,
                  WebkitMask:
                    'radial-gradient(farthest-side, #0000 calc(100% - 5px), #000 calc(100% - 5px))',
                  mask: 'radial-gradient(farthest-side, #0000 calc(100% - 5px), #000 calc(100% - 5px))',
                  animation: 'emailRingSpin 0.9s linear infinite',
                  '@keyframes emailRingSpin': {
                    to: { transform: 'rotate(360deg)' },
                  },
                }}
              />
              <SendIcon
                sx={{
                  color: 'primary.main',
                  fontSize: 30,
                  animation: 'emailPlanePulse 1.4s ease-in-out infinite',
                  '@keyframes emailPlanePulse': {
                    '0%, 100%': {
                      transform: 'translate(0, 0) scale(1)',
                      opacity: 0.8,
                    },
                    '50%': {
                      transform: 'translate(2px, -2px) scale(1.12)',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Sending {docLabel.toLowerCase()}…
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.6,
                  justifyContent: 'center',
                  mt: 1,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      animation: 'emailDotBounce 1s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                      '@keyframes emailDotBounce': {
                        '0%, 100%': {
                          opacity: 0.3,
                          transform: 'translateY(0)',
                        },
                        '50%': { opacity: 1, transform: 'translateY(-4px)' },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      ) : (
        <>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {multiple ? (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Select the email address(es) to send{' '}
                    {docLabel.toLowerCase()} <strong>{documentNumber}</strong>{' '}
                    to
                    {customerName ? (
                      <>
                        {' '}
                        for <strong>{customerName}</strong>
                      </>
                    ) : null}
                    .
                  </Typography>

                  {knownEmails.length > 0 ? (
                    <List dense disablePadding>
                      {knownEmails.map((e, idx) => (
                        <ListItem key={e} disableGutters disablePadding>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selected.includes(e)}
                                onChange={() => toggleSelected(e)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {e}
                                {idx === 0 && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    (primary)
                                  </Typography>
                                )}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      This customer has no email on file. Add one below.
                    </Typography>
                  )}

                  {/* Manually added emails */}
                  {extraEmails.map((e) => (
                    <Box key={e} display="flex" alignItems="center" gap={1}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selected.includes(e)}
                            onChange={() => toggleSelected(e)}
                            color="primary"
                          />
                        }
                        label={<Typography variant="body2">{e}</Typography>}
                      />
                      <IconButton
                        aria-label="Remove email"
                        size="small"
                        onClick={() => handleRemoveExtra(e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" alignItems="flex-start" gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add another email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        setError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEmail();
                        }
                      }}
                      placeholder="someone@example.com"
                      error={!!error}
                      helperText={error}
                      autoComplete="off"
                    />
                    <Button
                      onClick={handleAddEmail}
                      startIcon={<AddIcon />}
                      sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
                      disabled={!newEmail.trim()}
                    >
                      Add
                    </Button>
                  </Box>

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
                          Save new emails to {customerName || 'customer'}'s
                          profile
                        </Typography>
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </>
              ) : (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Customer <strong>{customerName}</strong> does not have an
                    email on file. Please enter an email address to send{' '}
                    {docLabel.toLowerCase()} <strong>{documentNumber}</strong>.
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
                          Save this email to {customerName}'s profile for future
                          use
                        </Typography>
                      }
                      sx={{ mt: 2 }}
                    />
                  )}
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={multiple ? handleSubmitMultiple : handleSubmitSingle}
              variant="contained"
              disabled={!canSubmit}
              startIcon={<EmailIcon />}
            >
              {multiple && selected.length > 1
                ? `Send to ${selected.length} recipients`
                : 'Send Email'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default EmailPromptDialog;
