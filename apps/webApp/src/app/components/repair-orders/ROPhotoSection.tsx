import { useState } from 'react';
import {
  Box,
  Typography,
  ImageList,
  ImageListItem,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete, PhotoCamera } from '@mui/icons-material';
import { ROMedia, ROMediaType, repairOrderRequests } from '../../requests/repair-order.requests';
import { AddPhotoButton } from './AddPhotoButton';
import { PhotoLightbox } from './PhotoLightbox';

interface ROPhotoSectionProps {
  roId: string;
  photos: ROMedia[];
  onPhotosChange: (photos: ROMedia[]) => void;
  canDelete?: boolean;
  compact?: boolean; // smaller grid for service items
  canUpload?: boolean; // when false, Add Photo is disabled
  uploadDisabledHint?: string; // tooltip explaining why upload is disabled
}

const TYPE_FILTERS: { value: ROMediaType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ARRIVAL_CONDITION', label: 'Arrival' },
  { value: 'DAMAGE_DOCUMENTATION', label: 'Damage' },
  { value: 'WORK_IN_PROGRESS', label: 'In Progress' },
  { value: 'WORK_COMPLETED', label: 'Completed' },
  { value: 'PARTS', label: 'Parts' },
];

export function ROPhotoSection({ roId, photos, onPhotosChange, canDelete, compact, canUpload = true, uploadDisabledHint }: ROPhotoSectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [filter, setFilter] = useState<ROMediaType | 'ALL'>('ALL');

  const filtered = filter === 'ALL' ? photos : photos.filter((p) => p.mediaType === filter);

  const handleUploaded = (media: ROMedia) => {
    onPhotosChange([...photos, media]);
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await repairOrderRequests.removeMedia(roId, mediaId);
      onPhotosChange(photos.filter((p) => p.id !== mediaId));
    } catch (err) {
      console.error('Failed to delete photo', err);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const cols = compact ? 4 : 3;
  const rowHeight = compact ? 80 : 140;

  return (
    <Box>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhotoCamera fontSize="small" color="action" />
          <Typography variant="subtitle2" color="text.secondary">
            Photos ({photos.length})
          </Typography>
        </Box>
        {canUpload ? (
          <AddPhotoButton roId={roId} onUploaded={handleUploaded} size="small" />
        ) : (
          <Tooltip title={uploadDisabledHint ?? ''}>
            <span>
              <AddPhotoButton roId={roId} onUploaded={handleUploaded} size="small" disabled />
            </span>
          </Tooltip>
        )}
      </Box>

      {/* Filter chips */}
      {photos.length > 0 && !compact && (
        <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          {TYPE_FILTERS.map((f) => {
            const count = f.value === 'ALL' ? photos.length : photos.filter((p) => p.mediaType === f.value).length;
            if (f.value !== 'ALL' && count === 0) return null;
            return (
              <Chip
                key={f.value}
                label={`${f.label}${f.value !== 'ALL' ? ` (${count})` : ''}`}
                size="small"
                onClick={() => setFilter(f.value as ROMediaType | 'ALL')}
                color={filter === f.value ? 'primary' : 'default'}
                variant={filter === f.value ? 'filled' : 'outlined'}
              />
            );
          })}
        </Stack>
      )}

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <Box sx={{ py: 2, textAlign: 'center', color: 'text.disabled' }}>
          <Typography variant="caption">
            {!canUpload && uploadDisabledHint ? uploadDisabledHint : 'No photos yet. Tap Add Photo to capture.'}
          </Typography>
        </Box>
      ) : (
        <ImageList cols={cols} rowHeight={rowHeight} gap={4} sx={{ mt: 0 }}>
          {filtered.map((photo, idx) => (
            <ImageListItem
              key={photo.id}
              sx={{ cursor: 'pointer', position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
            >
              <img
                src={photo.fileUrl}
                alt={photo.caption || photo.fileName || 'Photo'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onClick={() => openLightbox(photos.indexOf(photo))}
                loading="lazy"
              />
              {canDelete && (
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                  sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(211,47,47,0.8)' }, p: 0.3 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}

      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDelete={canDelete ? handleDelete : undefined}
        canDelete={canDelete}
      />
    </Box>
  );
}
