import React from 'react';
import { Grid, Box, Typography, Tabs, Tab } from '@mui/material';
import { ProductCard, ProductData } from './ProductCard';

const productColors = {
  secondary: '#ff6b35',
  text: {
    secondary: '#616161',
  },
};

interface ProductsGridProps {
  products: ProductData[];
  categories: { value: string; label: string }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <>
      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => onCategoryChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 48,
              color: productColors.text.secondary,
              '&.Mui-selected': {
                color: productColors.secondary,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: productColors.secondary,
              height: 3,
            },
          }}
        >
          {categories.map((cat) => (
            <Tab
              key={cat.value}
              value={cat.value}
              label={cat.label}
            />
          ))}
        </Tabs>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No products found matching your criteria
          </Typography>
        </Box>
      )}
    </>
  );
};