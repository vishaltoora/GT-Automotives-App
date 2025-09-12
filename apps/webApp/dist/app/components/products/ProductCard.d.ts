import React from 'react';
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
export declare const ProductCard: React.FC<ProductCardProps>;
export {};
//# sourceMappingURL=ProductCard.d.ts.map