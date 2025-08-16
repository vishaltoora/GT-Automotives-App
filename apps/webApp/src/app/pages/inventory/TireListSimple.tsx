import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useTires, useExportTires, useInvalidateTireQueries } from '../../hooks/useTires';
import { ITireFilters, ITireSearchParams, TireType, TireCondition } from '@gt-automotive/shared-interfaces';
import TireCard from '../../components/inventory/TireCard';
import TireFilter from '../../components/inventory/TireFilter';

type ViewMode = 'grid' | 'list';
type SortOption = 'brand' | 'model' | 'size' | 'price' | 'quantity' | 'updatedAt';

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
  const [filters, setFilters] = useState<ITireFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(embedded ? 6 : 12);
  const [showFilters, setShowFilters] = useState(!embedded);

  // Debounced search
  const searchParams = useMemo<ITireSearchParams>(() => ({
    search: searchQuery || undefined,
    filters,
    sortBy,
    sortOrder,
    page,
    limit: pageSize,
  }), [searchQuery, filters, sortBy, sortOrder, page, pageSize]);

  // Data fetching
  const { 
    data: tiresResult, 
    isLoading, 
    isError, 
    error 
  } = useTires(searchParams);

  const exportMutation = useExportTires();
  const invalidateQueries = useInvalidateTireQueries();

  const tires = tiresResult?.items || [];
  const totalCount = tiresResult?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Event handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  };

  const handleFiltersChange = (newFilters: ITireFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
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

  const handleTireEdit = (tireId: string) => {
    navigate(`/inventory/${tireId}/edit`);
  };

  const handleTireCreate = () => {
    navigate('/inventory/new');
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
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
            <TableCell>Brand</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Condition</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Price</TableCell>
            {isAdmin && <TableCell>Cost</TableCell>}
            {showActions && (isStaff || isAdmin) && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {tires.map((tire) => (
            <TableRow key={tire.id}>
              <TableCell>
                <Box
                  component="img"
                  src={tire.imageUrl || '/placeholder-tire.png'}
                  alt="Tire"
                  sx={{
                    width: 40,
                    height: 40,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              </TableCell>
              <TableCell>{tire.brand}</TableCell>
              <TableCell>{tire.model}</TableCell>
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
                  color={tire.quantity <= tire.minStock ? 'error' : 'inherit'}
                  fontWeight={tire.quantity <= tire.minStock ? 'bold' : 'normal'}
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
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      size="small"
                      onClick={() => handleTireView(tire.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleTireEdit(tire.id)}
                    >
                      Edit
                    </Button>
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
              <MenuItem value="model">Model</MenuItem>
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

          {/* Filter Toggle */}
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? 'primary' : 'default'}
          >
            <FilterIcon />
          </IconButton>

          {/* Actions */}
          {showActions && (isStaff || isAdmin) && (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleRefresh} title="Refresh">
                <RefreshIcon />
              </IconButton>
              
              {isAdmin && (
                <IconButton 
                  onClick={handleExport} 
                  disabled={exportMutation.isLoading}
                  title="Export to CSV"
                >
                  <DownloadIcon />
                </IconButton>
              )}
            </Stack>
          )}
        </Toolbar>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Box sx={{ mb: 3 }}>
          <TireFilter
            filters={filters}
            onChange={handleFiltersChange}
            onClear={handleClearFilters}
            isCompact={embedded}
          />
        </Box>
      )}

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
              item 
              xs={12} 
              sm={6} 
              md={embedded ? 6 : 4} 
              lg={embedded ? 4 : 3} 
              key={tire.id}
            >
              <TireCard
                tire={tire}
                onView={() => handleTireView(tire.id)}
                onEdit={showActions && (isStaff || isAdmin) ? () => handleTireEdit(tire.id) : undefined}
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
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
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
    </Box>
  );
}

export default TireListSimple;