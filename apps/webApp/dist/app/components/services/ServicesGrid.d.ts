import React from 'react';
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
    categories: {
        value: string;
        label: string;
    }[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    getIcon: (iconName: string) => React.ReactNode;
}
export declare const ServicesGrid: React.FC<ServicesGridProps>;
export {};
//# sourceMappingURL=ServicesGrid.d.ts.map