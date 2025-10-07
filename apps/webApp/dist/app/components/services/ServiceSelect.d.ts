import React from 'react';
import { ServiceDto } from '@gt-automotive/data';
interface ServiceSelectProps {
    services: ServiceDto[];
    value?: string;
    onChange: (serviceId: string, serviceName: string, unitPrice: number) => void;
    onServicesChange: () => void;
    disabled?: boolean;
}
export declare const ServiceSelect: React.FC<ServiceSelectProps>;
export default ServiceSelect;
//# sourceMappingURL=ServiceSelect.d.ts.map