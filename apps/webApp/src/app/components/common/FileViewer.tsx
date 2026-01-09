import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Alert, IconButton, Slider, Typography } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';

interface FileViewerProps {
  url: string;
  fileName?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ url, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'unknown'>('unknown');

  // Image viewer state
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url) {
      setError('No file URL provided');
      setLoading(false);
      return;
    }

    // Detect file type from URL or fileName
    const fileExtension = (fileName || url).split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      setFileType('pdf');
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      setFileType('image');
    } else {
      setFileType('unknown');
    }

    setLoading(false);
  }, [url, fileName]);

  // Reset zoom and rotation when URL changes
  useEffect(() => {
    setZoom(100);
    setRotation(0);
  }, [url]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (fileType === 'unknown') {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Unsupported file type. Please use PDF or image files (JPG, PNG, GIF, WEBP).
        </Alert>
      </Box>
    );
  }

  if (fileType === 'pdf') {
    return (
      <Box sx={{ height: '100%', width: '100%', minHeight: '500px' }}>
        {/*
          Removed #toolbar=0 to enable native PDF controls (zoom, download, print, etc.)
          The browser's built-in PDF viewer will now show all controls.
        */}
        <iframe
          src={url}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title={fileName || 'PDF Viewer'}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load PDF file');
            setLoading(false);
          }}
        />
      </Box>
    );
  }

  // Image viewer with custom controls
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
      }}
    >
      {/* Controls toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0.5, sm: 1 },
          p: { xs: 0.5, sm: 1 },
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap',
        }}
      >
        <IconButton onClick={handleZoomOut} color="inherit" size="small" title="Zoom Out">
          <ZoomOutIcon sx={{ color: 'white' }} />
        </IconButton>
        <Box sx={{ width: { xs: 80, sm: 120 }, mx: 1, display: 'flex', alignItems: 'center' }}>
          <Slider
            value={zoom}
            min={25}
            max={300}
            onChange={(_, value) => setZoom(value as number)}
            size="small"
            sx={{
              color: 'white',
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
            }}
          />
        </Box>
        <IconButton onClick={handleZoomIn} color="inherit" size="small" title="Zoom In">
          <ZoomInIcon sx={{ color: 'white' }} />
        </IconButton>
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            minWidth: 45,
            textAlign: 'center',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {zoom}%
        </Typography>
        <Box sx={{ width: 1, bgcolor: 'rgba(255,255,255,0.3)', mx: 1, display: { xs: 'none', sm: 'block' } }} />
        <IconButton onClick={handleRotate} color="inherit" size="small" title="Rotate 90°">
          <RotateIcon sx={{ color: 'white' }} />
        </IconButton>
        <IconButton onClick={handleReset} color="inherit" size="small" title="Reset">
          <ResetIcon sx={{ color: 'white' }} />
        </IconButton>
      </Box>

      {/* Image container with pan support */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          cursor: zoom > 100 ? 'grab' : 'default',
          '&:active': {
            cursor: zoom > 100 ? 'grabbing' : 'default',
          },
        }}
      >
        <img
          src={url}
          alt={fileName || 'Image'}
          style={{
            maxWidth: zoom <= 100 ? '100%' : 'none',
            maxHeight: zoom <= 100 ? '100%' : 'none',
            width: zoom > 100 ? `${zoom}%` : 'auto',
            height: 'auto',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
            objectFit: 'contain',
          }}
          onError={() => {
            setError('Failed to load image');
          }}
        />
      </Box>
    </Box>
  );
};

export default FileViewer;
