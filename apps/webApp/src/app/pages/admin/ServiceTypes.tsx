import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';
import { NumberInput } from '../../components/common';
import { useConfirmation } from '../../contexts/ConfirmationContext';
import { useError } from '../../contexts/ErrorContext';
import {
  serviceTypeService,
  ServiceType,
} from '../../requests/service-type.requests';

interface FormState {
  name: string;
  duration: number;
  isActive: boolean;
  code: string;
}

const emptyForm: FormState = {
  name: '',
  duration: 60,
  isActive: true,
  code: '',
};

export default function ServiceTypes() {
  const { confirm } = useConfirmation();
  const { showError } = useError();

  const [items, setItems] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceType | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await serviceTypeService.list();
      setItems(data);
    } catch (err: any) {
      showError(
        err?.response?.data?.message || 'Failed to load service types.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: ServiceType) => {
    setEditing(item);
    setForm({
      name: item.name,
      duration: item.duration,
      isActive: item.isActive,
      code: item.code,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showError('Please enter a service name.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await serviceTypeService.update(editing.id, {
          name: form.name.trim(),
          duration: form.duration,
          isActive: form.isActive,
        });
      } else {
        await serviceTypeService.create({
          name: form.name.trim(),
          duration: form.duration,
          isActive: form.isActive,
          // Only send a custom code when the user typed one.
          ...(form.code.trim() ? { code: form.code.trim() } : {}),
        });
      }
      setDialogOpen(false);
      await loadItems();
    } catch (err: any) {
      showError(
        err?.response?.data?.message || 'Failed to save the service type.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ServiceType) => {
    const confirmed = await confirm({
      title: 'Delete Service Type',
      message: `Delete "${item.name}"? Existing appointments keep their record, but this type will no longer be selectable.`,
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!confirmed) return;

    try {
      await serviceTypeService.remove(item.id);
      await loadItems();
    } catch (err: any) {
      showError(
        err?.response?.data?.message || 'Failed to delete the service type.'
      );
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            color={colors.primary.main}
          >
            Service Types
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the service options available when booking appointments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
        >
          Add Service Type
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell align="right">Duration</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No service types yet. Click "Add Service Type" to create
                      one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {item.code}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{item.duration} min</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={item.isActive ? 'success' : 'default'}
                        variant={item.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Service Type' : 'Add Service Type'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Service Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
              autoFocus
            />
            <NumberInput
              label="Default Duration (minutes)"
              min={15}
              max={480}
              value={form.duration}
              onChange={(v) => setForm({ ...form, duration: v ?? 60 })}
              fullWidth
              required
            />
            {editing ? (
              <TextField
                label="Code"
                value={form.code}
                fullWidth
                disabled
                helperText="Stable identifier stored on appointments (not editable)."
              />
            ) : (
              <TextField
                label="Code (optional)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                fullWidth
                helperText="Leave blank to auto-generate from the name."
              />
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
              }
              label="Active (available for new appointments)"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
