import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { colors } from '../../theme/colors';

export interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  details?: string;
  showDetails?: boolean;
  confirmText?: string;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  title,
  message,
  severity = 'error',
  details,
  showDetails,
  confirmText = 'OK',
}) => {
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  const getSeverityIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningIcon sx={{ color: colors.semantic.warning }} />;
      case 'info':
        return <InfoIcon sx={{ color: colors.semantic.info }} />;
      default:
        return <ErrorIcon sx={{ color: colors.semantic.error }} />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'warning':
        return colors.semantic.warning;
      case 'info':
        return colors.semantic.info;
      default:
        return colors.semantic.error;
    }
  };

  const getDefaultTitle = () => {
    switch (severity) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          '& .MuiDialogTitle-root': {
            backgroundColor: `${getSeverityColor()}10`,
            borderBottom: `1px solid ${getSeverityColor()}30`,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {getSeverityIcon()}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title || getDefaultTitle()}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" sx={{ mb: details ? 2 : 0 }}>
          {message}
        </Typography>

        {details && (
          <Box>
            <Button
              variant="text"
              size="small"
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              sx={{ 
                mb: 1,
                textTransform: 'none',
                color: getSeverityColor(),
              }}
            >
              {detailsExpanded ? 'Hide Details' : 'Show Details'}
            </Button>
            
            {(detailsExpanded || showDetails) && (
              <Alert 
                severity={severity} 
                variant="outlined"
                sx={{ 
                  mt: 1,
                  '& .MuiAlert-message': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  },
                }}
              >
                {details}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color={severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'primary'}
          sx={{ minWidth: 80 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;