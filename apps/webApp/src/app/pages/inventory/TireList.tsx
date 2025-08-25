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
} from '@mui/material';
import {
  Add as AddIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { useAuth } from '../../hooks/useAuth';
import { useTires, useExportTires, useInvalidateTireQueries } from '../../hooks/useTires';
import { ITireSearchParams, TireType, TireCondition } from '@gt-automotive/shared-interfaces';
import TireCard from '../../components/inventory/TireCard';

type ViewMode = 'grid' | 'list';
type SortOption = 'brand' | 'model' | 'size' | 'price' | 'quantity' | 'updatedAt';

interface TireListProps {
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

export function TireList({ 
  variant = 'full', 
  showActions = true, 
  embedded = false 
}: TireListProps) {
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
  const [pageSize, setPageSize] = useState(embedded ? 6 : 12);

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

  const tires = tiresResult?.items || [];
  const totalCount = tiresResult?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Event handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  };


  const handleClearFilters = () => {
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

  // Define columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const tire = params.row;
        
        // Function to get emoji based on tire type
        const getTireEmoji = (type: TireType) => {
          switch (type) {
            case 'ALL_SEASON':
              return '🌤️'; // All weather conditions
            case 'SUMMER':
              return '☀️'; // Summer sun
            case 'WINTER':
              return '❄️'; // Winter snowflake
            case 'PERFORMANCE':
              return '🏁'; // Racing/performance
            case 'OFF_ROAD':
              return '🏔️'; // Mountain/rugged terrain
            case 'RUN_FLAT':
              return '🛡️'; // Protection/safety
            default:
              return '🛞'; // Default tire
          }
        };

        if (tire.imageUrl) {
          return (
            <Box
              component="img"
              src={tire.imageUrl}
              alt={`${tire.brand} - ${tire.size}`}
              sx={{
                width: 40,
                height: 40,
                objectFit: 'cover',
                borderRadius: 1,
              }}
              onError={(e) => {
                // Hide broken images
                e.currentTarget.style.display = 'none';
              }}
            />
          );
        }
        
        // Show type-specific emoji placeholder when no image
        return (
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey.50',
              borderRadius: 1,
              fontSize: '20px',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
            title={`${tire.type.replace('_', ' ')} tire`}
          >
            {getTireEmoji(tire.type)}
          </Box>
        );
      },
    },
    {
      field: 'brand',
      headerName: 'Brand',
      width: 120,
      sortable: true,
    },
    {
      field: 'model',
      headerName: 'Model',
      width: 150,
      sortable: true,
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 120,
      sortable: true,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      sortable: true,
      renderCell: (params) => (
        <Chip 
          label={formatTireType(params.value)} 
          size="small" 
          variant="outlined"
        />
      ),
    },
    {
      field: 'condition',
      headerName: 'Condition',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <Chip 
          label={formatCondition(params.value)} 
          size="small" 
          color={params.value === 'NEW' ? 'success' : 'warning'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'quantity',
      headerName: 'Stock',
      width: 80,
      sortable: true,
      type: 'number',
      renderCell: (params) => (
        <Typography 
          color={params.row.quantity <= params.row.minStock ? 'error' : 'inherit'}
          fontWeight={params.row.quantity <= params.row.minStock ? 'bold' : 'normal'}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      sortable: true,
      type: 'number',
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
  ];

  // Add cost column for admin
  if (isAdmin) {
    columns.push({
      field: 'cost',
      headerName: 'Cost',
      width: 100,
      sortable: true,
      type: 'number',
      renderCell: (params) => params.value ? `$${params.value.toFixed(2)}` : '-',
    });
  }

  // Add actions column for staff/admin
  if (showActions && (isStaff || isAdmin)) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Button
            size="small"
            onClick={() => handleTireView(params.row.id)}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => handleTireEdit(params.row.id)}
          >
            Edit
          </Button>
        </Stack>
      ),
    });
  }

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
                onEdit={showActions && (isStaff || isAdmin) ? () => handleTireEdit(tire.id) : undefined}
                showCost={isAdmin}
                variant={embedded ? 'compact' : 'detailed'}
                showActions={showActions}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <DataGrid
            rows={tires}
            columns={columns}
            loading={isLoading}
            pagination
            paginationMode="server"
            rowCount={totalCount}
            page={page - 1}
            pageSize={pageSize}
            onPageChange={(newPage) => setPage(newPage + 1)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            pageSizeOptions={[10, 25, 50, 100]}
            autoHeight
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}
          />
        </Card>
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

      {/* Pagination for Grid View */}
      {viewMode === 'grid' && totalPages > 1 && (
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

export default TireList;