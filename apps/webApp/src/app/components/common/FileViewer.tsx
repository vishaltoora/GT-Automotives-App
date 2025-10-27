import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import ReactPanZoom from 'react-image-pan-zoom-rotate';

interface FileViewerProps {
  url: string;
  fileName?: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ url, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'unknown'>('unknown');

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

  // Image with pan/zoom capability
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        minHeight: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <ReactPanZoom
        image={url}
        alt={fileName || 'Image'}
      />
    </Box>
  );
};

export default FileViewer;
