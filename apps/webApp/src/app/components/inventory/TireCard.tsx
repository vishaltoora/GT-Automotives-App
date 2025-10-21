import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Chip,
  Button,
  IconButton,
  Box,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { TireResponseDto as ITire } from '@gt-automotive/data';
// Define enums locally to avoid Prisma client browser issues
const TireType = {
  ALL_SEASON: 'ALL_SEASON',
  SUMMER: 'SUMMER',
  WINTER: 'WINTER',
  PERFORMANCE: 'PERFORMANCE',
  OFF_ROAD: 'OFF_ROAD',
  RUN_FLAT: 'RUN_FLAT',
} as const;

const TireCondition = {
  NEW: 'NEW',
  USED_EXCELLENT: 'USED_EXCELLENT',
  USED_GOOD: 'USED_GOOD',
  USED_FAIR: 'USED_FAIR',
} as const;

type TireType = typeof TireType[keyof typeof TireType];
type TireCondition = typeof TireCondition[keyof typeof TireCondition];

// Helper function to get emoji based on tire type
const getTireEmoji = (type: TireType): string => {
  switch (type) {
    case TireType.ALL_SEASON:
      return '🌤️'; // All weather conditions
    case TireType.SUMMER:
      return '☀️'; // Summer sun
    case TireType.WINTER:
      return '❄️'; // Winter snowflake
    case TireType.PERFORMANCE:
      return '🏁'; // Racing/performance
    case TireType.OFF_ROAD:
      return '🏔️'; // Mountain/rugged terrain
    case TireType.RUN_FLAT:
      return '🛡️'; // Protection/safety
    default:
      return '🛞'; // Default tire
  }
};

interface TireCardProps {
  tire: ITire;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  showCost?: boolean;
  variant?: 'compact' | 'detailed';
  showActions?: boolean;
}

const TIRE_TYPE_COLORS: Record<TireType, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  [TireType.ALL_SEASON]: 'primary',
  [TireType.SUMMER]: 'warning',
  [TireType.WINTER]: 'info',
  [TireType.PERFORMANCE]: 'secondary',
  [TireType.OFF_ROAD]: 'success',
  [TireType.RUN_FLAT]: 'error',
};

const CONDITION_COLORS: Record<TireCondition, 'success' | 'warning' | 'error'> = {
  [TireCondition.NEW]: 'success',
  [TireCondition.USED_EXCELLENT]: 'success',
  [TireCondition.USED_GOOD]: 'warning',
  [TireCondition.USED_FAIR]: 'error',
};

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatCondition = (condition: TireCondition): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function TireCard({
  tire,
  onEdit,
  onDelete,
  onView,
  showCost = false,
  variant = 'detailed',
  showActions = true,
}: TireCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLowStock = tire.quantity <= (tire.minStock || 5);
  const isOutOfStock = tire.quantity === 0;
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete();
  };

  const placeholderImage = `https://via.placeholder.com/300x200/f5f5f5/9e9e9e?text=${encodeURIComponent(tire.brand + ' ' + tire.size)}`;

  if (variant === 'compact') {
    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
          transition: theme.transitions.create(['transform', 'box-shadow']),
        }}
      >
        {/* Low Stock Warning */}
        {isLowStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <Tooltip title={isOutOfStock ? 'Out of Stock' : 'Low Stock'}>
              <WarningIcon 
                color={isOutOfStock ? 'error' : 'warning'} 
                fontSize="small"
              />
            </Tooltip>
          </Box>
        )}

        <Box sx={{ position: 'relative', height: isMobile ? 100 : 140 }}>
          <CardMedia
            component="img"
            height={isMobile ? "100" : "140"}
            image={(tire as any).brandImageUrl || tire.imageUrl || placeholderImage}
            alt={`${tire.brand} ${tire.size}`}
            sx={{ objectFit: 'contain', backgroundColor: 'grey.50' }}
            onError={(e) => {
              // Replace with emoji fallback on error
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.emoji-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'emoji-fallback';
                fallback.style.cssText = `
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f5f5f5;
                  font-size: ${isMobile ? '30px' : '40px'};
                  border: 1px solid #e0e0e0;
                `;
                fallback.textContent = getTireEmoji(tire.type);
                parent.appendChild(fallback);
              }
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: isMobile ? 1 : 2 }}>
          {tire.name && (
            <Typography variant={isMobile ? 'body1' : 'h6'} component="h3" noWrap fontWeight="medium">
              {tire.name}
            </Typography>
          )}
          <Typography variant={tire.name ? "caption" : (isMobile ? "body2" : "h6")} component={tire.name ? "p" : "h3"} color={tire.name ? "text.secondary" : "inherit"} noWrap>
            {tire.brand}
          </Typography>

          <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary" gutterBottom>
            {tire.size}
          </Typography>

          {!isMobile && tire.sku && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }} gutterBottom>
              SKU: {tire.sku}
            </Typography>
          )}

          {!isMobile && tire.location && (
            <Typography variant="body2" color="primary" gutterBottom sx={{ fontWeight: 500 }}>
              📍 {tire.location}
            </Typography>
          )}

          <Stack direction="row" spacing={0.5} sx={{ mb: isMobile ? 0.5 : 1 }}>
            <Chip
              label={formatTireType(tire.type)}
              size="small"
              color={TIRE_TYPE_COLORS[tire.type]}
              variant="outlined"
              sx={{
                fontSize: isMobile ? '0.65rem' : undefined,
                height: isMobile ? 20 : undefined,
              }}
            />
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant={isMobile ? 'body1' : 'h6'} color="primary" fontWeight="bold">
              ${tire.price.toFixed(2)}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <InventoryIcon fontSize="small" color="action" sx={{ fontSize: isMobile ? 16 : undefined }} />
              <Typography variant={isMobile ? 'caption' : 'body2'} color={isLowStock ? 'error' : 'text.secondary'} fontWeight={isLowStock ? 'bold' : 'normal'}>
                {tire.quantity}
              </Typography>
            </Stack>
          </Box>
        </CardContent>

        {showActions && (
          <CardActions sx={{ p: isMobile ? 0.5 : 1, pt: 0, gap: 0.5 }}>
            <Button size="small" onClick={onView} startIcon={!isMobile && <ViewIcon />} sx={{ fontSize: isMobile ? '0.7rem' : undefined }}>
              View
            </Button>
            {onEdit && (
              <Button size="small" onClick={onEdit} startIcon={!isMobile && <EditIcon />} sx={{ fontSize: isMobile ? '0.7rem' : undefined }}>
                Edit
              </Button>
            )}
          </CardActions>
        )}
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        },
        transition: theme.transitions.create(['transform', 'box-shadow']),
      }}
    >
      {/* Low Stock Warning */}
      {isLowStock && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: isOutOfStock ? 'error.main' : 'warning.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <WarningIcon fontSize="small" />
          <Typography variant="caption">
            {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
          </Typography>
        </Box>
      )}

      <Box sx={{ position: 'relative', height: isMobile ? 120 : 240 }}>
        <CardMedia
          component="img"
          height={isMobile ? "120" : "240"}
          image={(tire as any).brandImageUrl || tire.imageUrl || placeholderImage}
          alt={`${tire.brand} ${tire.size}`}
          sx={{ objectFit: 'contain', backgroundColor: 'grey.50' }}
          onError={(e) => {
            // Replace with emoji fallback on error
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.emoji-fallback')) {
              const fallback = document.createElement('div');
              fallback.className = 'emoji-fallback';
              fallback.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f5f5;
                font-size: ${isMobile ? '40px' : '60px'};
                border: 1px solid #e0e0e0;
              `;
              fallback.textContent = getTireEmoji(tire.type);
              parent.appendChild(fallback);
            }
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 2 }}>
        {tire.name && (
          <Typography variant={isMobile ? 'body1' : 'h5'} component="h2" gutterBottom fontWeight="medium">
            {tire.name}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Typography variant={tire.name ? (isMobile ? 'body2' : 'h6') : (isMobile ? 'h6' : 'h5')} component={tire.name ? "h3" : "h2"} color={tire.name ? "text.secondary" : "inherit"}>
              {tire.brand}
            </Typography>
            <Chip
              label={formatCondition(tire.condition)}
              color={CONDITION_COLORS[tire.condition]}
              variant="outlined"
              size="small"
              sx={{
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                height: isMobile ? 18 : 22,
              }}
            />
          </Box>
          {showActions && (onEdit || onDelete) && (
            <>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                aria-label="more actions"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {onEdit && (
                  <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                  </MenuItem>
                )}
                {onDelete && (
                  <MenuItem onClick={handleDelete}>
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>

        <Typography variant={isMobile ? 'body2' : 'h6'} color="text.secondary" sx={{ mb: isMobile ? 1 : 2 }}>
          {tire.size} • <Box component="span" sx={{ fontWeight: 'bold' }}>{formatTireType(tire.type)}</Box>
        </Typography>

        {!isMobile && tire.sku && (
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mb: 1 }}>
            SKU: {tire.sku}
          </Typography>
        )}

        {!isMobile && tire.location && (
          <Typography variant="body1" color="primary" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
            📍 Location: {tire.location}
          </Typography>
        )}

        <Box sx={{ mb: isMobile ? 1 : 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant={isMobile ? 'h6' : 'h4'} color="primary" fontWeight="bold">
              ${tire.price.toFixed(2)}
            </Typography>

            {showCost && tire.cost && (
              <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                Cost: ${tire.cost.toFixed(2)}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <InventoryIcon fontSize="small" color="action" sx={{ fontSize: isMobile ? 16 : undefined }} />
            <Typography variant={isMobile ? 'body2' : 'body1'} color={isLowStock ? 'error' : 'text.primary'} fontWeight={isLowStock ? 'bold' : 'normal'}>
              {tire.quantity} in stock
            </Typography>
          </Box>
        </Box>

        {!isMobile && tire.notes && (
          <Typography variant="body2" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontStyle: 'italic',
          }}>
            {tire.notes}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default TireCard;