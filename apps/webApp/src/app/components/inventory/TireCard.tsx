import React from 'react';
import {
  Card,
  CardContent,
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

// Brand configuration with colors
const BRAND_CONFIG: Record<string, { bg: string; text: string; accent?: string }> = {
  'Michelin': { bg: '#1a237e', text: '#ffffff', accent: '#ffd700' },
  'Bridgestone': { bg: '#e53935', text: '#ffffff', accent: '#ffcdd2' },
  'Goodyear': { bg: '#0d47a1', text: '#ffc107', accent: '#ffc107' },
  'Continental': { bg: '#ff6f00', text: '#000000', accent: '#fff3e0' },
  'BF Goodrich': { bg: '#d32f2f', text: '#ffffff', accent: '#ffcdd2' },
  'Pirelli': { bg: '#ffc107', text: '#000000', accent: '#fff8e1' },
  'Dunlop': { bg: '#212121', text: '#ffffff', accent: '#ffc107' },
  'Yokohama': { bg: '#1565c0', text: '#ffffff', accent: '#bbdefb' },
  'Hankook': { bg: '#ff5722', text: '#ffffff', accent: '#ffccbc' },
  'Kumho': { bg: '#c62828', text: '#ffffff', accent: '#ffcdd2' },
  'Firestone': { bg: '#b71c1c', text: '#ffffff', accent: '#ffcdd2' },
  'Cooper': { bg: '#2e7d32', text: '#ffffff', accent: '#c8e6c9' },
  'Toyo': { bg: '#e65100', text: '#ffffff', accent: '#ffe0b2' },
  'Falken': { bg: '#1976d2', text: '#ffffff', accent: '#bbdefb' },
  'Nitto': { bg: '#424242', text: '#ffffff', accent: '#bdbdbd' },
};

// Default brand color for unknown brands
const DEFAULT_BRAND_CONFIG = { bg: '#37474f', text: '#ffffff', accent: '#b0bec5' };

// Tire wheel SVG icon component
const TireIcon: React.FC<{ size: number; color: string; accentColor: string }> = ({ size, color, accentColor }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer tire ring */}
    <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="3" fill="none" opacity="0.3" />
    <circle cx="50" cy="50" r="42" stroke={color} strokeWidth="8" fill="none" opacity="0.5" />
    {/* Tire tread pattern */}
    <circle cx="50" cy="50" r="38" stroke={accentColor} strokeWidth="2" fill="none" strokeDasharray="8 4" />
    {/* Wheel rim */}
    <circle cx="50" cy="50" r="25" fill={color} opacity="0.2" />
    <circle cx="50" cy="50" r="22" stroke={color} strokeWidth="2" fill="none" />
    {/* Center hub */}
    <circle cx="50" cy="50" r="12" fill={color} opacity="0.4" />
    <circle cx="50" cy="50" r="8" fill={accentColor} opacity="0.8" />
    {/* Spokes */}
    <line x1="50" y1="28" x2="50" y2="15" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="50" y1="72" x2="50" y2="85" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="28" y1="50" x2="15" y2="50" stroke={color} strokeWidth="2" opacity="0.6" />
    <line x1="72" y1="50" x2="85" y2="50" stroke={color} strokeWidth="2" opacity="0.6" />
    {/* Diagonal spokes */}
    <line x1="34" y1="34" x2="24" y2="24" stroke={color} strokeWidth="2" opacity="0.4" />
    <line x1="66" y1="66" x2="76" y2="76" stroke={color} strokeWidth="2" opacity="0.4" />
    <line x1="34" y1="66" x2="24" y2="76" stroke={color} strokeWidth="2" opacity="0.4" />
    <line x1="66" y1="34" x2="76" y2="24" stroke={color} strokeWidth="2" opacity="0.4" />
  </svg>
);

// Custom Brand Display component
interface BrandDisplayProps {
  brand: string;
  height: number;
  type: TireType;
}

const BrandDisplay: React.FC<BrandDisplayProps> = ({ brand, height, type }) => {
  const config = BRAND_CONFIG[brand] || DEFAULT_BRAND_CONFIG;
  const iconSize = height > 150 ? 80 : height > 100 ? 60 : 50;

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        backgroundColor: config.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        gap: 1,
      }}
    >
      {/* Tire wheel icon */}
      <TireIcon size={iconSize} color={config.text} accentColor={config.accent || config.text} />

      {/* Brand name */}
      <Typography
        sx={{
          color: config.text,
          fontWeight: 'bold',
          fontSize: height > 150 ? '1.4rem' : height > 100 ? '1rem' : '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          textAlign: 'center',
          px: 1,
          textShadow: config.text === '#ffffff' ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {brand}
      </Typography>

      {/* Tire type emoji badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          fontSize: height > 150 ? '1.3rem' : '1rem',
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '50%',
          width: height > 150 ? 32 : 26,
          height: height > 150 ? 32 : 26,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {getTireEmoji(type)}
      </Box>
    </Box>
  );
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

        {/* Custom Brand Display */}
        <BrandDisplay
          brand={tire.brand}
          height={isMobile ? 100 : 140}
          type={tire.type}
        />

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

      {/* Custom Brand Display */}
      <BrandDisplay
        brand={tire.brand}
        height={isMobile ? 120 : 240}
        type={tire.type}
      />

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