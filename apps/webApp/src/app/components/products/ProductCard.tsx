import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
} from '@mui/material';

const productColors = {
  primary: '#243c55',
  secondary: '#ff6b35',
  accent: '#4caf50',
  text: {
    primary: '#212121',
    secondary: '#616161',
  },
  background: {
    light: '#f8f9fa',
  },
};

export interface ProductData {
  id: number;
  name: string;
  category: string;
  brand: string;
  size: string;
  features: string[];
  image: string;
  popular?: boolean;
  new?: boolean;
  inStock: boolean;
}

interface ProductCardProps {
  product: ProductData;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      {product.popular && (
        <Chip
          label="POPULAR"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            backgroundColor: productColors.secondary,
            color: 'white',
            fontWeight: 600,
          }}
        />
      )}
      {product.new && (
        <Chip
          label="NEW"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
            backgroundColor: productColors.accent,
            color: 'white',
            fontWeight: 600,
          }}
        />
      )}
      
      <CardMedia
        sx={{
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: productColors.background.light,
          fontSize: '5rem',
        }}
      >
        {product.image}
      </CardMedia>
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: productColors.text.secondary,
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          {product.brand}
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: productColors.text.primary,
            mb: 1,
            minHeight: '3em',
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: productColors.primary,
            fontWeight: 600,
            mb: 2,
          }}
        >
          Size: {product.size}
        </Typography>
        
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2, flex: 1 }}>
          {product.features.slice(0, 2).map((feature, idx) => (
            <Chip
              key={idx}
              label={feature}
              size="small"
              sx={{
                backgroundColor: productColors.background.light,
                fontSize: '0.7rem',
              }}
            />
          ))}
        </Stack>
        
        <Box sx={{ mt: 'auto' }}>
          <Chip
            label={product.inStock ? 'In Stock' : 'Out of Stock'}
            size="small"
            sx={{
              backgroundColor: product.inStock ? productColors.accent + '20' : '#f44336' + '20',
              color: product.inStock ? productColors.accent : '#f44336',
              fontWeight: 600,
              mb: 2,
            }}
          />
          
          <Button
            fullWidth
            variant="contained"
            disabled={!product.inStock}
            sx={{
              backgroundColor: productColors.primary,
              '&:hover': {
                backgroundColor: '#1a2b3e',
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};