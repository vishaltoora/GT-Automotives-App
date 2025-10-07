import React from 'react';
interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}
interface FeatureHighlightProps {
    title?: string;
    subtitle?: string;
    features: Feature[];
    columns?: 2 | 3 | 4;
    variant?: 'centered' | 'left-aligned';
    backgroundColor?: string;
}
export declare const FeatureHighlight: React.FC<FeatureHighlightProps>;
export {};
//# sourceMappingURL=FeatureHighlight.d.ts.map