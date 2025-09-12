import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Add as AddIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useUploadTireImage, useDeleteTireImage } from '../../hooks/useTires';

interface TireImageUploadProps {
  tireId?: string;
  existingImages?: string[];
  primaryImageUrl?: string;
  onImagesChange?: (images: string[]) => void;
  onPrimaryChange?: (imageUrl: string) => void;
  maxImages?: number;
  maxSizeBytes?: number;
  disabled?: boolean;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function TireImageUpload({
  tireId,
  existingImages = [],
  primaryImageUrl,
  onImagesChange,
  onPrimaryChange,
  maxImages = DEFAULT_MAX_IMAGES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
}: TireImageUploadProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const uploadMutation = useUploadTireImage();
  const deleteMutation = useDeleteTireImage();

  const totalImages = existingImages.length + selectedFiles.length;
  const canAddMore = totalImages < maxImages && !disabled;

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeBytes / 1024 / 1024}MB`;
    }
    
    if (!file.type.startsWith('image/')) {
      return 'Invalid file type. Please use JPG, PNG, or WebP';
    }
    
    return null;
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newErrors: string[] = [];

    // Check total image limit
    if (totalImages + fileArray.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed`);
      setErrors(newErrors);
      return;
    }

    const validFiles: ImageFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: `${Date.now()}-${Math.random()}`,
        });
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setErrors(newErrors);

    // Auto-upload if tire ID is provided
    if (tireId) {
      validFiles.forEach(uploadFile);
    }
  };

  const [isDragActive, setIsDragActive] = useState(false);

  const uploadFile = async (imageFile: ImageFile) => {
    if (!tireId) return;

    try {
      setUploadProgress(prev => ({ ...prev, [imageFile.id]: 0 }));
      
      // Simulate progress (in real app, use upload progress callback)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[imageFile.id] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [imageFile.id]: current + 10 };
        });
      }, 100);

      const result = await uploadMutation.mutateAsync({
        tireId,
        file: imageFile.file,
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [imageFile.id]: 100 }));

      // Remove from selected files and add to existing images
      setSelectedFiles(prev => prev.filter(f => f.id !== imageFile.id));
      
      if (onImagesChange) {
        onImagesChange([...existingImages, result.url]);
      }

      // Set as primary if it's the first image
      if (existingImages.length === 0 && onPrimaryChange) {
        onPrimaryChange(result.url);
      }

      // Clean up progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [imageFile.id]: _, ...rest } = prev;
          return rest;
        });
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setErrors(prev => [...prev, `Failed to upload ${imageFile.file.name}`]);
      setUploadProgress(prev => {
        const { [imageFile.id]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
    
    setUploadProgress(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const removeExistingImage = async (imageUrl: string) => {
    if (!tireId) return;

    try {
      // Extract image ID from URL (you'll need to implement this based on your URL structure)
      const imageId = imageUrl.split('/').pop() || '';
      
      await deleteMutation.mutateAsync({ tireId, imageId });
      
      if (onImagesChange) {
        onImagesChange(existingImages.filter(url => url !== imageUrl));
      }

      // Update primary image if deleted
      if (primaryImageUrl === imageUrl && onPrimaryChange) {
        const remainingImages = existingImages.filter(url => url !== imageUrl);
        onPrimaryChange(remainingImages[0] || '');
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      setErrors(prev => [...prev, 'Failed to delete image']);
    }
  };

  const setPrimaryImage = (imageUrl: string) => {
    if (onPrimaryChange) {
      onPrimaryChange(imageUrl);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tire Images ({totalImages}/{maxImages})
      </Typography>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {errors.map((error, index) => (
            <Alert 
              key={index} 
              severity="error" 
              onClose={() => setErrors(prev => prev.filter((_, i) => i !== index))}
            >
              {error}
            </Alert>
          ))}
        </Stack>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Images
          </Typography>
          <Grid container spacing={2}>
            {existingImages.map((imageUrl, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={imageUrl}>
                <Card>
                  <CardMedia
                    component="img"
                    height="120"
                    image={imageUrl}
                    alt={`Tire image ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                    <IconButton
                      size="small"
                      onClick={() => setPrimaryImage(imageUrl)}
                      color={primaryImageUrl === imageUrl ? 'primary' : 'default'}
                      disabled={disabled}
                    >
                      {primaryImageUrl === imageUrl ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                    
                    <IconButton
                      size="small"
                      onClick={() => removeExistingImage(imageUrl)}
                      color="error"
                      disabled={disabled}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                  
                  {primaryImageUrl === imageUrl && (
                    <Chip
                      label="Primary"
                      size="small"
                      color="primary"
                      sx={{ position: 'absolute', top: 4, left: 4 }}
                    />
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Selected Files (Pending Upload) */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploading...
          </Typography>
          <Grid container spacing={2}>
            {selectedFiles.map((imageFile) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={imageFile.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="120"
                    image={imageFile.preview}
                    alt="Preview"
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  {uploadProgress[imageFile.id] !== undefined && (
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress[imageFile.id]} 
                      sx={{ height: 4 }}
                    />
                  )}
                  
                  <CardActions sx={{ p: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      onClick={() => removeSelectedFile(imageFile.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <Paper
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            p: 3,
            border: `2px dashed ${theme.palette.divider}`,
            borderColor: isDragActive ? theme.palette.primary.main : theme.palette.divider,
            bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
            cursor: 'pointer',
            textAlign: 'center',
            transition: theme.transitions.create(['border-color', 'background-color']),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          
          <Stack spacing={2} alignItems="center">
            <Box sx={{ color: isDragActive ? 'primary.main' : 'text.secondary' }}>
              {isDragActive ? <UploadIcon sx={{ fontSize: 48 }} /> : <ImageIcon sx={{ fontSize: 48 }} />}
            </Box>
            
            <Typography variant="h6" color={isDragActive ? 'primary.main' : 'text.primary'}>
              {isDragActive ? 'Drop images here...' : 'Upload Tire Images'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Drag & drop images here, or click to select files
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose Files
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              Supports JPG, PNG, WebP • Max {maxSizeBytes / 1024 / 1024}MB per file • Max {maxImages} images
            </Typography>
          </Stack>
        </Paper>
      )}

      {!canAddMore && totalImages >= maxImages && (
        <Alert severity="info">
          Maximum number of images ({maxImages}) reached.
        </Alert>
      )}
    </Box>
  );
}

export default TireImageUpload;