import React, { useRef, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { CameraAlt, ExpandMore } from '@mui/icons-material';
import { ROMediaType, repairOrderRequests } from '../../requests/repair-order.requests';

interface AddPhotoButtonProps {
  roId: string;
  roServiceId?: string;
  onUploaded: (media: any) => void;
  defaultType?: ROMediaType;
  label?: string;
  size?: 'small' | 'medium';
}

const MEDIA_TYPES: { value: ROMediaType; label: string }[] = [
  { value: 'ARRIVAL_CONDITION', label: 'Arrival Condition' },
  { value: 'DAMAGE_DOCUMENTATION', label: 'Damage / Pre-existing' },
  { value: 'WORK_IN_PROGRESS', label: 'Work In Progress' },
  { value: 'WORK_COMPLETED', label: 'Work Completed' },
  { value: 'PARTS', label: 'Parts' },
  { value: 'OTHER', label: 'Other' },
];

export function AddPhotoButton({ roId, roServiceId, onUploaded, defaultType, label, size = 'medium' }: AddPhotoButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState<ROMediaType>(defaultType ?? 'OTHER');
  const [uploading, setUploading] = useState(false);

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const handleTypeSelect = (type: ROMediaType) => {
    setSelectedType(type);
    setMenuAnchor(null);
    inputRef.current?.click();
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLElement>) => {
    if (defaultType) {
      inputRef.current?.click();
    } else {
      setMenuAnchor(e.currentTarget);
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = roServiceId
          ? await repairOrderRequests.uploadServiceMedia(roId, roServiceId, file, selectedType)
          : await repairOrderRequests.uploadMedia(roId, file, selectedType, undefined, roServiceId);
        onUploaded(uploaded);
      }
    } catch (err) {
      console.error('Photo upload failed', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Hidden file input — capture="environment" opens rear camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        capture={isMobile ? 'environment' : undefined}
        style={{ display: 'none' }}
        onChange={handleFiles}
      />

      <Button
        size={size}
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={16} /> : <CameraAlt />}
        endIcon={!defaultType ? <ExpandMore /> : undefined}
        onClick={handleButtonClick}
        disabled={uploading}
      >
        {uploading ? 'Uploading…' : (label ?? 'Add Photo')}
      </Button>

      {/* Type selector menu (shown when no defaultType) */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {MEDIA_TYPES.map((t) => (
          <MenuItem key={t.value} onClick={() => handleTypeSelect(t.value)}>
            {t.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
