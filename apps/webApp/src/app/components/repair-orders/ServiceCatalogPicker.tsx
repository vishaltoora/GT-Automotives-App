import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Close,
  Search,
  AddCircleOutline,
  Add,
  Delete,
  Edit,
  MoreVert,
} from '@mui/icons-material';
import {
  serviceCatalogRequests,
  ServiceCatalogItem,
} from '../../requests/service-catalog.requests';
import { NumberInput } from '../common';

interface ServiceCatalogPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (service: ServiceCatalogItem) => void;
  /** Can add new catalog services. */
  canManage?: boolean;
  /** Can delete catalog services. */
  canDelete?: boolean;
}

function hoursLabel(hours: number) {
  const h = Number(hours) || 0;
  return `${h} hr`;
}

export function ServiceCatalogPicker({
  open,
  onClose,
  onSelect,
  canManage = false,
  canDelete = false,
}: ServiceCatalogPickerProps) {
  const [items, setItems] = useState<ServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Add/edit-service form. editingId set => editing that item, otherwise adding.
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newHours, setNewHours] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Row overflow (3-dot) menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem] = useState<ServiceCatalogItem | null>(null);

  const openMenu = (
    e: React.MouseEvent<HTMLElement>,
    item: ServiceCatalogItem
  ) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuItem(item);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuItem(null);
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    serviceCatalogRequests
      .getAll()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setError('Failed to load services.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  // Flat list, sorted by name; filtered by the search query.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((s) => s.name.toLowerCase().includes(q))
      : items;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [query, items]);

  const resetAddForm = () => {
    setEditingId(null);
    setNewName('');
    setNewHours(1);
    setShowAddForm(false);
  };

  const handleEdit = (item: ServiceCatalogItem) => {
    setEditingId(item.id);
    setNewName(item.name);
    setNewHours(Number(item.labourHours) || 0);
    setShowAddForm(true);
  };

  const handleClose = () => {
    setQuery('');
    resetAddForm();
    onClose();
  };

  const handleSelect = (service: ServiceCatalogItem) => {
    onSelect(service);
    setQuery('');
  };

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError(null);
    const payload = {
      name: newName.trim(),
      labourHours: Number(newHours) || 0,
    };
    try {
      if (editingId) {
        const updated = await serviceCatalogRequests.update(editingId, payload);
        setItems((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await serviceCatalogRequests.create(payload);
        setItems((prev) => [...prev, created]);
      }
      resetAddForm();
    } catch {
      setError(
        editingId ? 'Failed to update service.' : 'Failed to add service.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await serviceCatalogRequests.remove(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('Failed to delete service.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderRow = (s: ServiceCatalogItem) => (
    <ListItemButton key={s.id} onClick={() => handleSelect(s)}>
      <ListItemText
        primary={s.name}
        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
      />
      <Chip
        label={hoursLabel(s.labourHours)}
        size="small"
        variant="outlined"
        sx={{ mr: 1 }}
      />
      {canManage || canDelete ? (
        deletingId === s.id ? (
          <Box sx={{ px: 0.75, display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} />
          </Box>
        ) : (
          <IconButton size="small" onClick={(e) => openMenu(e, s)}>
            <MoreVert fontSize="small" />
          </IconButton>
        )
      ) : (
        <AddCircleOutline fontSize="small" color="action" />
      )}
    </ListItemButton>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Choose a Service
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Search services…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {canManage && (
          <Box sx={{ mt: 1 }}>
            {showAddForm ? (
              <Box
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {editingId ? 'Edit Service' : 'New Service'}
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Service name"
                      size="small"
                      sx={{ flex: 1 }}
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                    <NumberInput
                      label="Default hours"
                      allowDecimals
                      size="small"
                      sx={{ width: 120 }}
                      value={newHours}
                      onChange={(v) =>
                        setNewHours((v ?? '') as unknown as number)
                      }
                      min={0}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSave}
                      disabled={saving || !newName.trim()}
                    >
                      {saving ? (
                        <CircularProgress size={16} />
                      ) : editingId ? (
                        'Save'
                      ) : (
                        'Add'
                      )}
                    </Button>
                    <Button size="small" onClick={resetAddForm}>
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setShowAddForm(true)}
              >
                Add Service
              </Button>
            )}
          </Box>
        )}

        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {error}
          </Typography>
        )}
      </Box>

      <DialogContent sx={{ pt: 0 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : visible.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.disabled' }}>
            {query ? (
              <>
                <Typography variant="body2">
                  No services match "{query}".
                </Typography>
                <Typography variant="caption">
                  You can still add it as a custom item.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2">No services yet.</Typography>
                {canManage && (
                  <Typography variant="caption">
                    Use "Add Service" to create one.
                  </Typography>
                )}
              </>
            )}
          </Box>
        ) : (
          <List dense>{visible.map((s) => renderRow(s))}</List>
        )}
      </DialogContent>

      {/* Row overflow menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        {canManage && (
          <MenuItem
            onClick={() => {
              if (menuItem) handleEdit(menuItem);
              closeMenu();
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
        )}
        {canDelete && (
          <MenuItem
            onClick={() => {
              const id = menuItem?.id;
              closeMenu();
              if (id) handleDelete(id);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            Delete
          </MenuItem>
        )}
      </Menu>
    </Dialog>
  );
}
