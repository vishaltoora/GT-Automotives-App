import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  Chip,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { 
  useInventoryReport, 
  useLowStockTires, 
  useInvalidateTireQueries 
} from '../../hooks/useTires';
import { useAuth } from '../../hooks/useAuth';
import { TireType } from '@gt-automotive/shared-interfaces';
import TireListSimple from './TireListSimple';

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function InventoryDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAdmin, isStaff } = useAuth();

  const [showRecentTires, setShowRecentTires] = useState(true);

  // Data fetching
  const { 
    data: inventoryReport, 
    isLoading: reportLoading,
    isError: reportError 
  } = useInventoryReport(undefined, isAdmin);

  const { 
    data: lowStockTires = [], 
    isLoading: lowStockLoading 
  } = useLowStockTires(isStaff || isAdmin);

  const invalidateQueries = useInvalidateTireQueries();

  const handleRefresh = () => {
    invalidateQueries();
  };

  const handleViewAllInventory = () => {
    navigate('/inventory');
  };

  const handleAddTire = () => {
    navigate('/inventory/new');
  };

  const handleViewLowStock = () => {
    navigate('/inventory?filter=lowStock');
  };

  // Calculate some additional metrics
  const totalValue = inventoryReport?.totalValue || 0;
  const totalCost = inventoryReport?.totalCost || 0;
  const totalItems = inventoryReport?.totalItems || 0;
  const grossMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue) * 100 : 0;

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary',
    trend,
    isLoading = false
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    trend?: 'up' | 'down';
    isLoading?: boolean;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            {isLoading ? (
              <LinearProgress sx={{ width: 100, mb: 1 }} />
            ) : (
              <Typography variant="h4" component="div" color={`${color}.main`}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {trend && (
                  trend === 'up' ? 
                    <TrendingUpIcon fontSize="small" color="success" /> :
                    <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, color: `${color}.contrastText` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of tire inventory and stock levels
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <IconButton onClick={handleRefresh} title="Refresh Data">
            <RefreshIcon />
          </IconButton>
          
          <Button
            variant="outlined"
            onClick={handleViewAllInventory}
            startIcon={<ViewListIcon />}
          >
            View All
          </Button>
          
          {(isStaff || isAdmin) && (
            <Button
              variant="contained"
              onClick={handleAddTire}
              startIcon={<AddIcon />}
            >
              Add Tire
            </Button>
          )}
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={totalItems.toLocaleString()}
            subtitle="Active inventory"
            icon={<InventoryIcon />}
            color="primary"
            isLoading={reportLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inventory Value"
            value={formatCurrency(totalValue)}
            subtitle="Current stock value"
            icon={<MoneyIcon />}
            color="success"
            isLoading={reportLoading}
          />
        </Grid>
        
        {isAdmin && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Gross Margin"
              value={`${grossMargin.toFixed(1)}%`}
              subtitle={`Cost: ${formatCurrency(totalCost)}`}
              icon={<TrendingUpIcon />}
              color="info"
              isLoading={reportLoading}
            />
          </Grid>
        )}
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={lowStockTires.length}
            subtitle={lowStockTires.length > 0 ? 'Needs attention' : 'All good'}
            icon={<WarningIcon />}
            color={lowStockTires.length > 0 ? 'warning' : 'success'}
            isLoading={lowStockLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Low Stock Alert */}
        {lowStockTires.length > 0 && (
          <Grid item xs={12}>
            <Alert 
              severity="warning" 
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleViewLowStock}
                >
                  View All
                </Button>
              }
              sx={{ mb: 3 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                {lowStockTires.length} items are running low on stock
              </Typography>
              <Typography variant="body2">
                Consider restocking: {lowStockTires.slice(0, 3).map(tire => 
                  `${tire.brand} ${tire.model}`
                ).join(', ')}
                {lowStockTires.length > 3 && ` and ${lowStockTires.length - 3} more`}
              </Typography>
            </Alert>
          </Grid>
        )}

        {/* Inventory by Type */}
        {inventoryReport?.byType && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Inventory by Type
                  </Typography>
                  <CategoryIcon color="action" />
                </Box>
                
                <Stack spacing={2}>
                  {Object.entries(inventoryReport.byType)
                    .sort(([,a], [,b]) => b - a)
                    .map(([type, count]) => {
                      const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
                      return (
                        <Box key={type}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">
                              {formatTireType(type as TireType)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {count} ({percentage.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      );
                    })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Inventory by Brand */}
        {inventoryReport?.byBrand && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Top Brands
                  </Typography>
                  <CategoryIcon color="action" />
                </Box>
                
                <Stack spacing={2}>
                  {Object.entries(inventoryReport.byBrand)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([brand, count]) => {
                      const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
                      return (
                        <Box key={brand}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">
                              {brand}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {count} ({percentage.toFixed(1)}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ height: 6, borderRadius: 3 }}
                            color="secondary"
                          />
                        </Box>
                      );
                    })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Low Stock Items List */}
        {lowStockTires.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Low Stock Items
                  </Typography>
                  <Chip 
                    label={lowStockTires.length} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
                
                <List dense>
                  {lowStockTires.slice(0, 5).map((tire, index) => (
                    <React.Fragment key={tire.id}>
                      <ListItem 
                        sx={{ px: 0 }}
                        secondaryAction={
                          <Chip 
                            label={`${tire.quantity} left`}
                            size="small"
                            color={tire.quantity === 0 ? 'error' : 'warning'}
                          />
                        }
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={tire.imageUrl}
                            sx={{ width: 40, height: 40 }}
                          >
                            {tire.brand.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${tire.brand} ${tire.model}`}
                          secondary={`${tire.size} • ${formatCurrency(tire.price)}`}
                        />
                      </ListItem>
                      {index < Math.min(lowStockTires.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                {lowStockTires.length > 5 && (
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={handleViewLowStock}
                    sx={{ mt: 2 }}
                  >
                    View All {lowStockTires.length} Items
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Tire Activity or Quick Inventory View */}
        <Grid item xs={12} md={lowStockTires.length > 0 ? 6 : 12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Inventory
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowRecentTires(!showRecentTires)}
                >
                  {showRecentTires ? 'Hide' : 'Show'}
                </Button>
              </Box>
              
              {showRecentTires && (
                <Box sx={{ maxHeight: 400, overflow: 'hidden' }}>
                  <TireListSimple 
                    variant="compact"
                    embedded
                    showActions={false}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Handling */}
      {reportError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Failed to load inventory report. Please try refreshing the page.
        </Alert>
      )}
    </Box>
  );
}

export default InventoryDashboard;