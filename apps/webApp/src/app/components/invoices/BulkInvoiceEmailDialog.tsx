import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  ErrorOutline as FailureIcon,
} from '@mui/icons-material';
import { getInvoiceBalanceDue } from '@gt-automotive/data';
import { invoiceService } from '../../requests/invoice.requests';

/**
 * Minimal invoice shape this dialog needs — satisfied by both the full
 * InvoiceResponseDto and the lighter CustomerInvoiceDto.
 */
export interface BulkEmailableInvoice {
  id: string;
  invoiceNumber: string;
  total: number | string;
  status: string;
  amountPaid?: number | string | null;
  invoiceDate?: string;
  createdAt?: string;
}

/** What became of one invoice's send, so partial failure can be reported exactly. */
interface SendOutcome {
  id: string;
  invoiceNumber: string;
  ok: boolean;
  error?: string;
}

interface BulkInvoiceEmailDialogProps {
  open: boolean;
  onClose: () => void;
  customerName: string;
  customerId?: string;
  /** Outstanding invoices to choose from. */
  invoices: BulkEmailableInvoice[];
  /** Known addresses for this customer (primary first, then additional). */
  availableEmails?: string[];
  /** Called once at least one invoice has been sent, so callers can refresh. */
  onSent?: () => void;
}

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);

const formatDate = (invoice: BulkEmailableInvoice) => {
  const raw = invoice.invoiceDate || invoice.createdAt;
  if (!raw) return '';
  // Invoice dates are stored as midnight-UTC calendar dates; read them back in
  // UTC or an evening invoice reads as the day before.
  return new Date(raw).toLocaleDateString('en-CA', { timeZone: 'UTC' });
};

const errorMessage = (err: unknown): string => {
  const response = (err as { response?: { data?: { message?: unknown } } })
    ?.response;
  const message = response?.data?.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message)) return message.join(', ');
  return err instanceof Error ? err.message : 'Unknown error';
};

/**
 * Email several of a customer's outstanding invoices in one go.
 *
 * Chasing a fleet customer with seven pending invoices otherwise means seven
 * trips through the single-invoice email dialog, and it is easy to miss one.
 *
 * Each invoice is sent as its own email with its own PDF — this is not a
 * combined statement (see GA-33 for that). Sends run one at a time rather than
 * concurrently: every PDF is rendered by Puppeteer on the server, and firing
 * seven Chromium renders at once at a 1.75GB app service is how you turn a
 * slow send into a failed one.
 */
export const BulkInvoiceEmailDialog: React.FC<BulkInvoiceEmailDialogProps> = ({
  open,
  onClose,
  customerName,
  customerId,
  invoices,
  availableEmails,
  onSent,
}) => {
  const knownEmails = useMemo(
    () => Array.from(new Set((availableEmails ?? []).filter(Boolean))),
    [availableEmails]
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [saveToCustomer, setSaveToCustomer] = useState(true);
  const [error, setError] = useState('');

  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [outcomes, setOutcomes] = useState<SendOutcome[] | null>(null);

  // Everything selected each time the dialog opens — the common case is
  // sending the lot.
  useEffect(() => {
    if (!open) return;
    setSelectedIds(new Set(invoices.map((inv) => inv.id)));
    setSelectedEmails(knownEmails);
    setExtraEmails([]);
    setNewEmail('');
    setSaveToCustomer(true);
    setError('');
    setSending(false);
    setProgress({ done: 0, total: 0 });
    setOutcomes(null);
    // Keyed on `open` alone, and deliberately so. The parent passes `invoices`
    // and `availableEmails` as fresh array literals, so both change identity on
    // every one of its renders — and a successful send triggers exactly that,
    // via onSent -> loadCustomer. Listing either here wipes the result summary
    // and re-ticks every invoice the instant the send finishes, leaving the
    // user looking at the selection screen with no idea what happened and one
    // click away from emailing the whole lot a second time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedInvoices = useMemo(
    () => invoices.filter((inv) => selectedIds.has(inv.id)),
    [invoices, selectedIds]
  );

  const outstandingTotal = useMemo(
    () =>
      selectedInvoices.reduce((sum, inv) => sum + getInvoiceBalanceDue(inv), 0),
    [selectedInvoices]
  );

  const allSelected =
    invoices.length > 0 && selectedIds.size === invoices.length;

  const failed = outcomes?.filter((o) => !o.ok) ?? [];
  const succeeded = outcomes?.filter((o) => o.ok) ?? [];

  const toggleInvoice = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllInvoices = () =>
    setSelectedIds((prev) =>
      prev.size === invoices.length
        ? new Set()
        : new Set(invoices.map((inv) => inv.id))
    );

  const toggleEmail = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
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
    setSelectedEmails((prev) => [...prev, trimmed]);
    setNewEmail('');
    setError('');
  };

  const handleRemoveExtra = (email: string) => {
    setExtraEmails((prev) => prev.filter((e) => e !== email));
    setSelectedEmails((prev) => prev.filter((e) => e !== email));
  };

  /**
   * Send the given invoices one at a time, recording what happened to each.
   *
   * A failure part-way through leaves the invoices already sent alone: they
   * have genuinely been emailed, and re-sending them to "clean up" would put a
   * duplicate in the customer's inbox.
   */
  const sendInvoices = async (targets: BulkEmailableInvoice[]) => {
    if (targets.length === 0 || selectedEmails.length === 0) return;

    setSending(true);
    setError('');
    setProgress({ done: 0, total: targets.length });

    const results: SendOutcome[] = [];
    // New addresses only need persisting once, and only if a send actually
    // succeeds — saving them off the back of a failed request would record
    // addresses that were never reached.
    let emailsSaved = false;

    for (const [index, invoice] of targets.entries()) {
      try {
        await invoiceService.sendInvoiceEmail(
          invoice.id,
          selectedEmails,
          saveToCustomer && !!customerId && !emailsSaved
        );
        emailsSaved = emailsSaved || (saveToCustomer && !!customerId);
        results.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          ok: true,
        });
      } catch (err) {
        results.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          ok: false,
          error: errorMessage(err),
        });
      }
      setProgress({ done: index + 1, total: targets.length });
    }

    // A retry reports the whole run, not just the invoices it re-sent.
    setOutcomes((prev) => {
      if (!prev) return results;
      const byId = new Map(prev.map((o) => [o.id, o]));
      results.forEach((o) => byId.set(o.id, o));
      return Array.from(byId.values());
    });
    setSending(false);

    if (results.some((o) => o.ok)) onSent?.();
  };

  const handleSend = () => sendInvoices(selectedInvoices);

  const handleRetryFailed = () =>
    sendInvoices(invoices.filter((inv) => failed.some((f) => f.id === inv.id)));

  const handleClose = () => {
    if (sending) return;
    onClose();
  };

  const canSend = selectedInvoices.length > 0 && selectedEmails.length > 0;

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
          Email Pending Invoices
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'white' }}
          disabled={sending}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {outcomes ? (
          <Box sx={{ pt: 1 }}>
            {failed.length === 0 ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                {`${
                  succeeded.length === 1
                    ? '1 invoice was'
                    : `All ${succeeded.length} invoices were`
                } emailed to ${selectedEmails.join(', ')}.`}
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {`${succeeded.length} of ${outcomes.length} invoices were emailed. The rest are listed below and can be retried \u2014 the ones that went out will not be sent again.`}
              </Alert>
            )}

            <List dense disablePadding>
              {outcomes.map((outcome) => (
                <ListItem key={outcome.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {outcome.ok ? (
                      <SuccessIcon color="success" fontSize="small" />
                    ) : (
                      <FailureIcon color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`#${outcome.invoiceNumber}`}
                    secondary={outcome.ok ? 'Sent' : outcome.error}
                    secondaryTypographyProps={{
                      color: outcome.ok ? 'text.secondary' : 'error',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select the invoices to email to <strong>{customerName}</strong>.
              Each one is sent as its own email with its own PDF attached.
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && selectedIds.size > 0}
                  onChange={toggleAllInvoices}
                  disabled={sending}
                />
              }
              label={`Select all (${invoices.length})`}
            />

            <List
              dense
              disablePadding
              sx={{ maxHeight: 220, overflow: 'auto' }}
            >
              {invoices.map((invoice) => (
                <ListItem key={invoice.id} disablePadding>
                  <ListItemButton
                    onClick={() => toggleInvoice(invoice.id)}
                    disabled={sending}
                    dense
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedIds.has(invoice.id)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={`#${invoice.invoiceNumber}`}
                      secondary={[formatDate(invoice), invoice.status]
                        .filter(Boolean)
                        .join(' · ')}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(getInvoiceBalanceDue(invoice))}
                      </Typography>
                      {Number(invoice.amountPaid ?? 0) > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          of {formatCurrency(Number(invoice.total))}
                        </Typography>
                      )}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle2">
                {selectedInvoices.length} selected
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatCurrency(outstandingTotal)}
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Send to
            </Typography>

            {knownEmails.length === 0 && extraEmails.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                This customer has no email on file. Add one below.
              </Typography>
            )}

            <List dense disablePadding>
              {knownEmails.map((email, index) => (
                <ListItem key={email} disableGutters disablePadding>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedEmails.includes(email)}
                        onChange={() => toggleEmail(email)}
                        disabled={sending}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {email}
                        {index === 0 && (
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

            {extraEmails.map((email) => (
              <Box key={email} display="flex" alignItems="center" gap={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedEmails.includes(email)}
                      onChange={() => toggleEmail(email)}
                      disabled={sending}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">{email}</Typography>}
                />
                <IconButton
                  aria-label="Remove email"
                  size="small"
                  onClick={() => handleRemoveExtra(email)}
                  disabled={sending}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            <Box display="flex" alignItems="flex-start" gap={1} sx={{ mt: 1 }}>
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
                disabled={sending}
              />
              <Button
                onClick={handleAddEmail}
                startIcon={<AddIcon />}
                sx={{ mt: 0.5, whiteSpace: 'nowrap' }}
                disabled={!newEmail.trim() || sending}
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
                    disabled={sending}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Save new emails to {customerName || 'customer'}'s profile
                  </Typography>
                }
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )}

        {sending && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={
                progress.total ? (progress.done / progress.total) * 100 : 0
              }
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: 'center' }}
            >
              Sending {Math.min(progress.done + 1, progress.total)} of{' '}
              {progress.total}…
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={sending}>
          {outcomes ? 'Close' : 'Cancel'}
        </Button>
        {outcomes
          ? failed.length > 0 && (
              <Button
                onClick={handleRetryFailed}
                variant="contained"
                startIcon={<EmailIcon />}
                disabled={sending}
              >
                {failed.length === 1
                  ? 'Retry 1 failed'
                  : `Retry ${failed.length} failed`}
              </Button>
            )
          : !sending && (
              <Button
                onClick={handleSend}
                variant="contained"
                startIcon={<EmailIcon />}
                disabled={!canSend}
              >
                {selectedInvoices.length === 1
                  ? 'Send 1 invoice'
                  : `Send ${selectedInvoices.length} invoices`}
              </Button>
            )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkInvoiceEmailDialog;
