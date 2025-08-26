import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Chip,
  Stack,
  IconButton,
  Alert,
  Skeleton,
  Divider,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogActions,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Warning as WarningIcon,
  PhotoLibrary as GalleryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  TireType,
  TireCondition,
} from '@gt-automotive/shared-interfaces';
import { useAuth } from '../../hooks/useAuth';
import { useTire, useDeleteTire } from '../../hooks/useTires';
import StockAdjustmentDialog from '../../components/inventory/StockAdjustmentDialog';

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatCondition = (condition: TireCondition): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function TireDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isStaff } = useAuth();

  // State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Data fetching
  const { data: tire, isLoading, isError, error } = useTire(id || '');
  const deleteMutation = useDeleteTire();

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={150} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isError || !tire) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'Tire not found'}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/inventory')}
          startIcon={<BackIcon />}
        >
          Back to Inventory
        </Button>
      </Box>
    );
  }

  const isLowStock = tire.quantity <= tire.minStock;
  const isOutOfStock = tire.quantity === 0;
  const placeholderImage = `https://via.placeholder.com/400x300/f5f5f5/9e9e9e?text=${encodeURIComponent(tire.brand + ' - ' + tire.size)}`;
  const primaryImage = tire.imageUrl || placeholderImage;
  const allImages = tire.images || [primaryImage];

  const handleEdit = () => {
    navigate(`/inventory/${tire.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(tire.id);
      setShowDeleteDialog(false);
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to delete tire:', error);
    }
  };

  const handlePrint = () => {
    // Generate a printable label
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tire Label - ${tire.brand} - ${tire.size}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .label { border: 2px solid #000; padding: 20px; max-width: 400px; }
              .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .info { margin-bottom: 5px; }
              .price { font-size: 24px; font-weight: bold; color: #1976d2; }
              .barcode { margin-top: 20px; text-align: center; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="title">${tire.brand} - ${tire.size}</div>
              <div class="info">Size: ${tire.size}</div>
              <div class="info">Type: ${formatTireType(tire.type)}</div>
              <div class="info">Condition: ${formatCondition(tire.condition)}</div>
              <div class="info">Stock: ${tire.quantity}</div>
              ${tire.location ? `<div class="info">Location: ${tire.location}</div>` : ''}
              <div class="price">$${tire.price.toFixed(2)}</div>
              <div class="barcode">SKU: ${tire.id}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tire.brand} - ${tire.size}`,
          text: `Check out this tire: ${tire.brand} - ${tire.size}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification (you'd implement this)
      alert('Link copied to clipboard!');
    }
  };

  const handleImageClick = () => {
    setShowImageGallery(true);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/inventory')}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            {tire.brand}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {tire.size}
          </Typography>
        </Box>
        
        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <IconButton onClick={handleShare} title="Share">
            <ShareIcon />
          </IconButton>
          
          <IconButton onClick={handlePrint} title="Print Label">
            <PrintIcon />
          </IconButton>
          
          {(isStaff || isAdmin) && (
            <Button
              variant="outlined"
              onClick={handleEdit}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )}
          
          {isAdmin && (
            <LoadingButton
              variant="outlined"
              color="error"
              onClick={() => setShowDeleteDialog(true)}
              startIcon={<DeleteIcon />}
              loading={deleteMutation.isPending}
            >
              Delete
            </LoadingButton>
          )}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Images */}
          <Card sx={{ mb: 3 }}>
            <CardMedia
              component="img"
              height="300"
              image={primaryImage}
              alt={`${tire.brand} - ${tire.size}`}
              sx={{ 
                objectFit: 'cover',
                cursor: allImages.length > 1 ? 'pointer' : 'default',
              }}
              onClick={() => allImages.length > 1 && handleImageClick()}
            />
            
            {allImages.length > 1 && (
              <Box sx={{ p: 2 }}>
                <ImageList sx={{ height: 80 }} cols={isMobile ? 3 : 6} rowHeight={80}>
                  {allImages.map((image, index) => (
                    <ImageListItem
                      key={index}
                      sx={{ 
                        cursor: 'pointer',
                        border: image === primaryImage ? 2 : 1,
                        borderColor: image === primaryImage ? 'primary.main' : 'divider',
                        borderRadius: 1,
                      }}
                      onClick={() => handleImageClick()}
                    >
                      <img
                        src={image}
                        alt={`${tire.brand} ${index + 1}`}
                        loading="lazy"
                        style={{ objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
                
                <Button
                  size="small"
                  startIcon={<GalleryIcon />}
                  onClick={() => setShowImageGallery(true)}
                  sx={{ mt: 1 }}
                >
                  View Gallery ({allImages.length} images)
                </Button>
              </Box>
            )}
          </Card>

          {/* Tire Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tire Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Brand
                    </Typography>
                    <Typography variant="body1">
                      {tire.brand}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Size
                    </Typography>
                    <Typography variant="body1">
                      {tire.size}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip 
                      label={formatTireType(tire.type)} 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Condition
                    </Typography>
                    <Chip 
                      label={formatCondition(tire.condition)} 
                      color={tire.condition === TireCondition.NEW ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                  
                  {tire.location && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Storage Location
                      </Typography>
                      <Typography variant="body1">
                        {tire.location}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {tire.notes && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {tire.notes}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Price & Stock */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Price & Availability
              </Typography>
              
              <Typography variant="h3" color="primary" gutterBottom>
                ${tire.price.toFixed(2)}
              </Typography>
              
              {isAdmin && tire.cost && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cost: ${tire.cost.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Margin: ${(tire.price - tire.cost).toFixed(2)} ({(((tire.price - tire.cost) / tire.price) * 100).toFixed(1)}%)
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InventoryIcon color={isLowStock ? 'error' : 'action'} />
                <Typography 
                  variant="h6" 
                  color={isLowStock ? 'error' : 'text.primary'}
                >
                  {tire.quantity} in stock
                </Typography>
              </Box>

              {isLowStock && (
                <Alert 
                  severity={isOutOfStock ? 'error' : 'warning'} 
                  sx={{ mb: 2 }}
                  icon={<WarningIcon />}
                >
                  {isOutOfStock ? 'Out of stock' : `Low stock (min: ${tire.minStock})`}
                </Alert>
              )}

              {(isStaff || isAdmin) && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowStockDialog(true)}
                  startIcon={<InventoryIcon />}
                >
                  Adjust Stock
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {tire.id}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Minimum Stock
                </Typography>
                <Typography variant="body2">
                  {tire.minStock} units
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Added
                </Typography>
                <Typography variant="body2">
                  {formatDate(tire.createdAt)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {formatDate(tire.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={showStockDialog}
        tire={tire}
        onClose={() => setShowStockDialog(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Delete Tire?
          </Typography>
          <Typography>
            Are you sure you want to delete this tire from inventory? This action cannot be undone.
          </Typography>
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2">
              {tire.brand} - {tire.size}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current stock: {tire.quantity} units
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <LoadingButton
            onClick={handleDelete}
            color="error"
            loading={deleteMutation.isPending}
          >
            Delete Tire
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog
        open={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogActions sx={{ p: 1 }}>
          <IconButton onClick={() => setShowImageGallery(false)}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>
          <Grid container spacing={2}>
            {allImages.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <img
                  src={image}
                  alt={`${tire.brand} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 8,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TireDetails;