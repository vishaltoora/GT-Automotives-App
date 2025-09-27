import React from 'react';
interface HeroProps {
    title: string;
    subtitle?: string;
    description?: string;
    primaryAction?: {
        label: string;
        path: string;
    };
    secondaryAction?: {
        label: string;
        path: string;
    };
    backgroundImage?: string;
    height?: string | number;
    overlay?: boolean;
    logo?: string;
}
export declare const Hero: React.FC<HeroProps>;
export {};
//# sourceMappingURL=Hero.d.ts.map