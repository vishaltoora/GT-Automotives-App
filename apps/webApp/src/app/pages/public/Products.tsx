import React, { useState } from 'react';
import { Container } from '@mui/material';
import { ProductsHero, ProductsGrid, ProductsFeaturesBar, ProductData } from '../../components/products';
import { CTASection } from '../../components/public';

export const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <ProductsHero 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />
      <ProductsFeaturesBar />
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