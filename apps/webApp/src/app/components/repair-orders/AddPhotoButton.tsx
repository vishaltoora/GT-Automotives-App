import React, { useRef, useState } from 'react';
import { Button, Menu, MenuItem, CircularProgress } from '@mui/material';
import { CameraAlt, ExpandMore } from '@mui/icons-material';
import {
  ROMediaType,
  repairOrderRequests,
} from '../../requests/repair-order.requests';
import { useErrorHelpers } from '../../contexts/ErrorContext';

interface AddPhotoButtonProps {
  roId: string;
  roServiceId?: string;
  onUploaded: (media: any) => void;
  defaultType?: ROMediaType;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
}

const MEDIA_TYPES: { value: ROMediaType; label: string }[] = [
  { value: 'ARRIVAL_CONDITION', label: 'Arrival Condition' },
  { value: 'DAMAGE_DOCUMENTATION', label: 'Damage / Pre-existing' },
  { value: 'WORK_IN_PROGRESS', label: 'Work In Progress' },
  { value: 'WORK_COMPLETED', label: 'Work Completed' },
  { value: 'PARTS', label: 'Parts' },
  { value: 'OTHER', label: 'Other' },
];

export function AddPhotoButton({
  roId,
  roServiceId,
  onUploaded,
  defaultType,
  label,
  size = 'medium',
  disabled = false,
}: AddPhotoButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState<ROMediaType>(
    defaultType ?? 'OTHER'
  );
  const [uploading, setUploading] = useState(false);
  const { showApiError } = useErrorHelpers();

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
    let current: File | undefined;
    try {
      for (const file of files) {
        current = file;
        // Diagnostic: log the file we're about to upload (size/type matter on mobile)
        console.log('[RO photo upload] starting', {
          name: file.name,
          type: file.type,
          sizeKB: Math.round(file.size / 1024),
        });
        const uploaded = roServiceId
          ? await repairOrderRequests.uploadServiceMedia(
              roId,
              roServiceId,
              file,
              selectedType
            )
          : await repairOrderRequests.uploadMedia(
              roId,
              file,
              selectedType,
              undefined,
              roServiceId
            );
        onUploaded(uploaded);
      }
    } catch (err: any) {
      // Surface the real failure instead of silently swallowing it (was console.error only).
      console.error('[RO photo upload] failed', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        file: current && {
          name: current.name,
          type: current.type,
          sizeKB: Math.round(current.size / 1024),
        },
      });
      const sizeMB = current ? (current.size / (1024 * 1024)).toFixed(1) : '?';
      showApiError(
        err,
        `Photo upload failed${
          current ? ` (${current.name}, ${sizeMB} MB)` : ''
        }. ` + 'Large camera photos may exceed the upload size/time limit.'
      );
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
        disabled={uploading || disabled}
      >
        {uploading ? 'Uploading…' : label ?? 'Add Photo'}
      </Button>

      {/* Type selector menu (shown when no defaultType) */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {MEDIA_TYPES.map((t) => (
          <MenuItem key={t.value} onClick={() => handleTypeSelect(t.value)}>
            {t.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
