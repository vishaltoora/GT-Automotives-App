import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import FileViewer from './FileViewer';

interface FileViewerDialogProps {
  open: boolean;
  onClose: () => void;
  url: string;
  fileName?: string;
  title?: string;
}

const FileViewerDialog: React.FC<FileViewerDialogProps> = ({
  open,
  onClose,
  url,
  fileName,
  title = 'File Preview',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : '90vh',
        },
      }}
    >
      {/* Header with AppBar for better visibility on mobile */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mr: 2,
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => window.open(url, '_blank')}
              color="primary"
              title="Open in New Tab"
            >
              <OpenInNewIcon />
            </IconButton>
            <IconButton
              onClick={onClose}
              color="inherit"
              edge="end"
              title="Close"
              sx={{
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: '100%',
            width: '100%',
            overflow: 'auto',
          }}
        >
          <FileViewer url={url} fileName={fileName} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerDialog;
