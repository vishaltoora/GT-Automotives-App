import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Close,
  ArrowBackIos,
  ArrowForwardIos,
  Delete,
} from '@mui/icons-material';
import { ROMedia } from '../../requests/repair-order.requests';

interface PhotoLightboxProps {
  photos: ROMedia[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  onDelete?: (mediaId: string) => void;
  canDelete?: boolean;
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  ARRIVAL_CONDITION: 'Arrival Condition',
  DAMAGE_DOCUMENTATION: 'Damage Documentation',
  WORK_IN_PROGRESS: 'Work In Progress',
  WORK_COMPLETED: 'Work Completed',
  PARTS: 'Parts',
  OTHER: 'Other',
};

export function PhotoLightbox({ photos, initialIndex, open, onClose, onDelete, canDelete }: PhotoLightboxProps) {
  const [current, setCurrent] = React.useState(initialIndex);

  useEffect(() => { setCurrent(initialIndex); }, [initialIndex, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, current, photos.length]);

  const prev = () => setCurrent((c) => (c > 0 ? c - 1 : photos.length - 1));
  const next = () => setCurrent((c) => (c < photos.length - 1 ? c + 1 : 0));

  if (!photos.length) return null;
  const photo = photos[current];

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth
      PaperProps={{ sx: { bgcolor: 'black', maxWidth: '95vw', maxHeight: '95vh', m: 1 } }}>
      <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, bgcolor: 'black' }}>
        {/* Close */}
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 2, bgcolor: 'rgba(0,0,0,0.5)' }}>
          <Close />
        </IconButton>

        {/* Delete */}
        {canDelete && onDelete && (
          <IconButton onClick={() => { onDelete(photo.id); onClose(); }} sx={{ position: 'absolute', top: 8, right: 52, color: '#f44336', zIndex: 2, bgcolor: 'rgba(0,0,0,0.5)' }}>
            <Delete />
          </IconButton>
        )}

        {/* Prev */}
        {photos.length > 1 && (
          <IconButton onClick={prev} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 2 }}>
            <ArrowBackIos />
          </IconButton>
        )}

        {/* Image */}
        <Box component="img" src={photo.fileUrl} alt={photo.caption || photo.fileName || 'Photo'}
          sx={{ maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />

        {/* Next */}
        {photos.length > 1 && (
          <IconButton onClick={next} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', zIndex: 2 }}>
            <ArrowForwardIos />
          </IconButton>
        )}

        {/* Caption bar */}
        <Box sx={{ width: '100%', p: 2, bgcolor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label={MEDIA_TYPE_LABELS[photo.mediaType] || photo.mediaType} size="small"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', fontSize: 11 }} variant="outlined" />
          {photo.caption && (
            <Typography variant="body2" sx={{ color: 'white', flexGrow: 1 }}>{photo.caption}</Typography>
          )}
          {photo.uploadedBy && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 'auto' }}>
              {photo.uploadedBy.firstName} {photo.uploadedBy.lastName}
            </Typography>
          )}
          {photos.length > 1 && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {current + 1} / {photos.length}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
