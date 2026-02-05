import React, { useState } from 'react';
import { Container } from '@mui/material';
import TireRepairIcon from '@mui/icons-material/TireRepair';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import { ProductsGrid, ProductData } from '../../components/products';
import { CTASection } from '../../components/public';
import { PageHero } from '../../components/shared';

// Products page slides
const productsSlides = [
  {
    id: 'quality-tires',
    title: 'Quality Tires for Every Vehicle',
    subtitle: 'Premium Selection',
    description: 'Browse our extensive inventory of new and quality used tires from trusted brands like Michelin, Bridgestone, Goodyear, and more.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    icon: TireRepairIcon,
  },
  {
    id: 'new-used',
    title: 'New & Quality Used Tires',
    subtitle: 'Options for Every Budget',
    description: 'Whether you need premium new tires or budget-friendly quality used options, we have the right tires at the right price.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    icon: ShoppingCartIcon,
  },
  {
    id: 'all-brands',
    title: 'All Major Brands Available',
    subtitle: 'Trusted Names',
    description: 'Michelin, Bridgestone, Goodyear, Continental, BF Goodrich, Pirelli, and many more top tire brands in stock.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80',
    icon: VerifiedIcon,
  },
];

export const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const products: ProductData[] = [
    {
      id: 1,
      name: 'Michelin Defender T+H',
      category: 'all-season',
      brand: 'Michelin',
      size: '225/65R17',
      features: ['80,000 mile warranty', 'All-season performance', 'Fuel efficient'],
      image: '🛞',
      popular: true,
      inStock: true,
    },
    {
      id: 2,
      name: 'Bridgestone Blizzak WS90',
      category: 'winter',
      brand: 'Bridgestone',
      size: '215/55R17',
      features: ['Winter performance', 'Ice traction', 'Snow grip'],
      image: '🛞',
      inStock: true,
    },
    {
      id: 3,
      name: 'Goodyear Eagle F1',
      category: 'performance',
      brand: 'Goodyear',
      size: '245/40R18',
      features: ['High performance', 'Superior handling', 'Sport driving'],
      image: '🛞',
      new: true,
      inStock: true,
    },
    {
      id: 4,
      name: 'Continental TerrainContact',
      category: 'all-terrain',
      brand: 'Continental',
      size: '275/65R18',
      features: ['Off-road capable', 'All-terrain', 'Durable construction'],
      image: '🛞',
      inStock: true,
    },
    {
      id: 5,
      name: 'BF Goodrich All-Terrain T/A KO2',
      category: 'all-terrain',
      brand: 'BF Goodrich',
      size: '285/75R16',
      features: ['Extreme durability', 'Off-road traction', 'Sidewall protection'],
      image: '🛞',
      popular: true,
      inStock: true,
    },
    {
      id: 6,
      name: 'Pirelli P Zero',
      category: 'performance',
      brand: 'Pirelli',
      size: '255/35R19',
      features: ['Ultra high performance', 'Track capable', 'Premium quality'],
      image: '🛞',
      inStock: false,
    },
    {
      id: 7,
      name: 'Yokohama Geolandar',
      category: 'all-terrain',
      brand: 'Yokohama',
      size: '265/70R17',
      features: ['All-terrain', 'Quiet ride', 'Long lasting'],
      image: '🛞',
      inStock: true,
    },
    {
      id: 8,
      name: 'Toyo Open Country',
      category: 'all-terrain',
      brand: 'Toyo',
      size: '275/55R20',
      features: ['Truck/SUV', 'All-weather', 'Heavy duty'],
      image: '🛞',
      new: true,
      inStock: true,
    },
    {
      id: 9,
      name: 'Firestone Winterforce',
      category: 'winter',
      brand: 'Firestone',
      size: '205/60R16',
      features: ['Budget winter', 'Snow traction', 'Value option'],
      image: '🛞',
      inStock: true,
    },
  ];

  const categories = [
    { value: 'all', label: 'All Tires' },
    { value: 'all-season', label: 'All-Season' },
    { value: 'winter', label: 'Winter' },
    { value: 'performance', label: 'Performance' },
    { value: 'all-terrain', label: 'All-Terrain' },
  ];

  const filteredProducts = products.filter(product => {
    return selectedCategory === 'all' || product.category === selectedCategory;
  });

  return (
    <>
      <PageHero
        slides={productsSlides}
        primaryAction={{
          label: 'Shop Tires',
          path: '/inventory',
        }}
        secondaryAction={{
          label: 'Get Quote',
          path: '/contact',
        }}
      />
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        <ProductsGrid
          products={filteredProducts}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </Container>
      <CTASection 
        title="Can't Find What You're Looking For?"
        description="We have access to thousands of tire models. Contact us for special orders and custom sizes."
        primaryAction={{
          label: 'Contact Us',
          path: '/contact'
        }}
        secondaryAction={{
          label: 'Call: (250) 986-9191',
          path: 'tel:2509869191'
        }}
        variant="outlined"
      />
    </>
  );
};