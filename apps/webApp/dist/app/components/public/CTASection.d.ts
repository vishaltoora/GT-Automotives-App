import React from 'react';
interface CTASectionProps {
    title: string;
    description?: string;
    primaryAction?: {
        label: string;
        path: string;
        icon?: React.ReactNode;
    };
    secondaryAction?: {
        label: string;
        path: string;
        icon?: React.ReactNode;
    };
    variant?: 'gradient' | 'solid' | 'outlined';
    alignment?: 'center' | 'left';
}
export declare const CTASection: React.FC<CTASectionProps>;
export {};
//# sourceMappingURL=CTASection.d.ts.map