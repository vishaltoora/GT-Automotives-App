import { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AddAPhoto as AddPhotoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ReportProblem as DefectIcon,
} from '@mui/icons-material';
import {
  repairOrderRequests,
  ROMedia,
} from '../../requests/repair-order.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';
import { useConfirmationHelpers } from '../../contexts/ConfirmationContext';

interface PreInspectionSectionProps {
  roId: string;
  photos: ROMedia[];
  onPhotosChange: (photos: ROMedia[]) => void;
  canEdit: boolean;
}

/**
 * Pre-inspection: the technician photographs defective parts and records a note
 * for each. Photos are stored as RO media tagged DAMAGE_DOCUMENTATION with the
 * note in `caption`; the estimate email builds a PDF from exactly these.
 */
export function PreInspectionSection({
  roId,
  photos,
  onPhotosChange,
  canEdit,
}: PreInspectionSectionProps) {
  const { showApiError } = useErrorHelpers();
  const { confirm } = useConfirmationHelpers();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defects = useMemo(
    () => photos.filter((p) => p.mediaType === 'DAMAGE_DOCUMENTATION'),
    [photos]
  );

  // Add-dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string>('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit-note state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openPicker = () => fileInputRef.current?.click();

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Allow re-selecting the same file later.
    e.target.value = '';
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setNote('');
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setPendingFile(null);
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingPreview('');
    setNote('');
  };

  const handleSaveNew = async () => {
    if (!pendingFile) return;
    setSaving(true);
    try {
      const uploaded = await repairOrderRequests.uploadMedia(
        roId,
        pendingFile,
        'DAMAGE_DOCUMENTATION',
        note.trim() || undefined
      );
      onPhotosChange([...photos, uploaded]);
      closeAdd();
    } catch (error) {
      showApiError(error, 'Failed to add the pre-inspection photo.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async (id: string) => {
    setSaving(true);
    try {
      const updated = await repairOrderRequests.updateMedia(roId, id, {
        caption: editNote.trim(),
      });
      onPhotosChange(
        photos.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      setEditingId(null);
    } catch (error) {
      showApiError(error, 'Failed to update the note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photo: ROMedia) => {
    const ok = await confirm({
      title: 'Delete Photo',
      message: 'Remove this pre-inspection photo? This cannot be undone.',
      confirmText: 'Delete',
      severity: 'error',
      confirmButtonColor: 'error',
    });
    if (!ok) return;
    setDeletingId(photo.id);
    try {
      await repairOrderRequests.removeMedia(roId, photo.id);
      onPhotosChange(photos.filter((p) => p.id !== photo.id));
    } catch (error) {
      showApiError(error, 'Failed to delete the photo.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <DefectIcon fontSize="small" color="warning" />
          <Typography variant="subtitle2" color="text.secondary">
            Pre-Inspection (defective parts)
          </Typography>
        </Stack>
        {canEdit && (
          <Button
            size="small"
            startIcon={<AddPhotoIcon fontSize="small" />}
            onClick={openPicker}
          >
            Add Photo
          </Button>
        )}
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChosen}
      />

      {defects.length === 0 ? (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ fontStyle: 'italic', py: 1 }}
        >
          No defective-part photos yet. Use “Add Photo” to document an issue
          with a note.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {defects.map((photo) => (
            <Paper key={photo.id} variant="outlined" sx={{ p: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  component="img"
                  src={photo.fileUrl}
                  alt={photo.caption || 'Defect'}
                  sx={{
                    width: 84,
                    height: 84,
                    objectFit: 'cover',
                    borderRadius: 1,
                    flexShrink: 0,
                    bgcolor: 'action.hover',
                  }}
                />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  {editingId === photo.id ? (
                    <Stack spacing={1}>
                      <TextField
                        size="small"
                        multiline
                        minRows={2}
                        fullWidth
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Describe the defect…"
                        autoFocus
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={saving}
                          onClick={() => handleSaveNote(photo.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          disabled={saving}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color={photo.caption ? 'text.primary' : 'text.disabled'}
                      sx={{
                        fontStyle: photo.caption ? 'normal' : 'italic',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {photo.caption || 'No note added'}
                    </Typography>
                  )}
                </Box>
                {canEdit && editingId !== photo.id && (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit note">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingId(photo.id);
                          setEditNote(photo.caption || '');
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete photo">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={deletingId === photo.id}
                          onClick={() => handleDelete(photo)}
                        >
                          {deletingId === photo.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Add photo + note dialog */}
      <Dialog
        open={addOpen}
        onClose={() => !saving && closeAdd()}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add Pre-Inspection Photo</DialogTitle>
        <DialogContent>
          {pendingPreview && (
            <Box
              component="img"
              src={pendingPreview}
              alt="Preview"
              sx={{
                width: '100%',
                maxHeight: 260,
                objectFit: 'contain',
                borderRadius: 1,
                mb: 2,
                bgcolor: 'action.hover',
              }}
            />
          )}
          <TextField
            label="Note (what's the defect?)"
            fullWidth
            multiline
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Front brake pads worn below 2mm"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdd} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveNew}
            disabled={saving || !pendingFile}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
          >
            Add Photo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
