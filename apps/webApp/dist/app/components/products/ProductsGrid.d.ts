import React from 'react';
import { ProductData } from './ProductCard';
interface ProductsGridProps {
    products: ProductData[];
    categories: {
        value: string;
        label: string;
    }[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}
export declare const ProductsGrid: React.FC<ProductsGridProps>;
export {};
//# sourceMappingURL=ProductsGrid.d.ts.map