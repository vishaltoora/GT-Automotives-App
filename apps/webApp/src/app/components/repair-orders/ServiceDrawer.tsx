import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Stack,
  Paper,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  Add,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  Delete,
  MenuBook,
} from '@mui/icons-material';
import {
  ROService,
  ROServiceStatus,
  ROServiceType,
  repairOrderRequests,
} from '../../requests/repair-order.requests';
import { NumberInput } from '../common';
import { ROPhotoSection } from './ROPhotoSection';
import { ServiceCatalogPicker } from './ServiceCatalogPicker';
import { ServiceCatalogItem } from '../../requests/service-catalog.requests';

interface ServiceDrawerProps {
  open: boolean;
  onClose: () => void;
  roId: string;
  services: ROService[];
  onServicesChange: (services: ROService[]) => void;
  canEdit: boolean;
  canDelete: boolean;
  currentUserId: string;
}

const STATUS_COLORS: Record<
  ROServiceStatus,
  'default' | 'warning' | 'success' | 'error'
> = {
  PENDING: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  DECLINED: 'error',
};

// Default labor rate ($/hour). LABOR cost = hours × rate.
const DEFAULT_LABOR_RATE = 100;

const CANNED_JOBS = [
  { description: 'Oil Change', type: 'LABOR' as ROServiceType, unitPrice: 45 },
  {
    description: 'Tire Rotation',
    type: 'LABOR' as ROServiceType,
    unitPrice: 35,
  },
  {
    description: 'Brake Inspection',
    type: 'LABOR' as ROServiceType,
    unitPrice: 30,
  },
  {
    description: 'Wheel Alignment',
    type: 'LABOR' as ROServiceType,
    unitPrice: 90,
  },
  {
    description: 'Battery Test & Replacement',
    type: 'LABOR' as ROServiceType,
    unitPrice: 120,
  },
  {
    description: 'Tire Mount & Balance (each)',
    type: 'LABOR' as ROServiceType,
    unitPrice: 25,
  },
  {
    description: 'Brake Pad Replacement (axle)',
    type: 'LABOR' as ROServiceType,
    unitPrice: 150,
  },
];

function ServiceItem({
  service,
  roId,
  onUpdate,
  onDelete,
  onMediaChange,
  canEdit,
  canDelete,
}: {
  service: ROService;
  roId: string;
  onUpdate: (updated: ROService) => void;
  onDelete: (id: string) => void;
  onMediaChange: (media: any[]) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(service.technicianNotes ?? '');
  const [notesEditing, setNotesEditing] = useState(false);

  const handleStatusChange = async (status: ROServiceStatus) => {
    setSaving(true);
    try {
      const updated = await repairOrderRequests.updateService(
        roId,
        service.id,
        { status }
      );
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const updated = await repairOrderRequests.updateService(
        roId,
        service.id,
        { technicianNotes: notes }
      );
      onUpdate(updated);
      setNotesEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const total = (Number(service.quantity) * Number(service.unitPrice)).toFixed(
    2
  );

  return (
    <Paper variant="outlined" sx={{ mb: 1 }}>
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {/* Status icon */}
          <IconButton
            size="small"
            disabled={!canEdit || saving}
            onClick={() =>
              handleStatusChange(
                service.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
              )
            }
            sx={{
              mt: 0.2,
              color:
                service.status === 'COMPLETED'
                  ? 'success.main'
                  : 'text.disabled',
            }}
          >
            {saving ? (
              <CircularProgress size={16} />
            ) : service.status === 'COMPLETED' ? (
              <CheckCircle />
            ) : (
              <RadioButtonUnchecked />
            )}
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                textDecoration:
                  service.status === 'DECLINED' ? 'line-through' : undefined,
              }}
            >
              {service.description}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                mt: 0.5,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Chip label={service.type} size="small" variant="outlined" />
              <Chip
                label={service.status.replace('_', ' ')}
                size="small"
                color={STATUS_COLORS[service.status]}
              />
              <Typography variant="caption" color="text.secondary">
                {service.type === 'LABOR'
                  ? `${Number(service.quantity)} hr × $${Number(
                      service.unitPrice
                    ).toFixed(2)}/hr = $${total}`
                  : `${Number(service.quantity)} × $${Number(
                      service.unitPrice
                    ).toFixed(2)} = $${total}`}
              </Typography>
            </Box>
            {service.completedBy && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
              >
                Completed by {service.completedBy.firstName}{' '}
                {service.completedBy.lastName}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            {canDelete && (
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(service.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          {/* Technician notes */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Technician Notes
          </Typography>
          {notesEditing ? (
            <Box sx={{ mt: 0.5 }}>
              <TextField
                multiline
                rows={2}
                fullWidth
                size="small"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Findings, measurements, observations…"
              />
              <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={handleSaveNotes}
                  disabled={saving}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setNotesEditing(false);
                    setNotes(service.technicianNotes ?? '');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{ mt: 0.5, cursor: canEdit ? 'pointer' : undefined }}
              onClick={() => canEdit && setNotesEditing(true)}
            >
              <Typography
                variant="body2"
                color={notes ? 'text.primary' : 'text.disabled'}
                sx={{ fontStyle: notes ? 'normal' : 'italic' }}
              >
                {notes || (canEdit ? 'Tap to add notes…' : 'No notes')}
              </Typography>
            </Box>
          )}

          {/* Service photos */}
          <Box sx={{ mt: 1.5 }}>
            <ROPhotoSection
              roId={roId}
              photos={service.media}
              onPhotosChange={onMediaChange}
              canDelete={canDelete}
              compact
            />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

export function ServiceDrawer({
  open,
  onClose,
  roId,
  services,
  onServicesChange,
  canEdit,
  canDelete,
  currentUserId,
}: ServiceDrawerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<ROServiceType>('LABOR');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(DEFAULT_LABOR_RATE);
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  const resetForm = () => {
    setNewDesc('');
    setNewType('LABOR');
    setNewQty(1);
    setNewPrice(DEFAULT_LABOR_RATE);
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleTypeChange = (type: ROServiceType) => {
    setNewType(type);
    // Switching to labor defaults the rate to $100/hr if none set yet.
    if (type === 'LABOR' && !newPrice) setNewPrice(DEFAULT_LABOR_RATE);
  };

  const newTotal = Number(newQty) * Number(newPrice);

  const handleAdd = async () => {
    if (!newDesc.trim()) return;
    setAdding(true);
    try {
      const created = await repairOrderRequests.addService(roId, {
        description: newDesc,
        type: newType,
        quantity: newQty,
        unitPrice: newPrice,
        technicianNotes: newNotes,
      });
      onServicesChange([...services, created]);
      resetForm();
    } finally {
      setAdding(false);
    }
  };

  // Labor items default to the $100/hr rate when the catalog has no price.
  const priceFor = (type: ROServiceType, unitPrice: number) =>
    type === 'LABOR' ? unitPrice || DEFAULT_LABOR_RATE : unitPrice;

  const handleCanned = (job: (typeof CANNED_JOBS)[0]) => {
    setNewDesc(job.description);
    setNewType(job.type);
    setNewQty(1);
    setNewPrice(priceFor(job.type, job.unitPrice));
    setShowAddForm(true);
  };

  const handleCatalogSelect = (service: ServiceCatalogItem) => {
    setNewDesc(service.name);
    setNewType(service.type);
    // Pre-fill the catalog's default labour hours; advisor can adjust before adding.
    setNewQty(service.type === 'LABOR' ? Number(service.labourHours) || 1 : 1);
    setNewPrice(priceFor(service.type, Number(service.unitPrice)));
    setNewNotes('');
    setShowAddForm(true);
    setCatalogOpen(false);
  };

  const handleUpdate = (updated: ROService) => {
    onServicesChange(services.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDelete = async (id: string) => {
    await repairOrderRequests.removeService(roId, id);
    onServicesChange(services.filter((s) => s.id !== id));
  };

  const handleMediaChange = (serviceId: string, media: any[]) => {
    onServicesChange(
      services.map((s) => (s.id === serviceId ? { ...s, media } : s))
    );
  };

  const total = services.reduce((sum, s) => sum + Number(s.total), 0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Service Items
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            Est. ${total.toFixed(2)}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {/* Existing services */}
          {services.length === 0 && !showAddForm && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
              <Typography variant="body2">No service items yet.</Typography>
              <Typography variant="caption">
                Add from canned jobs or create custom.
              </Typography>
            </Box>
          )}

          {services.map((s) => (
            <ServiceItem
              key={s.id}
              service={s}
              roId={roId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMediaChange={(media) => handleMediaChange(s.id, media)}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}

          {/* Add form */}
          {showAddForm && canEdit && (
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                New Service Item
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="Description"
                  fullWidth
                  size="small"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Front brake pad replacement"
                  required
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newType}
                      label="Type"
                      onChange={(e) =>
                        handleTypeChange(e.target.value as ROServiceType)
                      }
                    >
                      <MenuItem value="LABOR">Labor</MenuItem>
                      <MenuItem value="PART">Part</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {newType === 'LABOR' ? (
                    <>
                      <NumberInput
                        label="Hours"
                        allowDecimals
                        size="small"
                        sx={{ width: 90 }}
                        value={newQty}
                        onChange={(v) =>
                          setNewQty((v ?? '') as unknown as number)
                        }
                        min={0.25}
                      />
                      <NumberInput
                        label="Rate ($/hr)"
                        allowDecimals
                        size="small"
                        sx={{ flex: 1 }}
                        value={newPrice}
                        onChange={(v) =>
                          setNewPrice((v ?? '') as unknown as number)
                        }
                        min={0}
                        InputProps={{
                          startAdornment: (
                            <Typography variant="caption" sx={{ mr: 0.5 }}>
                              $
                            </Typography>
                          ),
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <NumberInput
                        label="Qty"
                        allowDecimals
                        size="small"
                        sx={{ width: 70 }}
                        value={newQty}
                        onChange={(v) =>
                          setNewQty((v ?? '') as unknown as number)
                        }
                        min={0.25}
                      />
                      <NumberInput
                        label="Unit Price"
                        allowDecimals
                        size="small"
                        sx={{ flex: 1 }}
                        value={newPrice}
                        onChange={(v) =>
                          setNewPrice((v ?? '') as unknown as number)
                        }
                        min={0}
                        InputProps={{
                          startAdornment: (
                            <Typography variant="caption" sx={{ mr: 0.5 }}>
                              $
                            </Typography>
                          ),
                        }}
                      />
                    </>
                  )}
                </Box>
                {/* Auto-computed, read-only total */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {newType === 'LABOR'
                      ? `${Number(newQty) || 0} hr × $${Number(
                          newPrice
                        ).toFixed(2)}/hr`
                      : 'Total'}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ${newTotal.toFixed(2)}
                  </Typography>
                </Box>
                <TextField
                  label="Technician Notes (optional)"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAdd}
                    disabled={adding || !newDesc.trim()}
                  >
                    {adding ? <CircularProgress size={16} /> : 'Add'}
                  </Button>
                  <Button size="small" onClick={resetForm}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Canned jobs */}
          {canEdit && !showAddForm && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, flexGrow: 1 }}
                >
                  Quick Add
                </Typography>
                <Button
                  size="small"
                  startIcon={<MenuBook fontSize="small" />}
                  onClick={() => setCatalogOpen(true)}
                >
                  Browse All Services
                </Button>
              </Box>
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}
              >
                {CANNED_JOBS.map((j) => (
                  <Chip
                    key={j.description}
                    label={j.description}
                    size="small"
                    clickable
                    onClick={() => handleCanned(j)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        {canEdit && (
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              startIcon={<MenuBook />}
              onClick={() => setCatalogOpen(true)}
            >
              Browse Services
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
            >
              Custom Item
            </Button>
          </Box>
        )}
      </Box>

      {/* Service catalog picker */}
      <ServiceCatalogPicker
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onSelect={handleCatalogSelect}
        canManage={canEdit}
        canDelete={canDelete}
      />
    </Drawer>
  );
}
