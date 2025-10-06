import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  Toolbar,
  Chip,
  Stack,
  Alert,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useTires, useExportTires, useInvalidateTireQueries } from '../../hooks/useTires';
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

const TireCondition = {
  NEW: 'NEW',
  USED_EXCELLENT: 'USED_EXCELLENT',
  USED_GOOD: 'USED_GOOD',
  USED_FAIR: 'USED_FAIR',
} as const;

type TireType = typeof TireType[keyof typeof TireType];
type TireCondition = typeof TireCondition[keyof typeof TireCondition];
import { useMutation } from '@tanstack/react-query';
import { TireService } from '../../services/tire.service';
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

const formatCondition = (condition: TireCondition): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function TireListSimple({ 
  variant = 'full', 
  showActions = true, 
  embedded = false 
}: TireListSimpleProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdmin, isStaff, isCustomer } = useAuth();

  // State
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'grid' : 'list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

  // Debounced search
  const searchParams = useMemo<ITireSearchParams>(() => ({
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    page,
    limit: pageSize,
  }), [searchQuery, sortBy, sortOrder, page, pageSize]);

  // Data fetching
  const { 
    data: tiresResult, 
    isLoading, 
    isError, 
    error 
  } = useTires(searchParams);

  const exportMutation = useExportTires();
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
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  };



  const handleSortChange = (newSortBy: SortOption) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setPage(1);
  };

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

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(searchParams);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    invalidateQueries();
  };

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
            <TableCell>Image</TableCell>
            <TableCell>Name/Brand</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Condition</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Price</TableCell>
            {isAdmin && <TableCell>Cost</TableCell>}
            {showActions && (isStaff || isAdmin) && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {tires.map((tire) => (
            <TableRow key={tire.id}>
              <TableCell>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.50',
                    borderRadius: 1,
                    fontSize: '24px',
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                  title={`${tire.type.replace('_', ' ')} tire`}
                >
                  {tire.type === 'ALL_SEASON' ? '🌤️' :
                   tire.type === 'SUMMER' ? '☀️' :
                   tire.type === 'WINTER' ? '❄️' :
                   tire.type === 'PERFORMANCE' ? '🏁' :
                   tire.type === 'OFF_ROAD' ? '🏔️' :
                   tire.type === 'RUN_FLAT' ? '🛡️' : '🛞'}
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  {tire.name && (
                    <Typography variant="body2" fontWeight="medium">
                      {tire.name}
                    </Typography>
                  )}
                  <Typography variant="body2" color={tire.name ? "text.secondary" : "inherit"}>
                    {tire.brand}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {tire.sku || '-'}
                </Typography>
              </TableCell>
              <TableCell>{tire.location || '-'}</TableCell>
              <TableCell>{tire.size}</TableCell>
              <TableCell>
                <Chip 
                  label={formatTireType(tire.type)} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={formatCondition(tire.condition)} 
                  size="small" 
                  color={tire.condition === 'NEW' ? 'success' : 'warning'}
                  variant="outlined"
                />
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
              {isAdmin && (
                <TableCell>
                  {tire.cost ? `$${tire.cost.toFixed(2)}` : '-'}
                </TableCell>
              )}
              {showActions && (isStaff || isAdmin) && (
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tire Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isCustomer 
              ? 'Browse our tire selection'
              : 'Manage tire inventory and stock levels'
            }
          </Typography>
        </Box>
      )}

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          {/* Search */}
          <TextField
            placeholder="Search tires..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
            sx={{ minWidth: 200, flexGrow: 1, maxWidth: 400 }}
          />

          {/* Sort */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
            >
              <MenuItem value="brand">Brand</MenuItem>
              <MenuItem value="size">Size</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="quantity">Stock</MenuItem>
              <MenuItem value="updatedAt">Updated</MenuItem>
            </Select>
          </FormControl>

          {/* View Mode Toggle */}
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


          {/* Actions */}
          {showActions && (isStaff || isAdmin) && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleTireCreate}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add New Tire
              </Button>
              
              <IconButton onClick={handleRefresh} title="Refresh">
                <RefreshIcon />
              </IconButton>
              
              {isAdmin && (
                <IconButton 
                  onClick={handleExport} 
                  disabled={exportMutation.isPending}
                  title="Export to CSV"
                >
                  <DownloadIcon />
                </IconButton>
              )}
            </Stack>
          )}
        </Toolbar>
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
                onEdit={showActions && (isStaff || isAdmin) ? () => handleTireEdit(tire) : undefined}
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
            {searchQuery
              ? 'Try adjusting your search'
              : 'Get started by adding your first tire to the inventory'
            }
          </Typography>
          {showActions && (isStaff || isAdmin) && (
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
      {showActions && (isStaff || isAdmin) && !embedded && (
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