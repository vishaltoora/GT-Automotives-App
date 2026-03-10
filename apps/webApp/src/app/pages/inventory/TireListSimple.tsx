import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Alert,
  Skeleton,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Autocomplete,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useTires, useInvalidateTireQueries, useTireBrands, useTireSizes } from '../../hooks/useTires';
import { ITireSearchParams, ITire } from '@gt-automotive/data';
// Define enums locally to avoid Prisma client browser issues
const TireType = {
  ALL_SEASON: 'ALL_SEASON',
  SUMMER: 'SUMMER',
  WINTER: 'WINTER',
  PERFORMANCE: 'PERFORMANCE',
  OFF_ROAD: 'OFF_ROAD',
  RUN_FLAT: 'RUN_FLAT',
} as const;

type TireType = typeof TireType[keyof typeof TireType];

// Tire type options for autocomplete filter
const TIRE_TYPE_OPTIONS = [
  { value: 'ALL_SEASON', label: 'All Season' },
  { value: 'SUMMER', label: 'Summer' },
  { value: 'WINTER', label: 'Winter' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'OFF_ROAD', label: 'Off Road' },
  { value: 'RUN_FLAT', label: 'Run Flat' },
];

import { useMutation } from '@tanstack/react-query';
import { TireService } from '../../requests/tire.requests';
import TireCard from '../../components/inventory/TireCard';
import TireDialog from '../../components/inventory/TireDialog';
import DeleteConfirmDialog from '../../components/inventory/DeleteConfirmDialog';

type ViewMode = 'grid' | 'list';
type SortOption = 'brand' | 'size' | 'price' | 'quantity' | 'updatedAt';

interface TireListSimpleProps {
  variant?: 'full' | 'compact';
  showActions?: boolean;
  embedded?: boolean;
}

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Get unique color for each location based on string hash (FNV-1a algorithm for better distribution)
const getLocationColor = (location: string | undefined): string => {
  if (!location) return '#9e9e9e'; // grey for empty
  // FNV-1a hash - better distribution than djb2
  let hash = 2166136261;
  for (let i = 0; i < location.length; i++) {
    hash ^= location.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash = hash >>> 0; // Convert to unsigned 32-bit
  const colors = [
    '#1976d2', // blue
    '#388e3c', // green
    '#f57c00', // orange
    '#7b1fa2', // purple
    '#d32f2f', // red
    '#0097a7', // cyan
    '#c2185b', // pink
    '#512da8', // deep purple
    '#00796b', // teal
    '#5d4037', // brown
    '#455a64', // blue grey
    '#e64a19', // deep orange
    '#303f9f', // indigo
  ];
  // Use prime number 13 for better distribution with 13 colors
  return colors[hash % 13];
};

export function TireListSimple({ 
  variant = 'full', 
  showActions = true, 
  embedded = false 
}: TireListSimpleProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isCustomer } = useAuth();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'list');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sortBy] = useState<SortOption>('updatedAt'); // setSortBy removed - currently unused
  const [sortOrder] = useState<'asc' | 'desc'>('desc'); // setSortOrder removed - currently unused
  const [page, setPage] = useState(1);
  const [pageSize] = useState(embedded ? 6 : 12);
  
  // Dialog states
  const [tireDialogOpen, setTireDialogOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<ITire | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tireToDelete, setTireToDelete] = useState<ITire | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Filter params for API
  const searchParams = useMemo<ITireSearchParams>(() => ({
    brand: selectedBrand || undefined,
    type: (selectedType || undefined) as ITireSearchParams['type'],
    size: selectedSize || undefined,
    sortBy,
    sortOrder,
    page,
    limit: pageSize,
  }), [selectedBrand, selectedType, selectedSize, sortBy, sortOrder, page, pageSize]);

  // Data fetching
  const {
    data: tiresResult,
    isLoading,
    isError,
    error
  } = useTires(searchParams);

  // Fetch brands and sizes for dropdown filters
  const { data: brands = [] } = useTireBrands();
  const { data: sizes = [] } = useTireSizes();

  // const exportMutation = useExportTires(); // Unused - kept for future implementation
  const invalidateQueries = useInvalidateTireQueries();
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => TireService.deleteTire(id),
    onSuccess: () => {
      invalidateQueries();
      setSnackbar({
        open: true,
        message: 'Tire deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setTireToDelete(null);
    },
    onError: (error: any) => {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Failed to delete tire',
        severity: 'error',
      });
    },
  });

  const tires = tiresResult?.items || [];
  const totalCount = tiresResult?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Event handlers
  const handleFilterChange = (filterType: 'brand' | 'type' | 'size', value: string) => {
    if (filterType === 'brand') setSelectedBrand(value);
    else if (filterType === 'type') setSelectedType(value);
    else if (filterType === 'size') setSelectedSize(value);
    setPage(1); // Reset to first page when filtering
  };



  // Unused for now - kept for future implementation
  // const handleSortChange = (newSortBy: SortOption) => {
  //   if (newSortBy === sortBy) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(newSortBy);
  //     setSortOrder('asc');
  //   }
  //   setPage(1);
  // };

  const handleTireView = (tireId: string) => {
    if (embedded) {
      // If embedded, open in a modal or different behavior
      window.open(`/inventory/${tireId}`, '_blank');
    } else {
      navigate(`/inventory/${tireId}`);
    }
  };

  const handleTireEdit = (tire: ITire) => {
    setSelectedTire(tire);
    setTireDialogOpen(true);
  };

  const handleTireCreate = () => {
    setSelectedTire(null);
    setTireDialogOpen(true);
  };
  
  const handleTireDelete = (tire: ITire) => {
    setTireToDelete(tire);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (tireToDelete) {
      deleteMutation.mutate(tireToDelete.id);
    }
  };
  
  const handleDialogClose = () => {
    setTireDialogOpen(false);
    setSelectedTire(null);
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setTireToDelete(null);
  };

  // Unused for now - kept for future implementation
  // const handleExport = async () => {
  //   try {
  //     await exportMutation.mutateAsync(searchParams);
  //   } catch (error) {
  //     console.error('Export failed:', error);
  //   }
  // };

  // const handleRefresh = () => {
  //   invalidateQueries();
  // };

  const LoadingSkeleton = () => (
    <Grid container spacing={2}>
      {[...Array(pageSize)].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={24} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const TableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name/Brand</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Unit Price</TableCell>
            <TableCell>Set Price</TableCell>
            {showActions && isAdmin && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {tires.map((tire) => (
            <TableRow key={tire.id}>
              <TableCell>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {tire.name || tire.brand}
                    </Typography>
                    <Chip
                      label={formatTireType(tire.type)}
                      size="small"
                      variant="outlined"
                      color={
                        tire.type === 'ALL_SEASON' ? 'info' :
                        tire.type === 'SUMMER' ? 'warning' :
                        tire.type === 'WINTER' ? 'primary' :
                        tire.type === 'PERFORMANCE' ? 'error' :
                        tire.type === 'OFF_ROAD' ? 'success' :
                        tire.type === 'RUN_FLAT' ? 'secondary' : 'default'
                      }
                    />
                  </Box>
                  {tire.name && (
                    <Typography variant="body2" color="text.secondary">
                      {tire.brand}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {tire.size}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ color: getLocationColor(tire.location), fontWeight: 'medium' }}>
                  {tire.location || '-'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  color={tire.quantity <= (tire.minStock || 5) ? 'error' : 'inherit'}
                  fontWeight={tire.quantity <= (tire.minStock || 5) ? 'bold' : 'normal'}
                >
                  {tire.quantity}
                </Typography>
              </TableCell>
              <TableCell>${tire.price.toFixed(2)}</TableCell>
              <TableCell>${(tire.price * 4).toFixed(2)}</TableCell>
              {showActions && isAdmin && (
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => handleTireView(tire.id)}
                      title="View Details"
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleTireEdit(tire)}
                      color="primary"
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => handleTireDelete(tire)}
                        color="error"
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header */}
      {!embedded && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" gutterBottom>
            Tire Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCustomer
              ? 'Browse our tire selection'
              : 'Manage tire inventory and stock levels'
            }
          </Typography>
        </Box>
      )}

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: isMobile ? 1.5 : 2 }}>
          {/* Filters and Actions Row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1.5 : 2,
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            {/* Brand Filter */}
            <Autocomplete
              size="small"
              sx={{ flex: isMobile ? 'none' : 1, minWidth: isMobile ? '100%' : 120 }}
              options={brands}
              value={selectedBrand || null}
              onChange={(_, newValue) => handleFilterChange('brand', newValue || '')}
              renderInput={(params) => <TextField {...params} label="Brand" />}
              clearOnEscape
            />

            {/* Type Filter */}
            <Autocomplete
              size="small"
              sx={{ flex: isMobile ? 'none' : 1, minWidth: isMobile ? '100%' : 120 }}
              options={TIRE_TYPE_OPTIONS}
              getOptionLabel={(option) => option.label}
              value={TIRE_TYPE_OPTIONS.find((opt) => opt.value === selectedType) || null}
              onChange={(_, newValue) => handleFilterChange('type', newValue?.value || '')}
              renderInput={(params) => <TextField {...params} label="Type" />}
              clearOnEscape
            />

            {/* Size Filter */}
            <Autocomplete
              size="small"
              sx={{ flex: isMobile ? 'none' : 1, minWidth: isMobile ? '100%' : 120 }}
              options={sizes}
              value={selectedSize || null}
              onChange={(_, newValue) => handleFilterChange('size', newValue || '')}
              renderInput={(params) => <TextField {...params} label="Size" />}
              clearOnEscape
            />

            {/* View Mode Toggle - Beside filters on desktop, separate row on mobile */}
            {isMobile ? null : (
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newViewMode) => newViewMode && setViewMode(newViewMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Add Button - Beside filters on desktop */}
            {!isMobile && showActions && isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleTireCreate}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add New Tire
              </Button>
            )}
          </Box>

          {/* Mobile: View toggle and Add button row */}
          {isMobile && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1.5,
              }}
            >
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newViewMode) => newViewMode && setViewMode(newViewMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>

              {showActions && isAdmin && (
                <IconButton
                  color="primary"
                  onClick={handleTireCreate}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    width: 40,
                    height: 40,
                  }}
                >
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </Card>


      {/* Error State */}
      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load tires: {error?.message || 'Unknown error'}
        </Alert>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {tires.map((tire) => (
            <Grid 
              size={{ 
                xs: 12, 
                sm: 6, 
                md: embedded ? 6 : 4, 
                lg: embedded ? 4 : 3 
              }} 
              key={tire.id}
            >
              <TireCard
                tire={tire}
                onView={() => handleTireView(tire.id)}
                onEdit={showActions && isAdmin ? () => handleTireEdit(tire) : undefined}
                onDelete={showActions && isAdmin ? () => handleTireDelete(tire) : undefined}
                showCost={isAdmin}
                variant={embedded ? 'compact' : 'detailed'}
                showActions={showActions}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableView />
      )}

      {/* Empty State */}
      {!isLoading && tires.length === 0 && (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tires found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {(selectedBrand || selectedType || selectedSize)
              ? 'Try adjusting your filters'
              : 'Get started by adding your first tire to the inventory'
            }
          </Typography>
          {showActions && isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleTireCreate}
            >
              Add First Tire
            </Button>
          )}
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Floating Add Button */}
      {showActions && isAdmin && !embedded && (
        <Fab
          color="primary"
          onClick={handleTireCreate}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Tire Add/Edit Dialog */}
      <TireDialog
        open={tireDialogOpen}
        onClose={handleDialogClose}
        tire={selectedTire}
        onSuccess={() => {
          setSnackbar({
            open: true,
            message: selectedTire ? 'Tire updated successfully' : 'Tire added successfully',
            severity: 'success',
          });
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleConfirmDelete}
        title="Delete Tire"
        message="Are you sure you want to delete this tire from inventory?"
        itemName={tireToDelete ? `${tireToDelete.brand} - ${tireToDelete.size}` : ''}
        warningMessage={tireToDelete && tireToDelete.quantity > 0 ? `This tire still has ${tireToDelete.quantity} units in stock.` : undefined}
        isLoading={deleteMutation.isPending}
      />
      
      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TireListSimple;