import React from 'react';
interface ServicePrice {
    name: string;
    price: string;
}
interface MobileTireServiceCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    services: ServicePrice[];
    iconColor?: string;
}
export declare const MobileTireServiceCard: React.FC<MobileTireServiceCardProps>;
export {};
//# sourceMappingURL=MobileTireServiceCard.d.ts.map