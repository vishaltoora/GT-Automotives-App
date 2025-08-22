import React from 'react';
import { Box, Tabs, Tab, Container, Typography, Stack } from '@mui/material';
import { ServiceCard } from '../public';

const serviceColors = {
  secondary: '#ff6b35',
  text: {
    primary: '#212121',
    secondary: '#616161',
  },
};

export interface ServiceData {
  title: string;
  description: string;
  icon: string;
  category: string;
  popular?: boolean;
  emergency?: boolean;
  features?: string[];
}

interface ServicesGridProps {
  services: ServiceData[];
  categories: { value: string; label: string }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  getIcon: (iconName: string) => React.ReactNode;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({
  services,
  categories,
  selectedCategory,
  onCategoryChange,
  getIcon,
}) => {
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory || (selectedCategory === 'emergency' && s.emergency));

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Stack spacing={1} alignItems="center" sx={{ mb: 5 }}>
          <Typography
            variant="overline"
            sx={{
              color: serviceColors.secondary,
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            COMPREHENSIVE SERVICES
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: serviceColors.text.primary,
              textAlign: 'center',
            }}
          >
            All Services
          </Typography>
        </Stack>

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
                color: serviceColors.text.secondary,
                '&.Mui-selected': {
                  color: serviceColors.secondary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: serviceColors.secondary,
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

        {/* Service Cards - 3 per row */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}>
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={getIcon(service.icon)}
              features={service.features}
              category={service.category as 'tire' | 'maintenance' | 'repair' | 'inspection'}
              highlighted={service.popular}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};