import React from 'react';
interface ServiceCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    price?: string;
    duration?: string;
    features?: string[];
    category?: 'tire' | 'maintenance' | 'repair' | 'inspection';
    actionLabel?: string;
    actionPath?: string;
    highlighted?: boolean;
    emergency?: boolean;
}
export declare const ServiceCard: React.FC<ServiceCardProps>;
export {};
//# sourceMappingURL=ServiceCard.d.ts.map