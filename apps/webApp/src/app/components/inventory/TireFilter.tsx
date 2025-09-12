import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Stack,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { TireFiltersDto } from '@gt-automotive/shared-dto';
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
import { useTireBrands, useTireSizeSuggestions } from '../../hooks/useTires';

interface TireFilterProps {
  filters: TireFiltersDto;
  onChange: (filters: TireFiltersDto) => void;
  onClear: () => void;
  isCompact?: boolean;
}

const TIRE_TYPES = Object.values(TireType);
const TIRE_CONDITIONS = Object.values(TireCondition);

const formatTireType = (type: TireType): string => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatCondition = (condition: TireCondition): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function TireFilter({ filters, onChange, onClear, isCompact = false }: TireFilterProps) {
  const [expanded, setExpanded] = useState(!isCompact);
  const [sizeQuery, setSizeQuery] = useState(filters.size || '');
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.minPrice || 0,
    filters.maxPrice || 1000
  ]);

  const { data: brands = [] } = useTireBrands();
  const { data: sizeSuggestions = [] } = useTireSizeSuggestions(sizeQuery);

  // Update price range when filters change externally
  useEffect(() => {
    setPriceRange([
      filters.minPrice || 0,
      filters.maxPrice || 1000
    ]);
  }, [filters.minPrice, filters.maxPrice]);

  const handleFilterChange = (key: keyof TireFiltersDto, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setPriceRange([min, max]);
    onChange({
      ...filters,
      minPrice: min > 0 ? min : undefined,
      maxPrice: max < 1000 ? max : undefined,
    });
  };

  const handleSizeChange = (value: string | null) => {
    setSizeQuery(value || '');
    handleFilterChange('size', value || undefined);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  const FilterContent = () => (
    <Stack spacing={3}>
      {/* Search by Brand */}
      <FormControl fullWidth>
        <Autocomplete
          options={brands}
          value={filters.brand || ''}
          onChange={(_, value) => handleFilterChange('brand', value || undefined)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Brand"
              placeholder="Select or type brand name"
            />
          )}
          freeSolo
        />
      </FormControl>


      {/* Size Search with Suggestions */}
      <FormControl fullWidth>
        <Autocomplete
          options={sizeSuggestions}
          value={sizeQuery}
          onChange={(_, value) => handleSizeChange(value)}
          onInputChange={(_, value) => setSizeQuery(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tire Size"
              placeholder="e.g., 225/45R17"
            />
          )}
          freeSolo
        />
      </FormControl>

      {/* Tire Type */}
      <FormControl fullWidth>
        <InputLabel>Tire Type</InputLabel>
        <Select
          value={filters.type || ''}
          label="Tire Type"
          onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
        >
          <MenuItem value="">All Types</MenuItem>
          {TIRE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {formatTireType(type)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Condition */}
      <FormControl fullWidth>
        <InputLabel>Condition</InputLabel>
        <Select
          value={filters.condition || ''}
          label="Condition"
          onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
        >
          <MenuItem value="">All Conditions</MenuItem>
          {TIRE_CONDITIONS.map((condition) => (
            <MenuItem key={condition} value={condition}>
              {formatCondition(condition)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range */}
      <Box>
        <Typography gutterBottom>
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceRangeChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          step={10}
          valueLabelFormat={(value) => `$${value}`}
          marks={[
            { value: 0, label: '$0' },
            { value: 250, label: '$250' },
            { value: 500, label: '$500' },
            { value: 750, label: '$750' },
            { value: 1000, label: '$1000+' },
          ]}
        />
      </Box>

      {/* Stock Filters */}
      <Stack spacing={1}>
        <FormControlLabel
          control={
            <Switch
              checked={filters.inStock || false}
              onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
            />
          }
          label="In Stock Only"
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={filters.lowStock || false}
              onChange={(e) => handleFilterChange('lowStock', e.target.checked || undefined)}
            />
          }
          label="Low Stock Items"
        />
      </Stack>

      {/* Clear Filters Button */}
      <Button
        variant="outlined"
        onClick={onClear}
        startIcon={<ClearIcon />}
        disabled={activeFiltersCount === 0}
        fullWidth
      >
        Clear All Filters ({activeFiltersCount})
      </Button>
    </Stack>
  );

  if (isCompact) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 2 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              <Typography variant="h6">
                Filters
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip 
                  label={activeFiltersCount} 
                  size="small" 
                  color="primary" 
                />
              )}
            </Box>
            
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          
          <Collapse in={expanded}>
            <Divider sx={{ mb: 2 }} />
            <FilterContent />
          </Collapse>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FilterIcon />
          <Typography variant="h6">
            Filter Tires
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} active`} 
              size="small" 
              color="primary" 
            />
          )}
        </Box>
        
        <FilterContent />
      </CardContent>
    </Card>
  );
}

export default TireFilter;