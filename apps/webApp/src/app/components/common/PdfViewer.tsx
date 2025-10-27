import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Toolbar,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface PdfViewerProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ open, onClose, pdfUrl, title = 'Document Viewer' }) => {
  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title.replace(/\s+/g, '_') + '.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {title}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              variant="outlined"
            >
              Download
            </Button>
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpenInNewTab}
              variant="outlined"
            >
              Open in New Tab
            </Button>
            <IconButton edge="end" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {/*
          Use an iframe with the PDF URL directly (NO #toolbar=0 parameter).
          This will use the browser's native PDF viewer with ALL controls enabled:
          - Zoom in/out
          - Page navigation
          - Print
          - Download
          - Rotate
          - Search
          - Presentation mode

          IMPORTANT: For this to work properly, the Azure Blob Storage URL must:
          1. Return Content-Type: application/pdf header
          2. Allow cross-origin requests (CORS enabled)
          3. Not force download via Content-Disposition: attachment header
        */}
        <iframe
          src={pdfUrl}
          title={title}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            display: 'block',
            minHeight: 'calc(90vh - 64px)', // Full height minus toolbar
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
